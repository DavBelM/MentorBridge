"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Filter } from "lucide-react"

export function MentorSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [industry, setIndustry] = useState("")
  const [expertise, setExpertise] = useState("")
  const [location, setLocation] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would trigger a search API call
    console.log({ searchQuery, industry, expertise, location })
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, skills, or keywords"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4 md:w-3/5">
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger>
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="creative">Creative Arts</SelectItem>
                </SelectContent>
              </Select>

              <Select value={expertise} onValueChange={setExpertise}>
                <SelectTrigger>
                  <SelectValue placeholder="Expertise" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="software-development">Software Development</SelectItem>
                  <SelectItem value="data-science">Data Science</SelectItem>
                  <SelectItem value="product-management">Product Management</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="leadership">Leadership</SelectItem>
                </SelectContent>
              </Select>

              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nairobi">Nairobi, Kenya</SelectItem>
                  <SelectItem value="lagos">Lagos, Nigeria</SelectItem>
                  <SelectItem value="accra">Accra, Ghana</SelectItem>
                  <SelectItem value="johannesburg">Johannesburg, South Africa</SelectItem>
                  <SelectItem value="cairo">Cairo, Egypt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="md:w-auto">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

