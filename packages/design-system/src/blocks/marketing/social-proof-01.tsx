"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

export interface LogoItem {
  id: string
  name: string
  logo: React.ReactNode | string
  href?: string
}

export interface SocialProof01Props {
  title?: string
  logos: LogoItem[]
  variant?: "default" | "scrolling" | "grid"
  grayscale?: boolean
  className?: string
}

export function SocialProof01({
  title = "Trusted by leading companies",
  logos,
  variant = "default",
  grayscale = true,
  className,
}: SocialProof01Props) {
  const logoClassName = cn(
    "h-8 w-auto object-contain transition-all duration-200",
    grayscale && "opacity-60 grayscale hover:opacity-100 hover:grayscale-0"
  )

  if (variant === "scrolling") {
    return (
      <section className={cn("py-12 overflow-hidden", className)}>
        <div className="container px-4 md:px-6 mb-8">
          {title && (
            <p className="text-center text-sm font-medium text-muted-foreground">
              {title}
            </p>
          )}
        </div>
        <div className="relative">
          <div className="flex animate-scroll gap-12">
            {[...logos, ...logos].map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className="flex shrink-0 items-center justify-center px-4"
              >
                {item.href ? (
                  <a href={item.href} title={item.name}>
                    {typeof item.logo === "string" ? (
                      <img
                        src={item.logo}
                        alt={item.name}
                        className={logoClassName}
                      />
                    ) : (
                      <div className={logoClassName}>{item.logo}</div>
                    )}
                  </a>
                ) : typeof item.logo === "string" ? (
                  <img
                    src={item.logo}
                    alt={item.name}
                    className={logoClassName}
                  />
                ) : (
                  <div className={logoClassName}>{item.logo}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (variant === "grid") {
    return (
      <section className={cn("py-12", className)}>
        <div className="container px-4 md:px-6">
          {title && (
            <p className="text-center text-sm font-medium text-muted-foreground mb-8">
              {title}
            </p>
          )}
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-6">
            {logos.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-center p-4"
              >
                {item.href ? (
                  <a href={item.href} title={item.name}>
                    {typeof item.logo === "string" ? (
                      <img
                        src={item.logo}
                        alt={item.name}
                        className={logoClassName}
                      />
                    ) : (
                      <div className={logoClassName}>{item.logo}</div>
                    )}
                  </a>
                ) : typeof item.logo === "string" ? (
                  <img
                    src={item.logo}
                    alt={item.name}
                    className={logoClassName}
                  />
                ) : (
                  <div className={logoClassName}>{item.logo}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Default variant - horizontal row
  return (
    <section className={cn("py-12", className)}>
      <div className="container px-4 md:px-6">
        {title && (
          <p className="text-center text-sm font-medium text-muted-foreground mb-8">
            {title}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {logos.map((item) => (
            <div key={item.id} className="flex items-center justify-center">
              {item.href ? (
                <a href={item.href} title={item.name}>
                  {typeof item.logo === "string" ? (
                    <img
                      src={item.logo}
                      alt={item.name}
                      className={logoClassName}
                    />
                  ) : (
                    <div className={logoClassName}>{item.logo}</div>
                  )}
                </a>
              ) : typeof item.logo === "string" ? (
                <img
                  src={item.logo}
                  alt={item.name}
                  className={logoClassName}
                />
              ) : (
                <div className={logoClassName}>{item.logo}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
