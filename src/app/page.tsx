export const dynamic = 'force-dynamic';

import Hero from '@/components/Hero'
import FeaturedProducts from '@/components/FeaturedProducts'
import WhyChooseUs from '@/components/WhyChooseUs'
import VendorSection from '@/components/VendorSection'
import BlogSection from '@/components/BlogSection'
import Newsletter from '@/components/Newsletter'
import TrustStrip from '@/components/TrustStrip'
import LiveStats from '@/components/LiveStats'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <div className="container-custom">
        <LiveStats />
      </div>
      <TrustStrip />
      <FeaturedProducts />
      <VendorSection />
      <WhyChooseUs />
      <BlogSection />
      <Newsletter />
    </main>
  )
}
