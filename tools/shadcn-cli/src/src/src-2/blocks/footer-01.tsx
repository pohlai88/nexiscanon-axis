import Link from 'next/link';

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface FooterProps {
  columns?: FooterColumn[];
  copyright?: string;
  socials?: React.ReactNode;
}

export function Footer01({
  columns = [],
  copyright = `© ${new Date().getFullYear()} NexusCanon. All rights reserved.`,
  socials,
}: FooterProps) {
  return (
    <footer className="bg-background border-t">
      <div className="container py-12 md:py-16">
        {columns.length > 0 && (
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="mb-4 text-sm font-semibold">{column.title}</h3>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        target={link.external ? '_blank' : undefined}
                        rel={link.external ? 'noopener noreferrer' : undefined}
                        className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row">
          <p className="text-muted-foreground text-center text-sm md:text-left">
            {copyright}
          </p>
          {socials && <div className="flex items-center gap-4">{socials}</div>}
        </div>
      </div>
    </footer>
  );
}

export function FooterSimple() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <p className="text-muted-foreground text-center text-sm leading-loose md:text-left">
          Built with{' '}
          <a
            href="https://nextjs.org"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            Next.js
          </a>{' '}
          and{' '}
          <a
            href="https://ui.shadcn.com"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            shadcn/ui
          </a>
          .
        </p>
      </div>
    </footer>
  );
}

export { Footer01 as Footer };
