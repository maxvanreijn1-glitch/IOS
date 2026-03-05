import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="py-24 px-6">
      <div className="container mx-auto rounded-[3rem] bg-emerald-primary p-12 lg:p-24 text-center text-white shadow-2xl shadow-emerald-primary/40">
        <h2 className="text-4xl lg:text-6xl font-black leading-tight mb-6">
          Stop chasing clients. <br />{' '}
          <span className="text-emerald-soft">Start booking them.</span>
        </h2>
        <p className="text-xl text-emerald-soft/90 mb-10 max-w-2xl mx-auto">
          Join thousands of professionals who have simplified their client
          intake process. Get your custom link today.
        </p>
        <Link
          href="/register"
          className="rounded-full bg-white px-10 py-4 text-lg font-bold text-emerald-primary hover:bg-emerald-soft transition-all inline-block"
        >
          Get Your Free Link Now
        </Link>
      </div>
    </section>
  );
}