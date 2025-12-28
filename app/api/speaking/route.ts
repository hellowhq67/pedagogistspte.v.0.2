import { NextResponse } from "next/server";
import { z } from "zod";

import { generateObject } from "ai";
import { openai as vercelOpenAI } from "@ai-sdk/openai";
import type { SpeakingQuestion, SpeakingScore } from "@/lib/types/speaking"
import { google } from "@ai-sdk/google";


const Body = z.object({
  question: z.any(), // SpeakingQuestion
});

const OutputSchema = z.object({
  maxScore: z.number(),
  overallScore: z.number(),
  components: z.object({
    content: z.object({ score: z.number(), max: z.number(), suggestion: z.string() }),
    pronun: z.object({ score: z.number(), max: z.number(), suggestion: z.string() }),
    fluency: z.object({ score: z.number(), max: z.number(), suggestion: z.string() }),
  }),
  stt: z.object({
    transcript: z.string(),
    words: z.array(z.object({
      w: z.string(),
      status: z.enum(["good","average","poor","pause"]),
    })).optional(),
  }),
});

function keywordCoverage(transcript: string, keywords: string[] = []) {
  const t = transcript.toLowerCase();
  const hits = keywords.filter(k => t.includes(k.toLowerCase()));
  return { hitCount: hits.length, total: keywords.length, hits };
}

export async function POST(req: Request) {
  const { question } = Body.parse(await req.json());
  const q = question as SpeakingQuestion;

  // 1) read audio from multipart/form-data
  const form = await req.formData();
  const file = form.get("audio") as File;
  if (!file) return NextResponse.json({ error: "Missing audio" }, { status: 400 });


  // 3) objective signals (keyword coverage)
  const coverage = keywordCoverage(transcript, q.expectedKeywords);

  // 4) Agentic scoring with structured output
  const system = `
You are a speaking-test examiner. Score on a 0-90 scale with 3 components:
- Content (relevance, completeness)
- Pronun (clarity, intelligibility; infer from transcript issues, hesitations, repairs)
- Fluency (pauses, repetitions, broken phrasing; infer from transcript patterns)

Return:
- component scores and targeted suggestions
- words array for coloring (good/average/poor/pause). Mark "pause" for obvious fillers like "um", "uh", long breaks denoted by "...", and repeated restart words.
Keep it fair: do not assume accent; judge intelligibility.
`;

  const prompt = `
Question type: ${q.type}
Title: ${q.title}
Prompt text: ${q.promptText ?? ""}
Expected text (if any): ${q.expectedText ?? ""}
Expected keywords (if any): ${(q.expectedKeywords ?? []).join(", ")}

User transcript:
${transcript}

Objective keyword coverage:
${coverage.hitCount}/${coverage.total} hits: ${coverage.hits.join(", ")}
`;

  const { object } = await generateObject({
    model: google('gemini-3-pro-preview'),
    schema: OutputSchema,
    system,
    prompt,
  });

  const score: SpeakingScore = {
    maxScore: object.maxScore ?? 90,
    overallScore: object.overallScore,
    components: object.components,
    stt: { transcript, words: object.stt.words },
  };

  return NextResponse.json(score);
}
