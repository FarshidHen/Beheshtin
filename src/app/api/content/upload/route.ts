import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware } from '@/lib/middleware'
import { prisma } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { logError, logInfo } from '@/lib/logger'
import { addTranscriptJob } from '@/lib/transcriptQueue'

export async function POST(request: NextRequest) {
  try {
    logInfo('Upload attempt started', 'UPLOAD')
    const user = authMiddleware(request)
    
    if (user instanceof NextResponse) {
      return user
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const keywords = formData.get('keywords') as string
    const subject = formData.get('subject') as string
    const language = formData.get('language') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      return NextResponse.json(
        { error: 'File must be an audio file' },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    try {
      await mkdir(uploadsDir, { recursive: true, mode: 0o777 })
    } catch (error) {
      // Directory might already exist, that's okay
      logInfo(`Upload directory status: ${error}`, 'UPLOAD')
    }

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name}`
    const filepath = join(uploadsDir, filename)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Create content record without transcript initially
    const content = await prisma.content.create({
      data: {
        title: title || file.name,
        description: description || '',
        keywords: keywords || '',
        subject: subject || '',
        transcript: null, // Will be generated when processed
        audioUrl: `/api/uploads/${filename}`,
        audioDuration: 0, // You would calculate this from the actual audio file
        language: (language as 'ENGLISH' | 'FARSI') || 'ENGLISH',
        isProcessed: false,
        userId: user.userId,
        isPublished: false,
        isPublic: true
      }
    })

    logInfo(`Content uploaded successfully: ${content.title}`, 'UPLOAD')
    
    // Add transcript job to queue for background processing
    const jobId = addTranscriptJob(content.id, filepath, language as 'ENGLISH' | 'FARSI')
    
    logInfo(`Transcript job queued: ${jobId} for content: ${content.id}`, 'UPLOAD')
    
    return NextResponse.json({
      message: 'Content uploaded successfully. Transcript processing started.',
      content,
      transcriptJobId: jobId
    })
  } catch (error) {
    logError(error, 'UPLOAD')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
