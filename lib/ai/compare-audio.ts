import dotenv from 'dotenv';
import fs from 'fs';
import { transcribeAudio } from './scoring-agent';

// Load environment variables
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

// Ensure we use the real key if it exists in .env but is "default-assembly-key-for-dev" in .env.local
if (process.env.ASSEMBLYAI_API_KEY === 'default-assembly-key-for-dev') {
    const envContent = fs.readFileSync('.env', 'utf8');
    const match = envContent.match(/ASSEMBLYAI_API_KEY=([^\r\n]+)/);
    if (match && match[1] && match[1] !== 'your_assemblyai_api_key_here') {
        process.env.ASSEMBLYAI_API_KEY = match[1];
    }
}

async function runComparison() {
    const newAudioUrl = 'https://sgp1.digitaloceanspaces.com/liilab/quizbit/media/audio_6324d7ee-d114-44ba-ad10-c7102dde36c5.m4a';
    const originalText = "In recent years, significant changes in diet and lifestyle have led to a sharp rise in heart related illnesses. What’s more concerning is that these conditions are no longer limited to older adults but are now affecting younger people too. Strokes are among the most common heart issues, with symptoms like chest pain, weakness, and heart attacks.";

    console.log(`[Comparison] Transcribing new audio: ${newAudioUrl}`);

    try {
        const result = await transcribeAudio(newAudioUrl);

        console.log('\n--- Comparison Result ---');
        console.log(`Original Question Text: "${originalText}"`);
        console.log(`New Audio Transcript: "${result.transcript}"`);
        console.log('--------------------------\n');

    } catch (error: any) {
        console.error('[Comparison] FAILED:', error.message);
    }
}

runComparison();
