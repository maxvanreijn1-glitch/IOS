export default function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-white to-pink-50 flex justify-center px-6 py-16">
      <div className="w-full max-w-6xl">{children}</div>
    </div>
  )
}