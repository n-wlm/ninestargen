import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About | ninestar.app",
  description:
    "ninestar.app makes high-quality nine-pointed star images available to anyone — free, customizable, and instantly downloadable.",
};

export default function AboutPage() {
  return (
    <div className="relative flex-1 min-h-0 overflow-y-auto">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 120% at 0% 0%, #e0e7ff 0%, transparent 45%), radial-gradient(120% 120% at 100% 100%, #fde68a 0%, transparent 40%), linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f8fafc 100%)",
        }}
      />

      <div className="relative flex min-h-full items-start justify-center px-4 py-6 sm:items-center sm:py-10">
        <article className="w-full max-w-xl rounded-2xl border border-[#E5E7EB] bg-white/95 backdrop-blur-sm shadow-[0_30px_80px_rgba(15,23,42,0.16)] p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                ninestar.app
              </Link>
              <span className="text-gray-300">/</span>
              <span className="text-xs text-gray-700 font-medium">About</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Hey there!
          </h1>

          <p className="text-sm sm:text-[15px] text-gray-600 leading-relaxed mb-4">
            I created this little tool with a simple goal in mind: to help you
            generate nine-pointed stars for your projects, your communities, or
            wherever your creativity takes you. Whether you’re here for a
            specific design or just exploring shapes, I hope you find this
            generator useful.
          </p>

          <p className="text-sm sm:text-[15px] text-gray-600 leading-relaxed mb-4">
            This project is a work in progress, and I’m always looking to learn
            and improve. If you have any feedback, suggestions, or just want to
            share what you’ve created, please feel free to reach out to me at{" "}
            <a
              href="mailto:naim@woellmer.io"
              className="text-indigo-500 hover:text-indigo-600 transition-colors"
            >
              naim@woellmer.io
            </a>
          </p>
          <p className="text-sm sm:text-[15px] text-gray-600 leading-relaxed">
            With love,
          </p>
          <p className="text-sm sm:text-[15px] text-gray-600 leading-relaxed mb-10">
            Naim
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors shadow-sm"
          >
            Start Creating →
          </Link>
        </article>
      </div>
    </div>
  );
}
