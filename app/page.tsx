import Navbar from '@/components/homepage/Navbar';
import HeroSection from '@/components/homepage/HeroSection';
import FeaturesSection from '@/components/homepage/FeatureSection';
import HowItWorksSection from '@/components/homepage/HowItWorks';
import TestimonialsSection from '@/components/homepage/Testimonials';
import CTASection from '@/components/homepage/CTASection';
import { PricingTable } from '@/components/homepage/PricingTable';
import { WaitlistSection } from '@/components/homepage/WaitlistSection';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="pt-20 lg:pt-0">
        {' '}
        {/* Desktop doesn't need pt if Hero has high py */}
        <HeroSection />
        {/* Sections now have IDs matching the Navbar Hrefs */}
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <PricingTable />
        <WaitlistSection />
        <CTASection />
      </main>
    </div>
  );
}