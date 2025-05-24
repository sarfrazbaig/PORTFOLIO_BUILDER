
'use server';
/**
 * @fileOverview Generates custom portfolio theme options based on user preferences.
 *
 * - generateCustomThemes - A function that handles the custom theme generation process.
 * - CustomThemePreferencesInput - The input type for user preferences.
 * - CustomThemeOutput - The output type for a single custom theme option.
 * - GenerateCustomThemesOutput - The array of theme options.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CustomThemePreferencesInputSchema = z.object({
  vibe: z.string().describe("The overall vibe the user is going for (e.g., 'Professional & Serious', 'Modern & Sleek', 'Creative & Playful', 'Minimalist & Clean')."),
  colorPreference: z.string().describe("User's preferred color palette (e.g., 'Cool Blues', 'Warm Earth Tones', 'Vibrant & Energetic', 'Monochromatic')."),
  mode: z.enum(['light', 'dark', 'system']).describe("Preferred color scheme mode: light, dark, or system default."),
  industryInspiration: z.string().optional().describe("Optional: Specific industries, styles, or websites the user admires for inspiration."),
  currentProfession: z.string().optional().describe("User's profession for additional context."),
});
export type CustomThemePreferencesInput = z.infer<typeof CustomThemePreferencesInputSchema>;

const CustomThemeVariablesSchema = z.object({
  background: z.string().describe("HSL value for background (e.g., '0 0% 100%')."),
  foreground: z.string().describe("HSL value for foreground text (e.g., '0 0% 10%')."),
  primary: z.string().describe("HSL value for primary elements (e.g., '210 100% 50%')."),
  primaryForeground: z.string().describe("HSL value for text on primary elements (e.g., '0 0% 100%')."),
  secondary: z.string().describe("HSL value for secondary elements (e.g., '210 50% 90%')."),
  secondaryForeground: z.string().describe("HSL value for text on secondary elements (e.g., '210 100% 30%')."),
  accent: z.string().describe("HSL value for accent elements (e.g., '30 100% 50%')."),
  accentForeground: z.string().describe("HSL value for text on accent elements (e.g., '0 0% 0%')."),
  card: z.string().describe("HSL value for card background (e.g., '0 0% 100%')."),
  cardForeground: z.string().describe("HSL value for card foreground text (e.g., '0 0% 10%')."),
  border: z.string().describe("HSL value for borders (e.g., '0 0% 90%')."),
  input: z.string().describe("HSL value for input backgrounds (e.g., '0 0% 90%')."),
  ring: z.string().describe("HSL value for focus rings (e.g., '210 100% 50%')."),
});
export type CustomThemeVariables = z.infer<typeof CustomThemeVariablesSchema>;

const CustomThemeOutputSchema = z.object({
  themeName: z.string().describe("A descriptive name for the generated theme (e.g., 'Ocean Breeze Dark', 'Sunset Minimalist')."),
  description: z.string().describe("A brief description of the theme and why it fits the preferences."),
  themeVariables: CustomThemeVariablesSchema,
  previewImagePrompt: z.string().describe("A short prompt for generating a preview image representing this theme's style (e.g., 'dark mode tech website', 'bright artistic portfolio'). Max 2 keywords."),
});
export type CustomThemeOutput = z.infer<typeof CustomThemeOutputSchema>;

const GenerateCustomThemesOutputSchema = z.object({
  themes: z.array(CustomThemeOutputSchema).min(2).max(4).describe("An array of 2 to 4 custom theme options."),
});
export type GenerateCustomThemesOutput = z.infer<typeof GenerateCustomThemesOutputSchema>;

export async function generateCustomThemes(input: CustomThemePreferencesInput): Promise<GenerateCustomThemesOutput> {
  return generateCustomThemesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'customThemeGeneratorPrompt',
  input: {schema: CustomThemePreferencesInputSchema},
  output: {schema: GenerateCustomThemesOutputSchema},
  prompt: `You are an expert UI/UX designer and color theorist specializing in creating beautiful and accessible website themes.
  Given the user's preferences, generate 3 distinct theme options. For each theme, provide:
  1. A unique, descriptive \`themeName\`.
  2. A brief \`description\` explaining its aesthetic and how it relates to the user's preferences.
  3. A complete set of \`themeVariables\` using HSL string values (e.g., 'H S% L%'). Ensure high contrast ratios for accessibility, especially between background/foreground and primary/primaryForeground.
      - Background: Overall page background.
      - Foreground: Default text color.
      - Primary: Main interactive elements, buttons, important highlights.
      - PrimaryForeground: Text color on primary elements.
      - Secondary: Less prominent elements, alternative backgrounds.
      - SecondaryForeground: Text on secondary elements.
      - Accent: Call-to-action highlights, secondary interactive elements.
      - AccentForeground: Text on accent elements.
      - Card: Background for card components.
      - CardForeground: Text color on card components.
      - Border: Color for borders and dividers.
      - Input: Background for input fields.
      - Ring: Color for focus indicators.
  4. A \`previewImagePrompt\` (max 2 keywords, e.g., "tech dark", "creative light") to suggest a visual for the theme.

  User Preferences:
  - Vibe: {{{vibe}}}
  - Color Preference: {{{colorPreference}}}
  - Mode: {{{mode}}}
  {{#if industryInspiration}}- Industry/Style Inspiration: {{{industryInspiration}}}{{/if}}
  {{#if currentProfession}}- Profession Context: {{{currentProfession}}}{{/if}}

  Ensure the HSL values are strings in the format "H S% L%". For example: '220 20% 98%'.
  Prioritize themes that are visually distinct from each other.
  If the mode is 'dark', ensure background colors are dark and foregrounds are light.
  If the mode is 'light', ensure background colors are light and foregrounds are dark.
  If mode is 'system', you can provide a mix, or lean towards the most common preference (usually light or adaptable).

  Example for one theme's variables (provide all variables for each theme):
  \`\`\`json
  {
    "background": "220 15% 10%", // Dark blue-gray
    "foreground": "220 10% 90%", // Light gray
    "primary": "200 80% 55%",    // Bright cyan
    "primaryForeground": "220 15% 10%", // Dark blue-gray for text on primary
    "secondary": "220 15% 20%",
    "secondaryForeground": "220 10% 80%",
    "accent": "340 80% 60%",      // Vibrant pink
    "accentForeground": "0 0% 100%", // White
    "card": "220 15% 15%",
    "cardForeground": "220 10% 90%",
    "border": "220 15% 25%",
    "input": "220 15% 25%",
    "ring": "200 80% 55%"
  }
  \`\`\`
  Generate 3 theme options.
  `,
});

const generateCustomThemesFlow = ai.defineFlow(
  {
    name: 'generateCustomThemesFlow',
    inputSchema: CustomThemePreferencesInputSchema,
    outputSchema: GenerateCustomThemesOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output || !output.themes || output.themes.length === 0) {
        // Fallback if AI fails to generate themes
        return {
            themes: [
                {
                    themeName: "Default Fallback Light",
                    description: "A default light theme as a fallback.",
                    themeVariables: {
                        background: "0 0% 100%", foreground: "0 0% 10%",
                        primary: "210 100% 50%", primaryForeground: "0 0% 100%",
                        secondary: "210 50% 90%", secondaryForeground: "210 100% 30%",
                        accent: "30 100% 50%", accentForeground: "0 0% 0%",
                        card: "0 0% 98%", cardForeground: "0 0% 10%",
                        border: "0 0% 90%", input: "0 0% 90%", ring: "210 100% 50%"
                    },
                    previewImagePrompt: "light default" // Ensure fallback has a prompt
                }
            ]
        };
    }
    // Ensure all theme variables and previewImagePrompt are present
     output.themes = output.themes.map(theme => ({
      ...theme,
      themeName: theme.themeName || "Unnamed Theme",
      description: theme.description || "A custom generated theme.",
      previewImagePrompt: theme.previewImagePrompt || "abstract modern ui", // Added fallback
      themeVariables: {
        background: theme.themeVariables.background || "0 0% 100%",
        foreground: theme.themeVariables.foreground || "0 0% 10%",
        primary: theme.themeVariables.primary || "240 5.9% 10%",
        primaryForeground: theme.themeVariables.primaryForeground || "0 0% 98%",
        secondary: theme.themeVariables.secondary || "240 4.8% 95.9%",
        secondaryForeground: theme.themeVariables.secondaryForeground || "240 5.9% 10%",
        accent: theme.themeVariables.accent || "240 3.7% 15.9%",
        accentForeground: theme.themeVariables.accentForeground || "0 0% 98%",
        card: theme.themeVariables.card || "0 0% 100%",
        cardForeground: theme.themeVariables.cardForeground || "240 5.9% 10%",
        border: theme.themeVariables.border || "240 5.9% 90%",
        input: theme.themeVariables.input || "240 5.9% 90%",
        ring: theme.themeVariables.ring || "240 5.9% 10%",
      }
    }));
    return output;
  }
);
