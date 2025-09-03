import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { splitPdf } from '@/lib/pdf'
import { uploadBuffer, downloadBuffer } from '@/lib/blob'
import { SplitRequest } from '@/lib/types'

const splitSchema = z.object({
  file: z.string().url(),
  ranges: z.array(z.object({
    start: z.number().int().min(1),
    end: z.number().int().min(1),
  })).min(1, 'At least one range required'),
})

export async function POST(request: NextRequest) {
  try {
    const body: SplitRequest = await request.json()
    const { file, ranges } = splitSchema.parse(body)
    
    // Validate ranges
    for (const range of ranges) {
      if (range.start > range.end) {
        return NextResponse.json(
          { success: false, error: 'Invalid range: start must be <= end' },
          { status: 400 }
        )
      }
    }
    
    // Download PDF file
    const pdfBuffer = await downloadBuffer(file)
    
    // Split PDF
    const splitBuffers = await splitPdf(pdfBuffer, ranges)
    
    // Convert split buffers to base64 data URLs
    const results = splitBuffers.map((buffer, index) => {
      const base64 = buffer.toString('base64')
      const url = `data:application/pdf;base64,${base64}`
      return {
        url,
        label: `Part ${index + 1} (pages ${ranges[index].start}-${ranges[index].end})`,
        size: buffer.length,
      }
    })
    
    return NextResponse.json({
      success: true,
      data: { results },
    })
  } catch (error) {
    console.error('Error splitting PDF:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to split PDF' },
      { status: 500 }
    )
  }
}
