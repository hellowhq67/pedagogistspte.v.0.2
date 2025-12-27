# 🔑 Environment Setup Instructions

## Current Status

❌ **API keys not configured** - The test failed because `GOOGLE_GENERATIVE_AI_API_KEY` is missing.

## Quick Setup (3 steps)

### Step 1: Get Your Gemini API Key (FREE)

1. Go to: <https://aistudio.google.com/app/apikey>
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key

### Step 2: Create `.env.local` File

1. Copy `.env.local.template` to `.env.local`
2. Or create a new file named `.env.local` in the root directory

### Step 3: Add Your API Key

Open `.env.local` and add:

```env
GOOGLE_GENERATIVE_AI_API_KEY=AIza...your_actual_key_here
```

## Test Again

After adding your API key, run:

```bash
pnpm tsx scripts/test-scoring.ts
```

## Optional: Additional Services

### AssemblyAI (for audio transcription)

- Get key: <https://www.assemblyai.com/dashboard>
- Add to `.env.local`: `ASSEMBLYAI_API_KEY=your_key`

### Vercel Blob (for audio storage)

- Get token: <https://vercel.com/dashboard/stores>
- Add to `.env.local`: `BLOB_READ_WRITE_TOKEN=your_token`

## Why Gemini?

- ✅ **FREE tier**: 15 requests/min, 1,500 requests/day
- ✅ **Cheaper**: ~10x cheaper than GPT-4
- ✅ **Better**: Multi-modal capabilities
- ✅ **Fast**: 1-3 second response times

## Need Help?

Check the full guide: `.agent/ENVIRONMENT_SETUP.md`
