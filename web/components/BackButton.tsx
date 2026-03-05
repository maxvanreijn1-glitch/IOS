"use client"

import { useRegister } from "@/context/RegisterContext"

export default function BackButton({
  to,
}: {
  to: "choose-account" | "choose-plan"
}) {
  const { setStep } = useRegister()

  return (
    <button
      onClick={() => setStep(to)}
      className="text-sm text-gray-500 hover:text-pink-600 transition mb-8"
    >
      ← Back
    </button>
  )
}