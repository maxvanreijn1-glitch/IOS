const TESTIMONIALS = [
  {
    quote:
      'MeetFlow has saved our engineering team at least 5 hours of documentation every week.',
    name: 'Sarah Chen',
    role: 'CTO at TechLeap',
    avatar: 'SC',
  },
  {
    quote:
      'The sentiment analysis is a game-changer for our customer success calls.',
    name: 'Marcus Thorne',
    role: 'Head of Sales at CloudScale',
    avatar: 'MT',
  },
  {
    quote:
      'Simple, powerful, and the dark mode looks absolutely stunning. 10/10.',
    name: 'Elena Rodriguez',
    role: 'Product Designer',
    avatar: 'ER',
  },
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24">
      <div className="container mx-auto px-6 text-center mb-16">
        <h2 className="text-4xl font-black mb-4">Loved by teams worldwide</h2>
      </div>
      <div className="container mx-auto px-6 grid md:grid-cols-3 gap-8">
        {TESTIMONIALS.map((t, idx) => (
          <div
            key={idx}
            className="p-8 rounded-3xl bg-card border border-border flex flex-col gap-6"
          >
            <p className="italic text-lg text-foreground/90">"{t.quote}"</p>
            <div className="flex items-center gap-4 mt-auto">
              <div className="h-12 w-12 rounded-full bg-emerald-primary/20 flex items-center justify-center font-bold text-emerald-primary">
                {t.avatar}
              </div>
              <div className="text-left">
                <p className="font-bold text-foreground">{t.name}</p>
                <p className="text-sm text-muted-foreground">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
