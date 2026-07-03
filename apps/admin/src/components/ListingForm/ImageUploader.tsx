import { useState, useRef, useCallback, useEffect } from 'react'
import { Trash2, Star, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabase'
import type { Tables } from '../../types/database'

type ListingImage = Tables<'listing_images'>

interface ImageUploaderProps {
  listingId: string
  existingImages?: ListingImage[]
}

interface LocalImage {
  id: string
  previewUrl: string
  dbRow?: ListingImage
  uploading: boolean
  progress: number
  error?: string
  storagePath?: string
}

export function ImageUploader({ listingId, existingImages = [] }: ImageUploaderProps) {
  const [images, setImages] = useState<LocalImage[]>(() =>
    existingImages.map((img) => ({
      id: img.id,
      previewUrl: img.url,
      dbRow: img,
      uploading: false,
      progress: 100,
      storagePath: img.storage_path,
    })),
  )
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setImages(
      existingImages.map((img) => ({
        id: img.id,
        previewUrl: img.url,
        dbRow: img,
        uploading: false,
        progress: 100,
        storagePath: img.storage_path,
      })),
    )
  }, [existingImages])

  const uploadFile = useCallback(
    async (file: File) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is over 5 MB and was skipped.`)
        return
      }

      const ext = file.name.split('.').pop() ?? 'jpg'
      const fileName = `${crypto.randomUUID()}.${ext}`
      const storagePath = `${listingId}/${fileName}`
      const localId = crypto.randomUUID()
      const previewUrl = URL.createObjectURL(file)

      setImages((prev) => [
        ...prev,
        { id: localId, previewUrl, uploading: true, progress: 0, storagePath },
      ])

      try {
        const { error: uploadError } = await supabase.storage
          .from('listing-images')
          .upload(storagePath, file, { upsert: false })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('listing-images')
          .getPublicUrl(storagePath)

        const sortOrder = images.length
        const { data: imgRow, error: insertError } = await supabase
          .from('listing_images')
          .insert({
            listing_id: listingId,
            url: publicUrl,
            storage_path: storagePath,
            is_primary: false,
            sort_order: sortOrder,
          })
          .select()
          .single()

        if (insertError) throw insertError

        setImages((prev) =>
          prev.map((img) =>
            img.id === localId
              ? {
                  ...img,
                  id: imgRow.id,
                  previewUrl: publicUrl,
                  dbRow: imgRow,
                  uploading: false,
                  progress: 100,
                }
              : img,
          ),
        )
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Upload failed'
        setImages((prev) =>
          prev.map((img) =>
            img.id === localId
              ? { ...img, uploading: false, error: msg }
              : img,
          ),
        )
        toast.error(`Upload failed for ${file.name}: ${msg}`)
      }
    },
    [listingId, images.length],
  )

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return
      Array.from(files).forEach((f) => uploadFile(f))
    },
    [uploadFile],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles],
  )

  const setPrimary = useCallback(
    async (targetId: string) => {
      const target = images.find((img) => img.id === targetId)
      if (!target?.dbRow) return

      try {
        // First unset all primaries for this listing
        const { error: unsetError } = await supabase
          .from('listing_images')
          .update({ is_primary: false })
          .eq('listing_id', listingId)

        if (unsetError) throw unsetError

        // Then set the selected one
        const { error: setError } = await supabase
          .from('listing_images')
          .update({ is_primary: true })
          .eq('id', targetId)

        if (setError) throw setError

        setImages((prev) =>
          prev.map((img) => ({
            ...img,
            dbRow: img.dbRow
              ? { ...img.dbRow, is_primary: img.id === targetId }
              : img.dbRow,
          })),
        )

        toast.success('Primary image updated')
      } catch (err) {
        toast.error(
          `Failed to set primary: ${err instanceof Error ? err.message : String(err)}`,
        )
      }
    },
    [images, listingId],
  )

  const deleteImage = useCallback(
    async (localId: string) => {
      const img = images.find((i) => i.id === localId)
      if (!img) return

      try {
        if (img.storagePath) {
          const { error: storageErr } = await supabase.storage
            .from('listing-images')
            .remove([img.storagePath])
          if (storageErr) throw storageErr
        }

        if (img.dbRow) {
          const { error: dbErr } = await supabase
            .from('listing_images')
            .delete()
            .eq('id', img.dbRow.id)
          if (dbErr) throw dbErr
        }

        URL.revokeObjectURL(img.previewUrl)
        setImages((prev) => prev.filter((i) => i.id !== localId))
        toast.success('Image deleted')
      } catch (err) {
        toast.error(
          `Failed to delete: ${err instanceof Error ? err.message : String(err)}`,
        )
      }
    },
    [images],
  )

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-ink">Images</label>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={[
          'border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer',
          dragging
            ? 'border-violet bg-violet-surface'
            : 'border-violet-border hover:border-violet',
        ].join(' ')}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="mx-auto text-muted mb-2" size={28} />
        <p className="text-sm text-muted">
          Drag &amp; drop images here, or{' '}
          <span className="text-violet font-medium">browse</span>
        </p>
        <p className="text-xs text-muted mt-1">JPEG, PNG, WebP — max 5 MB each</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Thumbnails */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {images.map((img) => (
            <div key={img.id} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border border-violet-border bg-violet-surface">
                <img
                  src={img.previewUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
                {img.uploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="text-white text-xs">{img.progress}%</div>
                  </div>
                )}
                {img.error && (
                  <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center">
                    <span className="text-red-700 text-xs text-center px-1">{img.error}</span>
                  </div>
                )}
              </div>

              {/* Controls */}
              {!img.uploading && !img.error && (
                <div className="flex items-center justify-between mt-1 px-0.5">
                  <button
                    type="button"
                    onClick={() => setPrimary(img.id)}
                    title="Set as primary"
                    className={[
                      'p-1 rounded transition-colors',
                      img.dbRow?.is_primary
                        ? 'text-star'
                        : 'text-muted hover:text-star',
                    ].join(' ')}
                  >
                    <Star
                      size={14}
                      fill={img.dbRow?.is_primary ? 'currentColor' : 'none'}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteImage(img.id)}
                    title="Delete image"
                    className="p-1 rounded text-muted hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
