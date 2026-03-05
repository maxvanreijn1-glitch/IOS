type Props = {
  children: React.ReactNode
  variant?: "primary" | "secondary"
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>

export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: Props) {
  const base =
    "px-6 py-3 rounded-xl font-semibold transition duration-200 focus:outline-none"

  const styles =
    variant === "primary"
      ? "bg-pink-600 text-white hover:bg-pink-700 shadow-lg shadow-pink-400/40 hover:shadow-pink-500/50"
      : "bg-white border border-pink-200 text-pink-600 hover:bg-pink-50"

  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  )
}