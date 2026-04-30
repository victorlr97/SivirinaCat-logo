export const dynamic = 'force-dynamic'

import { getProductsForCatalog } from "@/lib/firebase/db-server"
import { CatalogHeader } from "@/components/catalog/catalog-header"
import { HeroSection } from "@/components/home/hero-section"
import { ManifestoSection } from "@/components/home/manifesto-section"
import { BrandStorySection } from "@/components/home/brand-story-section"
import { PhilosophySection } from "@/components/home/philosophy-section"
import { FeaturedCollectionSection } from "@/components/home/featured-collection-section"
import { CTASection } from "@/components/home/cta-section"

export default async function HomePage() {
  const products = await getProductsForCatalog()

  return (
    <div className="min-h-screen">
      <CatalogHeader />
      <main>
        <HeroSection />
        <ManifestoSection />
        <BrandStorySection />
        <PhilosophySection />
        <FeaturedCollectionSection products={products} />
        <CTASection />
      </main>
    </div>
  )
}
