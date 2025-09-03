'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  FileText, 
  Scissors, 
  Download, 
  Minus, 
  PenTool, 
  Lock,
  Unlock,
  ArrowRight
} from 'lucide-react'
import { ToolCard } from '@/components/ToolCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tool } from '@/lib/types'

const tools: Tool[] = [
  {
    id: 'merge',
    title: 'Merge PDFs',
    description: 'Combine multiple PDF files into a single document',
    icon: 'FileText',
    href: '/tools/merge',
    enabled: true,
  },
  {
    id: 'split',
    title: 'Split PDF',
    description: 'Split a PDF into multiple files by pages or ranges',
    icon: 'Scissors',
    href: '/tools/split',
    enabled: true,
  },

  {
    id: 'compress',
    title: 'Compress PDF',
    description: 'Reduce PDF file size while maintaining quality',
    icon: 'Minus',
    href: '/tools/compress',
    enabled: true,
  },
  {
    id: 'sign',
    title: 'Sign PDF',
    description: 'Add digital signatures and text overlays',
    icon: 'PenTool',
    href: '/tools/sign',
    enabled: true,
    premium: true,
  },

  {
    id: 'lock',
    title: 'Lock PDF',
    description: 'Password protect your PDF documents',
    icon: 'Lock',
    href: '/tools/lock',
    enabled: true,
  },
  {
    id: 'unlock',
    title: 'Unlock PDF',
    description: 'Remove password protection from PDFs',
    icon: 'Unlock',
    href: '/tools/unlock',
    enabled: true,
  },
]

const iconMap = {
  FileText,
  Scissors,
  Download,
  Minus,
  PenTool,
  Lock,
  Unlock,
}

export default function HomePage() {
  const enabledTools = tools.filter(tool => tool.enabled)

  return (
    <div className="min-h-screen">
      {/* Enhanced Header */}
      <header className="border-b border-border/30 backdrop-blur-xl bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group hover:scale-105 transition-transform duration-300">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 group-hover:border-primary/40 transition-colors duration-300">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text group-hover:text-primary transition-colors duration-300">PDF HelpDesk</h1>
                <p className="text-xs text-muted-foreground">Professional PDF Solutions</p>
              </div>
            </Link>
            <div className="flex items-center space-x-3">
              <Link href="/about">
                <Button variant="ghost" size="sm" className="hidden md:flex">
                  About
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="ghost" size="sm" className="hidden md:flex">
                  Contact
                </Button>
              </Link>
              <Button variant="outline" size="sm" className="btn-secondary">
                Sign In
              </Button>
              <Button size="sm" className="btn-primary">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* HelpDesk Section - Main Opening Section */}
      <section className="py-12 bg-gradient-to-b from-transparent to-card/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h3 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">HelpDesk</h3>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Choose from our comprehensive suite of enterprise-grade PDF tools. 
              Each tool is optimized for performance, security, and ease of use.
            </p>
            <div className="mt-6 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Developed by{' '}
                <span className="text-base font-semibold bg-rainbow bg-clip-text text-transparent">
                  Lokanex
                </span>
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {enabledTools.map((tool, index) => {
              const Icon = iconMap[tool.icon as keyof typeof iconMap]
              return (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="animate-fade-in-scale"
                >
                  <ToolCard
                    title={tool.title}
                    description={tool.description}
                    icon={Icon}
                    href={tool.href}
                    enabled={tool.enabled}
                    premium={tool.premium}
                  />
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-16 bg-gradient-to-b from-transparent via-card/10 to-transparent relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-primary/5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-accent/5 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <span className="text-sm font-medium text-primary">✨ Why Choose Us</span>
            </div>
            <h3 className="text-4xl md:text-5xl font-bold mb-6 gradient-text leading-tight">
              Why Choose PDF HelpDesk?
            </h3>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Built for professionals who demand <span className="text-primary font-semibold">reliability</span>, <span className="text-primary font-semibold">speed</span>, and <span className="text-primary font-semibold">uncompromising security</span> in their PDF processing workflow
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center"
            >
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/20 flex items-center justify-center animate-glow">
                  <FileText className="h-10 w-10 text-green-500" />
                </div>
              </div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm font-medium text-green-500">Performance</span>
              </div>
              <h4 className="text-xl md:text-2xl font-bold mb-3 gradient-text">Lightning Fast Processing</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Process your PDFs in seconds with our cloud-optimized algorithms and distributed processing architecture
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-center"
            >
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20 flex items-center justify-center animate-glow">
                  <Lock className="h-10 w-10 text-blue-500" />
                </div>
              </div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm font-medium text-blue-500">Security</span>
              </div>
              <h4 className="text-xl md:text-2xl font-bold mb-3 gradient-text">Military-Grade Security</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your files are processed with end-to-end encryption and automatically deleted after processing
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-center"
            >
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20 flex items-center justify-center animate-glow">
                  <Download className="h-10 w-10 text-purple-500" />
                </div>
              </div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 mb-4">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm font-medium text-purple-500">Enterprise</span>
              </div>
              <h4 className="text-xl md:text-2xl font-bold mb-3 gradient-text">Enterprise-Ready Interface</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Intuitive design that scales from individual users to enterprise teams with advanced workflow management
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="border-t border-border/50 py-12 bg-gradient-to-t from-card/40 to-card/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <span className="text-xl font-bold gradient-text">PDF HelpDesk</span>
                  <p className="text-sm text-muted-foreground">Professional PDF Solutions</p>
                </div>
              </div>
              <p className="text-muted-foreground max-w-md leading-relaxed mb-4">
                Transform your PDF workflow with enterprise-grade tools designed for professionals who demand excellence.
              </p>
              <p className="text-sm text-muted-foreground">
                Developed by{' '}
                <span className="font-semibold bg-rainbow bg-clip-text text-transparent">
                  Lokanex
                </span>
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link href="/tools/merge" className="block hover:text-foreground transition-colors">Merge PDFs</Link>
                <Link href="/tools/split" className="block hover:text-foreground transition-colors">Split PDFs</Link>
                <Link href="/tools/compress" className="block hover:text-foreground transition-colors">Compress PDFs</Link>
                <Link href="/tools/sign" className="block hover:text-foreground transition-colors">Sign PDFs</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link href="/about" className="block hover:text-foreground transition-colors">About</Link>
                <Link href="/contact" className="block hover:text-foreground transition-colors">Contact</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-border/30 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-muted-foreground mb-4 md:mb-0">
              © 2024 PDF HelpDesk. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>All systems operational</span>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
