import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PDF HelpDesk - Professional PDF Tools',
  description: 'Transform your PDF workflow with our premium suite of tools. Merge, split, compress, sign, and edit PDFs with enterprise-grade security and lightning-fast processing.',
  keywords: 'PDF tools, merge PDF, split PDF, compress PDF, sign PDF, edit PDF, professional PDF software, secure PDF processing',
  authors: [{ name: 'PDF HelpDesk Team' }],
  openGraph: {
    title: 'PDF HelpDesk - Professional PDF Tools',
    description: 'Transform your PDF workflow with our premium suite of tools. Enterprise-grade security and lightning-fast processing.',
    type: 'website',
    siteName: 'PDF HelpDesk',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PDF HelpDesk - Professional PDF Tools',
    description: 'Transform your PDF workflow with our premium suite of tools.',
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#3b82f6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
