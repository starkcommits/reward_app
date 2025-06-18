import React, { useState } from 'react'

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'

import { Slider } from '@/components/ui/slider'
import { ArrowRight } from 'lucide-react'

const ExitHoldingsDialog = ({ position, handleExitPositions }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const [yesPrice, setYesPrice] = useState(position.yes_price)
  const [noPrice, setNoPrice] = useState(position.no_price)

  const [yesEnabled, setYesEnabled] = useState(false)
  const [noEnabled, setNoEnabled] = useState(false)

  return (
    <Drawer
      className="w-full"
      open={isDrawerOpen}
      onOpenChange={setIsDrawerOpen}
    >
      <DrawerTrigger asChild>
        <button
          className="flex gap-1 items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-xs font-medium">EXIT</span>
          <ArrowRight strokeWidth={1.5} className="h-4 w-4" />
        </button>
      </DrawerTrigger>
      <DrawerContent className="mx-auto w-full">
        <DrawerHeader className="flex items-center justify-center">
          <DrawerTitle className="w-full flex justify-center">
            Exit all positions in this particular market
          </DrawerTitle>
        </DrawerHeader>
        <div className="w-full flex flex-col gap-4">
          {position?.ACTIVE?.YES?.total_quantity ? (
            <div className="mb-6 px-10 flex items-center gap-1">
              <div className="flex items-center justify-center w-[20%]">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="yes-checkbox"
                    checked={yesEnabled}
                    onCheckedChange={setYesEnabled}
                  />
                  <label
                    htmlFor="yes-checkbox"
                    className="text-md font-medium cursor-pointer"
                  >
                    Yes Price
                  </label>
                </div>
              </div>
              {yesEnabled && (
                <div className="flex flex-col gap-2 w-[80%]">
                  <div className="flex items-center justify-between">
                    {/* <span className="text-lg font-medium">Yes Price</span> */}
                    <div className="flex items-center">
                      <span className="text-lg font-medium">₹{yesPrice}</span>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Slider
                      defaultValue={[1]}
                      max={9.5}
                      min={0.5}
                      step={0.5}
                      value={[yesPrice]}
                      className={``}
                      onValueChange={(values) => {
                        if (yesEnabled) setYesPrice(values[0])
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : null}
          {position?.ACTIVE?.NO?.total_quantity ? (
            <div className="mb-6 px-10 flex gap-1 items-center">
              <div className="flex items-center justify-center w-[20%]">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="no-checkbox"
                    checked={noEnabled}
                    onCheckedChange={setNoEnabled}
                  />
                  <label
                    htmlFor="no-checkbox"
                    className="text-md font-medium cursor-pointer"
                  >
                    No Price
                  </label>
                </div>
              </div>
              {noEnabled && (
                <div className="flex flex-col gap-2 w-[80%]">
                  <div className="flex items-center justify-between">
                    {/* <span className="text-lg font-medium">No Price</span> */}
                    <div className="flex items-center">
                      <span className="text-lg font-medium">₹{noPrice}</span>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Slider
                      defaultValue={[1]}
                      max={9.5}
                      min={0.5}
                      step={0.5}
                      value={[noPrice]}
                      className={``}
                      onValueChange={(values) => {
                        setNoPrice(values[0])
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
        <DrawerFooter className="w-full px-10 text-xs">
          <Button
            onClick={() => {
              handleExitPositions(
                yesPrice,
                noPrice,
                yesEnabled,
                noEnabled,
                setIsDrawerOpen
              )
            }}
          >
            Exit All Positions
          </Button>

          <DrawerClose className=" w-full">
            <Button variant="outline" className="w-full">
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default ExitHoldingsDialog
