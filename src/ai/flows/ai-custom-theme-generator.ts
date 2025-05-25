
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
  Given the user's preferences, generate 2 or 3 HIGHLY distinct theme options. For each theme, provide:
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
  **Crucially, prioritize themes that are visually distinct from each other.** This distinctiveness must apply not just to color schemes, but also significantly to font pairings, base font sizes, and the suggested layout/card/spacing styles.
  For example, if one theme is dark with 'Inter' (sans-serif), 16px base font, and 'grid-standard' layout, another might be light with 'Lora' (serif), 18px base font, and a 'minimal-rows' layout, and a third could use a monochromatic color scheme with 'Montserrat' and 'spacious' spacing. The goal is noticeable variety in the generated set.
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
    "fontFamilyBody": "'Roboto', sans-serif",
    "fontFamilyHeading": "'Playfair Display', serif",
    "baseFontSize": "17px",
    "layoutStyle": "focus-hero",
    "cardStyle": "rounded-elevated",
    "spacingScale": "spacious"
  }
  \`\`\`
  Generate 2 or 3 HIGHLY distinct theme options.
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
        console.warn("AI failed to generate themes, using fallback.");
        return {
            themes: [
                {
                    themeName: "Default Fallback Light",
                    description: "A default light theme as a fallback due to AI generation failure.",
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
                    previewImagePrompt: "light default abstract"
                }
            ]
        };
    }
    // Ensure all theme variables and previewImagePrompt are present with more robust fallbacks
     output.themes = output.themes.map((theme, index) => {
      const defaultFontBody = ["'Inter', sans-serif", "'Roboto', sans-serif", "'Lato', sans-serif"][index % 3];
      const defaultFontHeading = ["'Montserrat', sans-serif", "'Playfair Display', serif", "'Open Sans', sans-serif"][index % 3];
      const defaultBaseSize = ["15px", "16px", "17px"][index % 3];
      const defaultLayoutStyle = (['grid-standard', 'focus-hero', 'minimal-rows'] as const)[index % 3];
      const defaultCardStyle = (['shadow-soft', 'flat-bordered', 'rounded-elevated'] as const)[index % 3];
      const defaultSpacingScale = (['compact', 'regular', 'spacious'] as const)[index % 3];


      return {
        ...theme,
        themeName: theme.themeName || `Generated Theme ${index + 1}`,
        description: theme.description || "A custom generated theme by AI.",
        previewImagePrompt: theme.previewImagePrompt || "abstract modern ui",
        themeVariables: {
          background: theme.themeVariables?.background || (input.mode === 'dark' ? "0 0% 10%" : "0 0% 100%"),
          foreground: theme.themeVariables?.foreground || (input.mode === 'dark' ? "0 0% 90%" : "0 0% 10%"),
          primary: theme.themeVariables?.primary || "240 5.9% 10%", // Default ShadCN Primary
          primaryForeground: theme.themeVariables?.primaryForeground || "0 0% 98%", // Default ShadCN Primary Foreground
          secondary: theme.themeVariables?.secondary || "240 4.8% 95.9%",
          secondaryForeground: theme.themeVariables?.secondaryForeground || "240 5.9% 10%",
          accent: theme.themeVariables?.accent || "174 100% 29%", // Teal from original PRD
          accentForeground: theme.themeVariables?.accentForeground || "0 0% 100%",
          card: theme.themeVariables?.card || (input.mode === 'dark' ? "0 0% 15%" : "0 0% 98%"),
          cardForeground: theme.themeVariables?.cardForeground || (input.mode === 'dark' ? "0 0% 90%" : "0 0% 10%"),
          border: theme.themeVariables?.border || (input.mode === 'dark' ? "0 0% 20%" : "0 0% 90%"),
          input: theme.themeVariables?.input || (input.mode === 'dark' ? "0 0% 20%" : "0 0% 90%"),
          ring: theme.themeVariables?.ring || "240 5.9% 10%",
          fontFamilyBody: theme.themeVariables?.fontFamilyBody || defaultFontBody,
          fontFamilyHeading: theme.themeVariables?.fontFamilyHeading || defaultFontHeading,
          baseFontSize: theme.themeVariables?.baseFontSize || defaultBaseSize,
          layoutStyle: theme.themeVariables?.layoutStyle || defaultLayoutStyle,
          cardStyle: theme.themeVariables?.cardStyle || defaultCardStyle,
          spacingScale: theme.themeVariables?.spacingScale || defaultSpacingScale,
        }
      };
    });
    return output;
  }
);
