# 🚀 Quick Start - Gemini AI Scoring System

## ✅ What's Been Done

1. **Switched to Gemini Models** - All AI scoring now uses Google Gemini (cheaper & better)
2. **Database Integration** - All scores are saved to `pte_attempts` table
3. **AI Usage Tracking** - Cost monitoring in `ai_credit_usage` table
4. **Fixed All Lint Errors** - TypeScript errors resolved
5. **Updated Server Actions** - Authentication + database saving integrated

## 🔑 Required Environment Variables

Add to `.env.local`:

```bash
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
ASSEMBLYAI_API_KEY=your_key_here
BLOB_READ_WRITE_TOKEN=your_key_here
```

## 📍 Where to Get API Keys

| Service         | URL                                    | Free Tier                |
| --------------- | -------------------------------------- | ------------------------ |
| **Gemini**      | https://aistudio.google.com/app/apikey | 15 req/min, 1.5K req/day |
| **AssemblyAI**  | https://www.assemblyai.com/dashboard   | 5 hours/month            |
| **Vercel Blob** | https://vercel.com/dashboard/stores    | 500 MB storage           |

## 🧪 Test Your Setup

```bash
# Test the scoring system
pnpm tsx scripts/test-scoring.ts

# Run type check
pnpm exec tsc --noEmit

# Start dev server
pnpm dev
```

## 📊 Integration Flow

```
User Answer → Practice Component → Server Action →
Authenticate → Upload Audio → Score with Gemini →
Transcribe → Save to DB → Track AI Usage → Display Results
```

## 📁 Key Files Modified

| File                            | Purpose                    |
| ------------------------------- | -------------------------- |
| `lib/ai/config.ts`              | Gemini model configuration |
| `lib/ai/scoring-agent.ts`       | Main scoring logic         |
| `lib/db/queries/pte-scoring.ts` | Database operations        |
| `app/actions/pte.ts`            | Server actions             |
| `lib/utils.ts`                  | Added countWords()         |

## 💰 Cost Per Attempt

- **Speaking** (with audio): ~$0.002-0.005
- **Writing** (essay): ~$0.001-0.003
- **Reading/Listening**: ~$0.0005-0.001

**Much cheaper than GPT-4!** 🎉

## 🔍 Database Tables

### `pte_attempts`

Stores all user attempts with scores and feedback

### `ai_credit_usage`

Tracks AI costs and token usage

## 📝 Next Steps

1. Add environment variables to `.env.local`
2. Run test script to verify setup
3. Try submitting a practice question
4. Check database for saved attempts
5. Monitor AI usage and costs

## 🆘 Troubleshooting

**API Key not found?**

- Check `.env.local` exists
- Restart dev server after adding keys

**Transcription failed?**

- Verify ASSEMBLYAI_API_KEY is set
- Check audio URL is publicly accessible

**Database error?**

- Run: `pnpm db:push`
- Verify DATABASE_URL is set

## 📚 Documentation

- Full setup guide: `.agent/ENVIRONMENT_SETUP.md`
- Refactoring summary: `.agent/AI_REFACTORING_SUMMARY.md`
- Development commands: `AGENTS.md`
