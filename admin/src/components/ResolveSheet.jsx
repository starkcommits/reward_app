import React from 'react'

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { CircleCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useState } from 'react'
import { Check } from 'lucide-react'

const ResolveSheet = ({ market_id, onResolveAction }) => {
  const [selectedValue, setSelectedValue] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  async function onSubmit() {
    console.log('Selected outcome:', selectedValue)
    await onResolveAction(selectedValue, market_id)
  }

  return (
    // <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
    //   <SheetTrigger asChild>
    //     <button>
    //       <TooltipProvider>
    //         <Tooltip>
    //           <TooltipTrigger>
    //             <CircleCheck
    //               className="w-6 h-6 cursor-pointer"
    //               strokeWidth={1.5}
    //             />
    //           </TooltipTrigger>
    //           <TooltipContent>
    //             <p>Resolve the market</p>
    //           </TooltipContent>
    //         </Tooltip>
    //       </TooltipProvider>
    //     </button>
    //   </SheetTrigger>
    //   <SheetContent className="h-screen flex flex-col justify-center">
    //     <SheetHeader>
    //       <SheetTitle>Resolve Market</SheetTitle>
    //       <SheetDescription>
    //         Please select the outcome to resolve this market. This action is
    //         final and will affect all participant results.
    //       </SheetDescription>
    //     </SheetHeader>

    //     <Form {...form}>
    //       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
    //         <FormField
    //           control={form.control}
    //           name="outcome"
    //           render={({ field }) => (
    //             <FormItem>
    //               <div className="flex flex-col gap-2 w-full">
    //                 <div>
    //                   <FormLabel>End Result</FormLabel>
    //                 </div>
    //                 <div className="">
    //                   <Select
    //                     onValueChange={(value) => {
    //                       field.onChange(value)
    //                     }}
    //                     value={field.value}
    //                     className="w-[180px]"
    //                   >
    //                     <FormControl>
    //                       <SelectTrigger>
    //                         <SelectValue placeholder="Select the outcome" />
    //                       </SelectTrigger>
    //                     </FormControl>

    //                     <SelectContent>
    //                       <SelectItem value="YES">YES</SelectItem>
    //                       <SelectItem value="NO">NO</SelectItem>
    //                     </SelectContent>
    //                   </Select>
    //                 </div>
    //               </div>
    //               <FormMessage />
    //             </FormItem>
    //           )}
    //         />

    //         <SheetFooter>
    //           <Button
    //             variant="outline"
    //             onClick={() => {
    //               form.reset()
    //               setSheetOpen(false)
    //             }}
    //           >
    //             Cancel
    //           </Button>

    //           <Button type="submit">Resolve</Button>
    //         </SheetFooter>
    //       </form>
    //     </Form>
    //   </SheetContent>
    // </Sheet>

    <div className="flex items-center gap-2">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger>
          <Button>Resolve Market</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Resolve Market</DialogTitle>
            <DialogDescription className="w-full">
              {`Are you sure you want to resolve the market:
              ${market_id}`}
            </DialogDescription>
          </DialogHeader>

          <div className="">
            <RadioGroup
              value={selectedValue}
              onValueChange={(value) => setSelectedValue(value)}
              className="flex flex-col gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="YES" id="YES" />
                <Label htmlFor="YES" className="font-medium cursor-pointer">
                  YES
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="NO" id="NO" />
                <Label htmlFor="NO" className="font-medium cursor-pointer">
                  NO
                </Label>
              </div>
            </RadioGroup>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false)
                setSelectedValue(null)
              }}
            >
              Cancel
            </Button>
            <Button onClick={onSubmit} disabled={!selectedValue}>
              Confirm Resolution
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ResolveSheet
