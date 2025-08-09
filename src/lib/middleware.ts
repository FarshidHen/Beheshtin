import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './auth'

export function authMiddleware(request: NextRequest) {
  console.log('🚨🚨🚨 MIDDLEWARE CALLED! 🚨🚨🚨')
  console.log('🚨 URL:', request.url)
  console.log('🚨 Method:', request.method)
  
  const authHeader = request.headers.get('authorization')
  console.log('🔍 Auth header:', authHeader ? 'Present' : 'Missing')
  
  const token = authHeader?.replace('Bearer ', '')
  console.log('🔍 Token extracted:', token ? `${token.substring(0, 20)}...` : 'None')
  
  if (!token) {
    console.log('❌ No token provided')
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  const decoded = verifyToken(token)
  console.log('🔍 Token verification result:', decoded ? 'SUCCESS' : 'FAILED')
  
  if (!decoded) {
    console.log('❌ Token verification failed')
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    )
  }

  console.log('✅ Auth successful for user:', (decoded as any).email)
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
