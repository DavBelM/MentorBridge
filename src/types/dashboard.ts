export interface DashboardStats {
  activeMentorships: number
  upcomingSessions: number
  totalHours: number
  pendingRequests: number
  learningProgress?: number // For mentees
  completedSessions?: number // For mentees
}

export interface DashboardData {
  stats: DashboardStats
  profiles: Array<{
    id: number
    user: {
      id: number
      fullname: string
      email: string
    }
    bio?: string | null
    profilePicture?: string | null
    skills?: string | null
    interests?: string | null
    availability?: string | null
  }>
  upcomingSessions: Array<{
    id: number
    title: string
    startTime: Date
    endTime: Date
    mentor: {
      fullname: string
      profilePicture?: string | null
    }
    mentee: {
      fullname: string
      profilePicture?: string | null
    }
  }>
}
