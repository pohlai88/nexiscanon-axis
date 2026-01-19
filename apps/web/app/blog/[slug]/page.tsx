import { notFound } from "next/navigation";
import Link from "next/link";

// Example: in real apps, fetch from CMS/DB. For demo, static map.
const POSTS: Record<string, { title: string; content: string }> = {
  hello: { title: "Hello", content: "First post." },
  world: { title: "World", content: "Second post." },
};

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = POSTS[slug];

  if (!post) notFound();

  return (
    <article style={{ maxWidth: "60ch", margin: "0 auto", padding: "1rem" }}>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <Link href="/">← Home</Link>
    </article>
  );
}
