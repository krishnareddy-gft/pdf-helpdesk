'use client'

import * as React from 'react'
import { useRef, useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { X, Move, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { OverlayData } from '@/lib/types'

interface OverlayCanvasProps {
  overlays: OverlayData[]
  onOverlayAdd: (overlay: Omit<OverlayData, 'id'>) => void
  onOverlayUpdate: (id: string, overlay: Partial<OverlayData>) => void
  onOverlayRemove: (id: string) => void
  onOverlaySelect: (id: string | null) => void
  selectedOverlayId?: string | null
  className?: string
}

interface DragState {
  isDragging: boolean
  startX: number
  startY: number
  overlayId: string
}

const OverlayCanvas: React.FC<OverlayCanvasProps> = ({
  overlays,
  onOverlayAdd,
  onOverlayUpdate,
  onOverlayRemove,
  onOverlaySelect,
  selectedOverlayId,
  className,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [dragState, setDragState] = useState<DragState | null>(null)
  const [isAddingOverlay, setIsAddingOverlay] = useState(false)

  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    if (!isAddingOverlay) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Add a new text overlay at the clicked position
    onOverlayAdd({
      page: 1, // Default to page 1, should be passed as prop
      type: 'text',
      data: 'New Text',
      x,
      y,
      fontSize: 12,
      color: '#000000',
    })

    setIsAddingOverlay(false)
  }, [isAddingOverlay, onOverlayAdd])

  const handleMouseDown = useCallback((event: React.MouseEvent, overlayId: string) => {
    event.stopPropagation()
    setDragState({
      isDragging: true,
      startX: event.clientX,
      startY: event.clientY,
      overlayId,
    })
    onOverlaySelect(overlayId)
  }, [onOverlaySelect])

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!dragState?.isDragging) return

    const deltaX = event.clientX - dragState.startX
    const deltaY = event.clientY - dragState.startY

    const overlay = overlays.find(o => o.id === dragState.overlayId)
    if (overlay) {
      onOverlayUpdate(dragState.overlayId, {
        x: overlay.x + deltaX,
        y: overlay.y + deltaY,
      })
    }

    setDragState(prev => prev ? {
      ...prev,
      startX: event.clientX,
      startY: event.clientY,
    } : null)
  }, [dragState, overlays, onOverlayUpdate])

  const handleMouseUp = useCallback(() => {
    setDragState(null)
  }, [])

  useEffect(() => {
    const handleGlobalMouseMove = (event: MouseEvent) => {
      if (!dragState?.isDragging) return

      const deltaX = event.clientX - dragState.startX
      const deltaY = event.clientY - dragState.startY

      const overlay = overlays.find(o => o.id === dragState.overlayId)
      if (overlay) {
        onOverlayUpdate(dragState.overlayId, {
          x: overlay.x + deltaX,
          y: overlay.y + deltaY,
        })
      }

      setDragState(prev => prev ? {
        ...prev,
        startX: event.clientX,
        startY: event.clientY,
      } : null)
    }

    const handleGlobalMouseUp = () => {
      setDragState(null)
    }

    if (dragState?.isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [dragState, overlays, onOverlayUpdate])

  const renderOverlay = (overlay: OverlayData) => {
    const isSelected = selectedOverlayId === overlay.id

    switch (overlay.type) {
      case 'text':
        return (
          <motion.div
            key={overlay.id}
            className={cn(
              "absolute cursor-move select-none",
              isSelected && "ring-2 ring-primary"
            )}
            style={{
              left: overlay.x,
              top: overlay.y,
              fontSize: overlay.fontSize || 12,
              color: overlay.color || '#000000',
            }}
            onMouseDown={(e) => handleMouseDown(e, overlay.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative">
              {overlay.data}
              {isSelected && (
                <div className="absolute -top-6 left-0 flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      onOverlayRemove(overlay.id)
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )

      case 'signature':
      case 'image':
        return (
          <motion.div
            key={overlay.id}
            className={cn(
              "absolute cursor-move",
              isSelected && "ring-2 ring-primary"
            )}
            style={{
              left: overlay.x,
              top: overlay.y,
              width: overlay.width || 100,
              height: overlay.height || 50,
            }}
            onMouseDown={(e) => handleMouseDown(e, overlay.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <img
              src={overlay.data}
              alt={overlay.type}
              className="w-full h-full object-contain border border-border rounded"
            />
            {isSelected && (
              <div className="absolute -top-6 left-0 flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    onOverlayRemove(overlay.id)
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className={cn("relative", className)}>
      {/* Canvas */}
      <div
        ref={canvasRef}
        className="relative w-full h-96 bg-gray-50 dark:bg-gray-900 border border-border rounded-lg overflow-hidden"
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Overlays */}
        {overlays.map(renderOverlay)}

        {/* Add overlay button */}
        <div className="absolute top-4 left-4">
          <Button
            variant={isAddingOverlay ? "default" : "outline"}
            size="sm"
            onClick={() => setIsAddingOverlay(!isAddingOverlay)}
          >
            <Move className="h-4 w-4 mr-2" />
            {isAddingOverlay ? 'Click to add text' : 'Add Text'}
          </Button>
        </div>

        {/* Instructions */}
        {isAddingOverlay && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-4 right-4 p-3 bg-card border border-border rounded-lg"
          >
            <p className="text-sm text-muted-foreground text-center">
              Click anywhere on the canvas to add text
            </p>
          </motion.div>
        )}
      </div>

      {/* Overlay list */}
      {overlays.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium">Overlays ({overlays.length})</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {overlays.map((overlay) => (
              <div
                key={overlay.id}
                className={cn(
                  "flex items-center justify-between p-2 rounded border",
                  selectedOverlayId === overlay.id
                    ? "border-primary bg-primary/10"
                    : "border-border"
                )}
                onClick={() => onOverlaySelect(overlay.id)}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm capitalize">{overlay.type}</span>
                  {overlay.type === 'text' && (
                    <span className="text-xs text-muted-foreground">
                      &quot;{overlay.data}&quot;
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    onOverlayRemove(overlay.id)
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export { OverlayCanvas }
