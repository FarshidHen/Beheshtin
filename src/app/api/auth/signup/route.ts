import { NextRequest, NextResponse } from 'next/server'
import { signUpSchema } from '@/lib/validations'
import { createUser, getUserByEmail } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = signUpSchema.parse(body)

    // Check if user already exists
    const existingUser = await getUserByEmail(validatedData.email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Create user
    const user = await createUser(validatedData)

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: userWithoutPassword
      },
      { status: 201 }
    )
          } catch (error: unknown) {
      console.error('Signup error:', error)
      
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
