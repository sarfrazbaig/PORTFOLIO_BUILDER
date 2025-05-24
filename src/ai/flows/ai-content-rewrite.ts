// 'use server';
/**
 * @fileOverview An AI agent that rewrites, reorganizes, or adds content to a specific section of the portfolio.
 *
 * - rewriteContent - A function that handles the content rewriting process.
 * - RewriteContentInput - The input type for the rewriteContent function.
 * - RewriteContentOutput - The return type for the rewriteContent function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RewriteContentInputSchema = z.object({
  sectionContent: z
    .string()
    .describe('The current content of the section to be rewritten.'),
  instructions: z
    .string()
    .describe(
      'Instructions on how to rewrite, reorganize, or add content to the section.'
    ),
});
export type RewriteContentInput = z.infer<typeof RewriteContentInputSchema>;

const RewriteContentOutputSchema = z.object({
  rewrittenContent: z
    .string()
    .describe('The rewritten content of the section.'),
});
export type RewriteContentOutput = z.infer<typeof RewriteContentOutputSchema>;

export async function rewriteContent(
  input: RewriteContentInput
): Promise<RewriteContentOutput> {
  return rewriteContentFlow(input);
}

const rewriteContentPrompt = ai.definePrompt({
  name: 'rewriteContentPrompt',
  input: {schema: RewriteContentInputSchema},
  output: {schema: RewriteContentOutputSchema},
  prompt: `You are an AI assistant designed to rewrite content for a portfolio website.

You will receive the current content of a section and instructions on how to rewrite, reorganize, or add content to it.

Your goal is to improve the quality and impact of the portfolio by following the user's instructions.

Current Content:
{{sectionContent}}

Instructions:
{{instructions}}

Rewritten Content:`,
});

const rewriteContentFlow = ai.defineFlow(
  {
    name: 'rewriteContentFlow',
    inputSchema: RewriteContentInputSchema,
    outputSchema: RewriteContentOutputSchema,
  },
  async input => {
    const {output} = await rewriteContentPrompt(input);
    return output!;
  }
);
