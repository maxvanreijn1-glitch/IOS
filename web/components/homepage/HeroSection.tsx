import { ArrowRight} from 'lucide-react';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col items-start gap-6 text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-primary/20 bg-emerald-soft px-3 py-1 text-sm font-medium text-emerald-primary">
            New: MeetFlow 1.0v released 
          </div>
          <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-foreground">
            Your business,{' '}
            <span className="text-emerald-primary">one link away.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-135">
            Share your custom MeetFlow link and let clients book, pay, and join
            meetings in seconds. No more back-and-forth emails.
          </p>
          <div className="flex flex-col sm:row gap-4 w-full sm:w-auto">
            <Link
              href="/register"
              className="group flex items-center justify-center gap-2 rounded-full bg-emerald-primary px-8 py-4 text-lg font-bold text-white shadow-xl shadow-emerald-primary/20 hover:bg-emerald-hover hover:-translate-y-1 transition-all"
            >
              Create Your Link
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>
        </div>
        {/* RIGHT ILLUSTRATION - Imagine a booking card here */}
        <div className="relative lg:h-125 w-full rounded-3xl border border-border bg-card shadow-2xl flex items-center justify-center overflow-hidden">
          <div className="p-8 bg-background border border-border rounded-2xl shadow-xl w-64 text-center">
            <div className="size-16 bg-emerald-soft rounded-full mx-auto mb-4 flex items-center justify-center text-emerald-primary font-bold">
              JD
            </div>
            <p className="font-bold">John Doe</p>
            <p className="text-xs text-muted-foreground mb-4">
              Consultation • 30m
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 border border-emerald-primary/30 rounded text-[10px] font-bold">
                9:00 AM
              </div>
              <div className="p-2 bg-emerald-primary text-white rounded text-[10px] font-bold">
                10:30 AM
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}