'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ToolLayoutProps {
  children: React.ReactNode
}

export default function ToolLayout({ children }: ToolLayoutProps) {
  return (
    <div className="min-h-screen">
      {/* Enhanced Header */}
      <header className="border-b border-border/30 backdrop-blur-xl bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="hover:bg-accent/50">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold gradient-text">PDF HelpDesk</h1>
                  <p className="text-xs text-muted-foreground">Professional PDF Tools</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="hidden md:flex">
                Help
              </Button>
              <Button variant="outline" size="sm" className="btn-secondary">
                Account
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  )
}
