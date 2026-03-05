'use client';

import { useState } from 'react';
import { useRegister } from '@/context/RegisterContext';
import BackButton from '@/components/BackButton';

export default function ChoosePlan() {
  const { setSelectedPlan } = useRegister();
  const [loading, setLoading] = useState<string | null>(null);

  const handlePlan = async (plan: string) => {
    setLoading(plan);
    setSelectedPlan(plan);
    const res = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  return (
    <div className="max-w-6xl mx-auto py-20 px-6 bg-background text-foreground">
      <BackButton to="choose-account" />
      <h1 className="text-4xl font-bold text-center mb-12">Choose Your Plan</h1>
      <div className="grid md:grid-cols-3 gap-8">
        {['Starter', 'Growth', 'Pro'].map((plan) => (
          <div
            key={plan}
            className="bg-card border border-border rounded-2xl p-8 hover:border-emerald-primary transition shadow-sm"
          >
            <h2 className="text-2xl font-semibold mb-6">{plan}</h2>
            <button
              disabled={loading === plan}
              onClick={() => handlePlan(plan)}
              className="w-full bg-emerald-primary hover:bg-emerald-hover text-white py-2.5 rounded-lg transition disabled:opacity-50"
            >
              {loading === plan ? 'Redirecting...' : 'Select Plan'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
