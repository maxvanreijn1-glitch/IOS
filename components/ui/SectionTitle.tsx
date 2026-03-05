export default function SectionTitle({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <h1 className="text-4xl font-extrabold text-pink-600 tracking-tight mb-6">
      {children}
    </h1>
  )
}