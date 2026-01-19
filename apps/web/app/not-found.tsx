import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "50vh",
        gap: "1rem",
      }}
    >
      <h2>Not Found</h2>
      <p>Could not find the requested resource.</p>
      <Link href="/">Return Home</Link>
    </div>
  );
}
