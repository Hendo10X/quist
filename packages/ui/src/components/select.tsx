"use client"

import type * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { ArrowDown01Icon, Tick01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { cn } from "@workspace/ui/lib/utils"

const Select = SelectPrimitive.Root
const SelectValue = SelectPrimitive.Value

function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        "inline-flex h-8 items-center justify-between gap-2 rounded-md border border-border bg-transparent px-2.5 text-xs text-foreground transition-colors outline-none select-none hover:bg-muted/40 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 data-[popup-open]:bg-muted/40 dark:bg-input/30",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon className="text-muted-foreground">
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          className="size-3.5"
          strokeWidth={2}
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Popup>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        className="z-50 outline-none"
        side="bottom"
        sideOffset={4}
        alignItemWithTrigger={false}
      >
        <SelectPrimitive.Popup
          className={cn(
            "max-h-72 min-w-[var(--anchor-width)] origin-[var(--transform-origin)] overflow-y-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md transition-[transform,opacity] duration-150 outline-none data-[ending-style]:scale-[0.98] data-[ending-style]:opacity-0 data-[starting-style]:scale-[0.98] data-[starting-style]:opacity-0",
            className
          )}
          {...props}
        >
          {children}
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "flex cursor-default items-center justify-between gap-3 rounded-sm px-2 py-1.5 text-xs outline-none select-none data-[highlighted]:bg-muted data-[highlighted]:text-foreground",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="text-foreground">
        <HugeiconsIcon icon={Tick01Icon} className="size-3" strokeWidth={2} />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

export { Select, SelectValue, SelectTrigger, SelectContent, SelectItem }
