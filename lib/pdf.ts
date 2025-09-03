import { PDFDocument, PDFPage, rgb, StandardFonts } from 'pdf-lib'
import { OverlayData } from './types'

/**
 * Merge multiple PDFs into a single document
 */
export async function mergePdfs(pdfBuffers: Buffer[]): Promise<Buffer> {
  const mergedPdf = await PDFDocument.create()
  
  for (const buffer of pdfBuffers) {
    const pdf = await PDFDocument.load(buffer)
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
    pages.forEach((page) => mergedPdf.addPage(page))
  }
  
  return Buffer.from(await mergedPdf.save())
}

/**
 * Split a PDF into multiple documents based on page ranges
 */
export async function splitPdf(
  pdfBuffer: Buffer,
  ranges: Array<{ start: number; end: number }>
): Promise<Buffer[]> {
  const sourcePdf = await PDFDocument.load(pdfBuffer)
  const results: Buffer[] = []
  
  for (const range of ranges) {
    const newPdf = await PDFDocument.create()
    const pageIndices = Array.from(
      { length: range.end - range.start + 1 },
      (_, i) => range.start - 1 + i
    )
    
    const pages = await newPdf.copyPages(sourcePdf, pageIndices)
    pages.forEach((page) => newPdf.addPage(page))
    
    results.push(Buffer.from(await newPdf.save()))
  }
  
  return results
}



/**
 * Basic PDF compression by removing metadata and optimizing
 */
export async function compressPdf(
  pdfBuffer: Buffer,
  level: 'light' | 'balanced' | 'strong' = 'balanced'
): Promise<Buffer> {
  const pdf = await PDFDocument.load(pdfBuffer)
  
  // Remove metadata
  pdf.setTitle('')
  pdf.setAuthor('')
  pdf.setSubject('')
  pdf.setKeywords([])
  pdf.setProducer('')
  pdf.setCreator('')
  
  // Set compression level
  const saveOptions: any = {}
  
  switch (level) {
    case 'light':
      saveOptions.useObjectStreams = false
      break
    case 'balanced':
      saveOptions.useObjectStreams = true
      break
    case 'strong':
      saveOptions.useObjectStreams = true
      saveOptions.addDefaultPage = false
      break
  }
  
  return Buffer.from(await pdf.save(saveOptions))
}

/**
 * Add overlays (signatures, text, images) to a PDF
 */
export async function addOverlays(pdfBuffer: Buffer, overlays: OverlayData[]): Promise<Buffer> {
  const pdf = await PDFDocument.load(pdfBuffer)
  const pages = pdf.getPages()
  
  for (const overlay of overlays) {
    const page = pages[overlay.page - 1] // Convert to 0-based
    if (!page) continue
    
    const { width, height } = page.getSize()
    
    switch (overlay.type) {
      case 'text':
        await addTextOverlay(page, overlay, width, height)
        break
      case 'signature':
      case 'image':
        await addImageOverlay(page, overlay, width, height)
        break
    }
  }
  
  return Buffer.from(await pdf.save())
}

/**
 * Add text overlay to a page
 */
async function addTextOverlay(
  page: PDFPage,
  overlay: OverlayData,
  pageWidth: number,
  pageHeight: number
) {
  const font = await page.doc.embedFont(StandardFonts.Helvetica)
  const fontSize = overlay.fontSize || 12
  const color = overlay.color ? parseColor(overlay.color) : rgb(0, 0, 0)
  
  // Convert coordinates (PDF coordinates start from bottom-left)
  const x = overlay.x
  const y = pageHeight - overlay.y - fontSize
  
  page.drawText(overlay.data, {
    x,
    y,
    size: fontSize,
    font,
    color,
  })
}

/**
 * Add image overlay to a page
 */
async function addImageOverlay(
  page: PDFPage,
  overlay: OverlayData,
  pageWidth: number,
  pageHeight: number
) {
  try {
    // Remove data URL prefix if present
    const base64Data = overlay.data.replace(/^data:image\/[a-z]+;base64,/, '')
    const imageBuffer = Buffer.from(base64Data, 'base64')
    
    let image
    if (overlay.data.startsWith('data:image/png')) {
      image = await page.doc.embedPng(imageBuffer)
    } else if (overlay.data.startsWith('data:image/jpeg') || overlay.data.startsWith('data:image/jpg')) {
      image = await page.doc.embedJpg(imageBuffer)
    } else {
      throw new Error('Unsupported image format')
    }
    
    const { width: imgWidth, height: imgHeight } = image
    const overlayWidth = overlay.width || imgWidth
    const overlayHeight = overlay.height || imgHeight
    
    // Convert coordinates (PDF coordinates start from bottom-left)
    const x = overlay.x
    const y = pageHeight - overlay.y - overlayHeight
    
    page.drawImage(image, {
      x,
      y,
      width: overlayWidth,
      height: overlayHeight,
    })
  } catch (error) {
    console.error('Failed to add image overlay:', error)
    throw new Error('Invalid image data')
  }
}



/**
 * Lock a PDF with password protection
 * Note: This function is deprecated. Use the browser-based lockPdfInBrowser function instead.
 * @deprecated Use lockPdfInBrowser from '@/lib/lockPdf' for browser-based encryption
 */
export async function lockPdf(
  pdfBuffer: Buffer,
  password: string,
  options: {
    userPassword?: string
    ownerPassword?: string
    permissions?: {
      printing?: boolean
      modifying?: boolean
      copying?: boolean
      annotating?: boolean
      fillingForms?: boolean
      extractingForAccessibility?: boolean
      assembling?: boolean
      highQualityPrinting?: boolean
    }
  } = {}
): Promise<Buffer> {
  throw new Error('Server-side PDF locking is deprecated. Use browser-based encryption instead.')
}

/**
 * Unlock a PDF by removing password protection
 * Note: This function is deprecated. Use browser-based decryption instead.
 * @deprecated Use browser-based decryption for PDF unlocking
 */
export async function unlockPdf(
  pdfBuffer: Buffer,
  password: string
): Promise<Buffer> {
  throw new Error('Server-side PDF unlocking is deprecated. Use browser-based decryption instead.')
}

/**
 * Parse color string to RGB
 */
function parseColor(color: string) {
  if (color.startsWith('#')) {
    const hex = color.slice(1)
    const r = parseInt(hex.slice(0, 2), 16) / 255
    const g = parseInt(hex.slice(2, 4), 16) / 255
    const b = parseInt(hex.slice(4, 6), 16) / 255
    return rgb(r, g, b)
  }
  
  // Default to black
  return rgb(0, 0, 0)
}
