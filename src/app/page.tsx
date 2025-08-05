'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/use-toast'
import { Play, Heart, MessageCircle, User, LogIn } from 'lucide-react'

interface Content {
  id: string
  title: string
  description?: string
  transcript: string
  audioUrl: string
  createdAt: string
  user: {
    id: string
    name: string
    avatar?: string
  }
  _count: {
    likes: number
    comments: number
  }
}

export default function HomePage() {
  const [contents, setContents] = useState<Content[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchPublicContent()
  }, [])

  const fetchPublicContent = async () => {
    try {
      const response = await fetch('/api/content?public=true')
      
      if (!response.ok) {
        throw new Error('Failed to fetch content')
      }

      const data = await response.json()
      setContents(data.contents)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load content',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLike = async (contentId: string) => {
    // In a real app, you would implement like functionality
    toast({
      title: 'Like',
      description: 'Like functionality would be implemented here',
    })
  }

  const handleComment = async (contentId: string) => {
    // In a real app, you would implement comment functionality
    toast({
      title: 'Comment',
      description: 'Comment functionality would be implemented here',
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">Voice Content Platform</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/signin">
                <Button variant="outline">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button>
                  <User className="h-4 w-4 mr-2" />
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Discover Amazing Voice Content
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Explore a curated collection of voice content from talented creators. 
              Listen to podcasts, interviews, stories, and more.
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/signup">
                <Button size="lg">
                  <User className="h-5 w-5 mr-2" />
                  Start Creating
                </Button>
              </Link>
              <Link href="#content">
                <Button variant="outline" size="lg">
                  <Play className="h-5 w-5 mr-2" />
                  Explore Content
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section id="content" className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Content</h2>
          <p className="text-gray-600">
            Latest voice content from our community of creators
          </p>
        </div>

        {contents.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No content available</h3>
              <p className="text-gray-500 mb-4">
                Be the first to upload voice content to our platform
              </p>
              <Link href="/signup">
                <Button>
                  <User className="h-4 w-4 mr-2" />
                  Sign Up to Create
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contents.map((content) => (
              <Card key={content.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-2">
                    <Avatar>
                      <AvatarImage src={content.user.avatar} />
                      <AvatarFallback>{content.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{content.user.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(content.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{content.title}</CardTitle>
                  <CardDescription>
                    {content.description || 'No description available'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {content.transcript.substring(0, 150)}...
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(content.id)}
                          className="flex items-center"
                        >
                          <Heart className="h-4 w-4 mr-1" />
                          {content._count.likes}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleComment(content.id)}
                          className="flex items-center"
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {content._count.comments}
                        </Button>
                      </div>
                      <Button size="sm">
                        <Play className="h-4 w-4 mr-1" />
                        Listen
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Voice Content Platform</h3>
              <p className="text-gray-300">
                A platform for creators to share and discover amazing voice content.
              </p>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/signup" className="text-gray-300 hover:text-white">Sign Up</Link></li>
                <li><Link href="/signin" className="text-gray-300 hover:text-white">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-4">Contact</h4>
              <p className="text-gray-300">
                Get in touch with us for support or questions.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-300">
              © 2024 Voice Content Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
