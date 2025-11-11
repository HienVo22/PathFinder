import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Pathfinder - Job Recommendation Platform',
  description: 'Find your perfect job with AI-powered recommendations',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <AuthProvider>
            <Toaster position="top-right" />
            {children}
          </AuthProvider>
        </Providers>
      </body>
    </html>
  )
}
