'use client'

import * as React from 'react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, RotateCcw, Play, Settings, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Loading } from '@/components/ui/loading'
import { cn } from '@/lib/utils'

interface SidebarActionsProps {
  onProcess: () => void
  onReset: () => void
  onDownload?: (url: string) => void
  processing?: boolean
  resultUrl?: string
  resultSize?: number
  className?: string
  children?: React.ReactNode
  defaultFilename?: string
  onFilenameChange?: (filename: string) => void
}

const SidebarActions: React.FC<SidebarActionsProps> = ({
  onProcess,
  onReset,
  onDownload,
  processing = false,
  resultUrl,
  resultSize,
  className,
  children,
  defaultFilename = 'merged.pdf',
  onFilenameChange,
}) => {
  const [downloading, setDownloading] = useState(false)
  const [filename, setFilename] = useState(defaultFilename)

  const handleDownload = async () => {
    if (!resultUrl || !onDownload) return
    
    setDownloading(true)
    try {
      await onDownload(resultUrl)
    } finally {
      setDownloading(false)
    }
  }

  const handleFilenameChange = (value: string) => {
    setFilename(value)
    onFilenameChange?.(value)
  }

  return (
    <Card className={cn("h-fit", className)}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Actions</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tool-specific controls */}
        {children}

        {/* Filename input */}
        {resultUrl && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Filename
            </label>
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <Input
                value={filename}
                onChange={(e) => handleFilenameChange(e.target.value)}
                placeholder="Enter filename"
                className="flex-1"
              />
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-3">
          <Button
            onClick={onProcess}
            disabled={processing}
            className="w-full"
            size="lg"
          >
            {processing ? (
              <Loading size="sm" className="mr-2" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {processing ? 'Processing...' : 'Process'}
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={onReset}
              disabled={processing}
              size="sm"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            
            {resultUrl && (
              <Button
                variant="outline"
                onClick={handleDownload}
                disabled={downloading}
                size="sm"
              >
                {downloading ? (
                  <Loading size="sm" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Download
              </Button>
            )}
          </div>
        </div>

        {/* Result info */}
        {resultUrl && resultSize && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg"
          >
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                Processing Complete
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              File size: {(resultSize / 1024).toFixed(1)} KB
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}

export { SidebarActions }
