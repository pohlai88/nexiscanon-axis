"use client"

import * as React from "react"
import { Quote, Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/avatar"
import { Card, CardContent } from "@/components/card"
import { cn } from "@/lib/utils"

export interface Testimonial {
  id: string
  content: string
  author: {
    name: string
    title?: string
    company?: string
    avatarUrl?: string
    initials?: string
  }
  rating?: number
}

export interface Testimonials01Props {
  title?: string
  description?: string
  testimonials: Testimonial[]
  columns?: 1 | 2 | 3
  showRating?: boolean
  variant?: "cards" | "quotes" | "minimal"
  className?: string
}

const columnClasses = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-2 lg:grid-cols-3",
}

export function Testimonials01({
  title,
  description,
  testimonials,
  columns = 3,
  showRating = true,
  variant = "cards",
  className,
}: Testimonials01Props) {
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-4 w-4",
              i < rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-muted text-muted"
            )}
          />
        ))}
      </div>
    )
  }

  return (
    <section className={cn("py-20", className)}>
      <div className="container px-4 md:px-6">
        {(title || description) && (
          <div className="flex flex-col items-center text-center space-y-4 mb-12">
            {title && (
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-lg text-muted-foreground max-w-2xl">
                {description}
              </p>
            )}
          </div>
        )}

        <div className={cn("grid gap-6", columnClasses[columns])}>
          {testimonials.map((testimonial) => {
            if (variant === "quotes") {
              return (
                <div key={testimonial.id} className="relative p-6">
                  <Quote className="absolute top-0 left-0 h-8 w-8 text-primary/20" />
                  <blockquote className="pl-10 pt-4">
                    <p className="text-lg italic text-muted-foreground mb-4">
                      "{testimonial.content}"
                    </p>
                    {showRating && testimonial.rating && (
                      <div className="mb-3">{renderStars(testimonial.rating)}</div>
                    )}
                    <footer className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={testimonial.author.avatarUrl}
                          alt={testimonial.author.name}
                        />
                        <AvatarFallback>
                          {testimonial.author.initials ||
                            testimonial.author.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <cite className="not-italic font-semibold">
                          {testimonial.author.name}
                        </cite>
                        {(testimonial.author.title ||
                          testimonial.author.company) && (
                          <p className="text-sm text-muted-foreground">
                            {testimonial.author.title}
                            {testimonial.author.title &&
                              testimonial.author.company &&
                              ", "}
                            {testimonial.author.company}
                          </p>
                        )}
                      </div>
                    </footer>
                  </blockquote>
                </div>
              )
            }

            if (variant === "minimal") {
              return (
                <div
                  key={testimonial.id}
                  className="flex flex-col items-center text-center p-6"
                >
                  <Avatar className="h-16 w-16 mb-4">
                    <AvatarImage
                      src={testimonial.author.avatarUrl}
                      alt={testimonial.author.name}
                    />
                    <AvatarFallback>
                      {testimonial.author.initials ||
                        testimonial.author.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {showRating && testimonial.rating && (
                    <div className="mb-3">{renderStars(testimonial.rating)}</div>
                  )}
                  <p className="text-muted-foreground mb-4">
                    "{testimonial.content}"
                  </p>
                  <p className="font-semibold">{testimonial.author.name}</p>
                  {(testimonial.author.title || testimonial.author.company) && (
                    <p className="text-sm text-muted-foreground">
                      {testimonial.author.title}
                      {testimonial.author.title &&
                        testimonial.author.company &&
                        " at "}
                      {testimonial.author.company}
                    </p>
                  )}
                </div>
              )
            }

            // Cards variant (default)
            return (
              <Card key={testimonial.id}>
                <CardContent className="p-6">
                  {showRating && testimonial.rating && (
                    <div className="mb-3">{renderStars(testimonial.rating)}</div>
                  )}
                  <p className="text-muted-foreground mb-4">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={testimonial.author.avatarUrl}
                        alt={testimonial.author.name}
                      />
                      <AvatarFallback>
                        {testimonial.author.initials ||
                          testimonial.author.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{testimonial.author.name}</p>
                      {(testimonial.author.title ||
                        testimonial.author.company) && (
                        <p className="text-sm text-muted-foreground">
                          {testimonial.author.title}
                          {testimonial.author.title &&
                            testimonial.author.company &&
                            ", "}
                          {testimonial.author.company}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
