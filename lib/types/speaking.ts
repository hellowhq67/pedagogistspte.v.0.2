export type SpeakingTestType =
  | "read_aloud"
  | "repeat_sentence"
  | "describe_image"
  | "retell_lecture"
  | "answer_short_question"
  | "respond_situation"
  | "explain_topic";

export type SpeakingQuestion = {
  id: string;
  type: SpeakingTestType;
  title: string;

  // prompt modalities
  promptText?: string;
  imageUrl?: string;
  audioPromptUrl?: string;

  // expected answer for objective scoring (when available)
  expectedKeywords?: string[];
  expectedText?: string; // for read aloud / repeat sentence

  prepareSeconds: number;
  recordSeconds: number;
};

export type WordStatus = "good" | "average" | "poor" | "pause";

export type SpeakingScore = {
  maxScore: number;          // e.g. 90
  overallScore: number;      // e.g. 45
  components: {
    content: { score: number; max: number; suggestion: string };
    pronun: { score: number; max: number; suggestion: string };
    fluency: { score: number; max: number; suggestion: string };
  };
  stt: {
    transcript: string;
    words?: Array<{ w: string; status: WordStatus }>; // colored text in UI
  };
};
