import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Specification Checklist - Project Requirements Builder',
  description: 'Build and manage your project specifications with an interactive checklist. Select features, generate summaries, and track what\'s included or excluded in your project scope.',
  keywords: 'specification, checklist, project management, requirements, features',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
