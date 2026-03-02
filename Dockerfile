FROM node:20-alpine AS base

# Dependencia necesaria para que Prisma y SQLite funcionen correctamente en Alpine
RUN apk add --no-cache openssl libc6-compat

# 1. Fase de construcción (Builder)
FROM base AS builder
WORKDIR /app

# Copiamos archivos de dependencias
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Instalamos dependencias
RUN npm ci

# Generamos el Prisma Client
RUN npx prisma generate

# Copiamos el resto del código del proyecto
COPY . .

# Deshabilitamos la telemetría de Next.js (opcional pero recomendado)
ENV NEXT_TELEMETRY_DISABLED=1

# Compilamos el proyecto (genera la carpeta .next)
RUN npm run build

# 2. Fase de ejecución (Runner) para producción
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copiamos los archivos generados y de configuración desde la fase del builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts

# Copiamos la carpeta prisma (por si necesitas hacer npx prisma db push o gestionar BBDD)
COPY --from=builder /app/prisma ./prisma

# Aseguramos que existe el directorio de datos para SQLite y Pexels cache
RUN mkdir -p /app/data

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "run", "start"]
