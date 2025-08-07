import { z } from 'zod'

export const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'PUBLISHER', 'EDITOR', 'USER'])
})

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['ADMIN', 'PUBLISHER', 'EDITOR', 'USER']),
  avatar: z.string().optional(),
  bio: z.string().optional(),
  website: z.string().url().optional().or(z.literal(''))
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export const contentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  keywords: z.string().optional(),
  subject: z.string().optional(),
  isPublic: z.boolean().default(true)
})
