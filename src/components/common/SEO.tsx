import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { site } from '@/config/site';

interface SEOProps {
  /** Page-specific title; the brand suffix is added automatically. */
  title?: string;
  description?: string;
  /** Path for the canonical URL. Defaults to the current path without query. */
  canonicalPath?: string;
  image?: string;
  type?: 'website' | 'profile' | 'article';
  noindex?: boolean;
  /** One or more schema.org objects rendered as JSON-LD. */
  jsonLd?: object | object[];
}

export function SEO({ title, description, canonicalPath, image, type = 'website', noindex, jsonLd }: SEOProps) {
  const { pathname } = useLocation();
  const fullTitle = title ? `${title} | ${site.name}` : `${site.name} | Discover Businesses Across Tamil Nadu`;
  const metaDescription = description ?? site.defaultMetaDescription;
  const canonical = `${site.url}${canonicalPath ?? pathname}`;
  const ogImage = image ?? site.ogImage;
  const schemas = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex, follow" />}

      <meta property="og:site_name" content={site.name} />
      <meta property="og:locale" content={site.locale} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={canonical} />
      {ogImage && <meta property="og:image" content={ogImage} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />

      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}
