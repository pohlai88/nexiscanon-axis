// Type stub for optional react-router-dom peer dependency
declare module "react-router-dom" {
  import type { ComponentPropsWithoutRef, ReactNode } from "react";

  export interface LinkProps extends Omit<ComponentPropsWithoutRef<"a">, "href"> {
    to: string;
    replace?: boolean;
    state?: unknown;
    children?: ReactNode;
  }

  export function Link(props: LinkProps): JSX.Element;
  export function useNavigate(): (to: string, options?: { replace?: boolean; state?: unknown }) => void;
  export function useLocation(): { pathname: string; search: string; hash: string; state: unknown };
  export function useParams<T = Record<string, string>>(): T;
}
