import React from "react";
import { Input } from "@workspace/design-system/components/input";
import { Button } from "@workspace/design-system/components/button";
import { Card } from "@workspace/design-system/components/card";
import { Badge } from "@workspace/design-system/components/badge";
import { cn } from "@workspace/design-system/lib/utils";
import { Mail, Check } from "lucide-react";

export interface NewsletterProps {
  heading: string;
  description: string;
  badge?: string;
  placeholder?: string;
  buttonText?: string;
  onSubmit?: (email: string) => void | Promise<void>;
  variant?: "default" | "centered" | "inline";
  className?: string;
}

/**
 * Newsletter Signup
 * 
 * Conversion-optimized newsletter subscription component.
 * Multiple layout variants with design system integration.
 * 
 * Features:
 * - Email validation
 * - Loading states
 * - Success feedback
 * - Multiple variants
 * - Responsive design
 * - Accessible forms
 * 
 * @meta
 * - Category: Marketing
 * - Section: newsletter
 * - Use Cases: Email capture, Lead generation, Content marketing, Subscription forms
 */
export function NewsletterSignup({
  heading,
  description,
  badge,
  placeholder = "Enter your email",
  buttonText = "Subscribe",
  onSubmit,
  variant = "default",
  className,
}: NewsletterProps) {
  const [email, setEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isLoading) return;

    setIsLoading(true);
    try {
      await onSubmit?.(email);
      setIsSuccess(true);
      setEmail("");
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      console.error("Newsletter signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-4 rounded-lg bg-muted p-4", className)}>
        <Mail className="h-5 w-5 text-primary" />
        <form onSubmit={handleSubmit} className="flex flex-1 gap-2">
          <Input
            type="email"
            placeholder={placeholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || isSuccess}>
            {isSuccess ? <Check className="h-4 w-4" /> : buttonText}
          </Button>
        </form>
      </div>
    );
  }

  if (variant === "centered") {
    return (
      <Card className={cn("mx-auto max-w-md p-8 text-center", className)}>
        {badge && (
          <Badge className="mb-4 bg-primary">{badge}</Badge>
        )}
        <h3 className="mb-2 text-2xl font-bold">{heading}</h3>
        <p className="mb-6 text-sm text-muted-foreground">{description}</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="email"
            placeholder={placeholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
          <Button type="submit" className="w-full" disabled={isLoading || isSuccess}>
            {isSuccess ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Subscribed!
              </>
            ) : (
              buttonText
            )}
          </Button>
        </form>
      </Card>
    );
  }

  // Default variant
  return (
    <div className={cn("w-full", className)}>
      <div className="mb-6">
        {badge && (
          <Badge className="mb-3 bg-primary">{badge}</Badge>
        )}
        <h3 className="mb-2 text-2xl font-bold md:text-3xl">{heading}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <Input
          type="email"
          placeholder={placeholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || isSuccess}>
          {isSuccess ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Done
            </>
          ) : (
            buttonText
          )}
        </Button>
      </form>
    </div>
  );
}
