import dotenv from 'dotenv';
import fs from 'fs';
import { scorePteAttemptV2 } from './scoring-agent';
import { QuestionType } from '../types';

// Load environment variables
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

// Sync key logic for test script
if (process.env.ASSEMBLYAI_API_KEY === 'default-assembly-key-for-dev' || !process.env.ASSEMBLYAI_API_KEY) {
    const envContent = fs.readFileSync('.env', 'utf8');
    const match = envContent.match(/ASSEMBLYAI_API_KEY=([^\r\n]+)/);
    if (match && match[1] && match[1] !== 'your_assemblyai_api_key_here') {
        process.env.ASSEMBLYAI_API_KEY = match[1];
    }
}

async function runFullScoring() {
    const audioUrl = 'https://sgp1.digitaloceanspaces.com/liilab/quizbit/media/audio_6324d7ee-d114-44ba-ad10-c7102dde36c5.m4a';
    const questionText = "In recent years, significant changes in diet and lifestyle have led to a sharp rise in heart related illnesses. What’s more concerning is that these conditions are no longer limited to older adults but are now affecting younger people too. Strokes are among the most common heart issues, with symptoms like chest pain, weakness, and heart attacks.";

    console.log(`[Scoring Test] Running full scoring for audio: ${audioUrl}`);

    try {
        const result = await scorePteAttemptV2(QuestionType.READ_ALOUD, {
            questionContent: questionText,
            submission: {
                audioUrl: audioUrl
            }
        });

        console.log('\n--- FINAL JSON DATA ---');
        console.log(JSON.stringify(result, null, 2));
        console.log('-----------------------\n');

    } catch (error: any) {
        console.error('[Scoring Test] FAILED:', error.message);
    }
}

runFullScoring();
