import { SectionHeader } from "@/components/section-header"
import { StoreCard, type StoreCardData } from "@/components/store-card"

export function FeaturedStores({ stores }: { stores: StoreCardData[] }) {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeader title="Uitgelichte kramen" href="/kramen" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stores.map((store) => (
          <StoreCard key={store.slug} store={store} />
        ))}
      </div>
    </section>
  )
}
