// Simple PDF generation utility for transcripts
export interface TranscriptPDFOptions {
  title: string
  transcript: string
  author: string
  createdAt: string
  language?: 'ENGLISH' | 'FARSI'
}

export const generateTranscriptPDF = async (options: TranscriptPDFOptions): Promise<void> => {
  try {
    const { title, transcript, author, createdAt, language = 'FARSI' } = options
    
    // Create formatted text content
    const content = `
بهشتین - متن صوتی
${'='.repeat(50)}

عنوان: ${title}
نویسنده: ${author}
تاریخ: ${new Date(createdAt).toLocaleDateString('fa-IR')}

${'='.repeat(50)}

${transcript}

${'='.repeat(50)}
تولید شده توسط بهشتین | Beheshtin
    `.trim()

    // Create and download as text file
    const element = document.createElement('a')
    const file = new Blob([content], { type: 'text/plain;charset=utf-8' })
    element.href = URL.createObjectURL(file)
    element.download = `${title.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_')}_transcript.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error('Failed to generate PDF')
  }
}
