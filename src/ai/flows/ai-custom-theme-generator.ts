
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
  
  // New stylistic variables
  fontFamilyBody: z.string().describe("CSS font-family string for body text (e.g., \"'Inter', sans-serif\", \"'Lora', serif\"). Choose from common Google Fonts like Inter, Roboto, Lato, Montserrat, Open Sans, Lora, Merriweather, Playfair Display."),
  fontFamilyHeading: z.string().describe("CSS font-family string for headings (e.g., \"'Montserrat', sans-serif\", \"'Playfair Display', serif\"). Choose from common Google Fonts."),
  baseFontSize: z.string().describe("Base font size for the body (e.g., '16px', '1rem', '15px'). Should be a valid CSS font-size value."),
  layoutStyle: z.enum(['grid-standard', 'list-compact', 'focus-hero', 'minimal-rows']).describe("A keyword describing the overall layout approach (e.g., 'grid-standard' for typical grids, 'list-compact' for denser lists, 'focus-hero' for prominent hero sections, 'minimal-rows' for clean row-based layouts)."),
  cardStyle: z.enum(['shadow-soft', 'flat-bordered', 'rounded-elevated', 'minimal-outline']).describe("A keyword for card styling (e.g., 'shadow-soft' for subtle shadows, 'flat-bordered' for clean lines, 'rounded-elevated' for distinct raised cards, 'minimal-outline' for light outlines)."),
  spacingScale: z.enum(['compact', 'regular', 'spacious']).describe("Overall spacing scale: 'compact', 'regular', or 'spacious' to adjust padding and margins generally.")
});
export type CustomThemeVariables = z.infer<typeof CustomThemeVariablesSchema>;

const CustomThemeOutputSchema = z.object({
  themeName: z.string().describe("A descriptive name for the generated theme (e.g., 'Ocean Breeze Dark', 'Sunset Minimalist', 'Tech Professional')."),
  description: z.string().describe("A brief description of the theme and why it fits the preferences."),
  themeVariables: CustomThemeVariablesSchema,
  previewImagePrompt: z.string().describe("A short prompt (2-4 keywords, e.g., \"tech dark\", \"creative light\") for generating a preview image representing this theme's style."),
});
export type CustomThemeOutput = z.infer<typeof CustomThemeOutputSchema>;

const GenerateCustomThemesOutputSchema = z.object({
  themes: z.array(CustomThemeOutputSchema).min(2).max(3).describe("An array of 2 to 3 custom theme options."),
});
export type GenerateCustomThemesOutput = z.infer<typeof GenerateCustomThemesOutputSchema>;

