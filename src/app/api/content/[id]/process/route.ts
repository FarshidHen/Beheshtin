import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware } from '@/lib/middleware'
import { prisma } from '@/lib/db'
import { logError, logInfo } from '@/lib/logger'
import { join } from 'path'
import { transcribeAudio, validateAudioFile } from '@/lib/transcriptService'
import { addTranscriptJob } from '@/lib/transcriptQueue'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    logInfo(`Process transcript attempt (mock): ${params.id}`, 'PROCESS')
    const user = authMiddleware(request)
    
    if (user instanceof NextResponse) {
      return user
    }

    // Get the content
    const content = await prisma.content.findFirst({
      where: {
        id: params.id,
        userId: user.userId
      }
    })

    if (!content) {
      return NextResponse.json(
        { error: 'Content not found or access denied' },
        { status: 404 }
      )
    }

    if (content.isProcessed) {
      return NextResponse.json(
        { error: 'Content has already been processed' },
        { status: 400 }
      )
    }

    // Mock transcript generation (no external API call)
    // If OPENAI_API_KEY is available, enqueue a background Whisper job and return jobId for polling
    if (process.env.OPENAI_API_KEY) {
      const audioUrl = content.audioUrl
      const filename = audioUrl.replace('/api/uploads/', '')
      const filePath = join(process.cwd(), 'public', 'uploads', filename)

      const validation = await validateAudioFile(filePath)
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error || 'Audio file validation failed' },
          { status: 400 }
        )
      }

      const jobId = addTranscriptJob(content.id, filePath, content.language as 'ENGLISH' | 'FARSI')
      logInfo(`Whisper job queued: ${jobId} for content: ${content.id}`, 'PROCESS')
      return NextResponse.json({
        message: 'Transcript processing started',
        jobId,
        contentId: content.id
      })
    }

    // Fallback: mock transcript generation (no external API)
    const nowIso = new Date().toISOString()
    const mockText = `Mock transcript for "${content.title}" generated at ${nowIso}.\nThis is placeholder transcript text. Replace with real STT later.`

    const updated = await prisma.content.update({
      where: { id: content.id },
      data: {
        transcript: mockText,
        isProcessed: true,
        editedTranscript: mockText,
      }
    })

    logInfo(`Mock transcript generated and saved for content: ${content.id}`, 'PROCESS')

    return NextResponse.json({
      message: 'Transcript generated (mock)',
      content: updated
    })
  } catch (error) {
    logError(error, 'PROCESS')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Using mock transcript generation for now; no external API
