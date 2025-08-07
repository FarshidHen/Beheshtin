import fs from 'fs'
import path from 'path'

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs')
try {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true })
    console.log(`✅ Created logs directory: ${logsDir}`)
  }
} catch (error) {
  console.error('❌ Failed to create logs directory:', error)
}

const logFile = path.join(logsDir, 'app.log')
console.log(`📄 Log file path: ${logFile}`)

export function logError(error: any, context?: string) {
  const timestamp = new Date().toISOString()
  const contextStr = context ? `[${context}] ` : ''
  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorStack = error instanceof Error ? error.stack : ''
  
  const logEntry = `[${timestamp}] ERROR ${contextStr}${errorMessage}\n${errorStack}\n\n`
  
  // Always log to console first
  console.error(`❌ [${context || 'ERROR'}] ${errorMessage}`)
  console.error(`📄 Logging to: ${logFile}`)
  
  try {
    fs.appendFileSync(logFile, logEntry)
    console.error(`✅ Error logged to: ${logFile}`)
  } catch (writeError) {
    console.error('❌ Failed to write to log file:', writeError)
  }
}

export function logInfo(message: string, context?: string) {
  const timestamp = new Date().toISOString()
  const contextStr = context ? `[${context}] ` : ''
  
  const logEntry = `[${timestamp}] INFO ${contextStr}${message}\n`
  
  // Always log to console first
  console.log(`✅ [${context || 'INFO'}] ${message}`)
  
  try {
    fs.appendFileSync(logFile, logEntry)
  } catch (writeError) {
    console.error('❌ Failed to write to log file:', writeError)
  }
}

export const LOG_FILE_PATH = logFile
