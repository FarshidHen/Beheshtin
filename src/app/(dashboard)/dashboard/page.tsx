'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/use-toast'
import { Upload, FileAudio, Users, Settings, LogOut } from 'lucide-react'

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500">{user.role}</p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Button variant="ghost" className="flex items-center">
              <FileAudio className="h-4 w-4 mr-2" />
              My Content
            </Button>
            <Button variant="ghost" className="flex items-center">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
            {user.role === 'ADMIN' && (
              <Button variant="ghost" className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Users
              </Button>
            )}
            <Button variant="ghost" className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Content</CardTitle>
                <FileAudio className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{contents.length}</div>
                <p className="text-xs text-muted-foreground">
                  {contents.filter(c => c.isPublished).length} published
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
                <FileAudio className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {contents.reduce((sum, content) => sum + content._count.likes, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all content
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
                <FileAudio className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {contents.reduce((sum, content) => sum + content._count.comments, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all content
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Content List */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Content</h2>
              <Button onClick={() => router.push('/upload')}>
                <Upload className="h-4 w-4 mr-2" />
                Upload New Content
              </Button>
            </div>

            {contents.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FileAudio className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No content yet</h3>
                  <p className="text-gray-500 mb-4">
                    Start by uploading your first voice file
                  </p>
                  <Button onClick={() => router.push('/upload')}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Content
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contents.map((content) => (
                  <Card key={content.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{content.title}</CardTitle>
                      <CardDescription>
                        {content.description || 'No description'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>{new Date(content.createdAt).toLocaleDateString()}</span>
                        <div className="flex space-x-4">
                          <span>{content._count.likes} likes</span>
                          <span>{content._count.comments} comments</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          content.isPublished 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {content.isPublished ? 'Published' : 'Draft'}
                        </span>
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
