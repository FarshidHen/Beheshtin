'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/use-toast'
import { Play, Heart, MessageCircle, User, LogIn, Mic, Pause, Square, Download, Eye, EyeIcon, FileText, Volume2, Users, Sparkles, Globe2 } from 'lucide-react'
import { getTextDirectionStyle, getTextDirectionClass } from '@/lib/textDirection'

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
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [pausedId, setPausedId] = useState<string | null>(null)
  const [expandedTranscript, setExpandedTranscript] = useState<string | null>(null)
  const currentAudioRef = useRef<HTMLAudioElement | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchPublicContent()
  }, [])

  // Cleanup audio when component unmounts
  useEffect(() => {
    const stopAudio = () => {
      const audio = currentAudioRef.current
      if (audio) {
        try {
          audio.pause()
          audio.currentTime = 0
        } catch (_) {}
      }
      setCurrentAudio(null)
      setPlayingId(null)
      setPausedId(null)
    }

    const onVisibilityChange = () => {
      if (document.hidden) stopAudio()
    }

    window.addEventListener('beforeunload', stopAudio)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('beforeunload', stopAudio)
      stopAudio()
    }
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
        title: 'خطا',
        description: 'خطا در بارگذاری محتوا',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlay = (contentId: string, audioUrl: string, title: string) => {
    try {
      // If this is the same content that was paused, resume it
      if (pausedId === contentId && currentAudio) {
        currentAudio.play()
        setPlayingId(contentId)
        setPausedId(null)
        return
      }

      // Stop current audio if playing different content
      if (currentAudio) {
        currentAudio.pause()
        currentAudio.currentTime = 0
      }

      // Create new audio element
      const audio = new Audio(audioUrl)
      currentAudioRef.current = audio
      
      // Set up event listeners
      audio.addEventListener('ended', () => {
        setPlayingId(null)
        setCurrentAudio(null)
        currentAudioRef.current = null
        setPausedId(null)
      })
      
      audio.addEventListener('error', () => {
        setPlayingId(null)
        setCurrentAudio(null)
        currentAudioRef.current = null
        setPausedId(null)
        toast({
          title: 'خطا',
          description: 'خطا در پخش فایل صوتی',
          variant: 'destructive'
        })
      })
      
      // Start playing
      audio.play()
      setCurrentAudio(audio)
      setPlayingId(contentId)
      setPausedId(null)
      
    } catch (error) {
      toast({
        title: 'خطا',
        description: 'خطا در پخش فایل صوتی',
        variant: 'destructive'
      })
    }
  }

  const handlePause = () => {
    if (currentAudio && playingId) {
      currentAudio.pause()
      setPausedId(playingId)
      setPlayingId(null)
    }
  }

  const handleStop = () => {
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
      setCurrentAudio(null)
      currentAudioRef.current = null
      setPlayingId(null)
      setPausedId(null)
    }
  }

  const handleLike = async (contentId: string) => {
    toast({
      title: 'پسندیدن',
      description: 'قابلیت پسندیدن به زودی فعال خواهد شد',
    })
  }

  const handleComment = async (contentId: string) => {
    toast({
      title: 'نظر',
      description: 'قابلیت نظردهی به زودی فعال خواهد شد',
    })
  }

  const handleDownloadTranscript = async (content: Content) => {
    try {
      const { generateTranscriptPDF } = await import('@/lib/pdfGenerator')
      
      await generateTranscriptPDF({
        title: content.title,
        transcript: content.transcript,
        author: content.user.name,
        createdAt: content.createdAt,
        language: 'FARSI'
      })
      
      toast({
        title: 'دانلود',
        description: 'متن صوتی با موفقیت دانلود شد',
      })
    } catch (error) {
      toast({
        title: 'خطا',
        description: 'خطا در دانلود متن صوتی',
        variant: 'destructive'
      })
    }
  }

  const toggleTranscriptExpansion = (contentId: string) => {
    setExpandedTranscript(expandedTranscript === contentId ? null : contentId)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-orange-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">در حال بارگذاری بهشتین...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                <Mic className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
                بهشتین
              </h1>
            </div>
            <div className="flex space-x-2 rtl:space-x-reverse">
              <Link href="/signin">
                <Button variant="ghost" size="sm" className="text-gray-700 hover:text-orange-600">
                  <LogIn className="h-4 w-4 mr-1 ml-1" />
                  ورود
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600 text-white">
                  <User className="h-4 w-4 mr-1 ml-1" />
                  ثبت نام
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Service Description Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
                صدای شما، <span className="bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">داستان شما</span>
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto" style={{ direction: 'rtl' }}>
                بهشتین پلتفرمی است برای به اشتراک گذاری محتوای صوتی، تجربیات و دانش شما. 
                صدای خود را ضبط کنید، متن آن را دریافت کنید و با جهان به اشتراک بگذارید.
              </p>
            </div>
            
            {/* Key Features */}
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <Volume2 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">ضبط آسان</h3>
                <p className="text-gray-600 text-sm" style={{ direction: 'rtl' }}>
                  به راحتی صدای خود را ضبط کنید و آپلود کنید
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">تبدیل خودکار</h3>
                <p className="text-gray-600 text-sm" style={{ direction: 'rtl' }}>
                  فایل صوتی شما به طور خودکار به متن تبدیل می‌شود
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">اشتراک‌گذاری</h3>
                <p className="text-gray-600 text-sm" style={{ direction: 'rtl' }}>
                  محتوای خود را با دیگران به اشتراک بگذارید
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        </div>
      </section>

      {/* Published Content Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">محتوای منتشر شده</h3>
            <p className="text-lg text-gray-600" style={{ direction: 'rtl' }}>
              به آخرین محتوای صوتی منتشر شده توسط کاربران گوش دهید
            </p>
          </div>
          
          {contents.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">هنوز محتوایی منتشر نشده</h3>
              <p className="text-gray-600 mb-6" style={{ direction: 'rtl' }}>
                اولین نفری باشید که محتوای صوتی خود را با دیگران به اشتراک می‌گذارد
              </p>
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600 text-white">
                  <Sparkles className="h-4 w-4 mr-2" />
                  شروع کنید
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contents.map((content) => (
                <Card key={content.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 border border-orange-100">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
                      <Avatar className="border-2 border-orange-200 w-12 h-12">
                        <AvatarImage src={content.user.avatar} />
                        <AvatarFallback className="bg-gradient-to-r from-orange-500 to-green-500 text-white text-sm">
                          {content.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">{content.user.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(content.createdAt).toLocaleDateString('fa-IR')}
                        </p>
                      </div>
                    </div>
                    <CardTitle className="text-lg text-gray-900 line-clamp-2" style={getTextDirectionStyle(content.title)}>
                      {content.title}
                    </CardTitle>
                    {content.description && (
                      <CardDescription className="text-gray-600 text-sm line-clamp-2" style={getTextDirectionStyle(content.description)}>
                        {content.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Transcript Preview/Full View */}
                    <div className="bg-gradient-to-r from-orange-50 to-green-50 p-4 rounded-lg border border-orange-100">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-700">متن صوتی:</h4>
                        <div className="flex space-x-1 rtl:space-x-reverse">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleTranscriptExpansion(content.id)}
                            className="h-7 px-2 text-xs text-gray-600 hover:text-gray-900"
                          >
                            <EyeIcon className="h-3 w-3 mr-1" />
                            {expandedTranscript === content.id ? 'بستن' : 'مشاهده'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadTranscript(content)}
                            className="h-7 px-2 text-xs text-gray-600 hover:text-gray-900"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            دانلود
                          </Button>
                        </div>
                      </div>
                      
                      {expandedTranscript === content.id ? (
                        <div 
                          className="text-sm text-gray-700 max-h-64 overflow-y-auto bg-white p-3 rounded border border-gray-200 leading-relaxed"
                          style={getTextDirectionStyle(content.transcript)}
                        >
                          {content.transcript}
                        </div>
                      ) : (
                        <p 
                          className="text-sm text-gray-700 line-clamp-3 leading-relaxed"
                          style={getTextDirectionStyle(content.transcript)}
                        >
                          {content.transcript.substring(0, 120)}...
                        </p>
                      )}
                    </div>
                    
                    {/* Audio Controls */}
                    <div className="flex space-x-2 rtl:space-x-reverse mb-4">
                      {playingId === content.id ? (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 border-orange-200 text-orange-700 hover:bg-orange-50"
                            onClick={handlePause}
                          >
                            <Pause className="h-4 w-4 mr-1" />
                            توقف موقت
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                            onClick={handleStop}
                          >
                            <Square className="h-4 w-4 mr-1" />
                            پایان
                          </Button>
                        </>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className={`flex-1 ${
                            pausedId === content.id 
                              ? 'border-green-200 text-green-700 hover:bg-green-50' 
                              : 'border-orange-200 text-orange-700 hover:bg-orange-50'
                          }`}
                          onClick={() => handlePlay(content.id, content.audioUrl, content.title)}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          {pausedId === content.id ? 'ادامه' : 'پخش'}
                        </Button>
                      )}
                    </div>
                    
                    {/* Interaction Controls */}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <div className="flex space-x-4 rtl:space-x-reverse">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(content.id)}
                          className="flex items-center text-orange-600 hover:text-orange-700 hover:bg-orange-50 h-8 px-3"
                        >
                          <Heart className="h-4 w-4 ml-1" />
                          <span className="text-sm">{content._count.likes}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleComment(content.id)}
                          className="flex items-center text-green-600 hover:text-green-700 hover:bg-green-50 h-8 px-3"
                        >
                          <MessageCircle className="h-4 w-4 ml-1" />
                          <span className="text-sm">{content._count.comments}</span>
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

      {/* Floating Audio Player - Shows when audio is playing */}
      {playingId && currentAudio && (
        <div className="fixed bottom-6 left-6 right-6 bg-white rounded-lg shadow-2xl border border-orange-200 p-4 z-50 max-w-md mx-auto">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-green-500 rounded-full flex items-center justify-center">
              <Volume2 className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                در حال پخش...
              </p>
              <p className="text-xs text-gray-500 truncate">
                {contents.find(c => c.id === playingId)?.title}
              </p>
            </div>
            <div className="flex space-x-1 rtl:space-x-reverse">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePause}
                className="h-8 w-8 p-0"
              >
                <Pause className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStop}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <Square className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 rtl:space-x-reverse mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                <Mic className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-green-400 bg-clip-text text-transparent">
                بهشتین
              </h3>
            </div>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto" style={{ direction: 'rtl' }}>
              پلتفرمی برای به اشتراک گذاری صدا، تجربیات و دانش. 
              با بهشتین صدای خود را به جهان برسانید.
            </p>
            <div className="flex justify-center space-x-6 rtl:space-x-reverse">
              <Link href="/signin" className="text-gray-400 hover:text-orange-400 transition-colors">
                ورود
              </Link>
              <Link href="/signup" className="text-gray-400 hover:text-green-400 transition-colors">
                ثبت نام
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
