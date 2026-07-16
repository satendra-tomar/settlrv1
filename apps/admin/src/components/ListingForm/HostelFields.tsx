import { useFormContext } from 'react-hook-form'
import type { ListingFormData } from './schema'
import { StringArrayInput } from './StringArrayInput'

const ROOM_TYPE_OPTIONS = ['Single', 'Double', 'Triple', 'Dormitory']

type HostelFormData = Extract<ListingFormData, { type: 'hostel' }>

export function HostelFields() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<HostelFormData>()

  const roomTypes: string[] = watch('room_types') ?? []

  function toggleRoomType(value: string) {
    const next = roomTypes.includes(value)
      ? roomTypes.filter((v) => v !== value)
      : [...roomTypes, value]
    setValue('room_types', next)
  }

  return (
    <div className="space-y-6">
      {/* Gender */}
      <div>
        <label className="block text-sm font-medium text-ink mb-1">
          Gender <span className="text-red-500">*</span>
        </label>
        <select
          {...register('gender')}
          className="w-full max-w-xs px-3 py-2 border border-violet-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet bg-white"
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="co_ed">Co-ed</option>
        </select>
        {errors.gender && (
          <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>
        )}
      </div>

      {/* Rent Range */}
      <div>
        <label className="block text-sm font-medium text-ink mb-1">
          Rent Range (₹/month) <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            placeholder="Min"
            className="w-36 px-3 py-2 border border-violet-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet"
            {...register('rent_min', { valueAsNumber: true })}
          />
          <span className="text-muted">to</span>
          <input
            type="number"
            placeholder="Max"
            className="w-36 px-3 py-2 border border-violet-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet"
            {...register('rent_max', { valueAsNumber: true })}
          />
        </div>
        {errors.rent_max && (
          <p className="text-red-500 text-xs mt-1">{errors.rent_max.message}</p>
        )}
      </div>

      {/* Room Types */}
      <div>
        <label className="block text-sm font-medium text-ink mb-2">Room Types</label>
        <div className="flex flex-wrap gap-2">
          {ROOM_TYPE_OPTIONS.map((rt) => (
            <button
              key={rt}
              type="button"
              onClick={() => toggleRoomType(rt)}
              className={[
                'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
                roomTypes.includes(rt)
                  ? 'bg-violet text-white border-violet'
                  : 'bg-white text-ink border-violet-border hover:border-violet',
              ].join(' ')}
            >
              {rt}
            </button>
          ))}
        </div>
      </div>

    {/* Food Included */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="food_included"
          className="w-4 h-4 accent-violet"
          {...register('food_included')}
        />
        <label htmlFor="food_included" className="text-sm text-ink">
          Food included
        </label>
      </div>

      <hr className="border-t border-violet-border" />

      <h3 className="font-semibold text-ink">Pros & Cons</h3>
      <StringArrayInput name="pros" label="Pros" placeholder="Add a pro..." />
      <StringArrayInput name="cons" label="Cons" placeholder="Add a con..." />

      <hr className="border-t border-violet-border" />

      <h3 className="font-semibold text-ink">Experience Scores (0.0 to 10.0)</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
        {[
          { key: 'cleanliness_score', label: 'Cleanliness' },
          { key: 'food_quality_score', label: 'Food Quality' },
          { key: 'safety_score', label: 'Safety' },
          { key: 'study_environment_score', label: 'Study Environment' },
          { key: 'warden_support_score', label: 'Warden Support' },
          { key: 'location_score', label: 'Location' },
        ].map((score) => (
          <div key={score.key}>
            <label className="block text-sm font-medium text-ink mb-1">{score.label}</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              placeholder="0.0"
              className="w-full px-3 py-2 border border-violet-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet"
              {...register(score.key as any, {
                setValueAs: (v: string) => (v === '' ? undefined : Number(v)),
              })}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
