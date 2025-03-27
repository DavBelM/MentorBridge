"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface PendingMentor {
  id: number
  email: string
  fullname: string
  submittedForApprovalAt: string
}

export function MentorApprovalList() {
  const [mentors, setMentors] = useState<PendingMentor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const fetchPendingMentors = async () => {
    try {
      const response = await fetch("/api/admin/mentor-approval")
      if (!response.ok) throw new Error("Failed to fetch pending mentors")
      const data = await response.json()
      setMentors(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch pending mentors",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPendingMentors()
  }, [])

  const handleApproval = async (mentorId: number, action: "approve" | "reject") => {
    try {
      const response = await fetch("/api/admin/mentor-approval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentorId, action }),
      })

      if (!response.ok) throw new Error(`Failed to ${action} mentor`)

      toast({
        title: "Success",
        description: `Mentor ${action}d successfully`,
      })

      fetchPendingMentors()
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} mentor`,
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (mentors.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No pending mentor approvals
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Submitted At</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {mentors.map((mentor) => (
          <TableRow key={mentor.id}>
            <TableCell>{mentor.fullname}</TableCell>
            <TableCell>{mentor.email}</TableCell>
            <TableCell>
              {new Date(mentor.submittedForApprovalAt).toLocaleDateString()}
            </TableCell>
            <TableCell className="space-x-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => handleApproval(mentor.id, "approve")}
              >
                Approve
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleApproval(mentor.id, "reject")}
              >
                Reject
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
} 