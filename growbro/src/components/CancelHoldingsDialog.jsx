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
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const CancelHoldingsDialog = ({ position, handleCancelOrders }) => {
  const [isCancelOpen, setIsCancelOpen] = useState(false)
  return (
    <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
      <DialogTrigger className="w-full">
        <button className="flex gap-1 items-center">
          <span>Cancel</span>
          <ArrowRight className="w-4 h-4" />
        </button>
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
            onClick={() => {
              handleCancelOrders(position.market_id, setIsCancelOpen)
            }}
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CancelHoldingsDialog
