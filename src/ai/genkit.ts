
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Explicitly try to use GOOGLE_API_KEY from the environment.
// The googleAI plugin will use this key to authenticate with Google AI services.
// If this environment variable is not set in your deployed environment (Firebase App Hosting),
// the AI calls will fail.
const googleAiPlugin = googleAI({ apiKey: process.env.GOOGLE_API_KEY });

export const ai = genkit({
  plugins: [googleAiPlugin],
  model: 'googleai/gemini-2.0-flash', // Default text model
});
