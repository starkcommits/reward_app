import { CircleX } from 'lucide-react'
import React, { useState } from 'react'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const CancelHoldingDialog = ({ position, handleCancelOrder }) => {
  const [isCancelOpen, setIsCancelOpen] = useState(false)

  return (
    <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
      <DialogTrigger className="w-full">
        <span className="bg-emerald-100 text-emerald-700 rounded-xl p-1 text-xs text-[0.7rem] font-medium flex gap-1">
          {position.status}
          <Separator orientation="vertical" className="w-0.5 h-full" />

          <CircleX className="w-4 h-4" />
        </span>
      </DialogTrigger>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            className="bg-white hover:bg-white/90"
            variant="outline"
            onClick={() => setIsCancelOpen(false)}
          >
            Cancel
          </Button>
          <Button
            className="bg-neutral-900 text-white hover:text-neutral-800 hover:bg-neutral-800/40"
            onClick={() =>
              handleCancelOrder(
                position.order_id,
                position.name,
                position.filled_quantity,
                position.quantity
              )
            }
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CancelHoldingDialog
