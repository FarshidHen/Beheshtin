/**
 * Transcript Job Queue System
 * Handles background processing of audio transcription
 */

import { transcribeAudio, validateAudioFile } from './transcriptService'
import { prisma } from './db'
import { logInfo, logError } from './logger'

export interface TranscriptJob {
  id: string
  contentId: string
  filePath: string
  language: 'ENGLISH' | 'FARSI'
  attempts: number
  maxAttempts: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: Date
  processedAt?: Date
  error?: string
  progress: number
}

// In-memory queue (for simple implementation)
// For production, consider Redis or a proper queue system like Bull
const transcriptQueue: TranscriptJob[] = []
const processingJobs = new Set<string>()
const jobProgressIntervals = new Map<string, NodeJS.Timeout>()

/**
 * Add transcript job to queue
 * @param contentId - Content ID to process
 * @param filePath - Path to audio file
 * @param language - Expected language
 * @returns Job ID
 */
export function addTranscriptJob(
  contentId: string,
  filePath: string,
  language: 'ENGLISH' | 'FARSI' = 'ENGLISH'
): string {
  const jobId = `transcript_${contentId}_${Date.now()}`
  
  const job: TranscriptJob = {
    id: jobId,
    contentId,
    filePath,
    language,
    attempts: 0,
    maxAttempts: 3,
    status: 'pending',
    createdAt: new Date(),
    progress: 0
  }
  
  transcriptQueue.push(job)
  
  logInfo(`Added transcript job: ${jobId} for content: ${contentId}`, 'QUEUE')
  
  // Start processing if not already running
  processQueue()
  
  return jobId
}

/**
 * Process jobs in the queue
 */
async function processQueue(): Promise<void> {
  // Find next pending job
  const job = transcriptQueue.find(j => j.status === 'pending')
  
  if (!job || processingJobs.has(job.id)) {
    return
  }
  
  // Mark as processing
  job.status = 'processing'
  job.attempts++
  processingJobs.add(job.id)
  job.progress = Math.max(job.progress, 5)
  
  logInfo(`Processing transcript job: ${job.id}`, 'QUEUE')
  
  try {
    // Validate audio file first
    const validation = await validateAudioFile(job.filePath)
    if (!validation.valid) {
      throw new Error(validation.error || 'File validation failed')
    }
    job.progress = Math.max(job.progress, 10)

    // Start an interval to simulate progress up to 90% while processing
    if (!jobProgressIntervals.has(job.id)) {
      const interval = setInterval(() => {
        const tracked = transcriptQueue.find(j => j.id === job.id)
        if (!tracked || tracked.status !== 'processing') {
          clearInterval(interval)
          jobProgressIntervals.delete(job.id)
          return
        }
        if (tracked.progress < 90) {
          tracked.progress = Math.min(90, tracked.progress + 5)
        }
      }, 1000)
      jobProgressIntervals.set(job.id, interval)
    }

    // Decide path: real Whisper if key present, else mock
    if (process.env.OPENAI_API_KEY) {
      const result = await transcribeAudio(job.filePath, job.language)
      if ('error' in result) {
        throw new Error(result.error)
      }

      // Update database with transcript
      await prisma.content.update({
        where: { id: job.contentId },
        data: {
          transcript: result.transcript,
          language: result.language,
          isProcessed: true,
          editedTranscript: result.transcript
        }
      })
    } else {
      // Mock path: simulate a bit of work then save placeholder transcript
      await new Promise((resolve) => setTimeout(resolve, 5000))
      const nowIso = new Date().toISOString()
      const mockText = `Mock transcript generated at ${nowIso}. This is placeholder text.`
      await prisma.content.update({
        where: { id: job.contentId },
        data: {
          transcript: mockText,
          isProcessed: true,
          editedTranscript: mockText
        }
      })
    }

    // Mark job as completed
    job.status = 'completed'
    job.processedAt = new Date()
    job.progress = 100
    const interval = jobProgressIntervals.get(job.id)
    if (interval) { clearInterval(interval); jobProgressIntervals.delete(job.id) }
    
    logInfo(`Transcript job completed: ${job.id}`, 'QUEUE')
    
  } catch (error: any) {
    logError(error, 'QUEUE')
    
    job.error = error.message
    
    // Retry logic
    if (job.attempts < job.maxAttempts && isRetryableError(error)) {
      job.status = 'pending'
      logInfo(`Retrying transcript job: ${job.id} (attempt ${job.attempts + 1}/${job.maxAttempts})`, 'QUEUE')
    } else {
      job.status = 'failed'
      const interval = jobProgressIntervals.get(job.id)
      if (interval) { clearInterval(interval); jobProgressIntervals.delete(job.id) }
      
      // Update database to mark as failed
      await prisma.content.update({
        where: { id: job.contentId },
        data: {
          isProcessed: false,
          transcript: null
        }
      }).catch(dbError => {
        logError(dbError, 'QUEUE')
      })
      
      logError(`Transcript job failed permanently: ${job.id}`, 'QUEUE')
    }
  } finally {
    processingJobs.delete(job.id)
    
    // Continue processing next job after a delay
    setTimeout(() => {
      processQueue()
    }, 1000)
  }
}

/**
 * Get job status
 * @param jobId - Job ID
 * @returns Job status or null if not found
 */
export function getJobStatus(jobId: string): TranscriptJob | null {
  return transcriptQueue.find(job => job.id === jobId) || null
}

/**
 * Get jobs for content
 * @param contentId - Content ID
 * @returns Array of jobs for the content
 */
export function getJobsForContent(contentId: string): TranscriptJob[] {
  return transcriptQueue.filter(job => job.contentId === contentId)
}

/**
 * Clean up completed/failed jobs older than 24 hours
 */
export function cleanupOldJobs(): void {
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  
  const initialLength = transcriptQueue.length
  
  // Remove old completed/failed jobs
  const indicesToRemove = transcriptQueue
    .map((job, index) => ({ job, index }))
    .filter(({ job }) => 
      (job.status === 'completed' || job.status === 'failed') && 
      job.createdAt < dayAgo
    )
    .map(({ index }) => index)
    .reverse() // Remove from end to start to maintain indices
  
  indicesToRemove.forEach(index => {
    transcriptQueue.splice(index, 1)
  })
  
  if (indicesToRemove.length > 0) {
    logInfo(`Cleaned up ${indicesToRemove.length} old transcript jobs`, 'QUEUE')
  }
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: any): boolean {
  const message = error.message?.toLowerCase() || ''
  
  // Network/temporary errors
  if (message.includes('rate limit') || 
      message.includes('timeout') || 
      message.includes('network') ||
      message.includes('server error')) {
    return true
  }
  
  return false
}

// Run cleanup every hour
setInterval(cleanupOldJobs, 60 * 60 * 1000)



