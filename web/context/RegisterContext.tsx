"use client"

import { createContext, useContext, useState } from "react"

type Step =
  | "choose-account"
  | "choose-plan"
  | "account-form"

interface RegisterState {
  accountType: "client" | "business" | null
  selectedPlan: string | null
  stripeSessionId: string | null
  step: Step
  setAccountType: (type: "client" | "business") => void
  setSelectedPlan: (plan: string) => void
  setStripeSessionId: (id: string) => void
  setStep: (step: Step) => void
}

const RegisterContext = createContext<RegisterState | undefined>(undefined)

export function RegisterProvider({ children }: { children: React.ReactNode }) {
  const [accountType, setAccountType] = useState<"client" | "business" | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [stripeSessionId, setStripeSessionId] = useState<string | null>(null)
  const [step, setStep] = useState<Step>("choose-account")

  return (
    <RegisterContext.Provider
      value={{
        accountType,
        selectedPlan,
        stripeSessionId,
        step,
        setAccountType,
        setSelectedPlan,
        setStripeSessionId,
        setStep,
      }}
    >
      {children}
    </RegisterContext.Provider>
  )
}

export function useRegister() {
  const context = useContext(RegisterContext)
  if (!context) {
    throw new Error("useRegister must be used within RegisterProvider")
  }
  return context
}