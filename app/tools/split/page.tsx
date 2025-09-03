'use client'

import * as React from 'react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Scissors, ArrowRight, Download } from 'lucide-react'
import { Uploader } from '@/components/Uploader'

import { SidebarActions } from '@/components/SidebarActions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Loading } from '@/components/ui/loading'
import { Toast } from '@/components/ui/toast'
import { UploadedFile, ProcessedFile, PageRange } from '@/lib/types'
import { parsePageRanges, rangesToString } from '@/lib/ranges'
import { cn } from '@/lib/utils'

export default function SplitPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [processing, setProcessing] = useState(false)
  const [results, setResults] = useState<ProcessedFile[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [rangeInput, setRangeInput] = useState('')
  const [totalPages, setTotalPages] = useState(0)

  const handleFilesUploaded = async (files: UploadedFile[]) => {
    setUploadedFiles(prev => [...prev, ...files])
    setError(null)
    
    // Get page count from the uploaded file
    if (files.length > 0) {
      try {
        const pdfjsLib = await import('pdfjs-dist')
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js`
        
        let loadingTask
        if (files[0].blobUrl.startsWith('data:')) {
          const base64Data = files[0].blobUrl.split(',')[1]
          const binaryString = atob(base64Data)
          const bytes = new Uint8Array(binaryString.length)
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i)
          }
          loadingTask = pdfjsLib.getDocument({ data: bytes })
        } else {
          loadingTask = pdfjsLib.getDocument(files[0].blobUrl)
        }
        
        const pdf = await loadingTask.promise
        setTotalPages(pdf.numPages)
      } catch (err) {
        console.error('Error getting page count:', err)
      }
    }
  }

  const handleProcess = async () => {
    if (uploadedFiles.length === 0) {
      setError('Please upload a PDF file to split')
      setShowToast(true)
      return
    }

    if (!rangeInput.trim()) {
      setError('Please enter page ranges to split')
      setShowToast(true)
      return
    }

    const ranges = parsePageRanges(rangeInput)
    if (ranges.length === 0) {
      setError('Invalid page range format')
      setShowToast(true)
      return
    }

    setProcessing(true)
    setError(null)

    try {
      const response = await fetch('/api/split', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: uploadedFiles[0].blobUrl,
          ranges,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to split PDF')
      }

      setResults(data.data.results.map((result: any, index: number) => ({
        url: result.url,
        name: result.label,
        size: result.size,
        processedAt: new Date(),
      })))
    } catch (err) {
      console.error('Split error:', err)
      setError(err instanceof Error ? err.message : 'Failed to split PDF')
      setShowToast(true)
    } finally {
      setProcessing(false)
    }
  }

  const handleReset = () => {
    setUploadedFiles([])
    setResults([])
    setError(null)
    setRangeInput('')
    setTotalPages(0)
  }

  const handleDownload = async (url: string, name: string) => {
    try {
      // Handle base64 data URLs
      if (url.startsWith('data:')) {
        const response = await fetch(url)
        const blob = await response.blob()
        const downloadUrl = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = downloadUrl
        a.download = name
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(downloadUrl)
        document.body.removeChild(a)
        return
      }
      
      // Handle regular URLs
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = name
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Download error:', err)
      setError('Failed to download file')
      setShowToast(true)
    }
  }

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id))
  }



  const quickRanges = [
    { label: 'First half', range: `1-${Math.ceil(totalPages / 2)}` },
    { label: 'Second half', range: `${Math.ceil(totalPages / 2) + 1}-${totalPages}` },
    { label: 'Odd pages', range: Array.from({ length: Math.ceil(totalPages / 2) }, (_, i) => i * 2 + 1).join(',') },
    { label: 'Even pages', range: Array.from({ length: Math.floor(totalPages / 2) }, (_, i) => (i + 1) * 2).join(',') },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Scissors className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Split PDF</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Split a PDF into multiple files by specifying page ranges. 
          Use formats like &quot;1-3,5,8-10&quot; for custom ranges.
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Upload and Preview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Upload PDF File</CardTitle>
            </CardHeader>
            <CardContent>
              <Uploader
                onFilesUploaded={handleFilesUploaded}
                acceptedTypes={['.pdf']}
                maxFiles={1}
                maxSize={50 * 1024 * 1024} // 50MB
              />
            </CardContent>
          </Card>

          {/* Uploaded File */}
          {uploadedFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Uploaded File</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {uploadedFiles.map((file) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center space-x-3 p-3 bg-card rounded-lg border"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          1
                        </span>
                        <Scissors className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                      >
                        ×
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}




        </div>

        {/* Right Column - Actions */}
        <div className="space-y-6">
          <SidebarActions
            onProcess={handleProcess}
            onReset={handleReset}
            processing={processing}
            resultUrl={results.length > 0 ? 'multiple' : undefined}
            resultSize={results.reduce((total, result) => total + result.size, 0)}
          >
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Page Ranges</h4>
                <Input
                  placeholder="e.g., 1-3,5,8-10"
                  value={rangeInput}
                  onChange={(e) => setRangeInput(e.target.value)}
                  className="mb-2"
                />
                <p className="text-xs text-muted-foreground">
                  Enter page ranges separated by commas. Use hyphens for ranges.
                </p>
              </div>

              {totalPages > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Quick Ranges</h4>
                  <div className="space-y-2">
                    {quickRanges.map((quick, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setRangeInput(quick.range)}
                      >
                        {quick.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {uploadedFiles.length > 0 && totalPages > 0 && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm">
                    <span className="font-medium">{totalPages}</span> pages total
                  </p>
                </div>
              )}

              {results.length > 0 && (
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Split Results ({results.length})</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {results.map((result, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-between p-2 bg-muted/30 rounded border text-xs"
                        >
                          <div className="flex items-center space-x-2 min-w-0 flex-1">
                            <span className="text-muted-foreground font-medium">
                              {index + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium truncate">{result.name}</p>
                              <p className="text-muted-foreground">
                                {(result.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(result.url, result.name)}
                            className="h-6 px-2 text-xs"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground text-center">
                      {results.length} files • {((results.reduce((total, result) => total + result.size, 0)) / 1024).toFixed(1)} KB total
                    </p>
                  </div>
                </div>
              )}
            </div>
          </SidebarActions>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <Toast
              title={error ? "Error" : "Success"}
              description={error || "PDF split successfully"}
              variant={error ? "destructive" : "success"}
              onClose={() => setShowToast(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
