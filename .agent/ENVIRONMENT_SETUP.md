# Environment Setup Guide for Gemini AI Scoring

## Required Environment Variables

Add these to your `.env.local` file:

```env
# ============================================
# GOOGLE GEMINI AI (Required for Scoring)
# ============================================
# Get your API key from: https://aistudio.google.com/app/apikey
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here

# ============================================
# ASSEMBLYAI (Required for Audio Transcription)
# ============================================
# Get your API key from: https://www.assemblyai.com/dashboard/signup
ASSEMBLYAI_API_KEY=your_assemblyai_api_key_here

# ============================================
# VERCEL BLOB (Required for Audio Storage)
# ============================================
# Get your token from: https://vercel.com/dashboard/stores
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token_here

# ============================================
# DATABASE (Already configured)
# ============================================
DATABASE_URL=your_database_url
DATABASE_URL_POOLED=your_pooled_database_url

# ============================================
# AUTHENTICATION (Already configured)
# ============================================
BETTER_AUTH_SECRET=your_auth_secret
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
```

## How to Get API Keys

### 1. Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Get API Key" or "Create API Key"
4. Copy the key and add it to `.env.local`

**Note:** Gemini has a generous free tier:

- 15 requests per minute
- 1 million tokens per minute
- 1,500 requests per day

### 2. AssemblyAI API Key

1. Go to [AssemblyAI Dashboard](https://www.assemblyai.com/dashboard/signup)
2. Sign up for a free account
3. Navigate to your dashboard
4. Copy your API key from the dashboard
5. Add it to `.env.local`

**Note:** AssemblyAI free tier includes:

- 5 hours of transcription per month
- Perfect for testing and development

### 3. Vercel Blob Token

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to Storage → Blob
3. Create a new Blob store (if you don't have one)
4. Copy the `BLOB_READ_WRITE_TOKEN`
5. Add it to `.env.local`

**Note:** Vercel Blob free tier:

- 500 MB storage
- 1 GB bandwidth per month

## Testing Your Setup

Run this command to test if your environment is configured correctly:

```bash
pnpm tsx scripts/test-scoring.ts
```

This will:

- ✅ Test Gemini API connection
- ✅ Test scoring functionality
- ✅ Verify environment variables

## Integration Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    User Submits Answer                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Practice Component (Client)                     │
│  • Read Aloud, Write Essay, etc.                            │
│  • Captures user input (text/audio)                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│           Server Action (app/actions/pte.ts)                │
│  • scoreReadAloudAttempt()                                  │
│  • scoreWritingAttempt()                                    │
│  • scoreReadingAttempt()                                    │
│  • scoreListeningAttempt()                                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Authenticate User (Better Auth)                 │
│  • Verify session                                           │
│  • Get user ID                                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│        Upload Audio (if applicable - Vercel Blob)           │
│  • Store audio file                                         │
│  • Get public URL                                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│      Score with Gemini (lib/ai/scoring-agent.ts)           │
│  • scorePteAttemptV2()                                      │
│  • Uses gemini-1.5-pro-latest or flash                     │
│  • Applies PTE scoring criteria                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│       Transcribe Audio (if audio - AssemblyAI)              │
│  • Convert speech to text                                   │
│  • Verify content accuracy                                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│    Save to Database (lib/db/queries/pte-scoring.ts)        │
│  • savePteAttempt()                                         │
│  • Store in pte_attempts table                             │
│  • Save detailed scores and feedback                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Track AI Usage (Cost Monitoring)                │
│  • trackAIUsage()                                           │
│  • Store in ai_credit_usage table                          │
│  • Monitor costs and token usage                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Return Feedback to Client                       │
│  • AIFeedbackData with scores                              │
│  • Attempt ID for reference                                │
│  • Detailed feedback and suggestions                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│         Display Results (SpeakingResults.tsx, etc.)         │
│  • Show overall score                                       │
│  • Display subscores (pronunciation, fluency, etc.)        │
│  • List strengths and improvements                         │
│  • Provide actionable suggestions                          │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema

### `pte_attempts` Table

Stores each user attempt with:

- `id` - Unique attempt identifier
- `user_id` - Who submitted
- `question_id` - Which question
- `attempt_number` - 1st, 2nd, 3rd attempt, etc.
- `response_text` - Text answer (for writing)
- `response_audio_url` - Audio URL (for speaking)
- `response_data` - Structured data (for MCQ, etc.)
- `ai_score` - Overall score (0-90)
- `ai_scores` - Subscores (JSON)
- `ai_feedback` - Detailed feedback text
- `ai_scored_at` - When scored
- `completed_at` - When submitted

### `ai_credit_usage` Table

Tracks AI costs:

- `id` - Unique usage identifier
- `user_id` - Who used AI
- `usage_type` - 'scoring'
- `provider` - 'google'
- `model` - 'gemini-1.5-pro-latest'
- `input_tokens` - Tokens in
- `output_tokens` - Tokens out
- `total_tokens` - Total
- `cost` - Estimated cost in USD
- `pte_attempt_id` - Linked attempt

## Cost Estimation

### Gemini Pricing (as of 2024)

- **Pro Model**: $0.00025/1K input, $0.00075/1K output
- **Flash Model**: $0.000075/1K input, $0.0003/1K output

### Per Attempt Cost

- **Speaking** (with audio): ~$0.002-0.005
- **Writing** (essay): ~$0.001-0.003
- **Reading/Listening**: ~$0.0005-0.001

**Much cheaper than GPT-4!** 🎉

### AssemblyAI Pricing

- **Free Tier**: 5 hours/month
- **Paid**: $0.00025/second (~$0.015/minute)

## Troubleshooting

### "API Key not found"

- Check `.env.local` file exists
- Verify variable names match exactly
- Restart dev server after adding keys

### "Transcription failed"

- Check ASSEMBLYAI_API_KEY is set
- Verify audio URL is publicly accessible
- Check AssemblyAI dashboard for quota

### "Database error"

- Run migrations: `pnpm db:push`
- Check DATABASE_URL is set
- Verify database is accessible

### "Authentication failed"

- Check BETTER_AUTH_SECRET is set
- Verify user is logged in
- Check session is valid

## Next Steps

1. ✅ Add environment variables to `.env.local`
2. ✅ Run `pnpm tsx scripts/test-scoring.ts` to test
3. ✅ Try submitting a practice question
4. ✅ Check database for saved attempts
5. ✅ Monitor AI usage in `ai_credit_usage` table
6. ✅ Review costs and optimize if needed

## Support

If you encounter issues:

1. Check the console for error messages
2. Verify all environment variables are set
3. Check API key quotas and limits
4. Review the integration flow above
5. Test individual components separately
