'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Upload, ArrowLeft, FileAudio, Mic, Sparkles, X } from 'lucide-react'

export default function UploadPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('audio/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select an audio file',
          variant: 'destructive'
        })
        return
      }
      setSelectedFile(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (!file.type.startsWith('audio/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select an audio file',
          variant: 'destructive'
        })
        return
      }
      setSelectedFile(file)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    
    if (!selectedFile) {
      toast({
        title: 'No file selected',
        description: 'Please select an audio file to upload',
        variant: 'destructive'
      })
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/signin')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      
      // Add form fields
      const form = event.currentTarget
      const title = (form.elements.namedItem('title') as HTMLInputElement)?.value || selectedFile.name
      const description = (form.elements.namedItem('description') as HTMLTextAreaElement)?.value || ''
      const keywords = (form.elements.namedItem('keywords') as HTMLInputElement)?.value || ''
      const subject = (form.elements.namedItem('subject') as HTMLInputElement)?.value || ''

      formData.append('title', title)
      formData.append('description', description)
      formData.append('keywords', keywords)
      formData.append('subject', subject)

      const response = await fetch('/api/content/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const result = await response.json()

      toast({
        title: 'Success!',
        description: 'Content uploaded successfully. Processing transcript...',
      })

      // Reset form
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      form.reset()

      // Redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong'
      toast({
        title: 'Upload failed',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-orange-50 to-brand-green-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-4 text-brand-orange-600 hover:text-brand-orange-700 hover:bg-brand-orange-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Upload Voice Content</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
                              Upload your audio file and we&apos;ll generate a transcript, description, and keywords for you using our advanced AI technology.
            </p>
          </div>
        </div>

        <Card className="border-brand-orange-200 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="h-5 w-5 mr-2 text-brand-orange-500" />
              Upload Audio File
            </CardTitle>
            <CardDescription>
              Supported formats: MP3, WAV, M4A, and other audio formats (Max 100MB)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Upload */}
              <div>
                <Label htmlFor="file" className="text-sm font-medium text-gray-700 mb-2 block">Audio File</Label>
                <div
                  className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive 
                      ? 'border-brand-orange-400 bg-brand-orange-50' 
                      : selectedFile 
                        ? 'border-brand-green-400 bg-brand-green-50' 
                        : 'border-brand-orange-200 hover:border-brand-orange-300'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="file"
                    accept="audio/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  {selectedFile ? (
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-brand-green-500 to-brand-green-600 rounded-full flex items-center justify-center mx-auto">
                        <FileAudio className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedFile(null)}
                        className="border-brand-green-200 text-brand-green-700 hover:bg-brand-green-50"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Remove File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-brand-orange-500 to-brand-green-500 rounded-full flex items-center justify-center mx-auto">
                        <Upload className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium text-brand-orange-600">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">Audio files up to 100MB</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="border-brand-orange-200 text-brand-orange-700 hover:bg-brand-orange-50"
                      >
                        Choose File
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Content Details */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-sm font-medium text-gray-700">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter a compelling title for your content"
                    defaultValue={selectedFile?.name.replace(/\.[^/.]+$/, "") || ''}
                    className="mt-1 border-brand-orange-200 focus:border-brand-orange-500 focus:ring-brand-orange-500"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Enter a description that will help others discover your content"
                    rows={3}
                    className="mt-1 border-brand-orange-200 focus:border-brand-orange-500 focus:ring-brand-orange-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="keywords" className="text-sm font-medium text-gray-700">Keywords (Optional)</Label>
                    <Input
                      id="keywords"
                      name="keywords"
                      placeholder="Enter keywords separated by commas"
                      className="mt-1 border-brand-orange-200 focus:border-brand-orange-500 focus:ring-brand-orange-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="subject" className="text-sm font-medium text-gray-700">Subject (Optional)</Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="Enter the subject or topic"
                      className="mt-1 border-brand-orange-200 focus:border-brand-orange-500 focus:ring-brand-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-orange-600 font-medium">Uploading...</span>
                    <span className="text-gray-600">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-brand-orange-500 to-brand-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    Processing your audio with AI transcription...
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full btn-primary text-base py-3"
                disabled={isUploading || !selectedFile}
              >
                {isUploading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading & Processing...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Upload Content
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Features preview */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/50 rounded-lg p-4 border border-brand-orange-200 text-center">
            <div className="w-8 h-8 bg-brand-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Mic className="h-4 w-4 text-white" />
            </div>
            <p className="text-sm font-medium text-gray-700">AI Transcription</p>
            <p className="text-xs text-gray-500">Automatic text generation</p>
          </div>
          <div className="bg-white/50 rounded-lg p-4 border border-brand-green-200 text-center">
            <div className="w-8 h-8 bg-brand-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <p className="text-sm font-medium text-gray-700">Smart Analysis</p>
            <p className="text-xs text-gray-500">Keywords & descriptions</p>
          </div>
          <div className="bg-white/50 rounded-lg p-4 border border-brand-orange-200 text-center">
            <div className="w-8 h-8 bg-gradient-to-r from-brand-orange-500 to-brand-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Upload className="h-4 w-4 text-white" />
            </div>
            <p className="text-sm font-medium text-gray-700">Easy Publishing</p>
            <p className="text-xs text-gray-500">Share with community</p>
          </div>
        </div>
      </div>
    </div>
  )
}
