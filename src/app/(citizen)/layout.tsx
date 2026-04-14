// Citizen route group layout
// Auth protection is handled by proxy.ts (Clerk middleware)
// This layout provides the mobile shell common to all citizen pages

export default function CitizenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white">
      {children}
    </div>
  )
}
