import { z } from 'zod';
import { tool } from 'ai';
import { env } from '../env';

// Mock database of scoring criteria (RAG Knowledge Base)
const SCORING_CRITERIA: Record<string, string> = {
    'read_aloud': `
        **Read Aloud Scoring Criteria:**
        - **Content (5 points):** Does the speaker include all words from the text? Omissions or insertions differ.
        - **Oral Fluency (5 points):** Rhythm, phrasing, and stress. No hesitations or repetitions.
        - **Pronunciation (5 points):** Intelligibility and clarity. Vowels and consonants are produced correctly.
    `,
    'repeat_sentence': `
        **Repeat Sentence Scoring Criteria:**
        - **Content (3 points):** All words in sequence = 3. >50% words = 2. <50% = 1.
        - **Oral Fluency (5 points):** Smooth delivery.
        - **Pronunciation (5 points):** Clear and understandable.
    `,
    'describe_image': `
        **Describe Image Scoring Criteria:**
        - **Content (5 points):** Describe all main features of the image, relationships, and conclusion.
        - **Oral Fluency (5 points):** Smooth delivery, natural rhythm.
        - **Pronunciation (5 points):** Clear and understandable.
    `,
    'retell_lecture': `
        **Retell Lecture Scoring Criteria:**
        - **Content (5 points):** Captures all key points and relationships from the lecture.
        - **Oral Fluency (5 points):** Smooth delivery.
        - **Pronunciation (5 points):** Clear and understandable.
    `,
    'answer_short_question': `
        **Answer Short Question Scoring Criteria:**
        - **Content (1 point):** Correct answer is 1, incorrect is 0.
        - **Vocabulary (1 point):** Use of correct terms.
    `,
    'summarize_written_text': `
        **Summarize Written Text Scoring Criteria:**
        - **Content (2 points):** Captures the main point of the passage.
        - **Form (1 point):** One single sentence, 5-75 words.
        - **Grammar (2 points):** Correct grammatical structure.
        - **Vocabulary (2 points):** Appropriate choice of words.
    `,
    'essay': `
        **Essay Scoring Criteria:**
        - **Content (3 points):** Addresses the prompt fully.
        - **Form (2 points):** 200-300 words.
        - **Grammar (2 points):** Range of grammatical structures.
        - **Vocabulary (2 points):** Precise academic vocabulary.
        - **Structure/Coherence (2 points):** Logical flow and organization.
    `,
    'multiple_choice_single': `
        **Multiple Choice (Reading) Scoring Criteria:**
        - **Correct (1 point):** Selecting the correct option.
        - **Incorrect (0 points):** Selecting an incorrect option.
    `,
    'multiple_choice_multiple': `
        **Multiple Choice (Reading) Scoring Criteria:**
        - **Correct (1 point):** Each correct option.
        - **Incorrect (-1 point):** Each incorrect option. Min score 0.
    `,
    'reorder_paragraphs': `
        **Re-order Paragraphs Scoring Criteria:**
        - **Correct (1 point):** Each correct adjacent pair of paragraphs.
    `,
    'fill_in_the_blanks': `
        **Fill in the Blanks (Reading) Scoring Criteria:**
        - **Correct (1 point):** Each correct word filled in.
    `,
    'summarize_spoken_text': `
        **Summarize Spoken Text Scoring Criteria:**
        - **Content (2 points):** Captures key points from the audio.
        - **Form (1 point):** 50-70 words.
        - **Grammar (2 points):** Correct sentence structure.
        - **Vocabulary (2 points):** Appropriate and varied.
    `,
    'write_from_dictation': `
        **Write from Dictation Scoring Criteria:**
        - **Correct (1 point):** Each word spelled correctly and in sequence.
    `,
    'default': `
        **General Scoring Criteria:**
        - Accuracy: Correctness of the answer.
        - Fluency: Smoothness of delivery (if speaking).
        - Grammar: Correct grammatical structures (if writing/speaking).
    `
};

export const retrieveScoringCriteria = tool({
    description: 'Retrieve scoring criteria and rubrics for a specific PTE question type.',
    inputSchema: z.object({
        questionType: z.string().describe('The type of PTE question (e.g., read_aloud, write_essay).'),
    }),
    execute: async ({ questionType }: { questionType: string }) => {
        console.log(`[RAG] Retrieving criteria for: ${questionType}`);
        const criteria = SCORING_CRITERIA[questionType] || SCORING_CRITERIA['default'];
        return { criteria };
    },
});

export const fetchAudioAsBase64 = tool({
    description: 'Fetch audio from a URL and convert it to a base64 string.',
    inputSchema: z.object({
        url: z.string().url().describe('The URL of the audio file.'),
    }),
    execute: async ({ url }: { url: string }) => {
        console.log(`[Tool] Fetching audio from: ${url}`);
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch audio: ${response.statusText}`);
            const arrayBuffer = await response.arrayBuffer();
            const base64 = Buffer.from(arrayBuffer).toString('base64');
            return { base64, mimeType: response.headers.get('content-type') || 'audio/mp3' };
        } catch (error: any) {
            console.error('[Tool] Audio fetch error:', error);
            return { error: error.message as string };
        }
    },
});

export const transcribeAudioTool = tool({
    description: 'Transcribe audio using AssemblyAI.',
    inputSchema: z.object({
        audioUrl: z.string().url(),
    }),
    execute: async ({ audioUrl }: { audioUrl: string }): Promise<{ transcript?: string; error?: string }> => {
        console.log(`[Tool] Transcribing audio: ${audioUrl}`);
        if (!env.ASSEMBLYAI_API_KEY) {
            return { error: 'AssemblyAI API Key missing' };
        }

        try {
            const response = await fetch('https://api.assemblyai.com/v2/transcript', {
                method: 'POST',
                headers: {
                    'authorization': env.ASSEMBLYAI_API_KEY,
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    audio_url: audioUrl,
                    speaker_labels: false
                }),
            });

            const data = await response.json();

            if (data.error) throw new Error(data.error);

            const transcriptId = data.id;
            let status = data.status;
            let transcript = null;

            while (status === 'queued' || status === 'processing') {
                await new Promise(r => setTimeout(r, 1000));
                const pollResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
                    headers: { 'authorization': env.ASSEMBLYAI_API_KEY }
                });
                const pollResult = await pollResponse.json();
                status = pollResult.status;
                if (status === 'completed') {
                    transcript = pollResult.text;
                } else if (status === 'error') {
                    throw new Error(pollResult.error);
                }
            }

            return { transcript: transcript as string };

        } catch (error: any) {
            console.error('[Tool] Transcription error:', error);
            return { error: error.message as string };
        }
    },
});
