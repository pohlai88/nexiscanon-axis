import React from "react";
import { Facebook, Twitter, Instagram, Linkedin, Github } from "lucide-react";

export interface FooterLink {
  label: string;
  href: string;
}

export interface SocialLink {
  platform: "facebook" | "twitter" | "instagram" | "linkedin" | "github";
  href: string;
}

export interface FooterComponent01Props {
  logo: {
    src?: string;
    text: string;
    href: string;
  };
  navigation?: FooterLink[];
  social?: SocialLink[];
  copyright?: string;
}

const socialIcons = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  github: Github,
};

/**
 * Footer Component 01
 * 
 * Simple three-section footer with logo and brand name, centered navigation
 * links, social media icons, separator line, and copyright text.
 * 
 * @meta
 * - Category: marketing-ui
 * - Section: footer-component
 * - Use Cases: Minimal website footers, Personal portfolios, Landing pages
 */
export function FooterComponent01({
  logo,
  navigation = [],
  social = [],
  copyright,
}: FooterComponent01Props) {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Logo Section */}
        <div className="mb-8 flex justify-center">
          <a href={logo.href} className="flex items-center gap-2">
            {logo.src && (
              <img
                src={logo.src}
                alt={logo.text}
                className="h-8 w-8 rounded-md"
              />
            )}
            <span className="text-lg font-semibold">{logo.text}</span>
          </a>
        </div>

        {/* Navigation Links */}
        {navigation.length > 0 && (
          <nav className="mb-8 flex flex-wrap justify-center gap-6">
            {navigation.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}

        {/* Social Media Icons */}
        {social.length > 0 && (
          <div className="mb-8 flex justify-center gap-4">
            {social.map((link) => {
              const Icon = socialIcons[link.platform];
              return (
                <a
                  key={link.platform}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={link.platform}
                >
                  <Icon className="h-5 w-5" />
                </a>
              );
            })}
          </div>
        )}

        {/* Separator */}
        <div className="mb-6 border-t" />

        {/* Copyright */}
        <div className="text-center text-sm text-muted-foreground">
          {copyright || (
            <>
              © {new Date().getFullYear()} {logo.text}. Made with{" "}
              <span className="text-red-500">♥</span>
            </>
          )}
        </div>
      </div>
    </footer>
  );
}
