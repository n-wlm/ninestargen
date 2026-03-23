import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://ninestargen.com', lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: 'https://ninestargen.com/gallery', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: 'https://ninestargen.com/about', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ];
}
