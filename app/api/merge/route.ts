import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { mergePdfs } from '@/lib/pdf'
import { uploadBuffer, downloadBuffer } from '@/lib/blob'
import { MergeRequest } from '@/lib/types'

const mergeSchema = z.object({
  files: z.array(z.string().url()).min(2, 'At least 2 files required'),
})

export async function POST(request: NextRequest) {
  try {
    const body: MergeRequest = await request.json()
    const { files } = mergeSchema.parse(body)
    
    console.log(`Starting merge process for ${files.length} files`)
    
    // Download all PDF files with progress tracking
    const pdfBuffers = await Promise.all(
      files.map(async (url, index) => {
        console.log(`Downloading file ${index + 1}/${files.length}`)
        return downloadBuffer(url)
      })
    )
    
    console.log('All files downloaded, starting merge process')
    
    // Merge PDFs
    const mergedBuffer = await mergePdfs(pdfBuffers)
    
    console.log(`Merge completed. Result size: ${mergedBuffer.length} bytes`)
    
    // Convert merged buffer to base64 data URL for immediate use
    const base64 = mergedBuffer.toString('base64')
    const resultUrl = `data:application/pdf;base64,${base64}`
    
    return NextResponse.json({
      success: true,
      data: {
        url: resultUrl,
        size: mergedBuffer.length,
      },
    })
  } catch (error) {
    console.error('Error merging PDFs:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to merge PDFs' },
      { status: 500 }
    )
  }
}
