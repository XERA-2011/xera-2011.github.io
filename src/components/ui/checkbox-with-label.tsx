"use client"

import * as React from "react"
import { Checkbox } from "./checkbox"
import { Label } from "./label"

interface CheckboxWithLabelProps {
  id?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label: string
  className?: string
}

export function CheckboxWithLabel({
  id,
  checked,
  onCheckedChange,
  label,
  className,
}: CheckboxWithLabelProps) {
  const generatedId = React.useId()
  const checkboxId = id || generatedId

  return (
    <div className={className}>
      <Label
        htmlFor={checkboxId}
        className="flex items-center space-x-2 cursor-pointer"
      >
        <Checkbox
          id={checkboxId}
          checked={checked}
          onCheckedChange={onCheckedChange}
        />
        <span className="text-sm text-foreground">{label}</span>
      </Label>
    </div>
  )
}
