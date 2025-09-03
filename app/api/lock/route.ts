import { NextRequest, NextResponse } from 'next/server'
import { lockPdf } from '@/lib/lockPdf'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userPassword = formData.get('userPassword') as string
    const ownerPassword = formData.get('ownerPassword') as string

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!userPassword || userPassword.length < 1) {
      return NextResponse.json(
        { success: false, error: 'User password is required' },
        { status: 400 }
      )
    }

    if (!ownerPassword || ownerPassword.length < 1) {
      return NextResponse.json(
        { success: false, error: 'Owner password is required' },
        { status: 400 }
      )
    }

    // Lock the PDF using QPDF
    const lockedPdfBlob = await lockPdf(file, userPassword, ownerPassword)

    // Convert to base64 for response
    const arrayBuffer = await lockedPdfBlob.arrayBuffer()
    const base64Pdf = Buffer.from(arrayBuffer).toString('base64')
    const dataUrl = `data:application/pdf;base64,${base64Pdf}`

    return NextResponse.json({
      success: true,
      data: {
        url: dataUrl,
        beforeBytes: file.size,
        afterBytes: lockedPdfBlob.size,
      }
    })

  } catch (error) {
    console.error('Lock PDF error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to lock PDF' 
      },
      { status: 500 }
    )
  }
}
