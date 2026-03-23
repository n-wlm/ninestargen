import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "About the Nine-Pointed Star | Bahá'í Symbol | NineStarGen",
  description:
    "Learn about the nine-pointed star, its meaning in the Bahá'í Faith, its geometric variants (enneagram, triple triangle), and how to create your own nine-pointed star images.",
};

export default function AboutPage() {
  return (
    <article className="flex flex-col flex-1 px-4 py-10 max-w-2xl mx-auto w-full">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Generator</Link>
        <span className="text-gray-300">/</span>
        <span className="text-xs text-gray-700 font-medium">About</span>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">The Nine-Pointed Star</h1>
      <p className="text-sm text-gray-500 mb-8">A guide to one of the world's most beautiful geometric symbols</p>

      <section className="prose prose-sm prose-gray max-w-none">
        <h2>What is the Nine-Pointed Star?</h2>
        <p>
          The nine-pointed star, also called an <strong>enneagram</strong> or <strong>nonagram</strong>, is a star polygon
          with nine points. It holds special significance in the <strong>Bahá'í Faith</strong>, where it serves as an
          emblem representing the number nine — a number associated with perfection, unity, and the completion of a cycle.
        </p>
        <p>
          In the Bahá'í tradition, the word "Bahá" (بهاء) has a numerical value of nine in the Abjad system, which is
          one reason the nine-pointed star has become closely associated with the Faith.
        </p>

        <h2>Geometric Variants</h2>
        <p>
          The nine-pointed star can be drawn in many different ways, each with its own visual character:
        </p>
        <ul>
          <li>
            <strong>{'{9/2}'} Enneagram</strong> — Connect every 2nd point of 9 equally spaced vertices on a circle.
            This creates a sharp, interlaced nine-pointed star traced in a single continuous line.
          </li>
          <li>
            <strong>{'{9/4}'} Enneagram</strong> — Connect every 4th point. This produces a wider, more spread-out star
            with shallower points, also traced in one continuous line.
          </li>
          <li>
            <strong>Triple Triangle {'{9/3}'}</strong> — Three overlapping equilateral triangles, each rotated by 40°.
            This is the most commonly used Bahá'í nine-pointed star. The overlap creates a nine-pointed form with
            3-fold symmetry.
          </li>
          <li>
            <strong>Spike Star</strong> — Nine isosceles triangles radiating from a central point, the most intuitive
            and traditional star shape.
          </li>
          <li>
            <strong>Petal Rose</strong> — Nine Bézier-curved petals, giving an organic, flower-like appearance.
          </li>
        </ul>
        <p>
          Beyond these, there are many more artistic variations: spiral stars, fractal stars, Celtic interlace patterns,
          compound stars with inner polygons, and more — all based on the nine-fold geometry.
        </p>

        <h2>Nine-Pointed Star in the Bahá'í Faith</h2>
        <p>
          The Bahá'í Faith was founded in the 19th century by Bahá'u'lláh. The nine-pointed star is widely used as a
          symbol of the Faith, though the official symbol is the five-pointed star (<em>haykal</em>). The nine-pointed
          star appears frequently in Bahá'í art, architecture (including the nine-sided Bahá'í Houses of Worship), and
          personal jewelry and decorations.
        </p>
        <p>
          The number nine in the Bahá'í tradition represents completeness — it is the highest single digit, suggesting
          the fullness of creation and the unity of all humanity.
        </p>

        <h2>Mathematical Properties</h2>
        <p>
          A nine-pointed star is characterized by its <em>Schläfli symbol</em> {'{'}<em>n/k</em>{'}'}, where <em>n</em> = 9
          and <em>k</em> is the step between connected vertices. Because 9 = 3 × 3, when k = 3 the result is not a
          single connected star but three separate triangles — giving the triple-triangle variant its distinctive quality.
        </p>
        <p>
          All nine-pointed stars have 9-fold rotational symmetry (dihedral group D₉) — they look the same when rotated
          by any multiple of 40°.
        </p>

        <h2>About This Generator</h2>
        <p>
          NineStarGen is a free, browser-based tool for creating and downloading nine-pointed star images. You can
          choose from 18+ geometric bases, customize colors (including gradients), adjust size and proportions, add
          effects like glow and shadow, and download your star as SVG, PNG, or JPG at any resolution.
        </p>
        <p>
          Every design is shareable via a unique URL — just click <strong>Share</strong> in the generator to copy a
          link with your exact settings encoded.
        </p>
      </section>

      <div className="mt-10 pt-8 border-t border-gray-100">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors shadow-sm"
        >
          Open Generator →
        </Link>
      </div>
    </article>
  );
}
