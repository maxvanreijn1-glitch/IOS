'use client';

import { useRegister } from '@/context/RegisterContext';

export default function ChooseAccount() {
  const { setAccountType, setStep } = useRegister();

  const handleSelect = (type: 'client' | 'business') => {
    setAccountType(type);
    if (type === 'business') {
      setStep('choose-plan');
    } else {
      setStep('account-form');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-20 px-6 text-foreground">
      <h1 className="text-4xl font-bold text-center mb-12">
        Create Your Account
      </h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div
          onClick={() => handleSelect('business')}
          className="bg-card border border-border rounded-2xl p-10 cursor-pointer hover:border-emerald-primary transition shadow-sm group"
        >
          <h2 className="text-2xl font-semibold mb-4 group-hover:text-emerald-primary">
            Business Account
          </h2>
          <p className="opacity-70">
            Manage your organisation, team members, and bookings.
          </p>
        </div>
        <div
          onClick={() => handleSelect('client')}
          className="bg-card border border-border rounded-2xl p-10 cursor-pointer hover:border-emerald-primary transition shadow-sm group"
        >
          <h2 className="text-2xl font-semibold mb-4 group-hover:text-emerald-primary">
            Client Account
          </h2>
          <p className="opacity-70">Book meetings with organisations.</p>
        </div>
      </div>
    </div>
  );
}
