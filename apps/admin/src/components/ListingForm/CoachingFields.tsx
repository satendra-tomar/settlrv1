import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import type { ListingFormData } from './schema'

const PRESET_EXAM_TYPES = ['NEET', 'JEE', 'UPSC', 'Banking', 'SSC', 'Other']

// Type helper — safely cast the form context to access coaching-only fields
type CoachingFormData = Extract<ListingFormData, { type: 'coaching' }>

export function CoachingFields() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CoachingFormData>()

  const [otherText, setOtherText] = useState('')
  const [showOtherInput, setShowOtherInput] = useState(false)

  const examTypes: string[] = watch('exam_types') ?? []

  function toggleExamType(value: string) {
    if (value === 'Other') {
      setShowOtherInput((prev) => !prev)
      return
    }
    const next = examTypes.includes(value)
      ? examTypes.filter((v) => v !== value)
      : [...examTypes, value]
    setValue('exam_types', next, { shouldValidate: true })
  }

  function addOther() {
    const trimmed = otherText.trim()
    if (!trimmed) return
    if (!examTypes.includes(trimmed)) {
      setValue('exam_types', [...examTypes, trimmed], { shouldValidate: true })
    }
    setOtherText('')
    setShowOtherInput(false)
  }

  function removeExamType(value: string) {
    setValue(
      'exam_types',
      examTypes.filter((v) => v !== value),
      { shouldValidate: true },
    )
  }

  return (
    <div className="space-y-6">
      {/* Exam Types */}
      <div>
        <label className="block text-sm font-medium text-ink mb-2">
          Exam Types <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESET_EXAM_TYPES.map((et) => (
            <button
              key={et}
              type="button"
              onClick={() => toggleExamType(et)}
              className={[
                'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
                et !== 'Other' && examTypes.includes(et)
                  ? 'bg-violet text-white border-violet'
                  : 'bg-white text-ink border-violet-border hover:border-violet',
              ].join(' ')}
            >
              {et}
            </button>
          ))}
        </div>

        {/* Custom (non-preset) exam type chips */}
        {examTypes
          .filter((e) => !PRESET_EXAM_TYPES.includes(e))
          .map((e) => (
            <span
              key={e}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm bg-violet text-white mt-2 mr-2"
            >
              {e}
              <button
                type="button"
                onClick={() => removeExamType(e)}
                className="ml-1 hover:text-violet-light"
              >
                ×
              </button>
            </span>
          ))}

        {showOtherInput && (
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={otherText}
              onChange={(e) => setOtherText(e.target.value)}
              placeholder="Enter exam type"
              className="flex-1 px-3 py-2 border border-violet-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addOther()
                }
              }}
            />
            <button
              type="button"
              onClick={addOther}
              className="px-4 py-2 bg-violet text-white rounded-lg text-sm hover:bg-violet/90"
            >
              Add
            </button>
          </div>
        )}

        {errors.exam_types && (
          <p className="text-red-500 text-xs mt-1">{errors.exam_types.message}</p>
        )}
      </div>

      {/* Founded Year */}
      <div>
        <label className="block text-sm font-medium text-ink mb-1">Founded Year</label>
        <input
          type="number"
          placeholder="e.g. 2010"
          className="w-48 px-3 py-2 border border-violet-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet"
          {...register('founded_year', {
            setValueAs: (v: string) => (v === '' ? undefined : Number(v)),
          })}
        />
      </div>

      {/* Faculty Count */}
      <div>
        <label className="block text-sm font-medium text-ink mb-1">Faculty Count</label>
        <input
          type="number"
          placeholder="e.g. 15"
          className="w-48 px-3 py-2 border border-violet-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet"
          {...register('faculty_count', {
            setValueAs: (v: string) => (v === '' ? undefined : Number(v)),
          })}
        />
      </div>
    </div>
  )
}
