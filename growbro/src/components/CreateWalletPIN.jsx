import React, { useState } from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useFrappeCreateDoc, useFrappeUpdateDoc } from 'frappe-react-sdk'
import { TabletSmartphone } from 'lucide-react'
import toast from 'react-hot-toast'

const formSchema = z.object({
  pin: z.string().min(4, {
    message: 'OTP must be 4 characters.',
  }),
  confirm_pin: z.string().min(4, {
    message: 'OTP must be 4 characters.',
  }),
})

const CreateWalletPIN = ({ userWalletData }) => {
  const [step, setStep] = useState(1)
  const [open, setOpen] = useState(false)

  const { updateDoc } = useFrappeUpdateDoc()

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pin: '',
      confirm_pin: '',
    },
  })

  async function onSubmit(data) {
    try {
      if (data.pin !== data.confirm_pin) {
        form.setError('confirm_pin', {
          type: 'manual',
          message: 'PIN do not match!',
        })
        return
      }
      await updateDoc('User Wallet', currentUser, {
        pin: data.confirm_pin,
      })
      toast.success('Wallet PIN has been successfully created!')
    } catch (err) {
      console.log(err)
      toast.error('Error in creating Wallet PIN.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="w-full">
        <Button className="bg-secondary w-full hover:bg-secondary/90">
          Create Your Wallet PIN
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          {step === 1 && <DialogTitle>Enter your 4-digit PIN.</DialogTitle>}
          {step === 2 && (
            <DialogTitle>Re-enter the PIN to confirm.</DialogTitle>
          )}
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* PIN Field */}
            {step === 1 && (
              <FormField
                control={form.control}
                name="pin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enter PIN</FormLabel>
                    <FormControl>
                      <InputOTP maxLength={4} {...field}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {step === 2 && (
              <FormField
                control={form.control}
                name="confirm_pin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm PIN</FormLabel>
                    <FormControl>
                      <InputOTP maxLength={4} {...field}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </form>
        </Form>
        <DialogFooter>
          {step === 1 && (
            <Button
              type="button"
              className="bg-secondary hover:bg-secondary/90"
              onClick={() => {
                setStep(2)
              }}
            >
              Submit
            </Button>
          )}
          {step === 2 && (
            <Button
              type="submit"
              className="bg-secondary hover:bg-secondary/90"
            >
              Confirm
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreateWalletPIN
