import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

async function test25pro() {
    try {
        const { text } = await generateText({
            model: google('gemini-2.5-pro'),
            prompt: 'Hi',
        });
        console.log('Gemini 2.5 Pro works:', text);
    } catch (e: any) {
        console.error('Gemini 2.5 Pro failed:', e.message);
    }
}

test25pro();
