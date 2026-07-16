import { useState } from 'react'
import { useFormContext } from 'react-hook-form'

interface StringArrayInputProps {
  name: string
  label: string
  placeholder?: string
}

export function StringArrayInput({ name, label, placeholder = 'Add item...' }: StringArrayInputProps) {
  const { watch, setValue, formState: { errors } } = useFormContext()
  const [text, setText] = useState('')

  const items: string[] = watch(name) ?? []

  function addItem() {
    const trimmed = text.trim()
    if (!trimmed) return
    if (!items.includes(trimmed)) {
      setValue(name, [...items, trimmed], { shouldValidate: true })
    }
    setText('')
  }

  function removeItem(value: string) {
    setValue(
      name,
      items.filter((v) => v !== value),
      { shouldValidate: true },
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const error = (errors as any)[name]?.message

  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-2">
        {label}
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {items.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm bg-violet text-white"
          >
            {item}
            <button
              type="button"
              onClick={() => removeItem(item)}
              className="ml-1 hover:text-violet-light"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border border-violet-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addItem()
            }
          }}
        />
        <button
          type="button"
          onClick={addItem}
          className="px-4 py-2 bg-violet text-white rounded-lg text-sm hover:bg-violet/90"
        >
          Add
        </button>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error as string}</p>}
    </div>
  )
}
