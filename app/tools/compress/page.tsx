'use client'

import * as React from 'react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Minus, TrendingDown, FileText } from 'lucide-react'
import { Uploader } from '@/components/Uploader'

import { SidebarActions } from '@/components/SidebarActions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loading } from '@/components/ui/loading'
import { Toast } from '@/components/ui/toast'
import { UploadedFile, ProcessedFile } from '@/lib/types'
import { cn } from '@/lib/utils'

type CompressionLevel = 'light' | 'balanced' | 'strong'

export default function CompressPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<ProcessedFile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>('balanced')
  const [compressionStats, setCompressionStats] = useState<{
    beforeBytes: number
    afterBytes: number
    compressionRatio: number
  } | null>(null)
  const [filename, setFilename] = useState('compressed.pdf')

  const handleFilesUploaded = (files: UploadedFile[]) => {
    setUploadedFiles(prev => [...prev, ...files])
    setError(null)
  }

  const handleProcess = async () => {
    if (uploadedFiles.length === 0) {
      setError('Please upload a PDF file to compress')
      setShowToast(true)
      return
    }

    setProcessing(true)
    setError(null)

    try {
      const response = await fetch('/api/compress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: uploadedFiles[0].blobUrl,
          level: compressionLevel,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to compress PDF')
      }

      setResult({
        url: data.data.url,
        name: filename,
        size: data.data.afterBytes,
        processedAt: new Date(),
      })

      setCompressionStats({
        beforeBytes: data.data.beforeBytes,
        afterBytes: data.data.afterBytes,
        compressionRatio: data.data.compressionRatio,
      })
    } catch (err) {
      console.error('Compress error:', err)
      setError(err instanceof Error ? err.message : 'Failed to compress PDF')
      setShowToast(true)
    } finally {
      setProcessing(false)
    }
  }

  const handleReset = () => {
    setUploadedFiles([])
    setResult(null)
    setError(null)
    setCompressionStats(null)
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

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const compressionLevels = [
    {
      value: 'light' as const,
      label: 'Light',
      description: 'Minimal compression, best quality',
      icon: '🪶',
    },
    {
      value: 'balanced' as const,
      label: 'Balanced',
      description: 'Good balance of size and quality',
      icon: '⚖️',
    },
    {
      value: 'strong' as const,
      label: 'Strong',
      description: 'Maximum compression, smaller files',
      icon: '💪',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Minus className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Compress PDF</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Reduce PDF file size while maintaining quality. Choose your compression level based on your needs.
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
                        <FileText className="h-4 w-4 text-muted-foreground" />
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
            onDownload={handleDownload}
            processing={processing}
            resultUrl={result?.url}
            resultSize={result?.size}
            defaultFilename={filename}
            onFilenameChange={setFilename}
          >
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-3">Compression Level</h4>
                <div className="space-y-2">
                  {compressionLevels.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => setCompressionLevel(level.value)}
                      className={cn(
                        "w-full p-3 rounded-lg border text-left transition-all",
                        compressionLevel === level.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{level.icon}</span>
                        <div>
                          <p className="text-sm font-medium">{level.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {level.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Compression Stats */}
              {compressionStats && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg"
                >
                  <div className="flex items-center space-x-2 mb-3">
                    <TrendingDown className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">
                      Compression Results
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Original:</span>
                      <span>{formatBytes(compressionStats.beforeBytes)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Compressed:</span>
                      <span>{formatBytes(compressionStats.afterBytes)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Saved:</span>
                      <span className="text-green-600">
                        {compressionStats.compressionRatio.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {uploadedFiles.length > 0 && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm">
                    <span className="font-medium">{formatBytes(uploadedFiles[0].size)}</span> file ready to compress
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
              description={error || "File compressed successfully"}
              variant={error ? "destructive" : "success"}
              onClose={() => setShowToast(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
