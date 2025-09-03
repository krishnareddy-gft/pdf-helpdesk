'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Mail, MessageSquare, Phone, MapPin } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ContactPage() {
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
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold gradient-text">Contact Us</h1>
                  <p className="text-xs text-muted-foreground">Get in Touch</p>
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
                <span className="text-sm font-medium text-primary">📧 Contact Information</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-8 gradient-text leading-tight">
                Get In Touch
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Have a question about our PDF tools or want to discuss a custom project? 
                We&apos;d love to hear from you.
              </p>
            </motion.div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            {/* Contact Details */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Email Us</h3>
                  <p className="text-muted-foreground mb-2">For general inquiries and support</p>
                  <a 
                    href="mailto:admin@pdfhelpdesk.com"
                    className="text-primary hover:text-primary/80 transition-colors font-medium"
                  >
                    admin@pdfhelpdesk.com
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/20 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Business Inquiries</h3>
                  <p className="text-muted-foreground mb-2">For partnerships and business opportunities</p>
                  <a 
                    href="mailto:admin@lokanex.com"
                    className="text-primary hover:text-primary/80 transition-colors font-medium"
                  >
                    admin@lokanex.com
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Location</h3>
                  <p className="text-muted-foreground">Remote-first company</p>
                  <p className="text-muted-foreground">Serving clients worldwide</p>
                </div>
              </div>
            </motion.div>

            {/* Quick Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-gradient-to-br from-card/30 to-card/10 rounded-2xl p-8 border border-border/30"
            >
              <h3 className="text-2xl font-bold mb-6 gradient-text">Quick Message</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <Input placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input type="email" placeholder="your@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <Input placeholder="What's this about?" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea 
                    className="w-full h-32 px-3 py-2 rounded-lg border border-border/50 bg-input/50 backdrop-blur-sm text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-300"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>
                <Button className="w-full btn-primary">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Response Time */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center bg-gradient-to-br from-card/20 to-card/10 rounded-2xl p-8 border border-border/30"
          >
            <h3 className="text-2xl font-bold mb-4 gradient-text">Response Time</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We typically respond to all inquiries within 24 hours. For urgent matters, 
              please mention &quot;URGENT&quot; in your subject line and we&apos;ll prioritize your request.
            </p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
