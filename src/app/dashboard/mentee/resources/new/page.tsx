// src/app/dashboard/resources/new/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { get, post } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { MultiSelect } from "@/components/ui/multi-select"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft } from "lucide-react"

// Form schema
const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  type: z.string().min(1, "Please select a resource type"),
  url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  isPublic: z.boolean().default(false),
  collectionIds: z.array(z.number()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type Collection = {
  id: number;
  name: string;
  description: string | null;
};

export default function AddResourcePage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCollections, setIsLoadingCollections] = useState(false);
  
  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "",
      url: "",
      isPublic: false,
      collectionIds: [],
    },
  });
  
  // Fetch user's collections on mount
  useEffect(() => {
    async function fetchCollections() {
      setIsLoadingCollections(true);
      try {
        const response = await get<{ collections: Collection[] }>("/api/resource-collections");
        if (response) {
          setCollections(response.collections);
        }
      } catch (error) {
        console.error("Error fetching collections:", error);
        toast({
          title: "Error",
          description: "Failed to load collections",
          variant: "destructive",
        });
      } finally {
        setIsLoadingCollections(false);
      }
    }
    
    fetchCollections();
  }, []);
  
  // Handle form submission
  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    try {
      await post("/api/resources", values);
      
      toast({
        title: "Success",
        description: "Resource added successfully",
      });
      
      router.push("/dashboard/mentee/resources");
    } catch (error) {
      console.error("Error adding resource:", error);
      toast({
        title: "Error",
        description: "Failed to add resource",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }
  
  const resourceTypes = [
    { value: "article", label: "Article" },
    { value: "video", label: "Video" },
    { value: "book", label: "Book" },
    { value: "podcast", label: "Podcast" },
    { value: "course", label: "Course" },
    { value: "website", label: "Website" },
    { value: "tool", label: "Tool" },
    { value: "other", label: "Other" },
  ];
  
  // Convert collections for multi-select
  const collectionOptions = collections.map((collection) => ({
    value: collection.id,
    label: collection.name,
  }));
  
  return (
    <div className="container py-10">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Add New Resource</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Resource Details</CardTitle>
            <CardDescription>
              Add information about the learning resource you want to share
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Resource Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Resource title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Resource Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Briefly describe this resource" 
                          {...field} 
                          rows={3}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Resource Type */}
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select resource type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {resourceTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Resource URL */}
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Link to the resource, like an article, video, or website
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Collections */}
                <FormField
                  control={form.control}
                  name="collectionIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Collections (Optional)</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={collectionOptions}
                          selected={field.value || []}
                          onChange={field.onChange}
                          placeholder={isLoadingCollections ? "Loading collections..." : "Select collections"}
                          disabled={isLoadingCollections}
                        />
                      </FormControl>
                      <FormDescription>
                        Add this resource to specific collections
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Public/Private Setting */}
                <FormField
                  control={form.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Make this resource public</FormLabel>
                        <FormDescription>
                          Public resources are visible to all users of the platform
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Adding..." : "Add Resource"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}