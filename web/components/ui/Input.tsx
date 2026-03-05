type Props = React.InputHTMLAttributes<HTMLInputElement>

export default function Input({ className = "", ...props }: Props) {
  return (
    <input
      className={`w-full px-4 py-3 rounded-xl border border-pink-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition bg-white/70 backdrop-blur-sm ${className}`}
      {...props}
    />
  )
}