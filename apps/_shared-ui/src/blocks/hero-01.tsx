import Link from "next/link";
import { Button } from "@workspace/design-system";

export interface HeroProps {
  badge?: string;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
  children?: React.ReactNode;
}

export function Hero01({
  badge,
  title,
  description,
  primaryAction,
  secondaryAction,
  children,
}: HeroProps) {
  return (
    <section className="container flex flex-col items-center gap-8 pb-8 pt-12 md:pt-24 lg:pt-32">
      {badge && (
        <div className="inline-flex items-center rounded-full border bg-muted px-4 py-1.5 text-sm font-medium">
          {badge}
        </div>
      )}

      <div className="flex max-w-3xl flex-col items-center gap-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          {title}
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
          {description}
        </p>
      </div>

      {(primaryAction || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-4">
          {primaryAction && (
            <Button size="lg" asChild>
              <Link href={primaryAction.href}>{primaryAction.label}</Link>
            </Button>
          )}
          {secondaryAction && (
            <Button size="lg" variant="outline" asChild>
              <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
            </Button>
          )}
        </div>
      )}

      {children}
    </section>
  );
}

export { Hero01 as Hero };
