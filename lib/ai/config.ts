import { createGoogleGenerativeAI } from '@ai-sdk/google';

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY,
});

// Google Gemini models configuration
// Using Gemini for all AI operations for cost efficiency and multi-modal capabilities
// API key is automatically picked up from GOOGLE_GENERATIVE_AI_API_KEY environment variable
export const proModel = google('gemini-3-pro-preview')
export const fastModel = google('gemini-2.5-flash');
export const geminiModel = google('gemini-2.5-pro')
