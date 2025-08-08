import { NextRequest, NextResponse } from 'next/server'
import { signInSchema } from '@/lib/validations'
import { getUserByEmail, verifyPassword, generateToken } from '@/lib/auth'
import { logError, logInfo } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    logInfo('Signin attempt started', 'SIGNIN')
    const body = await request.json()
    logInfo(`Signin attempt for email: ${body.email}`, 'SIGNIN')
    const validatedData = signInSchema.parse(body)

    // Find user by email
    const user = await getUserByEmail(validatedData.email)
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await verifyPassword(validatedData.password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    logInfo(`Signin successful for user: ${user.email}`, 'SIGNIN')
    
    return NextResponse.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    })
  } catch (error: unknown) {
    logError(error, 'SIGNIN')
    
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: (error as any).errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
