'use client'

import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loading } from '@/components/ui/loading'
import { cn } from '@/lib/utils'

interface PdfPreviewProps {
  url: string
  className?: string
  onPageCount?: (count: number) => void
  onPageSelect?: (page: number) => void
  selectedPages?: number[]
  showThumbnails?: boolean
}

const PdfPreview: React.FC<PdfPreviewProps> = ({
  url,
  className,
  onPageCount,
  onPageSelect,
  selectedPages = [],
  showThumbnails = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [pdfDoc, setPdfDoc] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [scale, setScale] = useState(1.5)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load PDF.js dynamically
  useEffect(() => {
    const loadPdfJs = async () => {
      try {
        // Skip loading for mock URLs
        if (url.includes('mock-blob.vercel-storage.com')) {
          setError('Preview not available for mock files')
          setLoading(false)
          return
        }

        const pdfjsLib = await import('pdfjs-dist')
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js`
        
        // Handle base64 data URLs
        let loadingTask
        if (url.startsWith('data:')) {
          console.log('Loading PDF from base64 data URL, length:', url.length)
          // For base64 data URLs, we need to convert to Uint8Array
          const base64Data = url.split(',')[1]
          const binaryString = atob(base64Data)
          const bytes = new Uint8Array(binaryString.length)
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i)
          }
          console.log('Converted to Uint8Array, size:', bytes.length)
          loadingTask = pdfjsLib.getDocument({ data: bytes })
        } else {
          console.log('Loading PDF from URL:', url)
          // For regular URLs
          loadingTask = pdfjsLib.getDocument(url)
        }
        
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('PDF loading timeout')), 30000) // 30 second timeout
        })
        
        const pdf = await Promise.race([loadingTask.promise, timeoutPromise]) as any
        
        setPdfDoc(pdf)
        setTotalPages(pdf.numPages)
        onPageCount?.(pdf.numPages)
        setLoading(false)
      } catch (err) {
        console.error('Error loading PDF:', err)
        if (err instanceof Error) {
          if (err.message.includes('worker')) {
            setError('PDF viewer failed to load. Please try refreshing the page.')
          } else if (err.message.includes('timeout')) {
            setError('PDF loading timed out. The file might be too large.')
          } else {
            setError(`Failed to load PDF: ${err.message}`)
          }
        } else {
          setError('Failed to load PDF')
        }
        setLoading(false)
      }
    }

    if (url) {
      loadPdfJs()
    }
  }, [url, onPageCount])

  // Render current page
  useEffect(() => {
    const renderPage = async () => {
      if (!pdfDoc || !canvasRef.current) return

      try {
        const page = await pdfDoc.getPage(currentPage)
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')

        const viewport = page.getViewport({ scale })
        canvas.height = viewport.height
        canvas.width = viewport.width

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        }

        await page.render(renderContext).promise
      } catch (err) {
        console.error('Error rendering page:', err)
      }
    }

    renderPage()
  }, [pdfDoc, currentPage, scale])

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      onPageSelect?.(page)
    }
  }

  const zoomIn = () => setScale(prev => Math.min(prev + 0.25, 3))
  const zoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5))
  const resetZoom = () => setScale(1.5)

  const nextPage = () => goToPage(currentPage + 1)
  const prevPage = () => goToPage(currentPage - 1)

  if (loading) {
    return (
      <Card className={cn("h-96", className)}>
        <CardContent className="flex items-center justify-center h-full">
          <Loading text="Loading PDF..." />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn("h-96", className)}>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-destructive mb-2">{error}</p>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("flex h-full", className)}>
      {/* Main viewer */}
      <div className="flex-1 flex flex-col">
        {/* Controls */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={prevPage} disabled={currentPage <= 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              {currentPage} of {totalPages}
            </span>
            <Button variant="outline" size="sm" onClick={nextPage} disabled={currentPage >= totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={zoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">{Math.round(scale * 100)}%</span>
            <Button variant="outline" size="sm" onClick={zoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={resetZoom}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* PDF Canvas */}
        <div className="flex-1 overflow-auto p-4 bg-gray-50 dark:bg-gray-900">
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              className="shadow-lg border border-border rounded"
            />
          </div>
        </div>
      </div>

      {/* Thumbnails sidebar */}
      {showThumbnails && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 200, opacity: 1 }}
          className="border-l bg-card"
        >
          <div className="p-4 border-b">
            <h3 className="text-sm font-medium">Pages</h3>
          </div>
          <div className="overflow-y-auto h-full p-2 space-y-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <motion.div
                key={pageNum}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "relative cursor-pointer rounded border-2 transition-all",
                  currentPage === pageNum
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50",
                  selectedPages.includes(pageNum) && "ring-2 ring-blue-500"
                )}
                onClick={() => goToPage(pageNum)}
              >
                <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">{pageNum}</span>
                </div>
                {selectedPages.includes(pageNum) && (
                  <div className="absolute top-1 right-1 w-3 h-3 bg-blue-500 rounded-full" />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export { PdfPreview }
