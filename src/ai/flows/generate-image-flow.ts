
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
        console.error('generateImageFlow - Error: Prompt cannot be empty.');
        return { error: 'Image generation failed: Prompt cannot be empty.' };
    }
    console.log('generateImageFlow - Attempting to generate image with prompt:', input.prompt);
    try {
      const {media, finishReason, message} = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp', // IMPORTANT: Specific model for image generation
        prompt: input.prompt,
        config: {
          responseModalities: ['TEXT', 'IMAGE'], // Must request IMAGE
          safetySettings: [ 
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          ],
        },
      });

      console.log('generateImageFlow - AI Response:', { mediaIsEmpty: !media, finishReason, messageContent: message?.toString() });

      if (media && media.url) {
        console.log('generateImageFlow - Image generated successfully:', media.url.substring(0, 50) + '...');
        return { imageDataUri: media.url };
      } else {
        let errorMsg = 'Image generation did not return image media.';
        if (finishReason && finishReason !== 'STOP') { // 'STOP' usually means success for text, but for images, media presence is key
            errorMsg = `Image generation failed or was blocked. Reason: ${finishReason}.`;
        }
        if (message && message.length > 0) {
             const messageText = message.map(m => m.text || JSON.stringify(m.custom) || '').join('; ');
             if(messageText) errorMsg += ` Details: ${messageText}`;
        }
        console.error('generateImageFlow - No media URL. Prompt:', input.prompt, 'Finish Reason:', finishReason, 'Message:', message);
        return { error: errorMsg };
      }
    } catch (err: any) {
      console.error('Error in generateImageFlow catch block:', err);
      // Attempt to extract more details from Genkit/Gemini error structure
      let detailedError = `Image generation process failed: ${err.message || 'Unknown error'}`;
      if (err.cause && typeof err.cause === 'object') {
        const cause = err.cause as any;
        if (cause.finishReason) {
           detailedError += `. Reason: ${cause.finishReason}`;
        }
        // The 'message' in err.cause might be an array of MessagePart objects
        if (cause.message && Array.isArray(cause.message) && cause.message.length > 0) {
            const errorDetails = cause.message.map((m: any) => m.text || JSON.stringify(m.custom) || '').join('; ');
            if (errorDetails) detailedError += `. Details: ${errorDetails}`;
        } else if (cause.message && typeof cause.message === 'string') {
            detailedError += `. Details: ${cause.message}`;
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

