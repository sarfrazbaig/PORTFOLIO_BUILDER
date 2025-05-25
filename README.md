# FolioCraft AI

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the development server for Next.js:
   ```bash
   npm run dev
   ```
3. In a separate terminal, run the Genkit development server:
   ```bash
   npm run genkit:dev
   ```
   Or, if you want Genkit to watch for changes:
   ```bash
   npm run genkit:watch
   ```
Open [http://localhost:9002](http://localhost:9002) (or your configured port for Next.js) in your browser to see the app. Genkit typically runs on port 3400.

## Deployment to Firebase App Hosting

This project is configured for easy deployment using Firebase App Hosting.

1.  **Firebase Project:** Ensure you have a Firebase project. Create one at [console.firebase.google.com](https://console.firebase.google.com/) if needed.
2.  **Git Repository:**
    *   Your project code must be in a Git repository (e.g., GitHub, GitLab, Bitbucket).
    *   Commit and push all your latest changes.
3.  **Firebase App Hosting Setup:**
    *   In your Firebase project console, navigate to "App Hosting" (under the "Build" section).
    *   Click "Get started" and then "Create backend".
    *   Connect your Git provider and select the repository for this app.
    *   Choose a region for your backend.
4.  **Configure & Deploy:**
    *   App Hosting will detect it's a Next.js app and typically configure automatic deployments from your main branch.
    *   The `apphosting.yaml` file in this project provides basic configuration.
    *   **Important: Environment Variables:** If your AI features require API keys (e.g., for Google AI), set these as environment variables in your App Hosting backend's settings in the Firebase console. Do not commit API keys to your repository.
    *   Once set up, pushes to your designated branch will trigger automatic builds and deployments. You'll receive a URL for your live application.

That's it! Firebase App Hosting handles the complexities of building and serving your Next.js application.
