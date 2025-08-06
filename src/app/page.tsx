'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/use-toast'
import { Play, Heart, MessageCircle, User, LogIn, Mic, Upload, Users, Shield, Sparkles, Headphones, Zap, Globe, Star } from 'lucide-react'

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-orange-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading Beheshtin...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-orange-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 via-yellow-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                <Mic className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
                Beheshtin
              </h1>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Link href="/signin">
                <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50 hover:border-orange-400 transition-all duration-200">
                  <LogIn className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Sign In</span>
                  <span className="sm:hidden">Login</span>
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                  <User className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Get Started</span>
                  <span className="sm:hidden">Join</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center relative z-10">
            <div className="mb-8">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-100 to-green-100 rounded-full text-sm font-medium text-orange-800 mb-6">
                <Sparkles className="h-4 w-4 mr-2" />
                AI-Powered Voice Platform
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 leading-tight">
                <span className="bg-gradient-to-r from-orange-600 via-yellow-600 to-green-600 bg-clip-text text-transparent">
                  Transform Your Voice
                </span>
                <br />
                <span className="text-gray-800">Into Amazing Content</span>
              </h2>
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-8 sm:mb-10 max-w-4xl mx-auto leading-relaxed px-4">
                Upload, transcribe, and share your voice content with our advanced AI platform. 
                Create podcasts, interviews, stories, and more with automatic transcription and intelligent analysis.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 px-4">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button className="bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600 text-white text-lg sm:text-xl px-8 sm:px-10 py-4 w-full sm:w-auto shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105">
                  <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 mr-3" />
                  Start Creating Today
                </Button>
              </Link>
              <Link href="#features" className="w-full sm:w-auto">
                <Button variant="outline" className="border-2 border-orange-300 text-orange-700 hover:bg-orange-50 hover:border-orange-400 text-lg sm:text-xl px-8 sm:px-10 py-4 w-full sm:w-auto transition-all duration-200">
                  <Play className="h-5 w-5 sm:h-6 sm:w-6 mr-3" />
                  See How It Works
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/4 w-48 h-48 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse animation-delay-4000"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
                1000+
              </div>
              <p className="text-gray-600 font-medium">Voice Content</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
                500+
              </div>
              <p className="text-gray-600 font-medium">Active Creators</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
                99.9%
              </div>
              <p className="text-gray-600 font-medium">AI Accuracy</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
                24/7
              </div>
              <p className="text-gray-600 font-medium">Platform Uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-20">
            <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Why Choose Beheshtin?</h3>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of voice content creation with our cutting-edge AI-powered platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            <Card className="group hover:shadow-2xl transition-all duration-300 border-orange-200 hover:border-orange-300 transform hover:-translate-y-2">
              <CardHeader className="text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Upload className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <CardTitle className="text-xl sm:text-2xl text-gray-900">Easy Upload</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 leading-relaxed">
                  Upload your voice content with just a few clicks. Support for MP3, WAV, M4A, and more audio formats. 
                  Our platform handles the rest with automatic processing and optimization.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 border-green-200 hover:border-green-300 transform hover:-translate-y-2">
              <CardHeader className="text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Zap className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <CardTitle className="text-xl sm:text-2xl text-gray-900">AI Transcription</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 leading-relaxed">
                  Advanced AI technology automatically transcribes your audio with 99.9% accuracy. 
                  Get instant text versions, keyword extraction, and intelligent content analysis.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 border-orange-200 hover:border-orange-300 transform hover:-translate-y-2">
              <CardHeader className="text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-orange-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Users className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <CardTitle className="text-xl sm:text-2xl text-gray-900">Vibrant Community</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 leading-relaxed">
                  Connect with fellow creators, share your content, and build your audience. 
                  Like, comment, and discover amazing voice content from around the world.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 border-green-200 hover:border-green-300 transform hover:-translate-y-2">
              <CardHeader className="text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Headphones className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <CardTitle className="text-xl sm:text-2xl text-gray-900">Smart Playback</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 leading-relaxed">
                  Enjoy high-quality audio playback with synchronized transcripts. 
                  Follow along with the text while listening to your favorite content.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 border-orange-200 hover:border-orange-300 transform hover:-translate-y-2">
              <CardHeader className="text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Globe className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <CardTitle className="text-xl sm:text-2xl text-gray-900">Global Reach</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 leading-relaxed">
                  Share your voice with the world. Our platform supports multiple languages 
                  and reaches audiences across different time zones and cultures.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 border-green-200 hover:border-green-300 transform hover:-translate-y-2">
              <CardHeader className="text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <CardTitle className="text-xl sm:text-2xl text-gray-900">Secure & Private</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 leading-relaxed">
                  Your content is protected with enterprise-grade security. 
                  Choose privacy settings and control who can access your voice content.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 sm:py-32 bg-gradient-to-br from-orange-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-20">
            <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">How It Works</h3>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Get started with Beheshtin in just three simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">Upload Your Audio</h4>
              <p className="text-gray-600 leading-relaxed">
                Simply drag and drop your audio file or click to upload. 
                We support all major audio formats up to 100MB.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">AI Processing</h4>
              <p className="text-gray-600 leading-relaxed">
                Our AI automatically transcribes your audio, extracts keywords, 
                and generates a detailed analysis of your content.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">Share & Connect</h4>
              <p className="text-gray-600 leading-relaxed">
                Publish your content, share it with the community, 
                and connect with listeners and fellow creators.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section id="content" className="py-20 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 sm:mb-16 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Featured Content</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Discover amazing voice content from our talented community of creators
            </p>
          </div>

          {contents.length === 0 ? (
            <Card className="max-w-2xl mx-auto border-2 border-dashed border-orange-300 bg-gradient-to-br from-orange-50 to-green-50">
              <CardContent className="text-center py-16 sm:py-20">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-r from-orange-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                  <Play className="h-12 w-12 sm:h-16 sm:w-16 text-white" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Be the First Creator!</h3>
                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                  Start your journey as a voice content creator. Upload your first audio and inspire others to join our community.
                </p>
                <Link href="/signup">
                  <Button className="bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600 text-white text-lg px-8 py-4 shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105">
                    <User className="h-5 w-5 mr-3" />
                    Start Creating Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
              {contents.map((content, index) => (
                <Card key={content.id} className="group hover:shadow-2xl transition-all duration-300 bg-white border-orange-200 hover:border-orange-300 transform hover:-translate-y-2 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <CardHeader>
                    <div className="flex items-center space-x-3 mb-4">
                      <Avatar className="border-2 border-orange-200 w-12 h-12">
                        <AvatarImage src={content.user.avatar} />
                        <AvatarFallback className="bg-gradient-to-r from-orange-500 to-green-500 text-white text-sm">
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
                    <CardTitle className="text-lg text-gray-900 line-clamp-2">{content.title}</CardTitle>
                    <CardDescription className="text-gray-600 text-sm line-clamp-2">
                      {content.description || 'No description available'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-orange-50 to-green-50 p-4 rounded-lg border border-orange-100">
                        <p className="text-sm text-gray-700 line-clamp-3">
                          {content.transcript.substring(0, 120)}...
                        </p>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike(content.id)}
                            className="flex items-center text-orange-600 hover:text-orange-700 hover:bg-orange-50 h-8 px-3"
                          >
                            <Heart className="h-4 w-4 mr-1" />
                            <span className="text-sm">{content._count.likes}</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleComment(content.id)}
                            className="flex items-center text-green-600 hover:text-green-700 hover:bg-green-50 h-8 px-3"
                          >
                            <MessageCircle className="h-4 w-4 mr-1" />
                            <span className="text-sm">{content._count.comments}</span>
                          </Button>
                        </div>
                        <Button size="sm" className="bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600 text-white text-sm h-8 px-4 shadow-lg">
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
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32 bg-gradient-to-r from-orange-500 to-green-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Share Your Voice?
          </h3>
          <p className="text-lg sm:text-xl text-orange-100 mb-8 leading-relaxed">
            Join thousands of creators who are already sharing their stories, 
            knowledge, and creativity with the world through Beheshtin.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button className="bg-white text-orange-600 hover:bg-gray-100 text-lg px-8 py-4 w-full sm:w-auto shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105">
                <Sparkles className="h-5 w-5 mr-3" />
                Start Creating Today
              </Button>
            </Link>
            <Link href="/signin" className="w-full sm:w-auto">
              <Button variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-orange-600 text-lg px-8 py-4 w-full sm:w-auto transition-all duration-200">
                <LogIn className="h-5 w-5 mr-3" />
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-10">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Mic className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-400 to-green-400 bg-clip-text text-transparent">
                  Beheshtin
                </h3>
              </div>
              <p className="text-gray-300 mb-6 max-w-md text-base leading-relaxed">
                The ultimate platform for voice content creators. Upload, transcribe, and share your voice with the world using advanced AI technology.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <Star className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg sm:text-xl font-semibold mb-6">Quick Links</h4>
              <ul className="space-y-3">
                <li><Link href="/signup" className="text-gray-300 hover:text-orange-400 transition-colors text-base">Get Started</Link></li>
                <li><Link href="/signin" className="text-gray-300 hover:text-orange-400 transition-colors text-base">Sign In</Link></li>
                <li><Link href="#features" className="text-gray-300 hover:text-orange-400 transition-colors text-base">Features</Link></li>
                <li><Link href="#content" className="text-gray-300 hover:text-orange-400 transition-colors text-base">Explore Content</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg sm:text-xl font-semibold mb-6">Contact</h4>
              <p className="text-gray-300 mb-4 text-base leading-relaxed">
                Have questions? We're here to help you succeed with your voice content journey.
              </p>
              <p className="text-orange-400 text-base font-medium">support@beheshtin.com</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-10 sm:mt-12 pt-8 sm:pt-10 text-center">
            <p className="text-gray-400 text-base">
              © 2024 Beheshtin. All rights reserved. Made with ❤️ for voice creators worldwide.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
