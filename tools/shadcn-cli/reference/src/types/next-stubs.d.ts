// Type stubs for optional Next.js peer dependency
declare module "next/link" {
  import type { ComponentPropsWithoutRef, ReactNode } from "react";

  export interface LinkProps extends Omit<ComponentPropsWithoutRef<"a">, "href"> {
    href: string;
    as?: string;
    replace?: boolean;
    scroll?: boolean;
    shallow?: boolean;
    prefetch?: boolean;
    locale?: string | false;
    children?: ReactNode;
  }

  export default function Link(props: LinkProps): JSX.Element;
}

declare module "next/navigation" {
  export function usePathname(): string;
  export function useRouter(): {
    push: (href: string) => void;
    replace: (href: string) => void;
    refresh: () => void;
    back: () => void;
    forward: () => void;
    prefetch: (href: string) => void;
  };
  export function useSearchParams(): URLSearchParams;
}
