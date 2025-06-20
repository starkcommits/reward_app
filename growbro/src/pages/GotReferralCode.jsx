import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button' // Ensure you have this
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useFrappePostCall, useFrappeAuth } from 'frappe-react-sdk'

// Schema
const formSchema = z.object({
  gotReferralCode: z
    .string()
    .min(2, { message: 'Referral code must be at least 2 characters.' }),
})

const GotReferralCode = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const { call: checkReferral } = useFrappePostCall(
    'rewardapp.api.check_referral'
  )

  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      gotReferralCode: '',
    },
  })
  const { currentUser } = useFrappeAuth()
  const onSubmit = async (data) => {
    try {
      setIsLoading(true)
      const response = await checkReferral({
        referral_code: data.gotReferralCode,
        user_id: currentUser,
      })
      console.log(response?.message)
      if (response?.message?.status === 'success') {
        toast.success(response?.message?.message)
        navigate('/')
      }
    } catch (error) {
      const serverMessages = error._server_messages
      let errorMsg = 'Something went wrong'

      if (serverMessages) {
        try {
          const parsedMessages = JSON.parse(serverMessages)
          if (parsedMessages.length > 0) {
            const primaryMessage = JSON.parse(parsedMessages[0])?.message
            if (primaryMessage) errorMsg = primaryMessage
          }
        } catch (parseErr) {
          console.error('Error parsing _server_messages:', parseErr)
        }
      } else if (error.message) {
        errorMsg = error.message
      }

      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 justify-between">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 max-w-md mx-auto"
        >
          <div className="text-left">
            <h2 className="text-2xl font-semibold">Got a referral code</h2>
            <p className="text-sm font-normal mt-1">
              Get Instant bonus in your balance!
            </p>
          </div>

          <FormField
            control={form.control}
            name="gotReferralCode"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Enter your referral code"
                    {...field}
                    required
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-between items-center mt-4">
            <Button
              type="button"
              onClick={() => navigate('/')}
              disabled={isLoading}
            >
              Skip
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !form.formState.isValid}
              className={` 
                cursor-not-allowed" 
            `}
            >
              {isLoading ? 'Submitting...' : 'Continue'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default GotReferralCode
