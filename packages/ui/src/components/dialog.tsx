"use client"

import type * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

import { cn } from "@workspace/ui/lib/utils"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogClose = DialogPrimitive.Close
const DialogTitle = DialogPrimitive.Title
const DialogDescription = DialogPrimitive.Description

function DialogPopup({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Popup>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
      <DialogPrimitive.Popup
        className={cn(
          "fixed top-[15%] left-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg outline-none",
          "origin-top transition-all duration-200 ease-out data-[ending-style]:scale-[0.98] data-[ending-style]:opacity-0 data-[starting-style]:scale-[0.98] data-[starting-style]:opacity-0",
          className
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  )
}

export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogPopup,
  DialogTitle,
  DialogDescription,
}
