import { Check } from 'lucide-react';

const PLANS = [
  {
    name: 'Starter',
    price: '$19',
    description: 'Build your first booking page.',
    features: ['feature 1', 'feature 2', 'feature 3'],
    buttonText: 'Get Started',
    highlight: false,
  },
  {
    name: 'Growth',
    price: '$49',
    description: 'Unlimited links and payment processing.',
    features: ['feature 1', 'feature 2', 'feature 3'],
    buttonText: 'Start Free Trial',
    highlight: true,
  },
  {
    name: 'Pro',
    price: '$99',
    description: 'White-label solutions for large firms.',
    features: ['feature 1', 'feature 2', 'feature 3'],
    buttonText: 'Contact Sales',
    highlight: false,
  },
];

export function PricingTable() {
  return (
    <section id="pricing" className="py-24 bg-background">
      <div className="container mx-auto px-6 text-center mb-16">
        <h2 className="text-4xl font-black text-foreground mb-4">
          Simple, Transparent Pricing
        </h2>
        <p className="text-muted-foreground">
          Choose the plan that works for your workflow.
        </p>
      </div>
      <div className="container mx-auto px-6 grid md:grid-cols-3 gap-8">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`relative p-8 rounded-3xl border transition-all ${
              plan.highlight
                ? 'bg-card border-emerald-primary shadow-2xl scale-105 z-10'
                : 'bg-card border-border hover:border-emerald-primary/50'
            }`}
          >
            {plan.highlight && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-primary text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                Most Popular
              </span>
            )}
            <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
            <div className="mb-4">
              <span className="text-4xl font-black">{plan.price}</span>
              {plan.price !== 'Custom' && (
                <span className="text-muted-foreground text-sm">/mo</span>
              )}
            </div>
            <p className="text-muted-foreground text-sm mb-6">
              {plan.description}
            </p>
            <ul className="space-y-4 mb-8">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm">
                  <Check size={18} className="text-emerald-primary shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <button
              className={`w-full py-3 rounded-xl font-bold transition-all active:scale-95 ${
                plan.highlight
                  ? 'bg-emerald-primary text-white shadow-lg shadow-emerald-primary/20 hover:bg-emerald-hover'
                  : 'bg-secondary text-foreground hover:bg-muted border border-border'
              }`}
            >
              {plan.buttonText}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
