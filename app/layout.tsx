import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { TooltipProvider } from '@/components/ui/tooltip';
import Link from 'next/link';
import LogoStar from '@/components/LogoStar';

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
  authors: [{ name: 'NineStarGen' }],
  openGraph: {
    title: 'Nine-Pointed Star Generator',
    description: 'Create beautiful nine-pointed star images. Free, customizable, downloadable as SVG, PNG, or JPG.',
    type: 'website',
    siteName: 'NineStarGen',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nine-Pointed Star Generator',
    description: 'Create beautiful nine-pointed star images. Free, customizable, downloadable.',
  },
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} h-full`}>
      <body className="font-sans antialiased bg-[#F7F8FA] text-[#111827] flex flex-col h-full">
        <TooltipProvider>
          {/* Nav */}
          <header className="h-11 flex items-center px-5 border-b border-[#EAECF0] bg-white shrink-0">
            <Link href="/" className="flex items-center gap-2 text-[#111827] hover:text-[#5E6AD2] transition-colors">
              <LogoStar />
              <span className="text-[13px] font-semibold tracking-tight">NineStarGen</span>
            </Link>

            <nav className="flex items-center ml-5">
              <Link
                href="/gallery"
                className="px-2.5 py-1 text-[12px] text-[#6B7280] hover:text-[#111827] transition-colors font-medium rounded-md hover:bg-[#F3F4F6]"
              >
                Gallery
              </Link>
              <Link
                href="/about"
                className="px-2.5 py-1 text-[12px] text-[#6B7280] hover:text-[#111827] transition-colors font-medium rounded-md hover:bg-[#F3F4F6]"
              >
                About
              </Link>
            </nav>

            <div className="ml-auto hidden sm:block">
              <span className="text-[11px] text-[#9CA3AF]">Free nine-pointed star creator</span>
            </div>
          </header>

          <main className="flex-1 flex flex-col min-h-0">
            {children}
          </main>
        </TooltipProvider>
      </body>
    </html>
  );
}
