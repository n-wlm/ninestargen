import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "About | ninestar.app",
  description: "ninestar.app makes high-quality nine-pointed star images available to anyone — free, customizable, and instantly downloadable.",
};

export default function AboutPage() {
  return (
    <article className="flex flex-col flex-1 px-4 py-10 max-w-lg mx-auto w-full">
      <div className="flex items-center gap-2 mb-8">
        <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Generator</Link>
        <span className="text-gray-300">/</span>
        <span className="text-xs text-gray-700 font-medium">About</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-4">ninestar.app</h1>

      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Our mission is to make high-quality nine-pointed star images available to anyone — free, customizable, and instantly downloadable as SVG, PNG, or JPG.
      </p>

      <p className="text-sm text-gray-600 leading-relaxed mb-10">
        Questions or feedback?{' '}
        <a href="mailto:naim@woellmer.io" className="text-indigo-500 hover:text-indigo-600 transition-colors">
          naim@woellmer.io
        </a>
      </p>

      <Link
        href="/"
        className="self-start inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors shadow-sm"
      >
        Open Generator →
      </Link>
    </article>
  );
}