export async function generateCustomThemes(input: CustomThemePreferencesInput): Promise<GenerateCustomThemesOutput> {
  return generateCustomThemesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'customThemeGeneratorPrompt',
  input: {schema: CustomThemePreferencesInputSchema},
  output: {schema: GenerateCustomThemesOutputSchema},
  prompt: `You are an expert UI/UX designer and typographer specializing in creating beautiful, accessible, and unique website themes.
  Given the user's preferences, generate 2-3 distinct theme options. For each theme, provide:
  1. A unique, descriptive \`themeName\`.
  2. A brief \`description\` explaining its aesthetic and how it relates to the user's preferences.
  3. A complete set of \`themeVariables\`:
      - **Color Variables**: Using HSL string values (e.g., 'H S% L%'). Ensure high contrast ratios for accessibility, especially between background/foreground and primary/primaryForeground.
          - background, foreground, primary, primaryForeground, secondary, secondaryForeground, accent, accentForeground, card, cardForeground, border, input, ring.
      - **Typographic Variables**:
          - \`fontFamilyBody\`: CSS font-family string. Choose from: 'Inter, sans-serif', 'Roboto, sans-serif', 'Lato, sans-serif', 'Montserrat, sans-serif', 'Open Sans, sans-serif', 'Lora, serif', 'Merriweather, serif', 'Playfair Display, serif'.
          - \`fontFamilyHeading\`: CSS font-family string. Choose from the same list. Ensure good pairing with fontFamilyBody.
          - \`baseFontSize\`: A valid CSS font-size value for body text (e.g., '15px', '16px', '1rem').
      - **Layout & Style Keywords**:
          - \`layoutStyle\`: Choose one: 'grid-standard', 'list-compact', 'focus-hero', 'minimal-rows'. This hints at general section arrangement.
          - \`cardStyle\`: Choose one: 'shadow-soft', 'flat-bordered', 'rounded-elevated', 'minimal-outline'. This hints at card component appearance.
          - \`spacingScale\`: Choose one: 'compact', 'regular', 'spacious'. This hints at overall padding/margin scale.
  4. A \`previewImagePrompt\` (max 2 keywords, e.g., "tech dark", "creative light") to suggest a visual for the theme.

  User Preferences:
  - Vibe: {{{vibe}}}
  - Color Preference: {{{colorPreference}}}
  - Mode: {{{mode}}}
  {{#if industryInspiration}}- Industry/Style Inspiration: {{{industryInspiration}}}{{/if}}
  {{#if currentProfession}}- Profession Context: {{{currentProfession}}}{{/if}}

  Ensure HSL values are strings like "H S% L%".
  Prioritize themes that are visually distinct.
  If mode is 'dark', ensure background colors are dark and foregrounds are light.
  If mode is 'light', ensure background colors are light and foregrounds are dark.
  The font families should be chosen carefully for readability and aesthetic fit with the vibe. Headings and body fonts should complement each other.
  The baseFontSize should be reasonable for web readability (e.g., 14px to 18px range).

  Example for one theme's variables (provide all variables for each theme):
  \`\`\`json
  {
    "background": "220 15% 10%", "foreground": "220 10% 90%",
    "primary": "200 80% 55%", "primaryForeground": "220 15% 10%",
    "secondary": "220 15% 20%", "secondaryForeground": "220 10% 80%",
    "accent": "340 80% 60%", "accentForeground": "0 0% 100%",
    "card": "220 15% 15%", "cardForeground": "220 10% 90%",
    "border": "220 15% 25%", "input": "220 15% 25%", "ring": "200 80% 55%",
    "fontFamilyBody": "'Inter', sans-serif",
    "fontFamilyHeading": "'Montserrat', sans-serif",
    "baseFontSize": "16px",
    "layoutStyle": "grid-standard",
    "cardStyle": "shadow-soft",
    "spacingScale": "regular"
  }
  \`\`\`
  Generate 2 or 3 distinct theme options.
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
                        border: "0 0% 90%", input: "0 0% 90%", ring: "210 100% 50%",
                        fontFamilyBody: "'Inter', sans-serif",
                        fontFamilyHeading: "'Inter', sans-serif",
                        baseFontSize: "16px",
                        layoutStyle: "grid-standard",
                        cardStyle: "shadow-soft",
                        spacingScale: "regular"
                    },
                    previewImagePrompt: "light default"
                }
            ]
        };
    }
    // Ensure all theme variables and previewImagePrompt are present
     output.themes = output.themes.map(theme => ({
      ...theme,
      themeName: theme.themeName || "Unnamed Theme",
      description: theme.description || "A custom generated theme.",
      previewImagePrompt: theme.previewImagePrompt || "abstract modern ui",
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
        fontFamilyBody: theme.themeVariables.fontFamilyBody || "'Inter', sans-serif",
        fontFamilyHeading: theme.themeVariables.fontFamilyHeading || "'Inter', sans-serif",
        baseFontSize: theme.themeVariables.baseFontSize || "16px",
        layoutStyle: theme.themeVariables.layoutStyle || "grid-standard",
        cardStyle: theme.themeVariables.cardStyle || "shadow-soft",
        spacingScale: theme.themeVariables.spacingScale || "regular",
      }
    }));
    return output;
  }
);

    