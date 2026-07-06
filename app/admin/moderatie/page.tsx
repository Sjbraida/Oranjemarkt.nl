import { getAllReviewsAdmin } from "@/lib/admin-queries"
import { AdminReviews } from "@/components/admin/admin-reviews"
import { BroadcastForm } from "@/components/admin/broadcast-form"

export const metadata = { title: "Moderatie | Admin" }

export default async function AdminModerationPage() {
  const reviews = await getAllReviewsAdmin()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Moderatie &amp; meldingen</h1>
        <p className="text-sm text-muted-foreground">Beheer reviews en stuur platformmeldingen.</p>
      </div>

      <BroadcastForm />

      <div>
        <h2 className="mb-3 text-lg font-semibold text-foreground">Reviews ({reviews.length})</h2>
        <AdminReviews reviews={reviews} />
      </div>
    </div>
  )
}
