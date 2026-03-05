const STEPS = [
  {
    number: '01',
    title: 'Setup Your Profile',
    desc: 'Define your services, duration, and availability.',
  },
  {
    number: '02',
    title: 'Share Your Link',
    desc: 'Send your personalized MeetFlow link via email or social media.',
  },
  {
    number: '03',
    title: 'Clients Book You',
    desc: 'Clients choose a time, sign up, and receive instant confirmation.',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how" className="py-24 border-y border-border">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-black text-center mb-16">How it works</h2>
        <div className="grid md:grid-cols-3 gap-12 relative">
          {STEPS.map((step, idx) => (
            <div
              key={idx}
              className="relative flex flex-col items-center text-center"
            >
              <div className="mb-6 text-6xl font-black text-emerald-primary/10 absolute -top-8 left-1/2 -translate-x-1/2 select-none">
                {step.number}
              </div>
              <div className="z-10 h-14 w-14 rounded-full bg-emerald-primary text-white flex items-center justify-center font-bold text-xl mb-6 shadow-lg shadow-emerald-primary/30">
                {idx + 1}
              </div>
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-muted-foreground max-w-62.5">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
