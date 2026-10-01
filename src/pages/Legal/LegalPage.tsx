import { Link, NavLink } from 'react-router-dom';
import { Container } from '@/components/common/Container';
import { PageHero } from '@/components/common/PageHero';
import { SEO } from '@/components/common/SEO';
import { legalDocuments, type LegalDocKey } from '@/data/legal';
import { cn } from '@/lib/cn';
import { breadcrumbSchema } from '@/lib/schema';
import { slugify } from '@/lib/slug';

const paths: Record<LegalDocKey, string> = {
  privacy: '/privacy-policy',
  terms: '/terms',
  disclaimer: '/disclaimer',
};

export default function LegalPage({ doc }: { doc: LegalDocKey }) {
  const content = legalDocuments[doc];
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: content.title, path: paths[doc] },
  ];

  return (
    <>
      <SEO title={content.title} description={content.description} canonicalPath={paths[doc]} jsonLd={breadcrumbSchema(crumbs)} />
      <PageHero breadcrumbs={crumbs} eyebrow="Legal" title={content.title} description={`Last updated ${content.updated}`} />
      <Container className="py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-16">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <nav aria-label="Legal documents">
              <ul className="flex gap-1 overflow-x-auto scrollbar-none lg:flex-col">
                {(Object.keys(paths) as LegalDocKey[]).map((key) => (
                  <li key={key} className="shrink-0">
                    <NavLink
                      to={paths[key]}
                      className={({ isActive }) =>
                        cn(
                          'block rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
                          isActive ? 'bg-navy-950 text-white' : 'text-navy-600 hover:bg-navy-50 hover:text-navy-950',
                        )
                      }
                    >
                      {legalDocuments[key].title}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="On this page" className="mt-8 hidden lg:block">
              <p className="text-label text-navy-400">On this page</p>
              <ul className="mt-3 space-y-2 border-l border-line">
                {content.sections.map((s) => (
                  <li key={s.heading}>
                    <a href={`#${slugify(s.heading)}`} className="-ml-px block border-l border-transparent pl-3 text-sm text-navy-500 hover:border-navy-400 hover:text-navy-950">
                      {s.heading}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <article className="max-w-3xl">
            <p className="text-body text-lg text-navy-700">{content.intro}</p>
            {content.sections.map((section) => (
              <section key={section.heading} id={slugify(section.heading)} className="mt-10 scroll-mt-28">
                <h2 className="text-h3">{section.heading}</h2>
                {section.paragraphs.map((p) => (
                  <p key={p} className="text-body mt-3 text-navy-600">
                    {p}
                  </p>
                ))}
                {section.list && (
                  <ul className="mt-3 space-y-2">
                    {section.list.map((item) => (
                      <li key={item} className="text-body flex gap-3 text-navy-600">
                        <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-brand-600" aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
            <p className="text-body-sm mt-12 border-t border-line pt-6 text-navy-500">
              Questions about this page?{' '}
              <Link to="/contact" className="font-semibold text-brand-700 hover:text-navy-950">
                Contact us
              </Link>
              .
            </p>
          </article>
        </div>
      </Container>
    </>
  );
}
