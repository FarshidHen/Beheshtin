'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/use-toast'
import { Upload, FileAudio, Users, Settings, LogOut, Mic, Plus, Play, Heart, MessageCircle, TrendingUp, Calendar } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
}

interface Content {
  id: string
  title: string
  description?: string
  transcript: string
  audioUrl: string
  isPublished: boolean
  createdAt: string
  _count: {
    likes: number
    comments: number
  }
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [contents, setContents] = useState<Content[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (!token || !userData) {
      router.push('/signin')
      return
    }

    setUser(JSON.parse(userData))
    fetchContents(token)
  }, [router])

  const fetchContents = async (token: string) => {
    try {
      const response = await fetch('/api/content', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch content')
      }

      const data = await response.json()
      setContents(data.contents)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load your content',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/signin')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-orange-50 to-brand-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-brand-orange-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
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
              <h1 className="text-xl sm:text-2xl font-bold gradient-text">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Avatar className="border-2 border-brand-orange-200 w-8 h-8 sm:w-10 sm:h-10">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-gradient-to-r from-brand-orange-500 to-brand-green-500 text-white text-sm">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role.toLowerCase()}</p>
              </div>
              <Button variant="outline" onClick={handleLogout} className="border-brand-orange-200 text-brand-orange-700 hover:bg-brand-orange-50">
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white/60 backdrop-blur-sm border-b border-brand-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 sm:space-x-8 overflow-x-auto">
            <Button variant="ghost" className="flex items-center text-brand-orange-700 bg-brand-orange-50 border-b-2 border-brand-orange-500">
              <FileAudio className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">My Content</span>
              <span className="sm:hidden">Content</span>
            </Button>
            <Button variant="ghost" className="flex items-center text-gray-600 hover:text-brand-orange-700 hover:bg-brand-orange-50">
              <Upload className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Upload</span>
              <span className="sm:hidden">Upload</span>
            </Button>
            {user.role === 'ADMIN' && (
              <Button variant="ghost" className="flex items-center text-gray-600 hover:text-brand-orange-700 hover:bg-brand-orange-50">
                <Users className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Users</span>
                <span className="sm:hidden">Users</span>
              </Button>
            )}
            <Button variant="ghost" className="flex items-center text-gray-600 hover:text-brand-orange-700 hover:bg-brand-orange-50">
              <Settings className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Settings</span>
              <span className="sm:hidden">Settings</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6 sm:space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="card-hover border-brand-orange-200 bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Content</CardTitle>
                <FileAudio className="h-4 w-4 text-brand-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{contents.length}</div>
                <p className="text-xs text-gray-500">
                  {contents.filter(c => c.isPublished).length} published
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover border-brand-green-200 bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Likes</CardTitle>
                <Heart className="h-4 w-4 text-brand-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {contents.reduce((sum, content) => sum + content._count.likes, 0)}
                </div>
                <p className="text-xs text-gray-500">
                  Across all content
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover border-brand-orange-200 bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Comments</CardTitle>
                <MessageCircle className="h-4 w-4 text-brand-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {contents.reduce((sum, content) => sum + content._count.comments, 0)}
                </div>
                <p className="text-xs text-gray-500">
                  Across all content
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover border-brand-green-200 bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Engagement Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-brand-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {contents.length > 0 ? Math.round((contents.reduce((sum, content) => sum + content._count.likes + content._count.comments, 0) / contents.length) * 10) / 10 : 0}
                </div>
                <p className="text-xs text-gray-500">
                  Avg per content
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Content List */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">My Content</h2>
                <p className="text-gray-600">Manage and track your voice content</p>
              </div>
              <Button onClick={() => router.push('/upload')} className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Upload New Content
              </Button>
            </div>

            {contents.length === 0 ? (
              <Card className="border-brand-orange-200 bg-white/80 backdrop-blur-sm">
                <CardContent className="text-center py-12 sm:py-16">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-brand-orange-500 to-brand-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileAudio className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">No content yet</h3>
                  <p className="text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto">
                    Start by uploading your first voice file and let our AI generate transcripts for you
                  </p>
                  <Button onClick={() => router.push('/upload')} className="btn-primary">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Your First Content
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {contents.map((content, index) => (
                  <Card key={content.id} className="card-hover border-brand-orange-200 bg-white/80 backdrop-blur-sm animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg text-gray-900 line-clamp-2">{content.title}</CardTitle>
                          <CardDescription className="line-clamp-2 mt-2">
                            {content.description || 'No description'}
                          </CardDescription>
                        </div>
                        <div className="ml-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            content.isPublished 
                              ? 'bg-brand-green-100 text-brand-green-800 border border-brand-green-200' 
                              : 'bg-brand-orange-100 text-brand-orange-800 border border-brand-orange-200'
                          }`}>
                            {content.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(content.createdAt).toLocaleDateString()}
                          </div>
                          <div className="flex space-x-4">
                            <span className="flex items-center">
                              <Heart className="h-4 w-4 mr-1 text-brand-orange-500" />
                              {content._count.likes}
                            </span>
                            <span className="flex items-center">
                              <MessageCircle className="h-4 w-4 mr-1 text-brand-green-500" />
                              {content._count.comments}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="flex-1 border-brand-orange-200 text-brand-orange-700 hover:bg-brand-orange-50">
                            <Play className="h-4 w-4 mr-1" />
                            Listen
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1 border-brand-green-200 text-brand-green-700 hover:bg-brand-green-50">
                            <Settings className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
