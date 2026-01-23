import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@workspace/design-system/components/accordion';
import React from 'react';

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqComponent01Props {
  heading: string;
  description?: string;
  items: FaqItem[];
}

/**
 * FAQ Component 01
 *
 * Simple accordion-style FAQ section with collapsible questions and answers
 * using shadcn/ui accordion component, featuring a clean header and
 * single-column layout for basic Q&A display.
 *
 * @meta
 * - Category: marketing-ui
 * - Section: faq-component
 * - Use Cases: Basic FAQ pages, Help sections, Product documentation
 */
export function FaqComponent01({
  heading,
  description,
  items,
}: FaqComponent01Props) {
  return (
    <section className="bg-background w-full py-16 md:py-24">
      <div className="container mx-auto max-w-3xl px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            {heading}
          </h2>
          {description && (
            <p className="text-muted-foreground text-lg">{description}</p>
          )}
        </div>

        {/* FAQ Accordion */}
        <Accordion type="single" collapsible className="w-full space-y-4">
          {items.map((item, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-card rounded-lg border px-6"
            >
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-medium">{item.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
