'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/use-toast'
import { Play, Heart, MessageCircle, User, LogIn, Mic, Upload, Users, Shield, Sparkles } from 'lucide-react'

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
    toast({
      title: 'Like',
      description: 'Like functionality would be implemented here',
    })
  }

  const handleComment = async (contentId: string) => {
    toast({
      title: 'Comment',
      description: 'Comment functionality would be implemented here',
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-orange-50 to-brand-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-brand-orange-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-orange-50 to-brand-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-brand-orange-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-brand-orange-500 to-brand-green-500 rounded-lg flex items-center justify-center">
                <Mic className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold gradient-text">Beheshtin</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/signin">
                <Button variant="outline" className="border-brand-orange-200 text-brand-orange-700 hover:bg-brand-orange-50 text-sm sm:text-base">
                  <LogIn className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Sign In</span>
                  <span className="sm:hidden">Login</span>
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="btn-primary text-sm sm:text-base">
                  <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Sign Up</span>
                  <span className="sm:hidden">Join</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="text-center relative z-10">
            <div className="mb-8">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
                <span className="gradient-text">Discover Amazing</span>
                <br />
                <span className="text-gray-800">Voice Content</span>
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4">
                Explore a curated collection of voice content from talented creators. 
                Listen to podcasts, interviews, stories, and more with our advanced AI-powered platform.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 px-4">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 w-full sm:w-auto">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Start Creating
                </Button>
              </Link>
              <Link href="#content" className="w-full sm:w-auto">
                <Button className="btn-secondary text-base sm:text-lg px-6 sm:px-8 py-3 w-full sm:w-auto">
                  <Play className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Explore Content
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-48 h-48 sm:w-72 sm:h-72 bg-brand-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-48 h-48 sm:w-72 sm:h-72 bg-brand-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Why Choose Beheshtin?</h3>
            <p className="text-base sm:text-lg text-gray-600">Powerful features for content creators and listeners</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <Card className="card-hover border-brand-orange-200">
              <CardHeader className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-brand-orange-500 to-brand-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Easy Upload</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm sm:text-base text-gray-600">Upload your voice content with just a few clicks. Support for multiple audio formats.</p>
              </CardContent>
            </Card>

            <Card className="card-hover border-brand-green-200">
              <CardHeader className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-brand-green-500 to-brand-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mic className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl">AI Transcription</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm sm:text-base text-gray-600">Automatic transcription and content analysis powered by advanced AI technology.</p>
              </CardContent>
            </Card>

            <Card className="card-hover border-brand-orange-200">
              <CardHeader className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-brand-orange-500 to-brand-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Community</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm sm:text-base text-gray-600">Connect with creators, like, comment, and build your audience.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section id="content" className="py-12 sm:py-20 bg-gradient-to-br from-brand-orange-50 to-brand-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 sm:mb-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Featured Content</h2>
            <p className="text-base sm:text-lg text-gray-600">
              Latest voice content from our community of creators
            </p>
          </div>

          {contents.length === 0 ? (
            <Card className="max-w-2xl mx-auto">
              <CardContent className="text-center py-12 sm:py-16">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-brand-orange-500 to-brand-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Play className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">No content available</h3>
                <p className="text-gray-600 mb-6 sm:mb-8">
                  Be the first to upload voice content to our platform
                </p>
                <Link href="/signup">
                  <Button className="btn-primary">
                    <User className="h-4 w-4 mr-2" />
                    Sign Up to Create
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {contents.map((content, index) => (
                <Card key={content.id} className="card-hover bg-white/80 backdrop-blur-sm border-brand-orange-200 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <CardHeader>
                    <div className="flex items-center space-x-3 mb-4">
                      <Avatar className="border-2 border-brand-orange-200 w-10 h-10 sm:w-12 sm:h-12">
                        <AvatarImage src={content.user.avatar} />
                        <AvatarFallback className="bg-gradient-to-r from-brand-orange-500 to-brand-green-500 text-white text-sm">
                          {content.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">{content.user.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(content.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <CardTitle className="text-base sm:text-lg text-gray-900 line-clamp-2">{content.title}</CardTitle>
                    <CardDescription className="text-gray-600 text-sm line-clamp-2">
                      {content.description || 'No description available'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-brand-orange-50 to-brand-green-50 p-3 sm:p-4 rounded-lg border border-brand-orange-100">
                        <p className="text-xs sm:text-sm text-gray-700 line-clamp-3">
                          {content.transcript.substring(0, 120)}...
                        </p>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-2 sm:space-x-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike(content.id)}
                            className="flex items-center text-brand-orange-600 hover:text-brand-orange-700 hover:bg-brand-orange-50 h-8 px-2 sm:px-3"
                          >
                            <Heart className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            <span className="text-xs sm:text-sm">{content._count.likes}</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleComment(content.id)}
                            className="flex items-center text-brand-green-600 hover:text-brand-green-700 hover:bg-brand-green-50 h-8 px-2 sm:px-3"
                          >
                            <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            <span className="text-xs sm:text-sm">{content._count.comments}</span>
                          </Button>
                        </div>
                        <Button size="sm" className="btn-primary text-xs sm:text-sm h-8 px-3 sm:px-4">
                          <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Listen
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-brand-orange-500 to-brand-green-500 rounded-lg flex items-center justify-center">
                  <Mic className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold">Beheshtin</h3>
              </div>
              <p className="text-gray-300 mb-4 max-w-md text-sm sm:text-base">
                A platform for creators to share and discover amazing voice content with advanced AI-powered features.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-gradient-to-r from-brand-orange-500 to-brand-green-500 rounded-full flex items-center justify-center">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-brand-green-500 to-brand-orange-500 rounded-full flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/signup" className="text-gray-300 hover:text-brand-orange-400 transition-colors text-sm sm:text-base">Sign Up</Link></li>
                <li><Link href="/signin" className="text-gray-300 hover:text-brand-orange-400 transition-colors text-sm sm:text-base">Sign In</Link></li>
                <li><Link href="#content" className="text-gray-300 hover:text-brand-orange-400 transition-colors text-sm sm:text-base">Explore Content</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-4">Contact</h4>
              <p className="text-gray-300 mb-2 text-sm sm:text-base">
                Get in touch with us for support or questions.
              </p>
              <p className="text-brand-orange-400 text-sm sm:text-base">support@beheshtin.com</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center">
            <p className="text-gray-400 text-sm sm:text-base">
              © 2024 Beheshtin. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
