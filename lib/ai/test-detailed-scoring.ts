import * as dotenv from 'dotenv';
import path from 'path';
import { scorePteAttemptV2 } from './scoring-agent';
import { QuestionType } from '@/lib/types';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

async function testDetailedScoring() {
    console.log('[Scoring Test] Running detailed scoring with word marking...');

    // Use the external audio URL and target text from the user's earlier example
    const audioUrl = 'https://0bnqt3onuegvdmxo.public.blob.vercel-storage.com/test/speaking-audit-bNJ9fZ0a6BgiqHCchFztmN0i8Q4r2i.m4a';
    const targetText = "In recent years, significant changes in diet and lifestyle have led to a sharp rise in heart related illnesses. What's more concerning is that these conditions are no longer limited to older adults, but are now affecting younger people too. Strokes are among the most common heart issues, with symptoms like chest pain, weakness and heart attacks.";

    try {
        const result = await scorePteAttemptV2(
            QuestionType.READ_ALOUD,
            {
                questionContent: targetText,
                submission: { audioUrl }
            }
        );

        console.log('--- FINAL DETAILED JSON DATA ---');
        console.log(JSON.stringify(result, null, 2));
        console.log('--------------------------------');

        // Basic verification
        if (result.wordMarking && result.wordMarking.length > 0) {
            console.log(`[Success] Received ${result.wordMarking.length} word markings.`);
            // Check for some expected classifications
            const hasOmitted = result.wordMarking.some(m => m.classification === 'omitted');
            const hasGood = result.wordMarking.some(m => m.classification === 'good');
            console.log(`[Verification] Has Good: ${hasGood}, Has Omitted: ${hasOmitted}`);
        } else {
            console.warn('[Warning] No word markings received.');
        }

    } catch (error) {
        console.error('[Error] Scoring test failed:', error);
    }
}

testDetailedScoring();
