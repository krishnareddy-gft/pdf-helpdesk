'use client'

import * as React from 'react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, ArrowRight, Download, Save } from 'lucide-react'
import { Uploader } from '@/components/Uploader'

import { SidebarActions } from '@/components/SidebarActions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loading } from '@/components/ui/loading'
import { Toast } from '@/components/ui/toast'
import { UploadedFile, ProcessedFile } from '@/lib/types'
import { cn } from '@/lib/utils'

export default function MergePage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<ProcessedFile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [filename, setFilename] = useState('merged.pdf')

  const handleFilesUploaded = (files: UploadedFile[]) => {
    setUploadedFiles(prev => [...prev, ...files])
    setError(null)
  }

  const handleProcess = async () => {
    if (uploadedFiles.length < 2) {
      setError('Please upload at least 2 PDF files to merge')
      setShowToast(true)
      return
    }

    setProcessing(true)
    setError(null)

    try {
      const response = await fetch('/api/merge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: uploadedFiles.map(f => f.blobUrl),
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to merge PDFs')
      }

      console.log('Merge result:', data.data)
      setResult({
        url: data.data.url,
        name: filename,
        size: data.data.size,
        processedAt: new Date(),
      })
    } catch (err) {
      console.error('Merge error:', err)
      setError(err instanceof Error ? err.message : 'Failed to merge PDFs')
      setShowToast(true)
    } finally {
      setProcessing(false)
    }
  }

  const handleReset = () => {
    setUploadedFiles([])
    setResult(null)
    setError(null)
  }

  const handleDownload = async (url: string) => {
    try {
      // Handle base64 data URLs
      if (url.startsWith('data:')) {
        const response = await fetch(url)
        const blob = await response.blob()
        const downloadUrl = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = downloadUrl
        a.download = filename
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
      a.download = filename
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

  const moveFile = (fromIndex: number, toIndex: number) => {
    setUploadedFiles(prev => {
      const newFiles = [...prev]
      const [movedFile] = newFiles.splice(fromIndex, 1)
      newFiles.splice(toIndex, 0, movedFile)
      return newFiles
    })
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 animate-glow">
            <FileText className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold gradient-text">Merge PDFs</h1>
            <p className="text-sm text-muted-foreground mt-1">Professional PDF Merging</p>
          </div>
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Combine multiple PDF files into a single document with precision. 
          Drag and drop to reorder files for the perfect sequence.
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Upload and File List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Enhanced Upload Section */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-xl">Upload PDF Files</CardTitle>
              <p className="text-sm text-muted-foreground">
                Select up to 10 PDF files, maximum 50MB each
              </p>
            </CardHeader>
            <CardContent>
              <Uploader
                onFilesUploaded={handleFilesUploaded}
                acceptedTypes={['.pdf']}
                maxFiles={10}
                maxSize={50 * 1024 * 1024} // 50MB
              />
            </CardContent>
          </Card>

          {/* Enhanced File List */}
          {uploadedFiles.length > 0 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-xl">Files to Merge ({uploadedFiles.length})</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Drag to reorder or use the arrow buttons
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {uploadedFiles.map((file, index) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center space-x-3 p-4 bg-secondary/30 rounded-xl border border-border/30 hover:border-border/50 transition-all duration-300"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {index + 1}
                          </span>
                        </div>
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        {index > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveFile(index, index - 1)}
                            className="h-8 w-8 p-0 hover:bg-primary/10"
                          >
                            ↑
                          </Button>
                        )}
                        {index < uploadedFiles.length - 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveFile(index, index + 1)}
                            className="h-8 w-8 p-0 hover:bg-primary/10"
                          >
                            ↓
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          ×
                        </Button>
                      </div>
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
            onDownload={handleDownload}
            processing={processing}
            resultUrl={result?.url}
            resultSize={result?.size}
            defaultFilename={filename}
            onFilenameChange={setFilename}
          >
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Merge Options</h4>
                <p className="text-xs text-muted-foreground">
                  Files will be merged in the order shown in the list. 
                  Use the arrows to reorder files.
                </p>
              </div>
              
              {uploadedFiles.length > 0 && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm">
                    <span className="font-medium">{uploadedFiles.length}</span> files ready to merge
                  </p>
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
              description={error || "File saved successfully"}
              variant={error ? "destructive" : "success"}
              onClose={() => setShowToast(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
