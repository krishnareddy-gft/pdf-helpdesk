import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { addOverlays } from '@/lib/pdf'
import { uploadBuffer, downloadBuffer } from '@/lib/blob'
import { SignRequest, OverlayData } from '@/lib/types'

const overlaySchema = z.object({
  id: z.string(),
  page: z.number().int().min(1),
  type: z.enum(['signature', 'text', 'image']),
  data: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
  fontSize: z.number().optional(),
  color: z.string().optional(),
})

const signSchema = z.object({
  file: z.string().url(),
  overlays: z.array(overlaySchema).min(1, 'At least one overlay required'),
})

export async function POST(request: NextRequest) {
  try {
    const body: SignRequest = await request.json()
    const { file, overlays } = signSchema.parse(body)
    
    // Download PDF file
    const pdfBuffer = await downloadBuffer(file)
    
    // Add overlays
    const signedBuffer = await addOverlays(pdfBuffer, overlays as OverlayData[])
    
    // Upload result to blob storage
    const resultUrl = await uploadBuffer(
      signedBuffer,
      `signed-${Date.now()}.pdf`,
      'application/pdf'
    )
    
    return NextResponse.json({
      success: true,
      data: {
        url: resultUrl,
        size: signedBuffer.length,
        overlayCount: overlays.length,
      },
    })
  } catch (error) {
    console.error('Error signing PDF:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to sign PDF' },
      { status: 500 }
    )
  }
}
