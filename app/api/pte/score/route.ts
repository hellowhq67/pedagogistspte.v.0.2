import { NextRequest, NextResponse } from 'next/server';
import { scorePteAttemptV2 } from '@/lib/ai/scoring-agent';
import { QuestionType } from '@/lib/types';
import { db } from '@/lib/db/drizzle';
import { eq } from 'drizzle-orm';
import { pteQuestions } from '@/lib/db/schema';
import { savePteAttempt, trackAIUsage } from '@/lib/db/queries/pte-scoring';
import { auth } from '@/lib/auth/auth';

export async function POST(req: NextRequest) {
    try {
        // Get authenticated user
        const session = await auth.api.getSession({
            headers: req.headers,
        });

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { type, questionId, submission, timeTaken } = await req.json();

        if (!type || !questionId) {
            return NextResponse.json(
                { success: false, error: 'Missing type or questionId' },
                { status: 400 }
            );
        }

        // Fetch the question details from DB to get the answer key/content
        const question = await db.query.pteQuestions.findFirst({
            where: eq(pteQuestions.id, questionId),
        });

        if (!question) {
            return NextResponse.json(
                { success: false, error: 'Question not found' },
                { status: 404 }
            );
        }

        const questionType = type as QuestionType;

        // Determine input type
        const agentSubmission = {
            text: submission.textAnswer || submission.userTranscript,
            audioUrl: submission.audioRecordingUrl,
        };

        // Use the Gemini-based Orchestration Agent (V2)
        const feedback = await scorePteAttemptV2(questionType, {
            questionContent: question.content || question.title,
            submission: agentSubmission,
        });

        // Save the attempt to the database
        const attempt = await savePteAttempt({
            userId: session.user.id,
            questionId,
            questionType,
            responseText: submission.textAnswer,
            responseAudioUrl: submission.audioRecordingUrl,
            responseData: submission,
            timeTaken,
            aiFeedback: feedback,
        });

        // Track AI usage (optional - for cost monitoring)
        await trackAIUsage({
            userId: session.user.id,
            attemptId: attempt.id,
            provider: 'google',
            model: 'gemini-1.5-pro-latest',
            // Note: Gemini doesn't provide token counts in the same way as OpenAI
            // You may need to estimate or use a different tracking method
            totalTokens: 0,
            cost: 0,
        });

        return NextResponse.json({
            success: true,
            data: {
                feedback,
                attemptId: attempt.id,
                attemptNumber: attempt.attemptNumber,
            },
        });
    } catch (error: any) {
        console.error('Scoring API Error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
