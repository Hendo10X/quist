import Link from "next/link"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-6 py-12">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="text-center font-mono text-xs tracking-widest text-muted-foreground uppercase"
        >
          Quist
        </Link>
        {children}
      </div>
    </main>
  )
}
