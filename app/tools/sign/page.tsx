'use client'

import * as React from 'react'
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PenTool, FileText, Upload, Download, Trash2, Move } from 'lucide-react'
import { Uploader } from '@/components/Uploader'
import { SidebarActions } from '@/components/SidebarActions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Loading } from '@/components/ui/loading'
import { Toast } from '@/components/ui/toast'
import { UploadedFile, ProcessedFile } from '@/lib/types'
import { cn } from '@/lib/utils'
import { stampSignature } from '@/lib/signPdf'

export default function SignPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [signatureFile, setSignatureFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<ProcessedFile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [filename, setFilename] = useState('signed.pdf')
  
  // Signature positioning
  const [page, setPage] = useState(0)
  const [x, setX] = useState(100)
  const [y, setY] = useState(100)
  const [width, setWidth] = useState(200)

  const handleFilesUploaded = (files: UploadedFile[]) => {
    setUploadedFiles(prev => [...prev, ...files])
    setError(null)
  }

  const handleSignatureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setSignatureFile(file)
      setError(null)
    } else {
      setError('Please upload a valid image file for signature')
      setShowToast(true)
    }
  }

  const handleProcess = async () => {
    if (uploadedFiles.length === 0) {
      setError('Please upload a PDF file to sign')
      setShowToast(true)
      return
    }

    if (!signatureFile) {
      setError('Please upload a signature image')
      setShowToast(true)
      return
    }

    setProcessing(true)
    setError(null)

    try {
      // Get the PDF file from uploaded files
      const pdfFile = uploadedFiles[0].file
      if (!pdfFile) {
        throw new Error('No PDF file found')
      }

      // Use the stampSignature function
      const signedBlob = await stampSignature(pdfFile, signatureFile, page, x, y, width)
      
      // Create a data URL from the signed blob
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        
        setResult({
          url: dataUrl,
          name: filename,
          size: signedBlob.size,
          processedAt: new Date(),
        })
      }
      reader.readAsDataURL(signedBlob)
      
    } catch (err) {
      console.error('Sign error:', err)
      setError(err instanceof Error ? err.message : 'Failed to sign PDF')
      setShowToast(true)
    } finally {
      setProcessing(false)
    }
  }

  const handleReset = () => {
    setUploadedFiles([])
    setSignatureFile(null)
    setResult(null)
    setError(null)
    setPage(0)
    setX(100)
    setY(100)
    setWidth(200)
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <PenTool className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Sign PDF</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Add digital signatures to your PDF documents with precise positioning and sizing.
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Upload and Preview */}
        <div className="lg:col-span-2 space-y-6">
          {/* PDF Upload Section */}
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

          {/* Signature Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Signature Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSignatureUpload}
                    className="hidden"
                    id="signature-upload"
                  />
                  <label
                    htmlFor="signature-upload"
                    className="flex items-center space-x-2 px-4 py-2 border border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    <span className="text-sm">Choose signature image</span>
                  </label>
                </div>
                
                {signatureFile && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-3 p-3 bg-card rounded-lg border"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{signatureFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatBytes(signatureFile.size)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSignatureFile(null)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Uploaded PDF File */}
          {uploadedFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Uploaded PDF</CardTitle>
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
                          {formatBytes(file.size)}
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
              {/* Signature Positioning */}
              <div>
                <h4 className="text-sm font-medium mb-3">Signature Position</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Page Number (0-based)
                    </label>
                    <Input
                      type="number"
                      value={page}
                      onChange={(e) => setPage(parseInt(e.target.value) || 0)}
                      min="0"
                      placeholder="0"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        X Position
                      </label>
                      <Input
                        type="number"
                        value={x}
                        onChange={(e) => setX(parseInt(e.target.value) || 0)}
                        placeholder="100"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Y Position
                      </label>
                      <Input
                        type="number"
                        value={y}
                        onChange={(e) => setY(parseInt(e.target.value) || 0)}
                        placeholder="100"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Width
                    </label>
                    <Input
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(parseInt(e.target.value) || 200)}
                      placeholder="200"
                    />
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <PenTool className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                    Instructions
                  </span>
                </div>
                <ul className="text-xs text-blue-600 dark:text-blue-300 space-y-1">
                  <li>• Upload a PNG signature image</li>
                  <li>• Set page number (0 = first page)</li>
                  <li>• Adjust X, Y position and width</li>
                  <li>• Height scales automatically</li>
                </ul>
              </div>

              {uploadedFiles.length > 0 && signatureFile && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm">
                    <span className="font-medium">{formatBytes(uploadedFiles[0].size)}</span> PDF ready to sign
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Signature: {signatureFile.name}
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
              description={error || "PDF signed successfully"}
              variant={error ? "destructive" : "success"}
              onClose={() => setShowToast(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
