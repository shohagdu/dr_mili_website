interface Crumb {
  name: string;
  url: string;
}

export function BreadcrumbSchema({ items }: { items: Crumb[] }) {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://drtapan.com';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
