import * as dotenv from 'dotenv';
// Use global fetch

dotenv.config({ path: '.env.local' });
dotenv.config();

async function listModelsRaw() {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    console.log('Using API Key (first 5 chars):', apiKey?.substring(0, 5));

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        console.log('Available Models:', JSON.stringify(data.models?.map((m: any) => m.name), null, 2));
    } catch (e: any) {
        console.error('Failed to list models:', e.message);
    }
}

listModelsRaw();
