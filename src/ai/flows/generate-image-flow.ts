
'use server';
/**
 * @fileOverview Generates an image using AI based on a text prompt.
 *
 * - generateImage - A function that handles the image generation process.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('The text prompt for image generation.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  imageDataUri: z.string().optional().describe('The generated image as a data URI (e.g., data:image/png;base64,...).'),
  error: z.string().optional().describe('Error message if image generation failed.'),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
  return generateImageFlow(input);
}

const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: GenerateImageOutputSchema,
  },
  async (input) => {
    if (!input.prompt || input.prompt.trim() === "") {
        return { error: 'Image generation failed: Prompt cannot be empty.' };
    }
    try {
      const {media, finishReason, message} = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp', // IMPORTANT: Specific model for image generation
        prompt: input.prompt,
        config: {
          responseModalities: ['TEXT', 'IMAGE'], // Must request IMAGE
          safetySettings: [ // Adjusted safety settings
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          ],
        },
      });

      if (media && media.url) {
        return { imageDataUri: media.url };
      } else {
        let errorMsg = 'Image generation did not return image media.';
        if (finishReason && finishReason !== 'STOP') {
            errorMsg = `Image generation failed or was blocked. Reason: ${finishReason}.`;
        }
        if (message) {
            errorMsg += ` Details: ${message}`;
        }
        console.error('generateImageFlow - No media URL:', {prompt: input.prompt, finishReason, message});
        return { error: errorMsg };
      }
    } catch (err: any) {
      console.error('Error in generateImageFlow:', err);
      // Attempt to extract more details from Genkit/Gemini error structure
      let detailedError = `Image generation failed: ${err.message || 'Unknown error'}`;
      if (err.cause && typeof err.cause === 'object') {
        const cause = err.cause as any;
        if (cause.finishReason) {
           detailedError += `. Reason: ${cause.finishReason}`;
        }
        if (cause.message) {
            detailedError += `. Message: ${cause.message}`;
        }
         // Look for safety ratings if available
        if (cause.safetyRatings && Array.isArray(cause.safetyRatings)) {
          const blockedCategories = cause.safetyRatings
            .filter((r: any) => r.blocked)
            .map((r: any) => r.category)
            .join(', ');
          if (blockedCategories) {
            detailedError += `. Blocked categories: ${blockedCategories}`;
          }
        }
      }
      return { error: detailedError };
    }
  }
);
