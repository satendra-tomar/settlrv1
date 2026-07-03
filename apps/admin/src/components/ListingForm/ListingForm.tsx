import { useEffect, useCallback } from 'react'
import { useForm, FormProvider, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { listingSchema, type ListingFormData } from './schema'
import { CoachingFields } from './CoachingFields'
import { HostelFields } from './HostelFields'
import { ImageUploader } from './ImageUploader'
import type { Tables } from '../../types/database'

type ListingImage = Tables<'listing_images'>

interface ListingFormProps {
  listingId: string
  defaultValues?: Partial<ListingFormData>
  existingImages?: ListingImage[]
  onSubmit: (data: ListingFormData) => void
  isLoading?: boolean
  isEdit?: boolean
}

const INPUT_CLASS =
  'w-full px-3 py-2 border border-violet-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet bg-white'
const LABEL_CLASS = 'block text-sm font-medium text-ink mb-1'
const ERROR_CLASS = 'text-red-500 text-xs mt-1'

export function ListingForm({
  listingId,
  defaultValues,
  existingImages = [],
  onSubmit,
  isLoading = false,
  isEdit = false,
}: ListingFormProps) {
  const methods = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      type: 'coaching',
      is_verified: false,
      plan_tier: 'free',
      amenity_ids: [],
      exam_types: [],
      ...defaultValues,
    } as ListingFormData,
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = methods

  const selectedType = watch('type')
  const phone = watch('phone')

  // Safe setter for cross-type fields (coaching<->hostel switch)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setAny = useCallback((name: string, value: unknown) => (setValue as any)(name, value), [setValue])

  // Reset type-specific defaults when type changes
  useEffect(() => {
    if (!isEdit && selectedType === 'hostel') {
      setAny('rent_min', 0)
      setAny('rent_max', 0)
      setAny('room_types', [])
      setAny('food_included', false)
      setAny('gender', 'male')
    }
  }, [selectedType, isEdit, setAny])

  const { data: cities } = useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('id, name')
        .order('name')
      if (error) throw error
      return data ?? []
    },
  })

  const { data: amenities } = useQuery({
    queryKey: ['amenities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('amenities')
        .select('id, name')
        .order('name')
      if (error) throw error
      return data ?? []
    },
  })

  const amenityIds = watch('amenity_ids')

  function toggleAmenity(id: string) {
    const current = amenityIds ?? []
    const next = current.includes(id)
      ? current.filter((a) => a !== id)
      : [...current, id]
    setValue('amenity_ids', next)
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Type selection */}
        <div className="bg-white rounded-xl border border-violet-border p-6 space-y-6">
          <h2 className="text-base font-semibold text-ink">Listing Type</h2>
          <div className="flex gap-4">
            {(['coaching', 'hostel'] as const).map((t) => (
              <label
                key={t}
                className={[
                  'flex items-center gap-2 px-4 py-2.5 border rounded-lg cursor-pointer transition-colors select-none',
                  selectedType === t
                    ? 'border-violet bg-violet-surface text-violet font-medium'
                    : 'border-violet-border text-ink',
                  isEdit ? 'opacity-60 cursor-not-allowed' : '',
                ].join(' ')}
              >
                <input
                  type="radio"
                  value={t}
                  disabled={isEdit}
                  {...register('type')}
                  className="accent-violet"
                />
                {t === 'coaching' ? 'Coaching Institute' : 'Hostel'}
              </label>
            ))}
          </div>
        </div>

        {/* Common fields */}
        <div className="bg-white rounded-xl border border-violet-border p-6 space-y-5">
          <h2 className="text-base font-semibold text-ink">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={LABEL_CLASS}>
                Name <span className="text-red-500">*</span>
              </label>
              <input {...register('name')} className={INPUT_CLASS} placeholder="e.g. Aakash Institute" />
              {errors.name && <p className={ERROR_CLASS}>{errors.name.message}</p>}
            </div>

            <div>
              <label className={LABEL_CLASS}>
                City <span className="text-red-500">*</span>
              </label>
              <select {...register('city_id')} className={INPUT_CLASS}>
                <option value="">Select city</option>
                {cities?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.city_id && (
                <p className={ERROR_CLASS}>{errors.city_id.message}</p>
              )}
            </div>

            <div>
              <label className={LABEL_CLASS}>
                Area <span className="text-red-500">*</span>
              </label>
              <input
                {...register('area')}
                className={INPUT_CLASS}
                placeholder="e.g. Vijay Nagar"
              />
              {errors.area && <p className={ERROR_CLASS}>{errors.area.message}</p>}
            </div>

            <div>
              <label className={LABEL_CLASS}>Address</label>
              <input
                {...register('address')}
                className={INPUT_CLASS}
                placeholder="Street address"
              />
            </div>

            <div>
              <label className={LABEL_CLASS}>
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                {...register('phone')}
                className={INPUT_CLASS}
                placeholder="+91XXXXXXXXXX"
              />
              {errors.phone && (
                <p className={ERROR_CLASS}>{errors.phone.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-ink">WhatsApp</label>
                <label className="flex items-center gap-1.5 text-xs text-muted cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-violet"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setValue('whatsapp', phone || '')
                      } else {
                        setValue('whatsapp', '')
                      }
                    }}
                  />
                  Same as phone
                </label>
              </div>
              <input
                {...register('whatsapp')}
                className={INPUT_CLASS}
                placeholder="+91XXXXXXXXXX"
              />
            </div>

            <div className="md:col-span-2">
              <label className={LABEL_CLASS}>Website URL</label>
              <input
                {...register('website')}
                className={INPUT_CLASS}
                placeholder="https://"
              />
              {errors.website && (
                <p className={ERROR_CLASS}>{errors.website.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className={LABEL_CLASS}>Description</label>
              <textarea
                {...register('description')}
                rows={3}
                className={INPUT_CLASS}
                placeholder="Brief description of the institute/hostel"
              />
            </div>
          </div>
        </div>

        {/* Type-specific fields */}
        <div className="bg-white rounded-xl border border-violet-border p-6">
          <h2 className="text-base font-semibold text-ink mb-6">
            {selectedType === 'coaching' ? 'Coaching Details' : 'Hostel Details'}
          </h2>
          {selectedType === 'coaching' ? <CoachingFields /> : <HostelFields />}
        </div>

        {/* Amenities */}
        <div className="bg-white rounded-xl border border-violet-border p-6">
          <h2 className="text-base font-semibold text-ink mb-4">Amenities</h2>
          <div className="flex flex-wrap gap-2">
            {amenities?.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => toggleAmenity(a.id)}
                className={[
                  'px-3 py-1.5 rounded-full text-sm border transition-colors',
                  amenityIds?.includes(a.id)
                    ? 'bg-violet text-white border-violet'
                    : 'bg-white text-ink border-violet-border hover:border-violet',
                ].join(' ')}
              >
                {a.name}
              </button>
            ))}
          </div>
        </div>

        {/* Listing settings */}
        <div className="bg-white rounded-xl border border-violet-border p-6 space-y-5">
          <h2 className="text-base font-semibold text-ink">Settings</h2>

          <div className="flex items-start gap-3">
            <Controller
              name="is_verified"
              control={control}
              render={({ field }) => (
                <button
                  type="button"
                  role="switch"
                  aria-checked={field.value as boolean}
                  onClick={() => field.onChange(!field.value)}
                  className={[
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors mt-0.5',
                    field.value ? 'bg-verified' : 'bg-gray-200',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                      field.value ? 'translate-x-6' : 'translate-x-1',
                    ].join(' ')}
                  />
                </button>
              )}
            />
            <div>
              <p className="text-sm font-medium text-ink">Verified</p>
              <p className="text-xs text-muted">
                Turning this on makes the listing visible to students.
              </p>
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS}>Plan Tier</label>
            <select {...register('plan_tier')} className={INPUT_CLASS + ' max-w-xs'}>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl border border-violet-border p-6">
          <ImageUploader listingId={listingId} existingImages={existingImages} />
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-violet text-white rounded-xl font-medium hover:bg-violet/90 disabled:opacity-60 transition-colors"
          >
            {isLoading
              ? 'Saving...'
              : isEdit
                ? 'Save Changes'
                : 'Create Listing'}
          </button>
        </div>
      </form>
    </FormProvider>
  )
}
