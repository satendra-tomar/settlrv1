import { useRef } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { ListingForm } from '../components/ListingForm/ListingForm'
import { useListingDetail, useCreateListing, useUpdateListing } from '../hooks/useListings'
import type { ListingFormData } from '../components/ListingForm/schema'

export function ListingFormPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const duplicateId = searchParams.get('duplicate')
  const defaultType = searchParams.get('type') as 'coaching' | 'hostel' | null
  
  // Is this an actual edit of an existing record, or a duplicate flow?
  const isEdit = Boolean(id) && !duplicateId
  const loadId = id || duplicateId

  // Pre-generate UUID for new listings so images can upload before save
  const newIdRef = useRef(crypto.randomUUID())
  const listingId = isEdit ? id! : newIdRef.current

  const { data: detail, isLoading: detailLoading } = useListingDetail(
    loadId || undefined,
  )

  const createMutation = useCreateListing()
  const updateMutation = useUpdateListing()

  function handleSubmit(data: ListingFormData) {
    const payload: Record<string, unknown> = {
      ...data,
      id: listingId,
      is_active: true,
    }
    if (isEdit) {
      updateMutation.mutate(payload)
    } else {
      createMutation.mutate(payload)
    }
  }

  if (loadId && detailLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // The Supabase join returns 1:1 detail tables as arrays — access index [0].
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cd = detail ? (detail.coaching_details as any)?.[0] ?? null : null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hd = detail ? (detail.hostel_details as any)?.[0] ?? null : null

  // Build default values from existing detail data
  const defaultValues: Partial<ListingFormData> | undefined = detail
    ? ({
        type: detail.type,
        name: detail.name,
        city_id: detail.city_id,
        area: detail.area ?? '',
        address: detail.address ?? '',
        phone: detail.phone ?? '',
        whatsapp: detail.whatsapp ?? '',
        website: detail.website_url ?? '',
        description: detail.description ?? '',
        is_verified: detail.is_verified,
        plan_tier: detail.plan_tier,
        amenity_ids: (detail.listing_amenities ?? []).map(
          (la: { amenity_id: string }) => la.amenity_id,
        ),
        pros: (cd?.pros ?? hd?.pros ?? []),
        cons: (cd?.cons ?? hd?.cons ?? []),
        ...(detail.type === 'coaching' && cd
          ? {
              exam_types: cd.subjects ?? [],
              founded_year: cd.established_year ?? undefined,
              faculty_count: cd.faculty_count ?? undefined,
              fee_per_month: cd.fee_per_month ?? undefined,
              teaching_score: cd.teaching_score ?? undefined,
              notes_score: cd.notes_score ?? undefined,
              test_series_score: cd.test_series_score ?? undefined,
              doubt_support_score: cd.doubt_support_score ?? undefined,
              competition_score: cd.competition_score ?? undefined,
              personal_attention_score: cd.personal_attention_score ?? undefined,
            }
          : {}),
        ...(detail.type === 'hostel' && hd
          ? {
              gender: hd.gender,
              rent_min: hd.rent_min ?? 0,
              rent_max: hd.rent_max ?? 0,
              room_types: hd.room_types ?? [],
              food_included: hd.food_included,
              cleanliness_score: hd.cleanliness_score ?? undefined,
              food_quality_score: hd.food_quality_score ?? undefined,
              safety_score: hd.safety_score ?? undefined,
              study_environment_score: hd.study_environment_score ?? undefined,
              warden_support_score: hd.warden_support_score ?? undefined,
              location_score: hd.location_score ?? undefined,
            }
          : {}),
      } as Partial<ListingFormData>)
    : defaultType ? { type: defaultType } : undefined

  return (
    <ListingForm
      listingId={listingId}
      defaultValues={defaultValues}
      existingImages={duplicateId ? [] : (detail?.listing_images ?? [])}
      onSubmit={handleSubmit}
      isLoading={createMutation.isPending || updateMutation.isPending}
      isEdit={isEdit}
    />
  )
}
