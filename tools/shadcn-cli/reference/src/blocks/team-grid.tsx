import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/design-system/components/avatar';
import { Badge } from '@workspace/design-system/components/badge';
import { Card } from '@workspace/design-system/components/card';
import { cn } from '@workspace/design-system/lib/utils';
import { Linkedin, Twitter, Github, Mail } from 'lucide-react';
import React from 'react';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio?: string;
  avatar: string;
  social?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    email?: string;
  };
  featured?: boolean;
}

export interface TeamGridProps {
  members: TeamMember[];
  columns?: 2 | 3 | 4;
  className?: string;
}

/**
 * Team Grid
 *
 * Professional team member showcase with social links.
 * Optimized for company pages and about sections.
 *
 * Features:
 * - Avatar support
 * - Social media links
 * - Featured members
 * - Bio descriptions
 * - Hover animations
 * - Responsive grid
 *
 * @meta
 * - Category: About
 * - Section: team
 * - Use Cases: Team pages, About us sections, Company profiles, Staff directories
 */
export function TeamGrid({ members, columns = 4, className }: TeamGridProps) {
  const colsClass = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-6', colsClass[columns], className)}>
      {members.map((member) => (
        <TeamMemberCard key={member.id} member={member} />
      ))}
    </div>
  );
}

function TeamMemberCard({ member }: { member: TeamMember }) {
  const socialLinks = [
    { icon: Linkedin, url: member.social?.linkedin, label: 'LinkedIn' },
    { icon: Twitter, url: member.social?.twitter, label: 'Twitter' },
    { icon: Github, url: member.social?.github, label: 'GitHub' },
    {
      icon: Mail,
      url: member.social?.email ? `mailto:${member.social.email}` : undefined,
      label: 'Email',
    },
  ].filter((link) => link.url);

  return (
    <Card
      className={cn(
        'group relative flex flex-col items-center overflow-hidden p-6 text-center transition-all hover:shadow-lg',
        member.featured && 'border-primary ring-primary/20 ring-2',
      )}
    >
      {/* Featured Badge */}
      {member.featured && (
        <Badge className="bg-primary absolute top-4 right-4">Featured</Badge>
      )}

      {/* Avatar */}
      <div className="relative mb-4">
        <Avatar className="h-24 w-24 transition-transform group-hover:scale-110">
          <AvatarImage src={member.avatar} alt={member.name} />
          <AvatarFallback className="text-lg">
            {member.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </AvatarFallback>
        </Avatar>

        {/* Status Indicator */}
        <div className="border-background absolute right-1 bottom-1 h-4 w-4 rounded-full border-2 bg-green-500" />
      </div>

      {/* Name & Role */}
      <h3 className="mb-1 text-lg font-semibold">{member.name}</h3>
      <p className="text-muted-foreground mb-3 text-sm">{member.role}</p>

      {/* Bio */}
      {member.bio && (
        <p className="text-muted-foreground mb-4 line-clamp-2 text-xs">
          {member.bio}
        </p>
      )}

      {/* Social Links */}
      {socialLinks.length > 0 && (
        <div className="flex gap-2">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full transition-colors"
              aria-label={link.label}
            >
              <link.icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      )}

      {/* Hover Effect */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="from-primary/5 absolute inset-0 bg-gradient-to-br to-transparent" />
      </div>
    </Card>
  );
}
