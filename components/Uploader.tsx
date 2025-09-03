'use client'

import * as React from 'react'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, X, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loading } from '@/components/ui/loading'
import { EmptyState } from '@/components/ui/empty-state'
import { cn, formatFileSize, generateId, extensionsToAcceptFormat } from '@/lib/utils'
import { UploadedFile } from '@/lib/types'
import { createUploadUrl } from '@/lib/blob'

interface UploaderProps {
  onFilesUploaded: (files: UploadedFile[]) => void
  acceptedTypes?: string[]
  maxFiles?: number
  maxSize?: number
  className?: string
}

interface UploadingFile {
  id: string
  file: File
  progress: number
  status: 'uploading' | 'success' | 'error'
  error?: string
}

const Uploader: React.FC<UploaderProps> = ({
  onFilesUploaded,
  acceptedTypes = ['.pdf'],
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024, // 50MB
  className,
}) => {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])


  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newUploadingFiles: UploadingFile[] = acceptedFiles.map(file => ({
      id: generateId(),
      file,
      progress: 0,
      status: 'uploading',
    }))

    setUploadingFiles(prev => [...prev, ...newUploadingFiles])

    const uploadedResults: UploadedFile[] = []

    for (const uploadingFile of newUploadingFiles) {
      try {
        // Create a more efficient file processing approach
        const processFile = async (file: File): Promise<string> => {
          return new Promise((resolve, reject) => {
            // For very large files (>10MB), show a warning
            if (file.size > 10 * 1024 * 1024) {
              console.warn(`Large file detected: ${(file.size / 1024 / 1024).toFixed(1)}MB. Processing may take a moment.`)
            }
            
            const reader = new FileReader()
            
            reader.onprogress = (event) => {
              if (event.lengthComputable) {
                const progress = Math.round((event.loaded / event.total) * 100)
                setUploadingFiles(prev => 
                  prev.map(f => 
                    f.id === uploadingFile.id 
                      ? { ...f, progress }
                      : f
                  )
                )
              }
            }
            
            reader.onload = () => {
              const result = reader.result as string
              resolve(result)
            }
            
            reader.onerror = () => {
              reject(new Error('Failed to read file'))
            }
            
            // Use readAsDataURL for more efficient processing
            reader.readAsDataURL(file)
          })
        }

        // Process the file with real progress tracking
        const dataUrl = await processFile(uploadingFile.file)

        const uploadedFile: UploadedFile = {
          id: uploadingFile.id,
          name: uploadingFile.file.name,
          size: uploadingFile.file.size,
          blobUrl: dataUrl,
          uploadedAt: new Date(),
          file: uploadingFile.file, // Include the original file for browser-based operations
        }

        uploadedResults.push(uploadedFile)

        setUploadingFiles(prev => 
          prev.map(f => 
            f.id === uploadingFile.id 
              ? { ...f, status: 'success', progress: 100 }
              : f
          )
        )
      } catch (error) {
        console.error('Upload error:', error)
        setUploadingFiles(prev => 
          prev.map(f => 
            f.id === uploadingFile.id 
              ? { 
                  ...f, 
                  status: 'error', 
                  error: error instanceof Error ? error.message : 'Upload failed'
                }
              : f
          )
        )
      }
    }

    if (uploadedResults.length > 0) {
      onFilesUploaded(uploadedResults)
    }

    // Clear uploading files after a delay
    setTimeout(() => {
      setUploadingFiles(prev => prev.filter(f => f.status === 'error'))
    }, 3000)
  }, [onFilesUploaded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: extensionsToAcceptFormat(acceptedTypes),
    maxFiles,
    maxSize,
    multiple: true,
  })



  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop zone */}
      <Card
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed transition-all duration-200 cursor-pointer",
          isDragActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/50",
          className
        )}
      >
        <CardContent className="p-8">
          <input {...getInputProps()} />
          <EmptyState
            icon={<Upload className="h-12 w-12" />}
            title={isDragActive ? "Drop files here" : "Upload PDF files"}
            description="Drag and drop files here, or click to select files"
            action={
              <Button variant="outline" size="sm">
                Choose Files
              </Button>
            }
          />
        </CardContent>
      </Card>

      {/* Uploading files */}
      <AnimatePresence>
        {uploadingFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <h4 className="text-sm font-medium text-muted-foreground">Uploading...</h4>
            {uploadingFiles.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center space-x-3 p-3 bg-card rounded-lg"
              >
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.file.size)}
                    {file.status === 'uploading' && (
                      <span className="ml-2 text-blue-600">
                        {file.progress}% processing...
                      </span>
                    )}
                  </p>
                  {file.status === 'uploading' && (
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                        style={{ width: `${file.progress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {file.status === 'uploading' && (
                    <Loading size="sm" />
                  )}
                  {file.status === 'success' && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {file.status === 'error' && (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  )
}

export { Uploader }
