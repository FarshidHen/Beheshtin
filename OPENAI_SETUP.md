# OpenAI Whisper Integration Setup

## Required Environment Variables

Add these variables to your `.env` file:

```bash
# OpenAI API for Whisper Transcription
OPENAI_API_KEY="your-openai-api-key-here"

# Optional: OpenAI Configuration  
OPENAI_ORG_ID="your-organization-id"
OPENAI_MAX_RETRIES=3
OPENAI_TIMEOUT=60000
```

## Getting OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com)
2. Sign in or create an account
3. Navigate to API Keys section
4. Create a new secret key
5. Copy the key and add it to your `.env` file

## Installation

Install the OpenAI npm package:

```bash
npm install openai
```

## Docker Environment

For Docker deployment, add the environment variable to your docker-compose files:

```yaml
environment:
  - OPENAI_API_KEY=${OPENAI_API_KEY}
```

## Usage

The Whisper integration supports:

- ✅ English and Farsi/Persian languages
- ✅ Automatic language detection
- ✅ Background processing with queue system
- ✅ Retry logic for failed transcriptions
- ✅ File validation (max 25MB)
- ✅ Real-time status updates

## API Endpoints

- `POST /api/content/upload` - Uploads file and starts transcription
- `POST /api/content/[id]/process` - Manually trigger transcription
- `GET /api/transcript/status/[jobId]` - Check transcription status

## Architecture Benefits

- **Non-blocking uploads**: Files upload immediately, transcription happens in background
- **Fault tolerance**: Failed jobs retry automatically
- **Scalability**: Queue system handles multiple files
- **Cost optimization**: Only processes when needed
- **Language detection**: Automatically detects Farsi vs English content



