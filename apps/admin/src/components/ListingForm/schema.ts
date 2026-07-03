import { z } from 'zod'

const phoneRegex = /^[+]?[0-9]{10,13}$/

const commonFields = {
  name: z.string().min(1, 'Name is required'),
  city_id: z.string().uuid('Select a city'),
  area: z.string().min(1, 'Area is required'),
  address: z.string().optional(),
  description: z.string().optional(),
  phone: z.string().regex(phoneRegex, 'Enter a valid Indian phone number'),
  whatsapp: z
    .string()
    .regex(phoneRegex, 'Enter a valid phone number')
    .optional()
    .or(z.literal('')),
  website: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  is_verified: z.boolean(),
  plan_tier: z.enum(['free', 'paid']),
  amenity_ids: z.array(z.string().uuid()),
}

const coachingSchema = z.object({
  type: z.literal('coaching'),
  ...commonFields,
  exam_types: z.array(z.string()).min(1, 'Select at least one exam type'),
  founded_year: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear())
    .optional()
    .or(z.nan().transform(() => undefined)),
  faculty_count: z
    .number()
    .int()
    .min(1)
    .optional()
    .or(z.nan().transform(() => undefined)),
})

const hostelSchema = z
  .object({
    type: z.literal('hostel'),
    ...commonFields,
    gender: z.enum(['male', 'female', 'co_ed']),
    rent_min: z.number().int().min(0),
    rent_max: z.number().int().min(0),
    room_types: z.array(z.string()),
    food_included: z.boolean(),
  })
  .refine((data) => data.rent_max >= data.rent_min, {
    message: 'Maximum rent must be ≥ minimum rent',
    path: ['rent_max'],
  })

export const listingSchema = z.discriminatedUnion('type', [
  coachingSchema,
  hostelSchema,
])

export type ListingFormData = z.infer<typeof listingSchema>
