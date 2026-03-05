import { LinkIcon, CalendarCheck, CreditCard, Bell } from 'lucide-react';

const FEATURES = [
  {
    icon: <LinkIcon className="text-emerald-primary" />,
    title: 'Custom Booking Links',
    description:
      'A professional, branded page where clients can view your availability and book instantly.',
  },
  {
    icon: <CalendarCheck className="text-emerald-primary" />,
    title: 'Automated Scheduling',
    description:
      'Syncs with your calendar to prevent double-booking and automatically sends meeting invites.',
  },
  {
    icon: <CreditCard className="text-emerald-primary" />,
    title: 'Payment Integration',
    description:
      'Collect deposits or full payments from clients at the time of booking with Stripe.',
  },
  {
    icon: <Bell className="text-emerald-primary" />,
    title: 'Smart Reminders',
    description:
      'Automated SMS and email reminders to ensure your clients never miss a scheduled session.',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-6 text-center mb-16">
        <h2 className="text-emerald-primary font-bold tracking-widest uppercase text-sm mb-4">
          Everything you need
        </h2>
        <p className="text-4xl font-black text-foreground">
          Built for the modern workforce
        </p>
      </div>
      <div className="container mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {FEATURES.map((feature, idx) => (
          <div
            key={idx}
            className="group p-8 rounded-3xl bg-card border border-border hover:border-emerald-primary/50 transition-all hover:shadow-2xl hover:shadow-emerald-primary/5"
          >
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-soft group-hover:scale-110 transition-transform">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-foreground">
              {feature.title}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
