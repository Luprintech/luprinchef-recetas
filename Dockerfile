FROM node:20-alpine AS base

# Dependencias necesarias para Prisma, better-sqlite3 y Next.js en Alpine
RUN apk add --no-cache openssl libc6-compat

# ──────────────────────────────────────────────────────────────────────────────
# 1. Fase de construcción (Builder)
# ──────────────────────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app

# Copiamos archivos de dependencias primero (aprovecha caché de Docker)
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Instalamos dependencias (incluyendo compilación de módulos nativos como better-sqlite3)
RUN npm ci

# Generamos el Prisma Client
RUN npx prisma generate

# Copiamos el resto del código
COPY . .

# Deshabilitamos la telemetría de Next.js
ENV NEXT_TELEMETRY_DISABLED=1

# Compilamos el proyecto
RUN npm run build

# ──────────────────────────────────────────────────────────────────────────────
# 2. Fase de ejecución (Runner) — imagen mínima para producción
# ──────────────────────────────────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Creamos un usuario sin privilegios para mayor seguridad
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Copiamos artefactos de build y dependencias desde el builder
COPY --from=builder --chown=nextjs:nodejs /app/public        ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next         ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules  ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json  ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/next.config.ts ./next.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/prisma        ./prisma

# Copiamos el script de arranque y lo hacemos ejecutable (como root, antes de USER)
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh && chown nextjs:nodejs docker-entrypoint.sh

# Creamos el directorio de datos (SQLite + caché Pexels) con permisos correctos
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# El entrypoint corre las migraciones y luego ejecuta el CMD
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "run", "start"]
