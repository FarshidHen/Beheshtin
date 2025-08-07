import { NextResponse } from 'next/server'
import { LOG_FILE_PATH } from '@/lib/logger'
import fs from 'fs'

export async function GET() {
  try {
    // Check if log file exists
    if (!fs.existsSync(LOG_FILE_PATH)) {
      return NextResponse.json({
        error: 'Log file not found',
        path: LOG_FILE_PATH
      }, { status: 404 })
    }

    // Read the log file
    const logContent = fs.readFileSync(LOG_FILE_PATH, 'utf-8')
    const lines = logContent.split('\n').filter(line => line.trim())

    // Get last 100 lines to avoid huge responses
    const recentLines = lines.slice(-100)

    return NextResponse.json({
      logFile: LOG_FILE_PATH,
      totalLines: lines.length,
      recentLines: recentLines.length,
      logs: recentLines,
      lastUpdated: fs.statSync(LOG_FILE_PATH).mtime
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to read log file',
      message: error instanceof Error ? error.message : 'Unknown error',
      logFile: LOG_FILE_PATH
    }, { status: 500 })
  }
}
