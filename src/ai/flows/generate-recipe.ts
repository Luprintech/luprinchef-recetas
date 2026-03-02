'use server';

/**
 * @fileOverview Generates recipes based on a list of ingredients and other criteria.
 *
 * - generateRecipe - A function that generates recipe suggestions.
 * - GenerateRecipeInput - The input type for the generateRecipe function.
 * - GenerateRecipeOutput - The return type for the generateRecipe function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { searchPhoto } from '@/services/pexels';

const GenerateRecipeInputSchema = z.object({
  ingredients: z
    .string()
    .optional()
    .describe('A comma-separated list of ingredients available.'),
  category: z
    .string()
    .optional()
    .describe('The category of the recipe to generate (e.g., "Postres", "Ensaladas").'),
  cuisine: z
    .string()
    .optional()
    .describe('The cuisine or country of the recipe to generate (e.g., "Italiana", "Mexicana").'),
  vegetarian: z.boolean().optional().describe('Whether the recipe should be vegetarian.'),
  glutenFree: z.boolean().optional().describe('Whether the recipe should be gluten-free.'),
  airFryer: z.boolean().optional().describe('Whether the recipe should be for an air fryer.'),
});

export type GenerateRecipeInput = z.infer<typeof GenerateRecipeInputSchema>;

const GenerateRecipeOutputSchema = z.object({
  recipeName: z.string().describe('The name of the generated recipe.'),
  ingredientsList: z
    .string()
    .describe(
      'A list of ingredients required for the recipe, including quantities. Format: each ingredient on its own line starting with "- ", e.g. "- 2 huevos\n- 1 cebolla\n- 200g harina"'
    ),
  instructions: z.string().describe('Step-by-step instructions for the recipe.'),
  estimatedCookingTime: z
    .string()
    .describe('The estimated cooking time for the recipe.'),
  additionalSuggestedIngredients: z
    .string()
    .describe(
      'A comma-separated list of ingredients that could enhance the recipe.'
    ),
  nutritionalInformation: z
    .string()
    .describe('Basic nutritional information for the recipe.'),
  imageHint: z
    .string()
    .describe(
      'A specific 1-2 word English description to find a realistic food photo on Pexels. Focus ONLY on the main ingredient to ensure high quality and faithful results. Do not include sauces, adjectives or complex preparations. E.g.: for "merluza con salsa verde" use "hake fish", for "pollo al ajillo" use "cooked chicken", for "tortilla" use "omelette".'
    ),
  imageUrl: z.string().describe('A URL for an image of the recipe.'),
});

export type GenerateRecipeOutput = z.infer<typeof GenerateRecipeOutputSchema>;

export async function generateRecipe(input: GenerateRecipeInput): Promise<GenerateRecipeOutput> {
  return generateRecipeFlow(input);
}

const generateRecipePrompt = ai.definePrompt({
  name: 'generateRecipePrompt',
  model: 'googleai/gemini-2.5-flash',
  input: {schema: GenerateRecipeInputSchema},
  output: {schema: GenerateRecipeOutputSchema.omit({ imageUrl: true })},
  prompt: `Eres un chef de gran talento. Genera una receta de cocina. La receta completa, incluyendo todos los campos del JSON, debe estar en español. La receta debe incluir instrucciones paso a paso, donde cada paso es un elemento en una lista numerada y separada por un salto de línea (ej: "1. Picar la cebolla.\\n2. Sofreír el ajo."), una lista de ingredientes con cantidades, el tiempo de cocción estimado y una pista de 2 palabras en inglés para generar una imagen de la receta. Sugiere ingredientes adicionales que podrían mejorar la receta.

{{#if cuisine}}
La receta DEBE ser de la cocina {{{cuisine}}}.
{{else}}
Genera una receta de cualquier cocina del mundo.
{{/if}}

{{#if category}}
La receta DEBE pertenecer a la categoría: {{{category}}}.
{{/if}}
{{#if ingredients}}
La receta debe basarse en los siguientes ingredientes: {{{ingredients}}}
{{/if}}

Es OBLIGATORIO que la receta se base en los ingredientes o en la categoría proporcionada.

{{#if vegetarian}}
La receta DEBE ser vegetariana. No incluyas carne, pollo o pescado.
{{/if}}
{{#if glutenFree}}
La receta DEBE ser sin gluten. No incluyas ingredientes que contengan gluten como trigo, cebada o centeno.
{{/if}}
{{#if airFryer}}
La receta DEBE ser para una freidora de aire (air fryer).
{{/if}}

La salida debe ser en formato JSON. El JSON debe incluir las claves recipeName, ingredientsList, instructions, estimatedCookingTime, additionalSuggestedIngredients, nutritionalInformation y imageHint. Todo el texto en los valores del JSON debe estar en español.

IMPORTANTE sobre el formato:
- El campo ingredientsList DEBE tener cada ingrediente en una línea separada comenzando con "- ", ejemplo: "- 4 patatas medianas\\n- 6 huevos\\n- 1 cebolla"
- El campo instructions DEBE tener cada paso numerado en una línea separada, ejemplo: "1. Pelar las patatas.\\n2. Batir los huevos."
- El campo imageHint DEBE ser en inglés, de 1-2 palabras, centrándose solo en el ingrediente principal (por ejemplo: "cooked chicken" para pollo al ajillo) para buscar fotos realistas y fieles en Pexels.`,
});

const generateRecipeFlow = ai.defineFlow(
  {
    name: 'generateRecipeFlow',
    inputSchema: GenerateRecipeInputSchema,
    outputSchema: GenerateRecipeOutputSchema,
  },
  async input => {
    const {output: recipeDetails} = await generateRecipePrompt(input);
    if (!recipeDetails) {
        throw new Error('Could not generate recipe');
    }

    const imageUrl = await searchPhoto(recipeDetails.imageHint || recipeDetails.recipeName);

    return {
        ...recipeDetails,
        imageUrl,
    };
  }
);
