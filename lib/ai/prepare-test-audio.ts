import { put } from '@vercel/blob';
import * as dotenv from 'dotenv';
// Use global fetch

dotenv.config({ path: '.env.local' });
dotenv.config();

async function prepareTestAudio() {
    const audioUrl = 'https://sgp1.digitaloceanspaces.com/liilab/quizbit/media/audio_6324d7ee-d114-44ba-ad10-c7102dde36c5.m4a';
    console.log(`[Prepare] Fetching audio from: ${audioUrl}`);

    try {
        const response = await fetch(audioUrl);
        if (!response.ok) throw new Error(`Failed to fetch audio: ${response.statusText}`);

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        console.log(`[Prepare] Uploading to Vercel Blob...`);

        const blob = await put('test/speaking-audit.m4a', buffer, {
            access: 'public',
            token: process.env.BLOB_READ_WRITE_TOKEN,
            addRandomSuffix: true,
        });

        console.log(`[Success] Audio uploaded to: ${blob.url}`);
        return blob.url;
    } catch (error) {
        console.error('[Error] Failed to prepare test audio:', error);
    }
}

prepareTestAudio();
