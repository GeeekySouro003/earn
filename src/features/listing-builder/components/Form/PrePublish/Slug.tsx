import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/components/ui/multi-select";
import { isDuplicatingAtom, isEditingAtom, listingIdAtom } from "@/features/listing-builder/atoms";
import { useListingForm } from "@/features/listing-builder/hooks";
import { slugCheckQuery } from "@/features/listing-builder/queries/slug-check";
import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useWatch } from "react-hook-form";
import slugify from "slugify";

export function Slug() {
  const form = useListingForm()
  const isEditing = useAtomValue(isEditingAtom)
  const isDuplicating = useAtomValue(isDuplicatingAtom)

  const [isValidated, setIsValidated] = useState(false);

  const title = useWatch({
    control: form.control,
    name: 'title'
  })
  const slug = useWatch({
    control: form.control,
    name: 'slug'
  })

  const debouncedTitle = useDebounce(title)
  const slugifiedTitle = useMemo(() => {
    return slugify(title, {
      lower: true,
      strict: true,
    });
  }, [debouncedTitle])


  const {data: generatedSlugValidated, isFetching: generatedSlugFetching} = useQuery({
    ...slugCheckQuery({slug: slugifiedTitle, check: false}),
    enabled: !!(((!!title && !isEditing) || (!!title && isDuplicating))),
    retry: false
  })

  useEffect(() =>{
    if(generatedSlugValidated?.data.slug){
      console.log('is this running?')
      form.setValue('slug',generatedSlugValidated.data.slug, {
        shouldValidate: true,
        shouldDirty: true
      })
    }
  },[generatedSlugValidated])

  const debouncedSlug = useDebounce(slug)
  const listingId = useAtomValue(listingIdAtom)
  const {isError: isSlugCheckError, isFetching: slugCheckFetching} = useQuery({
    ...slugCheckQuery({slug: debouncedSlug, check: true, id: listingId }),
    enabled: isValidated && !!(!isEditing || isDuplicating) && !!debouncedSlug,
    retry: false,
  })

  useEffect(() => {
    if(isSlugCheckError) {
      if(slug === '') return
      form.setError('slug',{
        message:'Slug already exists. Please try another.',
        type: 'manual',
      })
    }
  },[isSlugCheckError, debouncedSlug])

  useEffect(() => {
    async function validateSlug() {
      setIsValidated(false);
      const validated = await form.trigger('slug')
      setIsValidated(validated)
    }
    validateSlug()
  }, [slug]);
  return (
    <FormField
      control={form.control}
      name='slug'
      render={({field}) => {
        return (
          <FormItem>
            <FormLabel className='text-slate-500 font-semibold'>Customise URL (Slug)</FormLabel>
            <FormControl>
              <div className="relative">
                <Input {...field} 
                  placeholder='write-a-twitter-thread-on-Solana'
                  disabled={isEditing || generatedSlugFetching}
                  onBlur={() => null}
                />
                {slugCheckFetching || generatedSlugFetching &&(
                  <Loader2 className="absolute right-2 top-1.5 text-slate-300 animate-spin" />
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}
