import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware } from '@/lib/middleware'
import { prisma } from '@/lib/db'
import { unlink } from 'fs/promises'
import { join } from 'path'
import { logError, logInfo } from '@/lib/logger'

// GET single content
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = authMiddleware(request)
    
    if (user instanceof NextResponse) {
      return user
    }

    const content = await prisma.content.findFirst({
      where: {
        id: params.id,
        userId: user.userId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      }
    })

    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ content })
  } catch (error) {
    logError(error, 'CONTENT_GET')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT update content
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    logInfo(`Update content attempt: ${params.id}`, 'CONTENT_UPDATE')
    const user = authMiddleware(request)
    
    if (user instanceof NextResponse) {
      return user
    }

    const body = await request.json()
    const { title, description, keywords, subject } = body

    // Update content
    const content = await prisma.content.update({
      where: {
        id: params.id,
        userId: user.userId // Ensure user owns this content
      },
      data: {
        title,
        description,
        keywords,
        subject,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      }
    })

    logInfo(`Content updated successfully: ${content.title}`, 'CONTENT_UPDATE')

    return NextResponse.json({
      message: 'Content updated successfully',
      content
    })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Content not found or access denied' },
        { status: 404 }
      )
    }
    logError(error, 'CONTENT_UPDATE')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE content
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    logInfo(`Delete content attempt: ${params.id}`, 'CONTENT_DELETE')
    const user = authMiddleware(request)
    
    if (user instanceof NextResponse) {
      return user
    }

    // First get the content to check ownership and get audio file path
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

    // Delete the audio file
    if (content.audioUrl) {
      try {
        const filename = content.audioUrl.replace('/uploads/', '')
        const filepath = join(process.cwd(), 'public', 'uploads', filename)
        await unlink(filepath)
        logInfo(`Audio file deleted: ${filename}`, 'CONTENT_DELETE')
      } catch (fileError) {
        // File might not exist, that's okay
        logInfo(`Could not delete audio file: ${content.audioUrl}`, 'CONTENT_DELETE')
      }
    }

    // Delete from database
    await prisma.content.delete({
      where: {
        id: params.id
      }
    })

    logInfo(`Content deleted successfully: ${content.title}`, 'CONTENT_DELETE')

    return NextResponse.json({
      message: 'Content deleted successfully'
    })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      )
    }
    logError(error, 'CONTENT_DELETE')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
