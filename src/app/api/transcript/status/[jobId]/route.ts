import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware } from '@/lib/middleware'
import { getJobStatus } from '@/lib/transcriptQueue'
import { logInfo } from '@/lib/logger'

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    // Verify authentication
    const user = authMiddleware(request)
    if (user instanceof NextResponse) {
      return user
    }

    const { jobId } = params
    
    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      )
    }

    const job = getJobStatus(jobId)
    
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    logInfo(`Job status requested: ${jobId} - ${job.status}`, 'TRANSCRIPT_STATUS')

    return NextResponse.json({
      jobId: job.id,
      contentId: job.contentId,
      status: job.status,
      attempts: job.attempts,
      maxAttempts: job.maxAttempts,
      createdAt: job.createdAt,
      processedAt: job.processedAt,
      error: job.error
    })

  } catch (error) {
    console.error('Error fetching job status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
