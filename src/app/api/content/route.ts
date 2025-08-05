import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware } from '@/lib/middleware'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = authMiddleware(request)
    
    if (user instanceof NextResponse) {
      return user
    }

    const { searchParams } = new URL(request.url)
    const isPublic = searchParams.get('public') === 'true'

    if (isPublic) {
      // Public content - only published content from publishers
      const contents = await prisma.content.findMany({
        where: {
          isPublished: true,
          isPublic: true,
          user: {
            role: 'PUBLISHER',
            isActive: true
          }
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
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return NextResponse.json({ contents })
    } else {
      // User's own content
      const contents = await prisma.content.findMany({
        where: {
          userId: user.userId
        },
        include: {
          _count: {
            select: {
              likes: true,
              comments: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return NextResponse.json({ contents })
    }
  } catch (error) {
    console.error('Get content error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
