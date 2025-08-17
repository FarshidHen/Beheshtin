/**
 * OpenAI Whisper Transcript Service
 * Handles audio transcription with language detection
 */

import OpenAI from 'openai'
import { createReadStream } from 'fs'
import { logInfo, logError } from './logger'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface TranscriptResult {
  transcript: string
  language: 'ENGLISH' | 'FARSI'
  confidence?: number
  processingTime: number
}

export interface TranscriptError {
  error: string
  code: string
  retryable: boolean
}

/**
 * Transcribe audio file using OpenAI Whisper
 * @param filePath - Path to the audio file
 * @param expectedLanguage - Expected language for better accuracy
 * @returns Promise with transcript result or error
 */
export async function transcribeAudio(
  filePath: string,
  expectedLanguage: 'ENGLISH' | 'FARSI' = 'ENGLISH'
): Promise<TranscriptResult | TranscriptError> {
  const startTime = Date.now()
  
  try {
    logInfo(`Starting transcription for: ${filePath}`, 'TRANSCRIPT')
    
    // Create file stream
    const audioFile = createReadStream(filePath)
    
    // Call OpenAI Whisper API
    // Let Whisper auto-detect language by omitting explicit language parameter
    const response = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'verbose_json', // Get additional metadata
      temperature: 0.2, // Lower temperature for more consistent results
    })
    
    const processingTime = Date.now() - startTime
    
    // Detect actual language from response
    const detectedLanguage = detectLanguageFromText(response.text)
    
    logInfo(`Transcription completed in ${processingTime}ms`, 'TRANSCRIPT')
    
    return {
      transcript: response.text?.trim() || '',
      language: detectedLanguage,
      confidence: Array.isArray((response as any).segments) ? (response as any).segments[0]?.avg_logprob : undefined,
      processingTime
    }
    
  } catch (error: any) {
    const processingTime = Date.now() - startTime
    
    logError(error, 'TRANSCRIPT')
    
    // Categorize errors for retry logic
    const isRetryable = isRetryableError(error)
    
    return {
      error: error.message || 'Transcription failed',
      code: error.code || 'UNKNOWN_ERROR',
      retryable: isRetryable
    }
  }
}

/**
 * Detect language from transcribed text
 * @param text - Transcribed text
 * @returns Detected language
 */
function detectLanguageFromText(text: string): 'ENGLISH' | 'FARSI' {
  // Check for Persian/Farsi characters and common Persian punctuation/diacritics
  const persianRegex = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF\u061B\u061F\u064B-\u065F]/
  
  if (persianRegex.test(text)) {
    return 'FARSI'
  }
  
  return 'ENGLISH'
}

/**
 * Determine if error is retryable
 * @param error - Error object
 * @returns Whether the error is retryable
 */
function isRetryableError(error: any): boolean {
  // Retryable errors
  const retryableCodes = [
    'rate_limit_exceeded',
    'server_error',
    'timeout',
    'network_error'
  ]
  
  // Non-retryable errors
  const nonRetryableCodes = [
    'invalid_api_key',
    'file_too_large',
    'unsupported_file_type',
    'invalid_file'
  ]
  
  if (nonRetryableCodes.includes(error.code)) {
    return false
  }
  
  if (retryableCodes.includes(error.code)) {
    return true
  }
  
  // Default: retry on HTTP 5xx errors
  if (error.status >= 500) {
    return true
  }
  
  return false
}

/**
 * Validate audio file for transcription
 * @param filePath - Path to audio file
 * @returns Validation result
 */
export async function validateAudioFile(filePath: string): Promise<{
  valid: boolean
  error?: string
  fileSize?: number
  duration?: number
}> {
  try {
    const fs = await import('fs/promises')
    const stats = await fs.stat(filePath)
    
    // Check file size (Whisper limit is 25MB)
    const maxSize = 25 * 1024 * 1024 // 25MB
    if (stats.size > maxSize) {
      return {
        valid: false,
        error: 'File too large (max 25MB)',
        fileSize: stats.size
      }
    }
    
    // TODO: Add audio duration check if needed
    // You could use a library like 'node-ffprobe' for this
    
    return {
      valid: true,
      fileSize: stats.size
    }
    
  } catch (error: any) {
    return {
      valid: false,
      error: error.message || 'File validation failed'
    }
  }
}



