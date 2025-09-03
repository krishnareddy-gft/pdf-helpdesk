import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { compressPdf } from '@/lib/pdf'
import { uploadBuffer, downloadBuffer } from '@/lib/blob'
import { CompressRequest } from '@/lib/types'

const compressSchema = z.object({
  file: z.string().url(),
  level: z.enum(['light', 'balanced', 'strong']).optional().default('balanced'),
})

export async function POST(request: NextRequest) {
  try {
    const body: CompressRequest = await request.json()
    const { file, level } = compressSchema.parse(body)
    
    // Download PDF file
    const originalBuffer = await downloadBuffer(file)
    const originalSize = originalBuffer.length
    
    // Compress PDF
    const compressedBuffer = await compressPdf(originalBuffer, level)
    const compressedSize = compressedBuffer.length
    
    // Convert compressed buffer to base64 data URL
    const base64 = compressedBuffer.toString('base64')
    const resultUrl = `data:application/pdf;base64,${base64}`
    
    const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1)
    
    return NextResponse.json({
      success: true,
      data: {
        url: resultUrl,
        beforeBytes: originalSize,
        afterBytes: compressedSize,
        compressionRatio: parseFloat(compressionRatio),
        level,
      },
    })
  } catch (error) {
    console.error('Error compressing PDF:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to compress PDF' },
      { status: 500 }
    )
  }
}
