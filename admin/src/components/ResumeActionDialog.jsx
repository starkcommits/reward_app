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

const ResumeActionDialog = ({ market_id, onResumeAction }) => {
  const [resumeDialogOpen, setResumeDialogOpen] = React.useState(false)

  const handleResumeMarket = async (market_id) => {
    await onResumeAction(market_id)
    setResumeDialogOpen(false)
  }

  return (
    <Dialog open={resumeDialogOpen} onOpenChange={setResumeDialogOpen}>
      <DialogTrigger>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <CirclePlay
                className="w-6 h-6 cursor-pointer"
                strokeWidth={1.5}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>Resume the market</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resume Market</DialogTitle>
          <DialogDescription>
            Do you want to resume this market? Once resumed, users will be able
            to view and trade on it again.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setResumeDialogOpen(false)
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleResumeMarket(market_id)
            }}
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ResumeActionDialog
