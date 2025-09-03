import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { z } from 'zod'

const createUploadUrlSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { filename } = createUploadUrlSchema.parse(body)
    
    // Generate a unique filename with timestamp
    const timestamp = Date.now()
    const uniqueFilename = `${timestamp}-${filename}`
    
    // Create a minimal blob to get the upload URL
    const blob = await put(uniqueFilename, Buffer.from([0]), {
      access: 'public',
      addRandomSuffix: true,
    })
    
    return NextResponse.json({
      url: blob.url,
      token: blob.downloadUrl,
    })
  } catch (error) {
    console.error('Error creating upload URL:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create upload URL' },
      { status: 500 }
    )
  }
}
