import type { Metadata } from 'next'
import { type Viewport } from 'next'
import { LanguageProvider } from '@/lib/LanguageContext'
import { AdminProvider } from '@/lib/AdminContext'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ольга Рубан | Olga Ruban - Поэтесса, Стихи, Песни',
  description: 'Официальный сайт Ольги Рубан (Olga Ruban) - поэтессы и автора песен. 400+ произведений на 7 языках. Стихи, песни, истории. Life is wonderful - you just have to know how to be amazed!',
  keywords: ['Ольга Рубан', 'Olga Ruban', 'поэтесса', 'poet', 'стихи', 'poems', 'песни', 'songs', 'Ruban poetry', 'Ольга Рубан стихи', 'Olga Ruban poems'],
  authors: [{ name: 'Ольга Рубан' }, { name: 'Olga Ruban' }],
  creator: 'Ольга Рубан',
  publisher: 'Ольга Рубан',
  openGraph: {
    title: 'Ольга Рубан | Olga Ruban - Поэтесса',
    description: 'Официальный сайт Ольги Рубан. Стихи, песни, истории на 7 языках. 400+ произведений.',
    type: 'website',
    locale: 'ru_RU',
    alternateLocale: ['en_US', 'de_DE'],
    siteName: 'Ольга Рубан | Olga Ruban',
    url: 'https://olgaruban.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ольга Рубан | Olga Ruban - Поэтесса',
    description: 'Официальный сайт Ольги Рубан. Стихи, песни, истории.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: 'https://olgaruban.com',
    languages: {
      'ru': 'https://olgaruban.com',
      'en': 'https://olgaruban.com',
      'de': 'https://olgaruban.com',
    },
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Inter:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Отключение правого клика
              document.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                return false;
              });

              // Отключение горячих клавиш для копирования
              document.addEventListener('keydown', function(e) {
                if (e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S' || e.key === 'p' || e.key === 'P' || e.key === 'a' || e.key === 'A')) {
                  e.preventDefault();
                  return false;
                }
                if (e.metaKey && (e.key === 'c' || e.key === 'C' || e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S' || e.key === 'p' || e.key === 'P' || e.key === 'a' || e.key === 'A')) {
                  e.preventDefault();
                  return false;
                }
              });

              // Отключение drag текста
              document.addEventListener('dragstart', function(e) {
                e.preventDefault();
                return false;
              });
            `,
          }}
        />
      </head>
      <body className="noise">
        <LanguageProvider>
          <AdminProvider>
            {children}
          </AdminProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
