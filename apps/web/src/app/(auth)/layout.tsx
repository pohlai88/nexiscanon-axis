export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--muted)]">
      <div className="w-full max-w-md p-8 bg-[var(--background)] rounded-xl shadow-lg">
        {children}
      </div>
    </div>
  );
}
