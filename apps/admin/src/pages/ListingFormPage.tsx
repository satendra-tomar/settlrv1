import { useRef } from 'react'
import { useParams } from 'react-router-dom'
import { ListingForm } from '../components/ListingForm/ListingForm'
import { useListingDetail, useCreateListing, useUpdateListing } from '../hooks/useListings'
import type { ListingFormData } from '../components/ListingForm/schema'

export function ListingFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)

  // Pre-generate UUID for new listings so images can upload before save
  const newIdRef = useRef(crypto.randomUUID())
  const listingId = id ?? newIdRef.current

  const { data: detail, isLoading: detailLoading } = useListingDetail(
    isEdit ? id : undefined,
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

  if (isEdit && detailLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-violet border-t-transparent rounded-full animate-spin" />
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
        ...(detail.type === 'coaching' && cd
          ? {
              exam_types: cd.subjects ?? [],
              founded_year: cd.established_year ?? undefined,
              faculty_count: cd.faculty_count ?? undefined,
            }
          : {}),
        ...(detail.type === 'hostel' && hd
          ? {
              gender: hd.gender,
              rent_min: hd.rent_min ?? 0,
              rent_max: hd.rent_max ?? 0,
              room_types: [],
              food_included: hd.food_included,
            }
          : {}),
      } as Partial<ListingFormData>)
    : undefined

  return (
    <ListingForm
      listingId={listingId}
      defaultValues={defaultValues}
      existingImages={detail?.listing_images ?? []}
      onSubmit={handleSubmit}
      isLoading={createMutation.isPending || updateMutation.isPending}
      isEdit={isEdit}
    />
  )
}
