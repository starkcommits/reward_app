import React from 'react'

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

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

const PauseActionDialog = ({ market_id, onPauseAction }) => {
  const [pauseDialogOpen, setPauseDialogOpen] = React.useState(false)

  const handlePauseMarket = async (market_id) => {
    await onPauseAction(market_id)
    setPauseDialogOpen(false)
  }

  return (
    <Dialog open={pauseDialogOpen} onOpenChange={setPauseDialogOpen}>
      <DialogTrigger>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <CirclePause
                className="w-6 h-6 cursor-pointer"
                strokeWidth={1.5}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>Pause the market</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pause Market</DialogTitle>
          <DialogDescription>
            Are you sure you want to pause this market? While paused, users will
            not be able to trade or interact with it.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setPauseDialogOpen(false)
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              handlePauseMarket(market_id)
            }}
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default PauseActionDialog
