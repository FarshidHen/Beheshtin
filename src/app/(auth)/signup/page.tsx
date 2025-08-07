'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signUpSchema } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Mic, ArrowLeft } from 'lucide-react'

type SignUpData = {
  name: string
  email: string
  password: string
  role: 'PUBLISHER' | 'EDITOR' | 'USER'
}

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      role: 'USER'
    }
  })

  const onSubmit = async (data: SignUpData) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Signup failed')
      }

      toast({
        title: 'Success!',
        description: 'Account created successfully. Please sign in.',
      })

      router.push('/signin')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-orange-50 to-brand-green-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center text-brand-orange-600 hover:text-brand-orange-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-brand-orange-500 to-brand-green-500 rounded-lg flex items-center justify-center">
              <Mic className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Beheshtin</h1>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Create your account
          </h2>
          <p className="text-gray-600">
            Or{' '}
            <Link href="/signin" className="font-medium text-brand-orange-600 hover:text-brand-orange-500 transition-colors">
              sign in to your existing account
            </Link>
          </p>
        </div>

        <Card className="border-brand-orange-200 shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Join Beheshtin</CardTitle>
            <CardDescription>
              Create your account to start uploading and managing voice content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  {...register('name')}
                  placeholder="Enter your full name"
                  className="mt-1 border-brand-orange-200 focus:border-brand-orange-500 focus:ring-brand-orange-500"
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name.message as string}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="Enter your email"
                  className="mt-1 border-brand-orange-200 focus:border-brand-orange-500 focus:ring-brand-orange-500"
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email.message as string}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register('password')}
                  placeholder="Create a strong password"
                  className="mt-1 border-brand-orange-200 focus:border-brand-orange-500 focus:ring-brand-orange-500"
                />
                {errors.password && (
                  <p className="text-sm text-red-600 mt-1">{errors.password.message as string}</p>
                )}
              </div>

              <div>
                <Label htmlFor="role" className="text-sm font-medium text-gray-700">Role</Label>
                <Select onValueChange={(value: 'PUBLISHER' | 'EDITOR' | 'USER') => setValue('role', value)}>
                  <SelectTrigger className="mt-1 border-brand-orange-200 focus:border-brand-orange-500 focus:ring-brand-orange-500">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">User - Basic content creation</SelectItem>
                    <SelectItem value="EDITOR">Editor - Upload and edit content</SelectItem>
                    <SelectItem value="PUBLISHER">Publisher - Upload and publish content</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-red-600 mt-1">{errors.role.message as string}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full btn-primary text-base py-3 mt-6" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  'Create account'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Features preview */}
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-4">What you&apos;ll get:</p>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="bg-white/50 rounded-lg p-3 border border-brand-orange-200">
              <div className="w-6 h-6 bg-brand-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Mic className="h-3 w-3 text-white" />
              </div>
              <p className="font-medium text-gray-700">Voice Upload</p>
            </div>
            <div className="bg-white/50 rounded-lg p-3 border border-brand-green-200">
              <div className="w-6 h-6 bg-brand-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Mic className="h-3 w-3 text-white" />
              </div>
              <p className="font-medium text-gray-700">AI Transcription</p>
            </div>
            <div className="bg-white/50 rounded-lg p-3 border border-brand-orange-200">
              <div className="w-6 h-6 bg-gradient-to-r from-brand-orange-500 to-brand-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Mic className="h-3 w-3 text-white" />
              </div>
              <p className="font-medium text-gray-700">Community</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
