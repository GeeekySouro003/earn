import { FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useListingForm } from "../../../hooks";
import { CompensationType } from "@prisma/client";

const paymentTypes: {value: CompensationType, label: string}[] = [
  { value: CompensationType.fixed, label: "Fixed" },
  { value: CompensationType.range, label: "Range"  },
  { value: CompensationType.variable, label: "Variable"  },
];

const descriptionByType = (type: CompensationType) => {
  switch (type) {
    case CompensationType.fixed: return 'A fixed rate decided by you'
    case CompensationType.range: return 'Applicants will quote you within a range'
    case CompensationType.variable: return 'Applicants will quote you any amount'
  }
}

export function PaymentType() {
  const form = useListingForm()
  return (
    <FormField
      name='compensationType'
      control={form.control}
      render={({field}) => {
        return (
          <FormItem className='flex justify-between items-center'>
            <div className="text-xs text-slate-400">
              <FormLabel className='text-slate-500 font-semibold'>Payment Type</FormLabel>
              <FormDescription>
                {descriptionByType(field.value)}
              </FormDescription>
            </div>
            <FormControl className='flex items-center'>
              <Select onValueChange={
                (e) => {
                  field.onChange(e)
                  if(e !== 'fixed') {
                    form.setValue('rewardAmount',undefined)
                  }
                }
                } value={field.value} >
                <SelectTrigger className=' w-32 text-slate-500'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentTypes.map(({ value, label  }) => (
                    <SelectItem key={value} value={value} className="text-xs text-slate-500">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
          </FormItem>
        )
      }}
    />
  )
}
