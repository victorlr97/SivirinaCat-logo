import { createServerClient } from "@/lib/supabase/server"
import { HeroSection } from "@/components/home/hero-section"
import { ManifestoSection } from "@/components/home/manifesto-section"
import { BrandStorySection } from "@/components/home/brand-story-section"
import { PhilosophySection } from "@/components/home/philosophy-section"
import { FeaturedCollectionSection } from "@/components/home/featured-collection-section"
import { CTASection } from "@/components/home/cta-section"

export default async function HomePage() {
  const supabase = await createServerClient()

  // Buscar todos os produtos para a seção de coleção
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("available", true)
    .eq("visivel_catalogo", true)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen">
      <main>
        <HeroSection />
        <ManifestoSection />
        <BrandStorySection />
        <PhilosophySection />
        <FeaturedCollectionSection products={products || []} />
        <CTASection />
      </main>
    </div>
  )
}
