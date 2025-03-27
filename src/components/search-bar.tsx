"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useRouter } from "next/navigation"

interface SearchResult {
  id: string
  name: string
  type: "mentor" | "mentee"
  description?: string
}

interface SearchBarProps {
  placeholder?: string
  onSearch?: (query: string) => void
  role: "mentor" | "mentee"
}

export function SearchBar({ placeholder, onSearch, role }: SearchBarProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const router = useRouter()

  const handleSearch = async (value: string) => {
    setQuery(value)
    if (!value) {
      setResults([])
      return
    }

    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/search?q=${value}&role=${role}`)
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("Search error:", error)
    }
  }

  const handleSelect = (result: SearchResult) => {
    setOpen(false)
    setQuery("")
    setResults([])
    
    if (role === "mentor") {
      router.push(`/dashboard/mentor/mentees/${result.id}`)
    } else {
      router.push(`/dashboard/mentee/mentors/${result.id}`)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-start"
        >
          <Search className="mr-2 h-4 w-4" />
          {query || placeholder || "Search..."}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput
            placeholder={placeholder || "Search..."}
            value={query}
            onValueChange={handleSearch}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              {results.map((result) => (
                <CommandItem
                  key={result.id}
                  value={result.name}
                  onSelect={() => handleSelect(result)}
                >
                  <div className="flex flex-col">
                    <span>{result.name}</span>
                    {result.description && (
                      <span className="text-sm text-muted-foreground">
                        {result.description}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 