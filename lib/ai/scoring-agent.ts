import { generateObject } from "ai";
import { proModel, fastModel } from "./config";
import { QuestionType, AIFeedbackData, WordMarking } from "../types";
import { z } from "zod";
import { AIFeedbackDataSchema } from "./schemas";
import {
    retrieveScoringCriteria,
    transcribeAudioTool,
    fetchAudioAsBase64,
} from "./tools";

/**
 * Orchestration Agent for PTE Scoring
 * Uses Parallel Review + Synthesis pattern with Gemini 1.5 Pro.
 */
export async function scorePteAttemptV2(
    type: QuestionType,
    params: {
        questionContent: string;
        submission: {
            text?: string;
            audioUrl?: string;
        };
    }
): Promise<AIFeedbackData> {
    console.log(`[Scoring Agent] Starting scoring for ${type}`);

    // Step 1: Retrieve scoring criteria and transcribe if needed
    const questionTypeKey = type.toLowerCase().replace(/\s+/g, "_");

    const [criteriaResult, transcriptionResult, audioBase64Result] =
        (await Promise.all([
            retrieveScoringCriteria.execute({ questionType: questionTypeKey }),
            params.submission.audioUrl
                ? transcribeAudioTool.execute({ audioUrl: params.submission.audioUrl })
                : Promise.resolve({ transcript: params.submission.text }),
            params.submission.audioUrl
                ? fetchAudioAsBase64.execute({ url: params.submission.audioUrl })
                : Promise.resolve(null),
        ])) as [{ criteria: string }, { transcript?: string; error?: string }, { base64?: string; mimeType?: string; error?: string } | null];

    console.log(`[Scoring Agent] Preprocessing complete.`);

    const criteria = criteriaResult.criteria;
    const transcript =
        transcriptionResult.transcript || params.submission.text || "";

    if (!transcript && !params.submission.audioUrl) {
        throw new Error("No submission content provided (text or audio)");
    }

    console.log(`[Scoring Agent] Transcript: ${transcript}`);

    // Step 2: Parallel Expert Reviews
    console.log("[Scoring Agent] Dispatching parallel expert reviews...");

    const [accuracyReviewResult, phoneticReviewResult] = await Promise.allSettled([
        // Expert 1: Accuracy & Content (Word-level marking)
        generateObject({
            model: fastModel,
            schema: z.object({
                contentScore: z.number().min(0).max(90),
                wordMarking: z.array(
                    z.object({
                        word: z.string(),
                        classification: z.enum([
                            "good",
                            "average",
                            "poor",
                            "pause",
                            "omitted",
                            "inserted",
                            "filler",
                        ]),
                        feedback: z.string().optional(),
                    })
                ),
                accuracyFeedback: z.string(),
            }),
            messages: [
                {
                    role: "system",
                    content: `You are an expert PTE Content and Accuracy examiner. 
            Your goal is to compare the target text (Question Prompt) with the User's Transcript.
            Identify every word that was:
            - good: pronounced correctly and present
            - average: slightly mispronounced
            - poor: badly mispronounced
            - omitted: in target text but missing in transcript
            - inserted: in transcript but not in target text
            - filler: "uh", "um", etc.
            - pause: significant silent gaps (indicated by punctuation or your inference)
            
            Return a list of WordMarking objects and a content score.`,
                },
                {
                    role: "user",
                    content: `Target Text: ${params.questionContent}\nUser Transcript: ${transcript}\nScoring Criteria: ${criteria}`,
                },
            ],
        }),

        // Expert 2: Pronunciation & Fluency
        generateObject({
            model: proModel,
            schema: z.object({
                pronunciationScore: z.number().min(0).max(90),
                fluencyScore: z.number().min(0).max(90),
                phoneticFeedback: z.string(),
                strengths: z.array(z.string()),
                weaknesses: z.array(z.string()),
            }),
            system: `You are an expert PTE Phonetic examiner focusing on Oral Fluency and Pronunciation.
            Assess rhythm, stress, intonation, and clarity.
            The criteria provided should guide your scores.`,
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `Evaluate the following submission:\nTranscript: ${transcript}\nCriteria: ${criteria}`,
                        },
                        ...(audioBase64Result && audioBase64Result.base64
                            ? [
                                {
                                    type: "file" as const,
                                    data: Buffer.from(audioBase64Result.base64, 'base64'),
                                    mimeType: audioBase64Result.mimeType || "audio/mpeg",
                                },
                            ]
                            : []),
                    ],
                },
            ],
        }),
    ]);

    if (accuracyReviewResult.status === "rejected") {
        console.error("[Scoring Agent] Accuracy Expert failed:", accuracyReviewResult.reason);
        throw new Error(`Accuracy Expert Review failed: ${accuracyReviewResult.reason.message}`);
    }
    if (phoneticReviewResult.status === "rejected") {
        console.error("[Scoring Agent] Phonetic Expert failed:", phoneticReviewResult.reason);
        throw new Error(`Phonetic Expert Review failed: ${phoneticReviewResult.reason.message}`);
    }

    const accuracyReview = accuracyReviewResult.value;
    const phoneticReview = phoneticReviewResult.value;

    // Step 3: Technical Lead Synthesis
    const { object: finalFeedback } = await generateObject({
        model: proModel,
        system: `You are the lead PTE Examiner. Synthesize the reports from the Accuracy Expert and the Phonetic Expert into a final, consistent AIFeedbackData report.
        Ensure the overall score is a fair weighted average.
        Ensure the wordMarking is preserved and accurate.
        The output must strictly follow the AIFeedbackData schema.`,
        schema: AIFeedbackDataSchema,
        prompt: `
        Accuracy Expert Report: ${JSON.stringify(accuracyReview.object)}
        Phonetic Expert Report: ${JSON.stringify(phoneticReview.object)}
        Question Type: ${type}
        Question Content: ${params.questionContent}`,
    });

    console.log("[Scoring Agent] Scoring complete.");
    return finalFeedback;
}
