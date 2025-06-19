import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import * as z from 'zod'
import {
  useFrappeUpdateDoc,
  useFrappeAuth,
  useFrappeFileUpload,
} from 'frappe-react-sdk'
import { ArrowLeft, Upload, X } from 'lucide-react'
import {
  Form,
  FormControl,
  //   FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const formSchema = z.object({
  username: z
    .string()
    .min(2, { message: 'Username must be at least 2 characters.' }),

  firstName: z
    .string()
    .min(2, { message: 'First name must be at least 2 characters.' }),

  lastName: z
    .string()
    .min(2, { message: 'Last name must be at least 2 characters.' }),

  email: z.string().email({ message: 'Please enter a valid email address.' }),

  bio: z.string().optional(),
})

function EditProfile() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      firstName: '',
      lastName: '',
      email: '',
      bio: '',
    },
  })
  const { updateDoc } = useFrappeUpdateDoc()
  const { upload } = useFrappeFileUpload()
  const { currentUser } = useFrappeAuth()
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data) => {
    try {
      setIsLoading(true)
      const payload = {
        username: data.username,
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        bio: data.bio,
      }
      if (imageFile) {
        await upload(imageFile, {
          isPrivate: 1,
        }).then((res) => {
          updateDoc('User', currentUser, {
            ...payload,
            user_image: res.file_url,
          })
        })
      } else {
        await updateDoc('User', currentUser, {
          ...payload,
        })
      }
      toast.success('Profile updated successfully')
    } catch (err) {
      console.error(err)
      toast.error('Error updating profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 py-4">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-full transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
        </div>
        <h2 className="text-2xl font-bold text-center">Edit Profile</h2>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 max-w-md mx-auto"
        >
          {/* Profile Image Upload */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg
                  className="w-16 h-16 text-gray-300"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              )}
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="profile-image"
                className="cursor-pointer flex items-center gap-1 px-3 py-2 rounded-md text-sm bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <Upload className="h-4 w-4" />
                {imageFile ? 'Change Image' : 'Upload Image'}
              </label>
              <input
                id="profile-image"
                name="profile-image"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleImageChange}
              />

              {imagePreview && (
                <button
                  type="button"
                  onClick={(data) => {
                    setImageFile(null)
                    setImagePreview(data.user_image || null)
                  }}
                  className="flex items-center gap-1 px-3 py-2 rounded-md text-sm text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  <X className="h-4 w-4" />
                  Remove
                </button>
              )}
            </div>
          </div>

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Username <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your username"
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
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  First Name <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter your first name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Last Name <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter your last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Email <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us about yourself"
                    className="resize-none"
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Profile'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
export default EditProfile
