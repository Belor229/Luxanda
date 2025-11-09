import Hero from '@/components/Hero'
import FeaturedProducts from '@/components/FeaturedProducts'
import WhyChooseUs from '@/components/WhyChooseUs'
import VendorSection from '@/components/VendorSection'
import BlogSection from '@/components/BlogSection'
import Newsletter from '@/components/Newsletter'
import TrustStrip from '@/components/TrustStrip'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <TrustStrip />
      <FeaturedProducts />
      <VendorSection />
      <WhyChooseUs />
      <BlogSection />
      <Newsletter />
    </main>
  )
}
