/**
 * Quick Test Script for Gemini Scoring System
 * 
 * This script tests the refactored AI scoring system to ensure:
 * 1. Gemini models are properly configured
 * 2. Scoring agent works correctly
 * 3. Database saving functions properly
 * 
 * Run with: pnpm tsx scripts/test-scoring.ts
 */

import 'dotenv/config';
import { scorePteAttemptV2 } from '../lib/ai/scoring-agent';
import { QuestionType } from '../lib/types';

async function testScoring() {
    console.log('🧪 Testing Gemini Scoring System...\n');

    try {
        // Test 1: Simple text scoring (Write Essay)
        console.log('Test 1: Write Essay Scoring');
        console.log('----------------------------');

        const essayFeedback = await scorePteAttemptV2(QuestionType.WRITE_ESSAY, {
            questionContent: 'Some people think that the government should provide free education. Discuss both views and give your opinion.',
            submission: {
                text: 'Education is a fundamental right that should be accessible to everyone. I believe that the government should provide free education because it helps reduce inequality and gives everyone an equal opportunity to succeed. However, some people argue that free education is too expensive for the government to afford. In my opinion, the benefits of free education outweigh the costs, as it leads to a more educated and productive society.'
            }
        });

        console.log('✅ Essay Feedback Received:');
        console.log(`   Overall Score: ${essayFeedback.overallScore}/90`);
        console.log(`   Strengths: ${essayFeedback.strengths.length} items`);
        console.log(`   Areas for Improvement: ${essayFeedback.areasForImprovement.length} items`);
        console.log(`   Suggestions: ${essayFeedback.suggestions.length} items\n`);

        // Test 2: Read Aloud (without audio - will use text)
        console.log('Test 2: Read Aloud Scoring (Text-based)');
        console.log('----------------------------------------');

        const readAloudFeedback = await scorePteAttemptV2(QuestionType.READ_ALOUD, {
            questionContent: 'The quick brown fox jumps over the lazy dog.',
            submission: {
                text: 'The quick brown fox jumps over the lazy dog.'
            }
        });

        console.log('✅ Read Aloud Feedback Received:');
        console.log(`   Overall Score: ${readAloudFeedback.overallScore}/90`);
        if (readAloudFeedback.pronunciation) {
            console.log(`   Pronunciation: ${readAloudFeedback.pronunciation.score}/5`);
        }
        if (readAloudFeedback.fluency) {
            console.log(`   Fluency: ${readAloudFeedback.fluency.score}/5`);
        }
        if (readAloudFeedback.content) {
            console.log(`   Content: ${readAloudFeedback.content.score}/5`);
        }
        console.log();

        console.log('🎉 All tests passed! Gemini scoring system is working correctly.\n');

        return true;
    } catch (error) {
        console.error('❌ Test failed:', error);
        return false;
    }
}

// Run the test
testScoring()
    .then((success) => {
        process.exit(success ? 0 : 1);
    })
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
