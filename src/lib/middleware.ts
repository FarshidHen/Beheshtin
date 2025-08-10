import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './auth'

export function authMiddleware(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  
  if (!token) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    )
  }

  return decoded
}

export function adminMiddleware(request: NextRequest) {
  const user = authMiddleware(request)
  
  if (user instanceof NextResponse) {
    return user
  }

  if (user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    )
  }

  return user
}
