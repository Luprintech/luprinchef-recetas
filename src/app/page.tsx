
'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ChefHat, Sparkles, BookHeart, BookOpen, Wind, Camera, Search, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThemeToggle } from '@/components/theme-toggle';
import { AuthButton } from '@/components/auth-button';
import { PwaInstallButton } from '@/components/pwa-install-button';

const formSchema = z.object({
  ingredients: z.string().min(10, {
    message: "Por favor, introduce al menos un ingrediente (mínimo 10 caracteres).",
  }),
  cuisine: z.string().optional(),
  vegetarian: z.boolean().default(false).optional(),
  glutenFree: z.boolean().default(false).optional(),
  airFryer: z.boolean().default(false).optional(),
});

const QUICK_EXAMPLES = ['huevos, patatas', 'pollo, arroz', 'pasta, tomate'];

function HomeComponent() {
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ingredients: "",
      cuisine: "any",
      vegetarian: false,
      glutenFree: false,
      airFryer: false,
    },
  });

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (searchTerm.trim()) {
          router.push(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
          setSuggestions([]);
      }
  };

  useEffect(() => {
      const fetchSuggestions = async () => {
          const q = searchTerm.trim();
          if (q.length < 3) {
              setSuggestions([]);
              return;
          }

          const cacheKey = `luprinchef_suggestions:${q.toLowerCase()}`;
          try {
              const cached = sessionStorage.getItem(cacheKey);
              if (cached) {
                  setSuggestions(JSON.parse(cached));
                  return;
              }
          } catch (_) { /* unavailable */ }

          setIsSuggesting(true);
          const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(q)}`);
          const data = await res.json();
          if (data.suggestions) {
              setSuggestions(data.suggestions);
              try {
                  sessionStorage.setItem(cacheKey, JSON.stringify(data.suggestions));
              } catch (_) { /* quota exceeded */ }
          }
          setIsSuggesting(false);
      };

      const handler = setTimeout(() => {
          fetchSuggestions();
      }, 1200);

      return () => {
          clearTimeout(handler);
      };
  }, [searchTerm]);

  useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
          if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
              setSuggestions([]);
          }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
          document.removeEventListener("mousedown", handleClickOutside);
      };
  }, [searchContainerRef]);

  useEffect(() => {
    const ingredientsFromQuery = searchParams.get('ingredients');
    if (ingredientsFromQuery) {
        form.setValue('ingredients', decodeURIComponent(ingredientsFromQuery));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [searchParams, form]);

  useEffect(() => {
    async function getCameraPermission() {
      if (!isCameraDialogOpen) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error al acceder a la cámara:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Acceso a la cámara denegado',
          description: 'Por favor, activa los permisos de cámara en tu navegador.',
        });
      }
    }

    getCameraPermission();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraDialogOpen, toast]);

  async function handleAnalyzeIngredients() {
    if (!videoRef.current || !canvasRef.current || !hasCameraPermission) return;

    setIsScanning(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if(context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataUri = canvas.toDataURL('image/jpeg');

      try {
        const res = await fetch('/api/ingredients/identify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageDataUri }),
        });
        const result = await res.json();
        if (result.error) {
          toast({ variant: "destructive", title: "Error al analizar", description: result.error });
        } else if (result.ingredients) {
          const currentIngredients = form.getValues('ingredients');
          form.setValue('ingredients', [currentIngredients, result.ingredients].filter(Boolean).join(', '));
          toast({ title: "¡Ingredientes añadidos!", description: "Hemos añadido los ingredientes de la imagen." });
          setIsCameraDialogOpen(false);
        }
      } catch (error) {
         toast({ variant: "destructive", title: "Error inesperado", description: "No se pudieron identificar los ingredientes." });
      }
    }

    setIsScanning(false);
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsNavigating(true);
    const params = new URLSearchParams();
    params.set('ingredients', values.ingredients);
    if (values.vegetarian) params.set('vegetarian', 'true');
    if (values.glutenFree) params.set('glutenFree', 'true');
    if (values.airFryer) params.set('airFryer', 'true');
    if (values.cuisine && values.cuisine !== 'any') params.set('cuisine', values.cuisine);
    router.push(`/recipe?${params.toString()}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-white dark:from-green-950/20 dark:via-background dark:to-background">
      <div className="flex flex-col items-center p-4 md:p-8">
        <main className="w-full max-w-2xl">

          {/* Header */}
          <header className="flex justify-between items-start w-full mb-10 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2.5">
                <ChefHat className="w-7 h-7 md:w-8 md:h-8 text-green-600 shrink-0" />
                Luprinchef
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-1 pl-[2.375rem] md:pl-[2.625rem]">
                Genera recetas con lo que tienes en casa
              </p>
            </div>
            <nav className="flex items-center gap-1 shrink-0">
              <PwaInstallButton />
              <ThemeToggle />
              <Link href="/recipes" passHref>
                <Button variant="ghost" size="sm" className="gap-1.5 px-2 md:px-3">
                  <BookOpen className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline text-sm">Catálogo</span>
                </Button>
              </Link>
              <Link href="/favorites" passHref>
                <Button variant="ghost" size="sm" className="gap-1.5 px-2 md:px-3">
                  <BookHeart className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline text-sm">Favoritos</span>
                </Button>
              </Link>
              <AuthButton />
            </nav>
          </header>

          {/* Search bar */}
          <div className="mb-6 relative" ref={searchContainerRef}>
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Buscar recetas por nombre o ingredientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 rounded-xl border-border/60 focus:border-green-500 transition-all duration-200"
                autoComplete="off"
              />
            </form>
            {(isSuggesting || suggestions.length > 0) && (
              <Card className="absolute top-full mt-2 w-full z-10 shadow-lg rounded-xl">
                <CardContent className="p-2">
                  {isSuggesting && !suggestions.length ? (
                    <p className="p-2 text-sm text-muted-foreground">Buscando sugerencias...</p>
                  ) : (
                    <ul className="space-y-1">
                      {suggestions.map((suggestion) => (
                        <li key={suggestion}>
                          <button
                            className="w-full text-left p-2 rounded-md text-sm hover:bg-accent transition-colors duration-150"
                            onClick={() => {
                              setSearchTerm(suggestion);
                              setSuggestions([]);
                              router.push(`/search?query=${encodeURIComponent(suggestion.trim())}`);
                            }}
                          >
                            {suggestion}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main card */}
          <Card className="rounded-2xl shadow-lg border border-gray-100 dark:border-border">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <CardTitle className="text-lg md:text-xl">¿Qué tienes en la nevera?</CardTitle>
                  <CardDescription className="mt-1 text-sm">
                    Escribe tus ingredientes o usa la cámara para escanear tu nevera
                  </CardDescription>
                </div>
                <Dialog open={isCameraDialogOpen} onOpenChange={setIsCameraDialogOpen}>
                  <DialogTrigger asChild>
                    <button
                      className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-muted dark:hover:bg-muted/70 transition-all duration-200 cursor-pointer shrink-0"
                      aria-label="Escanear con la cámara"
                    >
                      <Camera className="h-5 w-5 text-muted-foreground" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="w-[calc(100%-2rem)] sm:max-w-[625px] rounded-2xl">
                    <DialogHeader>
                      <DialogTitle>Escanear ingredientes</DialogTitle>
                      <DialogDescription>
                        Apunta con la cámara al interior de tu nevera. Cuando tengas una buena vista, pulsa "Analizar Ingredientes".
                      </DialogDescription>
                    </DialogHeader>
                    <div className="relative">
                      <video ref={videoRef} className="w-full aspect-video rounded-xl bg-muted" autoPlay muted playsInline />
                      <canvas ref={canvasRef} className="hidden" />
                      {hasCameraPermission === false && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                          <Alert variant="destructive" className="w-auto">
                            <AlertTitle>Cámara no disponible</AlertTitle>
                            <AlertDescription>Por favor, concede permisos de cámara en tu navegador.</AlertDescription>
                          </Alert>
                        </div>
                      )}
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                      <Button variant="outline" onClick={() => setIsCameraDialogOpen(false)} className="w-full sm:w-auto">Cancelar</Button>
                      <Button onClick={handleAnalyzeIngredients} disabled={isScanning || hasCameraPermission === false} className="w-full sm:w-auto">
                        {isScanning ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analizando...
                          </>
                        ) : (
                          <>
                            <Camera className="mr-2 h-4 w-4" />
                            Analizar Ingredientes
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                  {/* Textarea */}
                  <FormField
                    control={form.control}
                    name="ingredients"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="sr-only">Ingredientes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ej: patatas, huevos, cebolla, aceite de oliva, ajo..."
                            className="resize-none min-h-[150px] text-base rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200"
                            {...field}
                          />
                        </FormControl>
                        {/* Quick examples */}
                        <div className="flex flex-wrap items-center gap-2 pt-2">
                          <span className="text-xs text-muted-foreground">Prueba:</span>
                          {QUICK_EXAMPLES.map((ex) => (
                            <button
                              key={ex}
                              type="button"
                              onClick={() => form.setValue('ingredients', ex)}
                              className="text-xs px-3 py-1 rounded-full bg-muted hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-950/40 dark:hover:text-green-400 border border-border/60 transition-all duration-200"
                            >
                              {ex}
                            </button>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Options */}
                  <div className="space-y-4">
                    <p className="text-sm font-medium text-muted-foreground">Opciones</p>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                      <FormField
                        control={form.control}
                        name="vegetarian"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="font-medium text-sm cursor-pointer">
                              Vegetariano
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="glutenFree"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="font-medium text-sm cursor-pointer">
                              Sin Gluten
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="airFryer"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="font-medium text-sm cursor-pointer flex items-center gap-1.5">
                              <Wind className="w-3.5 h-3.5" />
                              Freidora de Aire
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="cuisine"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Tipo de Cocina</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="rounded-xl h-10">
                                <SelectValue placeholder="Selecciona un tipo de cocina" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="any">Cualquiera</SelectItem>
                              <SelectItem value="Española">Española</SelectItem>
                              <SelectItem value="Italiana">Italiana</SelectItem>
                              <SelectItem value="Mexicana">Mexicana</SelectItem>
                              <SelectItem value="Japonesa">Japonesa</SelectItem>
                              <SelectItem value="India">India</SelectItem>
                              <SelectItem value="Tailandesa">Tailandesa</SelectItem>
                              <SelectItem value="China">China</SelectItem>
                              <SelectItem value="Francesa">Francesa</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Submit button */}
                  <Button
                    type="submit"
                    disabled={isNavigating}
                    className="w-full h-auto py-4 text-base font-semibold bg-green-600 hover:bg-green-700 active:scale-95 shadow-md transition-all duration-200 rounded-xl"
                  >
                    {isNavigating ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generando receta…
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Generar Receta
                      </>
                    )}
                  </Button>

                </form>
              </Form>
            </CardContent>
          </Card>

        </main>
      </div>
    </div>
  );
}

export default function Home() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <HomeComponent />
        </Suspense>
    )
}
