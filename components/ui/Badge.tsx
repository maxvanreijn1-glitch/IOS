type Props = {
  children: React.ReactNode
  color?: "pink" | "green" | "gray"
}

export default function Badge({ children, color = "pink" }: Props) {
  const styles = {
    pink: "bg-pink-100 text-pink-600",
    green: "bg-green-100 text-green-600",
    gray: "bg-gray-100 text-gray-600",
  }

  return (
    <span
      className={`px-3 py-1 text-sm font-medium rounded-full ${styles[color]}`}
    >
      {children}
    </span>
  )
}