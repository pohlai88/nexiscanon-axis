import React from "react";
import { Card } from "@workspace/design-system/components/card";
import { Badge } from "@workspace/design-system/components/badge";
import { Button } from "@workspace/design-system/components/button";
import { cn } from "@workspace/design-system/lib/utils";
import { ArrowRight, ExternalLink } from "lucide-react";

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  date: string;
  author: {
    name: string;
    avatar?: string;
  };
  readTime: string;
  href: string;
}

export interface BlogGridProps {
  posts: BlogPost[];
  featured?: string; // id of featured post
  columns?: 2 | 3;
  className?: string;
}

/**
 * Blog Grid
 * 
 * Modern blog post grid with featured post support.
 * Optimized for content discovery and engagement.
 * 
 * Features:
 * - Featured post (larger card)
 * - Category badges
 * - Author info
 * - Read time
 * - Hover animations
 * - Responsive grid
 * 
 * @meta
 * - Category: Content
 * - Section: blog
 * - Use Cases: Blog listings, News sections, Article showcases, Content hubs
 */
export function BlogGrid({ posts, featured, columns = 3, className }: BlogGridProps) {
  const featuredPost = posts.find((p) => p.id === featured);
  const regularPosts = posts.filter((p) => p.id !== featured);
  const colsClass = columns === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={cn("space-y-8", className)}>
      {/* Featured Post */}
      {featuredPost && <FeaturedBlogCard post={featuredPost} />}

      {/* Regular Posts Grid */}
      <div className={cn("grid gap-6", colsClass)}>
        {regularPosts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}

function FeaturedBlogCard({ post }: { post: BlogPost }) {
  return (
    <Card className="group overflow-hidden transition-all hover:shadow-xl">
      <div className="grid md:grid-cols-2">
        {/* Image */}
        <div className="relative h-64 overflow-hidden md:h-auto">
          <img
            src={post.image}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <Badge className="absolute left-4 top-4 bg-primary">{post.category}</Badge>
        </div>

        {/* Content */}
        <div className="flex flex-col justify-between p-8">
          <div>
            <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
              <time>{post.date}</time>
              <span>•</span>
              <span>{post.readTime}</span>
            </div>

            <h2 className="mb-4 text-2xl font-bold tracking-tight transition-colors group-hover:text-primary">
              {post.title}
            </h2>

            <p className="mb-6 text-muted-foreground">{post.excerpt}</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {post.author.avatar && (
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              )}
              <span className="text-sm font-medium">{post.author.name}</span>
            </div>

            <Button asChild>
              <a href={post.href}>
                Read More
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Card className="group flex flex-col overflow-hidden transition-all hover:shadow-lg">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <Badge className="absolute left-4 top-4 bg-primary/90 backdrop-blur-sm">
          {post.category}
        </Badge>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
          <time>{post.date}</time>
          <span>•</span>
          <span>{post.readTime}</span>
        </div>

        <h3 className="mb-3 text-lg font-semibold tracking-tight transition-colors group-hover:text-primary">
          {post.title}
        </h3>

        <p className="mb-4 line-clamp-2 flex-1 text-sm text-muted-foreground">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-2">
            {post.author.avatar && (
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="h-6 w-6 rounded-full object-cover"
              />
            )}
            <span className="text-xs font-medium">{post.author.name}</span>
          </div>

          <a
            href={post.href}
            className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
          >
            Read
            <ArrowRight className="h-3 w-3" />
          </a>
        </div>
      </div>
    </Card>
  );
}
