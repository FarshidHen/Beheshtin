import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware } from '@/lib/middleware'
import { prisma } from '@/lib/db'
import { logError, logInfo } from '@/lib/logger'
import { addTranscriptJob } from '@/lib/transcriptQueue'
import { join } from 'path'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    logInfo(`Process transcript attempt: ${params.id}`, 'PROCESS')
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

    // Get the audio file path
    const audioUrl = content.audioUrl
    const filename = audioUrl.replace('/api/uploads/', '')
    const filepath = join(process.cwd(), 'public', 'uploads', filename)

    // Add transcript job to queue for OpenAI Whisper processing
    const jobId = addTranscriptJob(content.id, filepath, content.language as 'ENGLISH' | 'FARSI')
    
    logInfo(`Transcript job queued: ${jobId} for content: ${content.id}`, 'PROCESS')
    
    return NextResponse.json({
      message: 'Transcript processing started with OpenAI Whisper',
      jobId: jobId,
      contentId: content.id
    })
  } catch (error) {
    logError(error, 'PROCESS')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Mock transcript function removed - now using OpenAI Whisper
