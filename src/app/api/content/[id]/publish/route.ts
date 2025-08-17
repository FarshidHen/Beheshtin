import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware } from '@/lib/middleware'
import { prisma } from '@/lib/db'
import { logError, logInfo } from '@/lib/logger'

// PATCH - Toggle publish status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = authMiddleware(request)
    
    if (user instanceof NextResponse) {
      return user
    }

    const { isPublished } = await request.json()

    // Get the content to check ownership
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

    // Update publish status
    const updatedContent = await prisma.content.update({
      where: {
        id: params.id
      },
      data: {
        isPublished: isPublished,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
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

    logInfo(
      `Content ${isPublished ? 'published' : 'unpublished'}: ${content.id} by user: ${user.userId}`,
      'PUBLISH'
    )

    return NextResponse.json({
      message: `Content ${isPublished ? 'published' : 'unpublished'} successfully`,
      content: updatedContent
    })

  } catch (error) {
    logError(error, 'PUBLISH_CONTENT')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
