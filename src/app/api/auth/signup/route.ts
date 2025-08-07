import { NextRequest, NextResponse } from 'next/server'
import { signUpSchema } from '@/lib/validations'
import { createUser, getUserByEmail } from '@/lib/auth'
import { logError, logInfo, LOG_FILE_PATH } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    logInfo('Signup attempt started', 'SIGNUP')
    
    const body = await request.json()
    logInfo(`Raw signup data: ${JSON.stringify(body)}`, 'SIGNUP')
    const validatedData = signUpSchema.parse(body)

    logInfo(`Signup attempt for email: ${validatedData.email}`, 'SIGNUP')

    // Check if user already exists
    const existingUser = await getUserByEmail(validatedData.email)
    if (existingUser) {
      logInfo(`User already exists: ${validatedData.email}`, 'SIGNUP')
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Create user
    const user = await createUser(validatedData)

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    logInfo(`User created successfully: ${validatedData.email}`, 'SIGNUP')
    
    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: userWithoutPassword,
        logFile: LOG_FILE_PATH // Include log file path in response for debugging
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    logError(error, 'SIGNUP')
    
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      return NextResponse.json(
        { 
          error: 'Validation error', 
          details: (error as any).errors,
          logFile: LOG_FILE_PATH
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        logFile: LOG_FILE_PATH
      },
      { status: 500 }
    )
  }
}
