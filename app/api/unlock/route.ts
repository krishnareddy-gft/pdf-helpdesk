import { NextRequest, NextResponse } from 'next/server'
import { unlockPdf } from '@/lib/pdf'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { file, password } = body

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!password || password.length < 1) {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      )
    }

    // Fetch the PDF file
    const response = await fetch(file)
    if (!response.ok) {
      throw new Error('Failed to fetch PDF file')
    }

    const pdfBuffer = Buffer.from(await response.arrayBuffer())

    // Unlock the PDF
    const unlockedPdfBuffer = await unlockPdf(pdfBuffer, password)

    // Convert to base64 for response
    const base64Pdf = unlockedPdfBuffer.toString('base64')
    const dataUrl = `data:application/pdf;base64,${base64Pdf}`

    return NextResponse.json({
      success: true,
      data: {
        url: dataUrl,
        beforeBytes: pdfBuffer.length,
        afterBytes: unlockedPdfBuffer.length,
      }
    })

  } catch (error) {
    console.error('Unlock PDF error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to unlock PDF' 
      },
      { status: 500 }
    )
  }
}
