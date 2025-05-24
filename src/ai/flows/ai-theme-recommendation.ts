'use server';
/**
 * @fileOverview A portfolio theme recommendation AI agent.
 *
 * - recommendTheme - A function that handles the theme recommendation process.
 * - RecommendThemeInput - The input type for the recommendTheme function.
 * - RecommendThemeOutput - The return type for the recommendTheme function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendThemeInputSchema = z.object({
  cvContent: z.string().describe('The content of the user\'s CV.'),
  profession: z.string().describe('The user\'s profession.'),
});
export type RecommendThemeInput = z.infer<typeof RecommendThemeInputSchema>;

const RecommendThemeOutputSchema = z.object({
  themeName: z.string().describe('The name of the recommended portfolio theme.'),
  reason: z.string().describe('The reasoning behind the theme recommendation.'),
});
export type RecommendThemeOutput = z.infer<typeof RecommendThemeOutputSchema>;

export async function recommendTheme(input: RecommendThemeInput): Promise<RecommendThemeOutput> {
  return recommendThemeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendThemePrompt',
  input: {schema: RecommendThemeInputSchema},
  output: {schema: RecommendThemeOutputSchema},
  prompt: `You are an AI assistant specializing in recommending portfolio website themes based on a user's CV content and profession.

  Given the following CV content and profession, recommend the best portfolio theme from the list below. Explain your reasoning.

  Themes:
  - Modern
  - Classic
  - Creative
  - Minimalist
  - Corporate
  - Academic

  CV Content: {{{cvContent}}}
  Profession: {{{profession}}}

  Respond with the theme name and reasoning.
`,
});

const recommendThemeFlow = ai.defineFlow(
  {
    name: 'recommendThemeFlow',
    inputSchema: RecommendThemeInputSchema,
    outputSchema: RecommendThemeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
