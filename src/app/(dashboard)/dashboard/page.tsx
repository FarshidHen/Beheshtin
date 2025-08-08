'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/use-toast'
import { Upload, FileAudio, Users, Settings, LogOut, Mic, Plus, Play, Pause, Square, Heart, MessageCircle, TrendingUp, Calendar, Edit, Trash2, Zap, Languages, CheckCircle, Sparkles } from 'lucide-react'

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
  transcript: string | null
  audioUrl: string
  language: 'ENGLISH' | 'FARSI'
  isProcessed: boolean
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
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState<Content | null>(null)
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())
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

  const handlePlay = (contentId: string, audioUrl: string, title: string) => {
    try {
      // Stop current audio if playing
      if (currentAudio) {
        currentAudio.pause()
        currentAudio.currentTime = 0
      }

      // Create new audio element
      const audio = new Audio(audioUrl)
      
      // Set up event listeners
      audio.addEventListener('ended', () => {
        setPlayingId(null)
        setCurrentAudio(null)
      })
      
      audio.addEventListener('error', () => {
        toast({
          title: 'Error',
          description: 'Failed to load audio file',
          variant: 'destructive'
        })
        setPlayingId(null)
        setCurrentAudio(null)
      })

      // Play the audio
      audio.play()
      setCurrentAudio(audio)
      setPlayingId(contentId)
      
      toast({
        title: 'Playing Audio',
        description: `Now playing: ${title}`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to play audio file',
        variant: 'destructive'
      })
    }
  }

  const handlePause = () => {
    if (currentAudio) {
      currentAudio.pause()
      setPlayingId(null)
    }
  }

  const handleStop = () => {
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
      setCurrentAudio(null)
      setPlayingId(null)
    }
  }

  const handleDelete = async (contentId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/content/${contentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete content')
      }

      // Remove from local state
      setContents(contents.filter(c => c.id !== contentId))
      
      // Stop audio if this content was playing
      if (playingId === contentId) {
        handleStop()
      }

      toast({
        title: 'Success',
        description: `"${title}" has been deleted successfully`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete content',
        variant: 'destructive'
      })
    }
  }

  const handleProcess = async (contentId: string, title: string) => {
    setProcessingIds(prev => new Set([...prev, contentId]))

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/content/${contentId}/process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to process content')
      }

      const result = await response.json()
      
      // Update local state
      setContents(contents.map(c => 
        c.id === contentId 
          ? { ...c, transcript: result.content.transcript, isProcessed: true }
          : c
      ))

      toast({
        title: 'Success!',
        description: `Transcript generated for "${title}"`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate transcript',
        variant: 'destructive'
      })
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(contentId)
        return newSet
      })
    }
  }

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingContent) return

    const formData = new FormData(e.currentTarget)
    const updatedData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      keywords: formData.get('keywords') as string,
      subject: formData.get('subject') as string,
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/content/${editingContent.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      })

      if (!response.ok) {
        throw new Error('Failed to update content')
      }

      const updatedContent = await response.json()
      
      // Update local state
      setContents(contents.map(c => 
        c.id === editingContent.id ? { ...c, ...updatedData } : c
      ))
      
      setEditingContent(null)

      toast({
        title: 'Success',
        description: 'Content updated successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update content',
        variant: 'destructive'
      })
    }
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
                          <div className="flex items-center mt-2 space-x-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                              <Languages className="h-3 w-3 mr-1" />
                              {content.language === 'FARSI' ? 'Farsi' : 'English'}
                            </span>
                            {content.isProcessed && (
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Processed
                              </span>
                            )}
                          </div>
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
                        
                        <div className="space-y-2">
                          {/* Process Button */}
                          {!content.isProcessed && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                              onClick={() => handleProcess(content.id, content.title)}
                              disabled={processingIds.has(content.id)}
                            >
                              {processingIds.has(content.id) ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-700 mr-2"></div>
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <Zap className="h-4 w-4 mr-1" />
                                  Generate Transcript
                                </>
                              )}
                            </Button>
                          )}
                          
                          {/* Features Info Cards */}
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            <div className="bg-brand-orange-50 rounded-md p-2 text-center border border-brand-orange-200">
                              <div className="w-5 h-5 bg-brand-orange-500 rounded-full flex items-center justify-center mx-auto mb-1">
                                <Mic className="h-3 w-3 text-white" />
                              </div>
                              <p className="text-xs font-medium text-gray-700">AI Transcription</p>
                              <p className="text-xs text-gray-500">Automatic text</p>
                            </div>
                            <div className="bg-brand-green-50 rounded-md p-2 text-center border border-brand-green-200">
                              <div className="w-5 h-5 bg-brand-green-500 rounded-full flex items-center justify-center mx-auto mb-1">
                                <Sparkles className="h-3 w-3 text-white" />
                              </div>
                              <p className="text-xs font-medium text-gray-700">Smart Analysis</p>
                              <p className="text-xs text-gray-500">Keywords & desc</p>
                            </div>
                            <div className="bg-gradient-to-r from-brand-orange-50 to-brand-green-50 rounded-md p-2 text-center border border-brand-orange-200">
                              <div className="w-5 h-5 bg-gradient-to-r from-brand-orange-500 to-brand-green-500 rounded-full flex items-center justify-center mx-auto mb-1">
                                <Upload className="h-3 w-3 text-white" />
                              </div>
                              <p className="text-xs font-medium text-gray-700">Easy Publishing</p>
                              <p className="text-xs text-gray-500">Share content</p>
                            </div>
                          </div>

                          {/* Transcript Preview */}
                          {content.isProcessed && content.transcript && (
                            <div className="bg-gray-50 rounded-md p-3">
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Transcript:</h4>
                              <p className="text-xs text-gray-600 line-clamp-3">
                                {content.transcript}
                              </p>
                            </div>
                          )}
                          
                          {/* Audio Controls */}
                          <div className="flex space-x-2">
                            {playingId === content.id ? (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="flex-1 border-brand-orange-200 text-brand-orange-700 hover:bg-brand-orange-50"
                                  onClick={handlePause}
                                >
                                  <Pause className="h-4 w-4 mr-1" />
                                  Pause
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                                  onClick={handleStop}
                                >
                                  <Square className="h-4 w-4 mr-1" />
                                  Stop
                                </Button>
                              </>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1 border-brand-orange-200 text-brand-orange-700 hover:bg-brand-orange-50"
                                onClick={() => handlePlay(content.id, content.audioUrl, content.title)}
                              >
                                <Play className="h-4 w-4 mr-1" />
                                Play
                              </Button>
                            )}
                          </div>
                          
                          {/* Edit/Delete Controls */}
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 border-brand-green-200 text-brand-green-700 hover:bg-brand-green-50"
                              onClick={() => setEditingContent(content)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                              onClick={() => handleDelete(content.id, content.title)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
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

      {/* Edit Modal */}
      {editingContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Edit Content</CardTitle>
              <CardDescription>Update your audio content details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={editingContent.title}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={editingContent.description || ''}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="keywords">Keywords</Label>
                    <Input
                      id="keywords"
                      name="keywords"
                      defaultValue={editingContent.keywords || ''}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      name="subject"
                      defaultValue={editingContent.subject || ''}
                    />
                  </div>
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button type="submit" className="flex-1">
                    Save Changes
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setEditingContent(null)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={() => {
                      setEditingContent(null)
                      handleDelete(editingContent.id, editingContent.title)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
