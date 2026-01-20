import React from "react";
import { Card } from "@workspace/design-system/components/card";
import { Badge } from "@workspace/design-system/components/badge";
import { Button } from "@workspace/design-system/components/button";
import { cn } from "@workspace/design-system/lib/utils";
import { ExternalLink, Github } from "lucide-react";

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  tags: string[];
  link?: string;
  github?: string;
}

export interface PortfolioGridProps {
  projects: PortfolioProject[];
  columns?: 2 | 3;
  className?: string;
}

/**
 * Portfolio Grid
 * 
 * Showcase projects and work samples with elegant cards.
 * Perfect for developers, designers, and agencies.
 * 
 * Features:
 * - Image hover effects
 * - Category badges
 * - Tag system
 * - External links
 * - GitHub integration
 * - Responsive masonry
 * 
 * @meta
 * - Category: Portfolio
 * - Section: projects
 * - Use Cases: Developer portfolios, Agency showcases, Case studies, Project galleries
 */
export function PortfolioGrid({ projects, columns = 3, className }: PortfolioGridProps) {
  const colsClass = columns === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={cn("grid gap-6", colsClass, className)}>
      {projects.map((project) => (
        <PortfolioCard key={project.id} project={project} />
      ))}
    </div>
  );
}

function PortfolioCard({ project }: { project: PortfolioProject }) {
  return (
    <Card className="group flex flex-col overflow-hidden transition-all hover:shadow-xl">
      {/* Image */}
      <div className="relative h-64 overflow-hidden bg-muted">
        <img
          src={project.image}
          alt={project.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Overlay on Hover */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-background/90 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {project.link && (
            <Button size="sm" asChild>
              <a href={project.link} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                View Project
              </a>
            </Button>
          )}
          {project.github && (
            <Button size="sm" variant="outline" asChild>
              <a href={project.github} target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-4 w-4" />
                Code
              </a>
            </Button>
          )}
        </div>

        {/* Category Badge */}
        <Badge className="absolute left-4 top-4 bg-primary">{project.category}</Badge>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="mb-2 text-xl font-semibold tracking-tight transition-colors group-hover:text-primary">
          {project.title}
        </h3>

        <p className="mb-4 flex-1 text-sm text-muted-foreground">
          {project.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  );
}
