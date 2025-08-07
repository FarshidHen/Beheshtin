import { NextRequest, NextResponse } from 'next/server'
import { readFile, stat } from 'fs/promises'
import { join } from 'path'
import { logError } from '@/lib/logger'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = params.path.join('/')
    const fullPath = join(process.cwd(), 'public', 'uploads', filePath)
    
    // Check if file exists
    const stats = await stat(fullPath)
    if (!stats.isFile()) {
      return new NextResponse('File not found', { status: 404 })
    }

    // Read the file
    const fileBuffer = await readFile(fullPath)
    
    // Determine content type based on file extension
    const ext = filePath.split('.').pop()?.toLowerCase()
    let contentType = 'application/octet-stream'
    
    switch (ext) {
      case 'mp3':
        contentType = 'audio/mpeg'
        break
      case 'wav':
        contentType = 'audio/wav'
        break
      case 'ogg':
        contentType = 'audio/ogg'
        break
      case 'm4a':
        contentType = 'audio/mp4'
        break
      case 'aac':
        contentType = 'audio/aac'
        break
    }

    // Return the file with appropriate headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': stats.size.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Accept-Ranges': 'bytes',
      },
    })
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return new NextResponse('File not found', { status: 404 })
    }
    
    logError(error, 'FILE_SERVE')
    return new NextResponse('Internal server error', { status: 500 })
  }
}
