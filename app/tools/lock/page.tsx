'use client'

import * as React from 'react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, FileText, Eye, EyeOff, Shield } from 'lucide-react'
import { Uploader } from '@/components/Uploader'

import { SidebarActions } from '@/components/SidebarActions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Loading } from '@/components/ui/loading'
import { Toast } from '@/components/ui/toast'
import { UploadedFile, ProcessedFile } from '@/lib/types'
import { cn } from '@/lib/utils'
import { lockPdf } from '@/lib/lockPdf'



export default function LockPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<ProcessedFile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [filename, setFilename] = useState('locked.pdf')

  const handleFilesUploaded = (files: UploadedFile[]) => {
    setUploadedFiles(prev => [...prev, ...files])
    setError(null)
  }

  const handleProcess = async () => {
    if (uploadedFiles.length === 0) {
      setError('Please upload a PDF file to lock')
      setShowToast(true)
      return
    }

    if (!password) {
      setError('Please enter a password')
      setShowToast(true)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setShowToast(true)
      return
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters long')
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

      // Use QPDF-based encryption
      const encryptedBlob = await lockPdf(file, password, password)
      
      // Create a data URL from the encrypted blob
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        
        setResult({
          url: dataUrl,
          name: filename,
          size: encryptedBlob.size,
          processedAt: new Date(),
        })
      }
      reader.readAsDataURL(encryptedBlob)
      
    } catch (err) {
      console.error('Lock error:', err)
      setError(err instanceof Error ? err.message : 'Failed to lock PDF')
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
    setConfirmPassword('')
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
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Lock PDF</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Protect your PDF documents with strong password encryption to secure your content.
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
              {/* Password Section */}
              <div>
                <h4 className="text-sm font-medium mb-3">Password Protection</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
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
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm password"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
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
                  Your PDF will be encrypted with strong password protection. Make sure to remember your password as it cannot be recovered.
                </p>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm">
                    <span className="font-medium">{formatBytes(uploadedFiles[0].size)}</span> file ready to lock
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
              description={error || "PDF locked successfully"}
              variant={error ? "destructive" : "success"}
              onClose={() => setShowToast(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
