import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

// Zod schema
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  panCardNumber: z
    .string()
    .min(10, { message: 'PAN number must be 10 characters.' }),
})

export const PanVerification = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [date, setDate] = useState(null)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      panCardNumber: '',
    },
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    console.log('Form data:', data)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      alert('PAN Verified Successfully!')
    }, 2000)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 py-4">
        <button
          onClick={() => navigate('/wallet')}
          className="p-2 rounded-full transition-colors"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h2 className="text-2xl font-bold text-center">PAN Verification</h2>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 max-w-md mx-auto"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Name <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Name as in PAN card"
                    {...field}
                    required
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="panCardNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  PAN card Number <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="PAN NUMBER (10 Characters)"
                    {...field}
                    required
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-col justify-between gap-4">
            <span className="text-sm font-semibold">Select your DOB</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Verifying...' : 'Verify'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
