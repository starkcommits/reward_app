import React from 'react'

import { CircleX } from 'lucide-react'

import { useFrappeUpdateDoc } from 'frappe-react-sdk'

import { toast } from 'react-hot-toast'
import { CirclePause } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { Button } from '@/components/ui/button'

import { CirclePlay } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useState } from 'react'

const CloseActionDialog = ({ market_id, onCloseAction }) => {
  const [closeDialogOpen, setCloseDialogOpen] = useState(false)

  const handleCloseMarket = async (market_id) => {
    await onCloseAction(market_id)
    setCloseDialogOpen(false)
  }

  return (
    <Dialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
      <DialogTrigger>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <CircleX className="w-6 h-6 cursor-pointer" strokeWidth={1.5} />
            </TooltipTrigger>
            <TooltipContent>
              <p>Close the market</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Close Market</DialogTitle>
          <DialogDescription>
            Are you sure you want to close this market? Once closed, it will be
            finalized and no further trades or changes will be allowed.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setCloseDialogOpen(false)
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleCloseMarket(market_id)
            }}
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CloseActionDialog
