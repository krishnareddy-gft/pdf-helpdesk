'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LucideIcon, ArrowRight } from 'lucide-react'

interface ToolCardProps {
  title: string
  description: string
  icon: LucideIcon
  href: string
  enabled?: boolean
  premium?: boolean
  className?: string
}

const ToolCard: React.FC<ToolCardProps> = ({
  title,
  description,
  icon: Icon,
  href,
  enabled = true,
  premium = false,
  className,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (premium) {
      e.preventDefault()
      alert('This is a premium feature. Please upgrade to access PDF signing capabilities.')
    }
  }

  const cardContent = (
    <Card className={cn(
      "glass-card h-full group border-2 border-border/40 bg-card/80 backdrop-blur-xl shadow-xl",
      enabled 
        ? "cursor-pointer hover:border-primary/50 hover:shadow-2xl" 
        : "opacity-50 cursor-not-allowed",
      className
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 group-hover:border-primary/40 transition-all duration-300">
              <Icon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
            </div>
            <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-300">{title}</CardTitle>
          </div>
          {premium && (
            <div className="premium-badge text-xs px-2 py-1">
              PREMIUM
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="text-sm text-foreground/80 leading-relaxed group-hover:text-foreground transition-colors duration-300">
          {description}
        </CardDescription>
        {enabled && (
          <div className="mt-3 flex items-center text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span>Get Started</span>
            <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (!enabled) {
    return cardContent
  }

  if (premium) {
    return (
      <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        onClick={handleClick}
      >
        {cardContent}
      </motion.div>
    )
  }

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Link href={href} className="block">
        {cardContent}
      </Link>
    </motion.div>
  )
}

export { ToolCard }
