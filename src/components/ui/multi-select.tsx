"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Command, CommandGroup, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export type Option = {
  label: string
  value: any
}

interface MultiSelectProps {
  options: Option[]
  selected: any[]
  onChange: (selected: any[]) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options",
  className,
  disabled = false,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleUnselect = (value: any) => {
    onChange(selected.filter((item) => item !== value))
  }

  return (
    <Popover open={open && !disabled} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          <div className="flex flex-wrap gap-1 truncate">
            {selected.length === 0 && placeholder}
            {selected.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selected.map((value) => {
                  const option = options.find((o) => o.value === value)
                  return option ? (
                    <Badge
                      key={option.value}
                      variant="secondary"
                      className="mr-1 mb-1"
                    >
                      {option.label}
                      <button
                        className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            e.stopPropagation()
                            handleUnselect(option.value)
                          }
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        onClick={() => handleUnselect(option.value)}
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove {option.label}</span>
                      </button>
                    </Badge>
                  ) : null
                })}
              </div>
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command className="max-h-60 overflow-y-auto">
          <CommandGroup>
            {options.map((option) => {
              const isSelected = selected.includes(option.value)
              return (
                <CommandItem
                  key={option.value}
                  onSelect={() => {
                    if (selected.includes(option.value)) {
                      onChange(selected.filter((item) => item !== option.value))
                    } else {
                      onChange([...selected, option.value])
                    }
                    setOpen(true)
                  }}
                  className={cn(
                    "flex items-center gap-2",
                    isSelected ? "bg-accent" : ""
                  )}
                >
                  <div
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                  >
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span>{option.label}</span>
                </CommandItem>
              )
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}