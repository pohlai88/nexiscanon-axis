"use client"

import * as React from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/accordion"
import { cn } from "@/lib/utils"

export interface FAQItem {
  id: string
  question: string
  answer: string | React.ReactNode
}

export interface FAQ01Props {
  title?: string
  description?: string
  items: FAQItem[]
  defaultValue?: string[]
  columns?: 1 | 2
  className?: string
}

export function FAQ01({
  title = "Frequently Asked Questions",
  description,
  items,
  defaultValue,
  columns = 1,
  className,
}: FAQ01Props) {
  if (columns === 2) {
    const midpoint = Math.ceil(items.length / 2)
    const leftItems = items.slice(0, midpoint)
    const rightItems = items.slice(midpoint)

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

          <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
            <Accordion defaultValue={defaultValue} className="space-y-4">
              {leftItems.map((item) => (
                <AccordionItem
                  key={item.id}
                  value={item.id}
                  className="border rounded-lg px-4"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-4">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <Accordion defaultValue={defaultValue} className="space-y-4">
              {rightItems.map((item) => (
                <AccordionItem
                  key={item.id}
                  value={item.id}
                  className="border rounded-lg px-4"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-4">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
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

        <Accordion
          defaultValue={defaultValue}
          className="max-w-3xl mx-auto space-y-4"
        >
          {items.map((item) => (
            <AccordionItem
              key={item.id}
              value={item.id}
              className="border rounded-lg px-4"
            >
              <AccordionTrigger className="text-left hover:no-underline py-4">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
