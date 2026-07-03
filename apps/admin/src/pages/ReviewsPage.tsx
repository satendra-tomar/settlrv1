import { useReviews, useToggleReviewApproval } from '../hooks/useReviews'

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-star">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < rating ? 'text-star' : 'text-muted opacity-40'}>
          ★
        </span>
      ))}
    </span>
  )
}

function RelativeDate({ iso }: { iso: string }) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  const hrs = Math.floor(mins / 60)
  const days = Math.floor(hrs / 24)

  let label: string
  if (days > 0) label = `${days}d ago`
  else if (hrs > 0) label = `${hrs}h ago`
  else if (mins > 0) label = `${mins}m ago`
  else label = 'Just now'

  return <span className="text-xs text-muted">{label}</span>
}

interface ReviewItemProps {
  review: {
    id: string
    listing_id: string
    user_id: string
    rating: number
    body: string | null
    is_approved: boolean
    created_at: string
    listings: { name: string } | null
    profiles: { full_name: string | null } | null
  }
}

function ReviewItem({ review }: ReviewItemProps) {
  const toggle = useToggleReviewApproval(review.id, review.is_approved)
  const reviewerName = review.profiles?.full_name ?? 'Anonymous'
  const listingName = review.listings?.name ?? 'Unknown listing'

  return (
    <div
      className={[
        'bg-white rounded-xl border p-5 space-y-3 transition-opacity',
        !review.is_approved ? 'opacity-60' : '',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-0.5">
          <p className="font-medium text-ink text-sm">{reviewerName}</p>
          <p className="text-xs text-muted">{listingName}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <RelativeDate iso={review.created_at} />
          <button
            onClick={() => toggle.mutate()}
            disabled={toggle.isPending}
            className={[
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-60',
              review.is_approved
                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                : 'bg-violet-surface text-violet hover:bg-violet-border',
            ].join(' ')}
          >
            {toggle.isPending
              ? '…'
              : review.is_approved
                ? 'Hide'
                : 'Show'}
          </button>
        </div>
      </div>

      <StarRating rating={review.rating} />

      {review.body && (
        <p className="text-sm text-ink leading-relaxed">{review.body}</p>
      )}

      {!review.is_approved && (
        <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
          Hidden
        </span>
      )}
    </div>
  )
}

export function ReviewsPage() {
  const { data: reviews, isLoading } = useReviews()

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-violet-border p-5 h-24 animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-violet-border p-12 text-center">
        <p className="text-muted text-sm">No reviews yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        {reviews.length} review{reviews.length !== 1 ? 's' : ''} total
      </p>
      {reviews.map((review) => (
        <ReviewItem
          key={review.id}
          review={
            review as unknown as ReviewItemProps['review']
          }
        />
      ))}
    </div>
  )
}
