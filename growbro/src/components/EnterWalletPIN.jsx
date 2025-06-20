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
import {
  useFrappeAuth,
  useFrappeCreateDoc,
  useFrappeEventListener,
  useFrappeUpdateDoc,
} from 'frappe-react-sdk'
import toast from 'react-hot-toast'

const formSchema = z.object({
  pin: z.string().min(4, {
    message: 'OTP must be 4 characters.',
  }),
})

const EnterWalletPIN = ({
  amount,
  refetchWalletData,
  userWalletData,
  setAmount,
}) => {
  const { updateDoc } = useFrappeUpdateDoc()
  const { createDoc } = useFrappeCreateDoc()
  const { currentUser } = useFrappeAuth()
  const [open, setOpen] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pin: '',
    },
  })

  async function onSubmit(data) {
    try {
      if (data.pin !== String(userWalletData.pin)) {
        form.setError('pin', {
          type: 'manual',
          message: 'Invalid PIN!',
        })
        return
      }

      await updateDoc('User Wallet', currentUser, {
        balance: userWalletData.balance + parseFloat(amount),
      })
      await createDoc('Transaction Logs', {
        user: currentUser,
        transaction_amount: amount,
        transaction_type: 'RECHARGE',
        transaction_status: 'Success',
        transaction_method: 'UPI',
      })
      toast.success(`${amount} added to your wallet.`, {
        top: 0,
        right: 0,
      })

      form.reset()
      setAmount(0)
      refetchWalletData()
      setOpen(false)
    } catch (err) {
      console.log(err)
      toast.error('Failed to add money in the wallet.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="w-full">
        <Button
          className="bg-secondary w-full hover:bg-secondary/90"
          disabled={!amount}
        >
          Add Money
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter Your 4 digit PIN</DialogTitle>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="pin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel></FormLabel>
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
              <DialogFooter>
                <Button
                  type="submit"
                  className="bg-secondary hover:bg-secondary/90"
                >
                  Submit
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

export default EnterWalletPIN
