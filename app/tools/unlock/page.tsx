'use client'

import * as React from 'react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Unlock, FileText, Eye, EyeOff, Shield } from 'lucide-react'
import { Uploader } from '@/components/Uploader'

import { SidebarActions } from '@/components/SidebarActions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Loading } from '@/components/ui/loading'
import { Toast } from '@/components/ui/toast'
import { UploadedFile, ProcessedFile } from '@/lib/types'
import { cn } from '@/lib/utils'
import { unlockPdfInBrowser } from '@/lib/unlockPdf'

export default function UnlockPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<ProcessedFile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [filename, setFilename] = useState('unlocked.pdf')

  const handleFilesUploaded = (files: UploadedFile[]) => {
    setUploadedFiles(prev => [...prev, ...files])
    setError(null)
  }

  const handleProcess = async () => {
    if (uploadedFiles.length === 0) {
      setError('Please upload a password-protected PDF file')
      setShowToast(true)
      return
    }

    if (!password) {
      setError('Please enter the PDF password')
      setShowToast(true)
      return
    }

    setProcessing(true)
    setError(null)

    try {
      // Get the file from the uploaded files
      const file = uploadedFiles[0].file
      if (!file) {
        throw new Error('No file found')
      }

      // Use browser-based unlock function
      const unlockedBlob = await unlockPdfInBrowser(file, password)
      
      // Create a data URL from the unlocked blob
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        
        setResult({
          url: dataUrl,
          name: filename,
          size: unlockedBlob.size,
          processedAt: new Date(),
        })
      }
      reader.readAsDataURL(unlockedBlob)
      
    } catch (err) {
      console.error('Unlock error:', err)
      setError(err instanceof Error ? err.message : 'Failed to unlock PDF')
      setShowToast(true)
    } finally {
      setProcessing(false)
    }
  }

  const handleReset = () => {
    setUploadedFiles([])
    setResult(null)
    setError(null)
    setPassword('')
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
            <Unlock className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Unlock PDF</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Remove password protection from your PDF documents. Enter the correct password to unlock.
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Upload and Preview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Password-Protected PDF</CardTitle>
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
              {/* Password Section */}
              <div>
                <h4 className="text-sm font-medium mb-3">PDF Password</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Enter PDF Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter the PDF password"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                    Security Notice
                  </span>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-300">
                  Only enter passwords for PDFs you own or have permission to unlock. 
                  We do not store your password or PDF content.
                </p>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm">
                    <span className="font-medium">{formatBytes(uploadedFiles[0].size)}</span> password-protected file ready to unlock
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
              description={error || "PDF unlocked successfully"}
              variant={error ? "destructive" : "success"}
              onClose={() => setShowToast(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
