import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { TooltipProvider } from '@/components/ui/tooltip';
import AppHeader from '@/components/AppHeader';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono', weight: ['400', '500'] });

export const metadata: Metadata = {
  title: "Nine-Pointed Star Generator | Free Bahá'í Star Creator",
  description:
    "Create and download custom nine-pointed star images for free. Customize colors, shapes, gradients, and more. Download as SVG, PNG, or JPG. Perfect for Bahá'í symbols, spiritual art, and geometric design.",
  keywords: [
    'bahai star', 'nine pointed star', 'nine-pointed star generator',
    '9 pointed star', 'bahai symbol', 'enneagram star', 'nine star generator',
    'bahai star creator', 'nine pointed star image', 'free star generator',
  ],
  authors: [{ name: 'ninestar.app' }],
  openGraph: {
    title: 'Nine-Pointed Star Generator',
    description: 'Create beautiful nine-pointed star images. Free, customizable, downloadable as SVG, PNG, or JPG.',
    type: 'website',
    siteName: 'ninestar.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nine-Pointed Star Generator',
    description: 'Create beautiful nine-pointed star images. Free, customizable, downloadable.',
  },
  robots: { index: true, follow: true },
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-96x96.png', type: 'image/png', sizes: '96x96' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: ['/favicon.ico'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} h-full`}>
      <body className="font-sans antialiased bg-[#F7F8FA] text-[#111827] flex flex-col h-full">
        <TooltipProvider>
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-1.5 text-center shrink-0">
            <p className="text-[11px] text-amber-700 font-medium">This app is currently under development — expect changes and rough edges.</p>
          </div>
          <AppHeader />
          <main className="flex-1 flex flex-col min-h-0">
            {children}
          </main>
        </TooltipProvider>
      </body>
    </html>
  );
}
