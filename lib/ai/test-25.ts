import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

async function test25() {
    try {
        const { text } = await generateText({
            model: google('gemini-2.5-flash'),
            prompt: 'Hi',
        });
        console.log('Gemini 2.5 Flash works:', text);
    } catch (e: any) {
        console.error('Gemini 2.5 Flash failed:', e.message);
    }
}

test25();
