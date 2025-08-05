import { NextRequest, NextResponse } from 'next/server'
import { adminMiddleware } from '@/lib/middleware'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = adminMiddleware(request)
    
    if (user instanceof NextResponse) {
      return user
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        _count: {
          select: {
            contents: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
