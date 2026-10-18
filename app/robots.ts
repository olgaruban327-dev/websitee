import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/data/'],
    },
    sitemap: 'https://olgaruban.com/sitemap.xml',
  }
}
