'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Users, Code, Heart, Mail } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
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
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold gradient-text">About Lokanex.com</h1>
                  <p className="text-xs text-muted-foreground">Our Story</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Hero Section */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center px-6 py-3 rounded-full bg-primary/10 border border-primary/20 mb-8">
                <span className="text-sm font-medium text-primary">🚀 About Lokanex.com</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-8 gradient-text leading-tight">
                Young, Talented & Passionate
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Lokanex.com is a startup company with young, talented, passionate people. 
                We build software products with low cost, reliability, and modern technology.
              </p>
            </motion.div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center"
            >
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6 animate-glow">
                <Users className="h-10 w-10 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4 gradient-text">Young & Talented</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our team consists of passionate young professionals who bring fresh perspectives and innovative solutions to every project.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-center"
            >
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-6 animate-glow">
                <Code className="h-10 w-10 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4 gradient-text">Modern Tech Stack</h3>
              <p className="text-muted-foreground leading-relaxed">
                We use cutting-edge technologies and up-to-date frameworks to ensure our products are modern, scalable, and future-proof.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-center"
            >
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-6 animate-glow">
                <Heart className="h-10 w-10 text-purple-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4 gradient-text">Low Cost & Reliable</h3>
              <p className="text-muted-foreground leading-relaxed">
                We deliver high-quality software solutions at competitive prices without compromising on reliability and performance.
              </p>
            </motion.div>
          </div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center bg-gradient-to-br from-card/30 to-card/10 rounded-2xl p-8 border border-border/30"
          >
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-4 gradient-text">Get In Touch</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Ready to work with us? Let&apos;s discuss your project and how we can help bring your ideas to life.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="mailto:admin@lokanex.com"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                <Mail className="h-5 w-5 mr-2" />
                admin@lokanex.com
              </a>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="btn-secondary">
                  Contact Page
                </Button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
