'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { getApiBase } from '@/lib/api-client';

type AccountType = 'client' | 'business' | null;
type Step = 'choose' | 'pricing' | 'form';

function RegisterPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();

  const stripeSessionId = searchParams.get('session_id');

  const [step, setStep] = useState<Step>('choose');
  const [accountType, setAccountType] = useState<AccountType>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    orgName: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user && !stripeSessionId && step === 'choose') {
      router.push('/dashboard');
    }
  }, [user, loading, router, stripeSessionId, step]);

  useEffect(() => {
    if (stripeSessionId) {
      setAccountType('business');
      setStep('form');
    }
  }, [stripeSessionId]);

  if (loading) return null;

  const handleStripeCheckout = async (plan: string) => {
    try {
      setProcessing(true);
      setSelectedPlan(plan);

      const res = await fetch(`${getApiBase()}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Checkout failed');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Stripe error:', error);
      alert('Unable to start checkout. Please try again.');
      setProcessing(false);
    }
  };

  const handleAccountChoice = (type: AccountType) => {
    setAccountType(type);
    if (type === 'business') {
      setStep('pricing');
    } else {
      setStep('form');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (accountType === 'business' && !stripeSessionId) {
      alert('Payment required before creating a business account.');
      return;
    }

    try {
      setProcessing(true);
      const res = await fetch(`${getApiBase()}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          accountType,
          ...(accountType === 'business' && {
            orgName: formData.orgName,
            stripeSessionId,
          }),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || 'Registration failed');
        setProcessing(false);
        return;
      }

      router.push('/dashboard');
    } catch {
      setFormError('Something went wrong. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-4xl bg-card rounded-3xl border border-border shadow-xl p-12">
        {/* Progress Bar */}
        <div className="flex justify-center mb-10">
          {['choose', 'pricing', 'form'].map((s, i) => (
            <div
              key={i}
              className={`h-1 w-20 mx-2 rounded-full ${
                step === s ? 'bg-emerald-primary' : 'bg-border'
              }`}
            />
          ))}
        </div>

        {/* Back Button */}
        {step !== 'choose' && !stripeSessionId && (
          <button
            onClick={() =>
              setStep(
                step === 'form' && accountType === 'business'
                  ? 'pricing'
                  : 'choose'
              )
            }
            className="text-sm opacity-60 hover:text-emerald-primary mb-8 transition"
          >
            ← Back
          </button>
        )}

        {/* STEP 1 — Choose Account */}
        {step === 'choose' && (
          <>
            <h1 className="text-4xl font-bold text-center mb-12">
              Create Your Account
            </h1>

            <div className="grid md:grid-cols-2 gap-8">
              <div
                onClick={() => handleAccountChoice('business')}
                className="border border-border rounded-2xl p-10 cursor-pointer hover:border-emerald-primary hover:bg-emerald-soft/10 transition group"
              >
                <h2 className="text-2xl font-semibold mb-4 group-hover:text-emerald-primary">
                  Business Account
                </h2>
                <p className="opacity-70">
                  Manage your organisation and accept bookings.
                </p>
              </div>

              <div
                onClick={() => handleAccountChoice('client')}
                className="border border-border rounded-2xl p-10 cursor-pointer hover:border-emerald-primary hover:bg-emerald-soft/10 transition group"
              >
                <h2 className="text-2xl font-semibold mb-4 group-hover:text-emerald-primary">
                  Client Account
                </h2>
                <p className="opacity-70">
                  Join organisations and schedule meetings.
                </p>
              </div>
            </div>
          </>
        )}

        {/* STEP 2 — Pricing */}
        {step === 'pricing' && (
          <>
            <h1 className="text-4xl font-bold text-center mb-12">
              Simple, Transparent Pricing
            </h1>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { name: 'Starter', price: '£19' },
                { name: 'Growth', price: '£49', highlight: true },
                { name: 'Pro', price: '£99' },
              ].map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-2xl p-8 border transition ${
                    plan.highlight
                      ? 'border-emerald-primary shadow-xl scale-105 bg-background'
                      : 'border-border'
                  }`}
                >
                  <h2 className="text-2xl font-semibold mb-6">{plan.name}</h2>

                  <p className="text-4xl font-bold mb-8">
                    {plan.price}
                    <span className="text-base font-normal opacity-50">
                      {' '}
                      /mo
                    </span>
                  </p>

                  <button
                    disabled={processing}
                    onClick={() => handleStripeCheckout(plan.name)}
                    className="w-full bg-emerald-primary hover:bg-emerald-hover text-white py-3 rounded-xl transition disabled:opacity-50"
                  >
                    {processing && selectedPlan === plan.name
                      ? 'Redirecting...'
                      : 'Get Started'}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* STEP 3 — Account Form */}
        {step === 'form' && (
          <>
            <h1 className="text-3xl font-bold text-center mb-12">
              {accountType === 'business'
                ? `Complete Your Business Setup`
                : 'Create Client Account'}
            </h1>

            <form
              onSubmit={handleSubmit}
              className="space-y-6 max-w-md mx-auto"
            >
              <input
                type="text"
                placeholder="Full Name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-5 py-3 border border-border bg-background rounded-xl focus:ring-2 focus:ring-emerald-primary outline-none text-foreground"
              />

              <input
                type="email"
                placeholder="Email Address"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-5 py-3 border border-border bg-background rounded-xl focus:ring-2 focus:ring-emerald-primary outline-none text-foreground"
              />

              <input
                type="password"
                placeholder="Password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-5 py-3 border border-border bg-background rounded-xl focus:ring-2 focus:ring-emerald-primary outline-none text-foreground"
              />

              {accountType === 'business' && (
                <input
                  type="text"
                  placeholder="Organisation Name"
                  required
                  value={formData.orgName}
                  onChange={(e) =>
                    setFormData({ ...formData, orgName: e.target.value })
                  }
                  className="w-full px-5 py-3 border border-border bg-background rounded-xl focus:ring-2 focus:ring-emerald-primary outline-none text-foreground"
                />
              )}

              {formError && <p className="text-red-500 text-sm">{formError}</p>}

              <button
                type="submit"
                disabled={processing}
                className="w-full bg-emerald-primary hover:bg-emerald-hover text-white py-3 rounded-xl transition disabled:opacity-60"
              >
                {processing ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterPageInner />
    </Suspense>
  );
}
