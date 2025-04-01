"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format, formatDistance } from "date-fns"
import { Calendar as CalendarIcon, Target, Trophy, CheckCircle2, Circle, ArrowLeft, PlusCircle, MoreHorizontal, Pencil, Trash2, ChevronRight, Clock } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"

// Types
type Mentee = {
  id: number
  fullname: string
  email: string
  profile: {
    profilePicture: string | null
  }
}

type Goal = {
  id: number
  title: string
  description: string | null
  category: string
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED"
  dueDate: string | null
  createdAt: string
  completedAt: string | null
  menteeId: number
  priority: "LOW" | "MEDIUM" | "HIGH"
  milestones: Milestone[]
}

type Milestone = {
  id: number
  title: string
  isCompleted: boolean
  goalId: number
}

// Form schema for goal creation
const goalFormSchema = z.object({
  title: z.string().min(3, "Goal title must be at least 3 characters"),
  description: z.string().optional(),
  category: z.string().min(1, "Please select a category"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  dueDate: z.date().optional().nullable(),
  milestones: z.array(
    z.object({
      title: z.string().min(2, "Milestone must be at least 2 characters"),
      isCompleted: z.boolean().default(false),
    })
  ).optional(),
});

export default function MenteeGoalsPage() {
  const params = useParams()
  const menteeId = Number(params.id)
  const router = useRouter()
  const { toast } = useToast()
  
  const [mentee, setMentee] = useState<Mentee | null>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [milestoneFields, setMilestoneFields] = useState([{ title: "", isCompleted: false }])
  
  // Set up form
  const form = useForm<z.infer<typeof goalFormSchema>>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      priority: "MEDIUM",
      dueDate: null,
      milestones: [{ title: "", isCompleted: false }],
    },
  })
  
  // Fetch mentee data and goals
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        // Fetch mentee details
        const menteeResponse = await fetch(`/api/mentees/${menteeId}`)
        if (!menteeResponse.ok) throw new Error("Failed to fetch mentee")
        const menteeData = await menteeResponse.json()
        setMentee(menteeData)
        
        // Fetch goals
        const goalsResponse = await fetch(`/api/mentees/${menteeId}/goals`)
        if (!goalsResponse.ok) throw new Error("Failed to fetch goals")
        const goalsData = await goalsResponse.json()
        setGoals(goalsData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load mentee goals",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    if (menteeId) {
      fetchData()
    }
  }, [menteeId, toast])
  
  // Handle goal creation
  const onSubmit = async (values: z.infer<typeof goalFormSchema>) => {
    try {
      const response = await fetch(`/api/mentees/${menteeId}/goals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })
      
      if (!response.ok) throw new Error("Failed to create goal")
      
      const newGoal = await response.json()
      setGoals([...goals, newGoal])
      
      toast({
        title: "Success",
        description: "Goal created successfully",
      })
      
      // Reset form and close dialog
      form.reset()
      setIsCreateDialogOpen(false)
      setMilestoneFields([{ title: "", isCompleted: false }])
    } catch (error) {
      console.error("Error creating goal:", error)
      toast({
        title: "Error",
        description: "Failed to create goal",
        variant: "destructive",
      })
    }
  }
  
  // Handle goal update
  const handleUpdateGoal = async (goal: Goal) => {
    try {
      const response = await fetch(`/api/mentees/${menteeId}/goals/${goal.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(goal),
      })
      
      if (!response.ok) throw new Error("Failed to update goal")
      
      // Update goals state
      setGoals(goals.map(g => g.id === goal.id ? goal : g))
      
      toast({
        title: "Success",
        description: "Goal updated successfully",
      })
    } catch (error) {
      console.error("Error updating goal:", error)
      toast({
        title: "Error",
        description: "Failed to update goal",
        variant: "destructive",
      })
    }
  }
  
  // Update goal status
  const updateGoalStatus = async (goalId: number, status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED") => {
    const goal = goals.find(g => g.id === goalId)
    if (!goal) return
    
    const updatedGoal = { 
      ...goal, 
      status,
      completedAt: status === "COMPLETED" ? new Date().toISOString() : null
    }
    
    await handleUpdateGoal(updatedGoal)
  }
  
  // Toggle milestone completion
  const toggleMilestone = async (goalId: number, milestoneId: number, isCompleted: boolean) => {
    const goal = goals.find(g => g.id === goalId)
    if (!goal) return
    
    const updatedGoal = {
      ...goal,
      milestones: goal.milestones.map(m => 
        m.id === milestoneId ? { ...m, isCompleted } : m
      )
    }
    
    // Update goal status based on milestones
    const allCompleted = updatedGoal.milestones.every(m => m.isCompleted)
    const anyCompleted = updatedGoal.milestones.some(m => m.isCompleted)
    
    if (allCompleted && updatedGoal.status !== "COMPLETED") {
      updatedGoal.status = "COMPLETED"
      updatedGoal.completedAt = new Date().toISOString()
    } else if (anyCompleted && updatedGoal.status === "NOT_STARTED") {
      updatedGoal.status = "IN_PROGRESS"
    } else if (!anyCompleted && updatedGoal.status !== "NOT_STARTED") {
      updatedGoal.status = "NOT_STARTED"
      updatedGoal.completedAt = null
    }
    
    await handleUpdateGoal(updatedGoal)
  }
  
  // Handle goal deletion
  const handleDeleteGoal = async () => {
    if (!selectedGoal) return
    
    try {
      const response = await fetch(`/api/mentees/${menteeId}/goals/${selectedGoal.id}`, {
        method: "DELETE",
      })
      
      if (!response.ok) throw new Error("Failed to delete goal")
      
      // Update goals state
      setGoals(goals.filter(g => g.id !== selectedGoal.id))
      
      toast({
        title: "Success",
        description: "Goal deleted successfully",
      })
      
      setIsDeleteDialogOpen(false)
      setSelectedGoal(null)
    } catch (error) {
      console.error("Error deleting goal:", error)
      toast({
        title: "Error",
        description: "Failed to delete goal",
        variant: "destructive",
      })
    }
  }
  
  // Add milestone field
  const addMilestoneField = () => {
    setMilestoneFields([...milestoneFields, { title: "", isCompleted: false }])
  }
  
  // Remove milestone field
  const removeMilestoneField = (index: number) => {
    const updated = [...milestoneFields]
    updated.splice(index, 1)
    setMilestoneFields(updated)
  }
  
  // Set up edit form
  const setupEditForm = (goal: Goal) => {
    setSelectedGoal(goal)
    
    form.reset({
      title: goal.title,
      description: goal.description || "",
      category: goal.category,
      priority: goal.priority,
      dueDate: goal.dueDate ? new Date(goal.dueDate) : null,
      milestones: goal.milestones,
    })
    
    setMilestoneFields(goal.milestones.length > 0 ? 
      goal.milestones.map(m => ({ title: m.title, isCompleted: m.isCompleted })) : 
      [{ title: "", isCompleted: false }]
    )
    
    setIsEditDialogOpen(true)
  }
  
  // Filter goals based on tab
  const filteredGoals = goals.filter(goal => {
    if (activeTab === "all") return true
    if (activeTab === "not-started") return goal.status === "NOT_STARTED"
    if (activeTab === "in-progress") return goal.status === "IN_PROGRESS"
    if (activeTab === "completed") return goal.status === "COMPLETED"
    return true
  })
  
  // Get progress numbers
  const totalGoals = goals.length
  const completedGoals = goals.filter(goal => goal.status === "COMPLETED").length
  const inProgressGoals = goals.filter(goal => goal.status === "IN_PROGRESS").length
  const notStartedGoals = goals.filter(goal => goal.status === "NOT_STARTED").length
  
  // Get completion percentage
  const completionPercentage = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0
  
  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    if (status === "COMPLETED") return <CheckCircle2 className="h-5 w-5 text-green-500" />
    if (status === "IN_PROGRESS") return <Clock className="h-5 w-5 text-amber-500" />
    return <Circle className="h-5 w-5 text-gray-400" />
  }
  
  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    if (priority === "HIGH") 
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">High</Badge>
    if (priority === "MEDIUM") 
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Medium</Badge>
    return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Low</Badge>
  }
  
  return (
    <div className="container py-6">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="mb-2" 
          onClick={() => router.push(`/dashboard/mentor/mentees`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Mentees
        </Button>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {mentee ? (
              <>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={mentee.profile.profilePicture || undefined} />
                  <AvatarFallback>{getInitials(mentee.fullname)}</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold">
                    Learning Goals for {mentee.fullname}
                  </h1>
                  <p className="text-muted-foreground">
                    Track and manage mentee's learning objectives
                  </p>
                </div>
              </>
            ) : isLoading ? (
              <>
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-4 w-40 mt-1" />
                </div>
              </>
            ) : (
              <h1 className="text-2xl font-bold">Mentee not found</h1>
            )}
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create New Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Learning Goal</DialogTitle>
                <DialogDescription>
                  Set a new learning goal for your mentee.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Goal Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Learn React fundamentals" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the goal and expected outcomes" 
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="TECHNICAL">Technical Skills</SelectItem>
                              <SelectItem value="SOFT_SKILLS">Soft Skills</SelectItem>
                              <SelectItem value="CAREER">Career Development</SelectItem>
                              <SelectItem value="PERSONAL">Personal Growth</SelectItem>
                              <SelectItem value="PROJECT">Project Milestone</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="LOW">Low</SelectItem>
                              <SelectItem value="MEDIUM">Medium</SelectItem>
                              <SelectItem value="HIGH">High</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Due Date (Optional)</FormLabel>
                        <FormControl>
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            className="rounded-md border"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <FormLabel>Milestones</FormLabel>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={addMilestoneField}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Milestone
                      </Button>
                    </div>
                    
                    {milestoneFields.map((milestone, index) => (
                      <div key={index} className="flex items-center gap-2 mb-2">
                        <Input
                          placeholder={`Milestone ${index + 1}`}
                          value={milestone.title}
                          onChange={(e) => {
                            const newFields = [...milestoneFields]
                            newFields[index].title = e.target.value
                            setMilestoneFields(newFields)
                            form.setValue("milestones", newFields)
                          }}
                          className="flex-1"
                        />
                        {milestoneFields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeMilestoneField(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {form.formState.errors.milestones && (
                      <p className="text-sm font-medium text-destructive">
                        {form.formState.errors.milestones.message}
                      </p>
                    )}
                  </div>
                  
                  <DialogFooter>
                    <Button type="submit">Create Goal</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Learning Goal</DialogTitle>
                <DialogDescription>
                  Modify this learning goal for your mentee.
                </DialogDescription>
              </DialogHeader>
              {/* Edit form - similar to create form */}
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Target className="h-8 w-8 mr-3 text-primary" />
              <span className="text-3xl font-bold">{totalGoals}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CheckCircle2 className="h-8 w-8 mr-3 text-green-500" />
              <span className="text-3xl font-bold">{completedGoals}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-8 w-8 mr-3 text-amber-500" />
              <span className="text-3xl font-bold">{inProgressGoals}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Trophy className="h-8 w-8 mr-3 text-yellow-500" />
                  <span className="text-3xl font-bold">{completionPercentage.toFixed(0)}%</span>
                </div>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Goal Listings */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="all" className="flex gap-2">
            <Target className="h-4 w-4" />
            All Goals
            <Badge variant="secondary" className="ml-1">{totalGoals}</Badge>
          </TabsTrigger>
          <TabsTrigger value="not-started" className="flex gap-2">
            <Circle className="h-4 w-4" />
            Not Started
            <Badge variant="secondary" className="ml-1">{notStartedGoals}</Badge>
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="flex gap-2">
            <Clock className="h-4 w-4" />
            In Progress
            <Badge variant="secondary" className="ml-1">{inProgressGoals}</Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Completed
            <Badge variant="secondary" className="ml-1">{completedGoals}</Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <Skeleton className="h-5 w-64" />
                        <Skeleton className="h-4 w-40" />
                      </div>
                      <Skeleton className="h-10 w-10 rounded-full" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-9 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : filteredGoals.length > 0 ? (
            <div className="space-y-4">
              {filteredGoals.map((goal) => (
                <Card key={goal.id} className={
                  goal.status === "COMPLETED" ? "border-green-200" :
                  goal.status === "IN_PROGRESS" ? "border-amber-200" : ""
                }>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(goal.status)}
                        <div>
                          <CardTitle className="text-lg">{goal.title}</CardTitle>
                          <CardDescription>
                            {goal.category === "TECHNICAL" && "Technical Skills"}
                            {goal.category === "SOFT_SKILLS" && "Soft Skills"}
                            {goal.category === "CAREER" && "Career Development"}
                            {goal.category === "PERSONAL" && "Personal Growth"}
                            {goal.category === "PROJECT" && "Project Milestone"}
                            {goal.dueDate && ` • Due ${format(new Date(goal.dueDate), 'MMM d, yyyy')}`}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getPriorityBadge(goal.priority)}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setupEditForm(goal)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit Goal
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => {
                                setSelectedGoal(goal)
                                setIsDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Goal
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    {goal.description && (
                      <p className="text-sm text-muted-foreground mb-4">{goal.description}</p>
                    )}
                    
                    {goal.milestones && goal.milestones.length > 0 && (
                      <div className="space-y-2 mt-2">
                        <h4 className="text-sm font-medium">Milestones</h4>
                        {goal.milestones.map((milestone) => (
                          <div key={milestone.id} className="flex items-center gap-2">
                            <Checkbox 
                              id={`milestone-${milestone.id}`}
                              checked={milestone.isCompleted}
                              onCheckedChange={(checked) => 
                                toggleMilestone(goal.id, milestone.id, checked === true)
                              }
                            />
                            <label 
                              htmlFor={`milestone-${milestone.id}`}
                              className={`text-sm ${milestone.isCompleted ? "line-through text-muted-foreground" : ""}`}
                            >
                              {milestone.title}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {goal.completedAt && (
                      <div className="mt-3 text-xs text-muted-foreground">
                        Completed {formatDistance(new Date(goal.completedAt), new Date(), { addSuffix: true })}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <div className="flex gap-2 w-full">
                      {goal.status !== "NOT_STARTED" && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-xs"
                          onClick={() => updateGoalStatus(goal.id, "NOT_STARTED")}
                        >
                          Mark as Not Started
                        </Button>
                      )}
                      {goal.status !== "IN_PROGRESS" && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-xs"
                          onClick={() => updateGoalStatus(goal.id, "IN_PROGRESS")}
                        >
                          Mark as In Progress
                        </Button>
                      )}
                      {goal.status !== "COMPLETED" && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-xs"
                          onClick={() => updateGoalStatus(goal.id, "COMPLETED")}
                        >
                          Mark as Completed
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Target className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg mb-2">No goals found</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  {activeTab !== "all" 
                    ? `There are no goals with "${activeTab.replace('-', ' ')}" status.`
                    : "You haven't created any goals for this mentee yet."}
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="w-full max-w-xs"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create New Goal
                </Button>
              </CardContent>
            </Card>
            )}
          </TabsContent>
        </Tabs>
          
        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this goal and all associated milestones.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteGoal} className="bg-destructive">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
  )
}
