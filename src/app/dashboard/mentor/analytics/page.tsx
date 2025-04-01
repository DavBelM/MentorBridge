"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart, 
  LineChart,
  PieChart,
  Users, 
  Clock, 
  Calendar, 
  TrendingUp, 
  Award,
  Target,
  CheckCircle2,
  Star,
  Download,
  Coffee
} from "lucide-react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line, Bar, Pie } from 'react-chartjs-2'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

// Types for analytics data
interface MentorStats {
  totalMentees: number
  activeMentees: number
  totalSessions: number
  completedSessions: number
  upcomingSessions: number
  totalHours: number
  averageSessionRating: number
  totalGoalsSet: number
  goalsCompleted: number
}

interface TimeData {
  period: string
  sessionsCount: number
  hoursSpent: number
  menteeCount: number
}

interface FeedbackData {
  rating: number
  count: number
}

interface CategoryTimeData {
  category: string
  hours: number
  percentage: number
}

interface GoalCategoryData {
  category: string
  count: number
  completedCount: number
}

export default function MentorAnalyticsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("last30days")
  const [stats, setStats] = useState<MentorStats>({
    totalMentees: 0,
    activeMentees: 0,
    totalSessions: 0,
    completedSessions: 0,
    upcomingSessions: 0,
    totalHours: 0,
    averageSessionRating: 0,
    totalGoalsSet: 0,
    goalsCompleted: 0
  })
  const [timeData, setTimeData] = useState<TimeData[]>([])
  const [feedbackData, setFeedbackData] = useState<FeedbackData[]>([])
  const [categoryTimeData, setCategoryTimeData] = useState<CategoryTimeData[]>([])
  const [goalCategoryData, setGoalCategoryData] = useState<GoalCategoryData[]>([])
  
  // Fetch analytics data
  useEffect(() => {
    async function fetchAnalyticsData() {
      setIsLoading(true)
      try {
        // In a real application, you would fetch this data from your API
        // For this example, we'll use mock data
        
        // Mock stats
        setStats({
          totalMentees: 12,
          activeMentees: 8,
          totalSessions: 47,
          completedSessions: 42,
          upcomingSessions: 5,
          totalHours: 63,
          averageSessionRating: 4.7,
          totalGoalsSet: 36,
          goalsCompleted: 24
        })
        
        // Mock time series data
        const mockTimeData = [
          { period: "Week 1", sessionsCount: 3, hoursSpent: 4.5, menteeCount: 3 },
          { period: "Week 2", sessionsCount: 5, hoursSpent: 7.5, menteeCount: 4 },
          { period: "Week 3", sessionsCount: 4, hoursSpent: 6, menteeCount: 5 },
          { period: "Week 4", sessionsCount: 6, hoursSpent: 9, menteeCount: 6 },
          { period: "Week 5", sessionsCount: 5, hoursSpent: 7.5, menteeCount: 7 },
          { period: "Week 6", sessionsCount: 7, hoursSpent: 10.5, menteeCount: 8 },
          { period: "Week 7", sessionsCount: 6, hoursSpent: 9, menteeCount: 8 },
          { period: "Week 8", sessionsCount: 8, hoursSpent: 12, menteeCount: 9 },
        ]
        setTimeData(mockTimeData)
        
        // Mock feedback data
        setFeedbackData([
          { rating: 5, count: 28 },
          { rating: 4, count: 12 },
          { rating: 3, count: 5 },
          { rating: 2, count: 1 },
          { rating: 1, count: 0 },
        ])
        
        // Mock category time data
        setCategoryTimeData([
          { category: "Technical Guidance", hours: 25, percentage: 40 },
          { category: "Career Advice", hours: 15, percentage: 24 },
          { category: "Code Reviews", hours: 12, percentage: 19 },
          { category: "Project Planning", hours: 8, percentage: 13 },
          { category: "Other", hours: 3, percentage: 4 },
        ])
        
        // Mock goal category data
        setGoalCategoryData([
          { category: "Technical Skills", count: 18, completedCount: 12 },
          { category: "Soft Skills", count: 8, completedCount: 6 },
          { category: "Career Development", count: 6, completedCount: 4 },
          { category: "Personal Growth", count: 4, completedCount: 2 },
        ])
        
      } catch (error) {
        console.error("Error fetching analytics data:", error)
        toast({
          title: "Error",
          description: "Failed to load analytics data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchAnalyticsData()
  }, [timeRange, toast])
  
  // Chart data for sessions over time
  const sessionsChartData = {
    labels: timeData.map(item => item.period),
    datasets: [
      {
        label: 'Sessions',
        data: timeData.map(item => item.sessionsCount),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        tension: 0.2,
      },
    ],
  }
  
  // Chart data for hours spent
  const hoursChartData = {
    labels: timeData.map(item => item.period),
    datasets: [
      {
        label: 'Hours',
        data: timeData.map(item => item.hoursSpent),
        borderColor: 'rgb(14, 165, 233)',
        backgroundColor: 'rgba(14, 165, 233, 0.5)',
        tension: 0.2,
      },
    ],
  }
  
  // Chart data for mentee growth
  const menteeChartData = {
    labels: timeData.map(item => item.period),
    datasets: [
      {
        label: 'Mentees',
        data: timeData.map(item => item.menteeCount),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        tension: 0.2,
      },
    ],
  }
  
  // Chart data for session categories
  const categoryChartData = {
    labels: categoryTimeData.map(item => item.category),
    datasets: [
      {
        label: 'Hours',
        data: categoryTimeData.map(item => item.hours),
        backgroundColor: [
          'rgba(99, 102, 241, 0.6)',
          'rgba(14, 165, 233, 0.6)',
          'rgba(34, 197, 94, 0.6)',
          'rgba(249, 115, 22, 0.6)',
          'rgba(156, 163, 175, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  }
  
  // Chart data for feedback ratings
  const feedbackChartData = {
    labels: ['5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'],
    datasets: [
      {
        label: 'Feedback Count',
        data: feedbackData.map(item => item.count),
        backgroundColor: [
          'rgba(34, 197, 94, 0.6)',
          'rgba(99, 102, 241, 0.6)',
          'rgba(250, 204, 21, 0.6)',
          'rgba(249, 115, 22, 0.6)',
          'rgba(239, 68, 68, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  }
  
  // Chart data for goals by category
  const goalsChartData = {
    labels: goalCategoryData.map(item => item.category),
    datasets: [
      {
        label: 'Total Goals',
        data: goalCategoryData.map(item => item.count),
        backgroundColor: 'rgba(99, 102, 241, 0.6)',
      },
      {
        label: 'Completed Goals',
        data: goalCategoryData.map(item => item.completedCount),
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
      },
    ],
  }
  
  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  }
  
  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Mentorship Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track your mentoring impact and performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last7days">Last 7 days</SelectItem>
              <SelectItem value="last30days">Last 30 days</SelectItem>
              <SelectItem value="last90days">Last 90 days</SelectItem>
              <SelectItem value="thisYear">This year</SelectItem>
              <SelectItem value="allTime">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Mentees</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary" />
                <span className="text-2xl font-bold">{stats.totalMentees}</span>
                <span className="ml-2 text-sm text-muted-foreground">
                  ({stats.activeMentees} active)
                </span>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-indigo-500" />
                <span className="text-2xl font-bold">{stats.totalSessions}</span>
                <span className="ml-2 text-sm text-muted-foreground">
                  ({stats.completedSessions} completed)
                </span>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Hours Mentoring</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-500" />
                <span className="text-2xl font-bold">{stats.totalHours}</span>
                <span className="ml-2 text-sm text-muted-foreground">hours</span>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="flex items-center">
                <Star className="h-5 w-5 mr-2 text-yellow-500" />
                <span className="text-2xl font-bold">{stats.averageSessionRating}</span>
                <span className="ml-2 text-sm text-muted-foreground">/ 5.0</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Mentoring Activity</CardTitle>
                <CardDescription>
                  Number of sessions conducted over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-80 flex items-center justify-center">
                    <Skeleton className="h-64 w-full" />
                  </div>
                ) : (
                  <div className="h-80">
                    <Line options={chartOptions} data={sessionsChartData} />
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Time Distribution</CardTitle>
                <CardDescription>
                  How your mentoring time is spent
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <Skeleton className="h-60 w-60 rounded-full mx-auto" />
                  </div>
                ) : (
                  <div className="h-64">
                    <Pie options={chartOptions} data={categoryChartData} />
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex-col items-start">
                <h4 className="font-medium text-sm mb-2">Top Categories</h4>
                <div className="w-full space-y-2">
                  {categoryTimeData.slice(0, 3).map((category, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{category.category}</span>
                        <span className="font-medium">{category.hours} hrs ({category.percentage}%)</span>
                      </div>
                      <Progress value={category.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Goals Progress</CardTitle>
                <CardDescription>
                  Mentee goal achievement by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <Skeleton className="h-64 w-full" />
                  </div>
                ) : (
                  <div className="h-64">
                    <Bar options={chartOptions} data={goalsChartData} />
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <div className="flex items-center justify-between w-full text-sm">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span>Total Goals: {stats.totalGoalsSet}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Completed: {stats.goalsCompleted} ({Math.round((stats.goalsCompleted / stats.totalGoalsSet) * 100)}%)</span>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Performance Tab */}
        <TabsContent value="performance">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Hours Mentoring</CardTitle>
                <CardDescription>
                  Total hours spent mentoring over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-80 flex items-center justify-center">
                    <Skeleton className="h-64 w-full" />
                  </div>
                ) : (
                  <div className="h-80">
                    <Line options={chartOptions} data={hoursChartData} />
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <div className="flex items-center justify-between w-full">
                  <div className="text-sm text-muted-foreground">
                    Average: {(stats.totalHours / timeData.length).toFixed(1)} hours per week
                  </div>
                  <Badge variant="outline" className="flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {((timeData[timeData.length - 1].hoursSpent / timeData[0].hoursSpent - 1) * 100).toFixed(0)}% growth
                  </Badge>
                </div>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Mentee Growth</CardTitle>
                <CardDescription>
                  Number of mentees over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-80 flex items-center justify-center">
                    <Skeleton className="h-64 w-full" />
                  </div>
                ) : (
                  <div className="h-80">
                    <Line options={chartOptions} data={menteeChartData} />
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <div className="flex items-center justify-between w-full">
                  <div className="text-sm text-muted-foreground">
                    Retention rate: 85%
                  </div>
                  <Badge variant="outline" className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {stats.activeMentees} active mentees
                  </Badge>
                </div>
              </CardFooter>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Impact Metrics</CardTitle>
                <CardDescription>
                  Your mentorship impact at a glance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-amber-500" />
                      <span className="font-medium">Career Advancements</span>
                    </div>
                    <p className="text-3xl font-bold">4</p>
                    <p className="text-sm text-muted-foreground">
                      Mentees who received promotions or new roles
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span className="font-medium">Projects Completed</span>
                    </div>
                    <p className="text-3xl font-bold">12</p>
                    <p className="text-sm text-muted-foreground">
                      Projects completed with your guidance
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">Skills Improved</span>
                    </div>
                    <p className="text-3xl font-bold">27</p>
                    <p className="text-sm text-muted-foreground">
                      New skills acquired by mentees
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Coffee className="h-5 w-5 text-amber-700" />
                      <span className="font-medium">1:1 Sessions</span>
                    </div>
                    <p className="text-3xl font-bold">42</p>
                    <p className="text-sm text-muted-foreground">
                      Individual mentoring sessions held
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Feedback Tab */}
        <TabsContent value="feedback">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Session Ratings</CardTitle>
                  <CardDescription>
                    Feedback ratings distribution
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-80 flex items-center justify-center">
                      <Skeleton className="h-64 w-full" />
                    </div>
                  ) : (
                    <div className="h-80">
                      <Bar options={chartOptions} data={feedbackChartData} />
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Average Rating</span>
                      <span className="font-medium">{stats.averageSessionRating} / 5.0</span>
                    </div>
                    <Progress value={(stats.averageSessionRating / 5) * 100} className="h-2" />
                  </div>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Feedback</CardTitle>
                  <CardDescription>
                    Latest comments from your mentees
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-16 w-full" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              ))}
                            </div>
                            <span className="ml-2 text-sm font-medium">Frontend Development Session</span>
                          </div>
                          <span className="text-xs text-muted-foreground">2 days ago</span>
                        </div>
                        <p className="text-sm">
                          "Sarah is an exceptional mentor who goes above and beyond. Her guidance on React
                          hooks was incredibly clear and she provided excellent examples for me to follow."
                        </p>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className="flex">
                              {[...Array(4)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              ))}
                              {[...Array(1)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 text-yellow-500" />
                              ))}
                            </div>
                            <span className="ml-2 text-sm font-medium">Career Planning Session</span>
                          </div>
                          <span className="text-xs text-muted-foreground">1 week ago</span>
                        </div>
                        <p className="text-sm">
                          "Great insights on navigating the tech industry. The resources shared were
                          very helpful for preparing for my upcoming interviews."
                        </p>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              ))}
                            </div>
                            <span className="ml-2 text-sm font-medium">Code Review Session</span>
                          </div>
                          <span className="text-xs text-muted-foreground">2 weeks ago</span>
                        </div>
                        <p className="text-sm">
                          "The feedback on my project was detailed and constructive. I appreciate how
                          you identified both strengths and areas for improvement in my code."
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Feedback Summary</CardTitle>
                  <CardDescription>
                    Aggregated feedback metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Knowledge & Expertise</span>
                          <span className="text-sm font-medium">4.9/5</span>
                        </div>
                        <Progress value={(4.9/5) * 100} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Communication Skills</span>
                          <span className="text-sm font-medium">4.8/5</span>
                        </div>
                        <Progress value={(4.8/5) * 100} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Responsiveness</span>
                          <span className="text-sm font-medium">4.7/5</span>
                        </div>
                        <Progress value={(4.7/5) * 100} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Helpfulness of Resources</span>
                          <span className="text-sm font-medium">4.6/5</span>
                        </div>
                        <Progress value={(4.6/5) * 100} className="h-2" />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Top Strengths</CardTitle>
                  <CardDescription>
                    Most mentioned positive attributes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-8 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 bg-green-50 border border-green-100 rounded-md">
                        <div className="flex items-center">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm font-medium">Technical expertise</span>
                        </div>
                        <Badge variant="secondary">18 mentions</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 bg-green-50 border border-green-100 rounded-md">
                        <div className="flex items-center">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm font-medium">Clear explanations</span>
                        </div>
                        <Badge variant="secondary">15 mentions</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 bg-green-50 border border-green-100 rounded-md">
                        <div className="flex items-center">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm font-medium">Patience</span>
                        </div>
                        <Badge variant="secondary">12 mentions</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 bg-green-50 border border-green-100 rounded-md">
                        <div className="flex items-center">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm font-medium">Actionable advice</span>
                        </div>
                        <Badge variant="secondary">9 mentions</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 bg-green-50 border border-green-100 rounded-md">
                        <div className="flex items-center">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm font-medium">Supportive attitude</span>
                        </div>
                        <Badge variant="secondary">7 mentions</Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Goals Tab */}
        <TabsContent value="goals">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Goals by Category</CardTitle>
                <CardDescription>
                  Distribution of goals by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-80 flex items-center justify-center">
                    <Skeleton className="h-64 w-full" />
                  </div>
                ) : (
                  <div className="h-80">
                    <Pie options={chartOptions} data={{
                      labels: goalCategoryData.map(item => item.category),
                      datasets: [
                        {
                          label: 'Goals',
                          data: goalCategoryData.map(item => item.count),
                          backgroundColor: [
                            'rgba(99, 102, 241, 0.6)',
                            'rgba(14, 165, 233, 0.6)',
                            'rgba(249, 115, 22, 0.6)',
                            'rgba(34, 197, 94, 0.6)',
                          ],
                          borderWidth: 1,
                        },
                      ],
                    }} />
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Completion Rate by Category</CardTitle>
                <CardDescription>
                  Goal completion percentages by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {goalCategoryData.map((category, index) => {
                      const completionRate = (category.completedCount / category.count) * 100;
                      return (
                        <div key={index}>
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <h4 className="font-medium">{category.category}</h4>
                              <p className="text-sm text-muted-foreground">
                                {category.completedCount} of {category.count} completed
                              </p>
                            </div>
                            <Badge variant={
                              completionRate >= 75 ? "default" : 
                              completionRate >= 50 ? "secondary" : 
                              "outline"
                            }>
                              {completionRate.toFixed(0)}%
                            </Badge>
                          </div>
                          <Progress value={completionRate} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Goal Achievement Timeline</CardTitle>
                <CardDescription>
                  Completed goals over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-80 flex items-center justify-center">
                    <Skeleton className="h-64 w-full" />
                  </div>
                ) : (
                  <div className="h-80">
                    <Line 
                      options={chartOptions} 
                      data={{
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
                        datasets: [
                          {
                            label: 'Technical Skills',
                            data: [1, 2, 3, 4, 5, 7, 9, 12],
                            borderColor: 'rgb(99, 102, 241)',
                            backgroundColor: 'rgba(99, 102, 241, 0.5)',
                          },
                          {
                            label: 'Soft Skills',
                            data: [0, 1, 1, 2, 3, 4, 5, 6],
                            borderColor: 'rgb(14, 165, 233)',
                            backgroundColor: 'rgba(14, 165, 233, 0.5)',
                          },
                          {
                            label: 'Career Development',
                            data: [0, 0, 1, 1, 2, 2, 3, 4],
                            borderColor: 'rgb(249, 115, 22)',
                            backgroundColor: 'rgba(249, 115, 22, 0.5)',
                          },
                          {
                            label: 'Personal Growth',
                            data: [0, 0, 0, 1, 1, 1, 2, 2],
                            borderColor: 'rgb(34, 197, 94)',
                            backgroundColor: 'rgba(34, 197, 94, 0.5)',
                          },
                        ],
                      }}
                    />
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <div className="flex items-center justify-between w-full">
                  <div className="text-sm text-muted-foreground">
                    Total Goals: {stats.totalGoalsSet}
                  </div>
                  <Badge variant="outline" className="flex items-center">
                    <Target className="h-3 w-3 mr-1" />
                    {stats.goalsCompleted} goals completed
                  </Badge>
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
