import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

async function listModels() {
    try {
        const { text } = await generateText({
            model: google('gemini-1.5-flash-latest'),
            prompt: 'Hi',
        });
        console.log('Gemini 1.5 Flash Latest works:', text);
    } catch (e: any) {
        console.error('Gemini 1.5 Flash Latest failed:', e.message);
    }

    try {
        const { text } = await generateText({
            model: google('gemini-1.5-pro-latest'),
            prompt: 'Hi',
        });
        console.log('Gemini 1.5 Pro Latest works:', text);
    } catch (e: any) {
        console.error('Gemini 1.5 Pro Latest failed:', e.message);
    }
}

listModels();
