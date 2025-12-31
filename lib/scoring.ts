// Mock implementation of scoring logic for PTE Practice
// Replacing Supabase Edge Function calls with local mocks

export interface ScoreResult {
  overallScore: number;
  content: number;
  fluency: number;
  pronunciation: number;
  feedback: string[];
  detailedAnalysis: {
    strengths: string[];
    improvements: string[];
    tips: string[];
  };
}

export type TestType =
  | "read-aloud"
  | "repeat-sentence"
  | "describe-image"
  | "retell-lecture"
  | "answer-short-question"
  | "summarize-spoken-text"
  | "read-and-retell"
  | "summarize-group-discussion"
  | "respond-to-situation";

interface ScoringParams {
  testType: TestType;
  spokenText: string;
  originalText?: string;
  imageDescription?: string;
  lectureContent?: string;
  question?: string;
  expectedAnswer?: string;
}

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  // Mock transcription
  return new Promise((resolve) => {
    setTimeout(() => {
      // In a real scenario, we would send the blob to a transcription service
      // Here we just return a placeholder or try to use Web Speech API if available in browser (but we are server side here mostly or client side)
      // Since this is called from client, we can't easily mock "what was said" without actual transcription.
      // However, for the purpose of "using mock data", we can return a text that closely matches the "originalText" if provided, or random text.
      // But `transcribeAudio` only takes blob.
      // We will return a generic text for now, or maybe the user wants us to simulate a "good" attempt.
      resolve("The library is an excellent place to study. It provides a quiet environment where students can focus on their work.");
    }, 1500);
  });
}

export async function scoreSpeaking(params: ScoringParams): Promise<ScoreResult> {
  // Mock scoring
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        overallScore: 85,
        content: 80,
        fluency: 90,
        pronunciation: 85,
        feedback: ["Great job! Your pronunciation is very clear.", "Try to maintain a steady pace."],
        detailedAnalysis: {
          strengths: ["Clear enunciation", "Good volume", "Natural pausing"],
          improvements: ["Some minor hesitation", "Stress on some words could be better"],
          tips: ["Practice reading aloud daily", "Record yourself and listen back"]
        }
      });
    }, 1500);
  });
}

// Helper to convert blob to base64 if needed later
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}