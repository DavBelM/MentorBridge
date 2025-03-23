// src/app/dashboard/resources/[id]/edit/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { get, patch } from "@/lib/api-client"
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

type Resource = {
  id: number;
  title: string;
  description: string | null;
  type: string;
  url: string | null;
  isPublic: boolean;
  collections: {
    id: number;
    name: string;
  }[];
};

export default function EditResourcePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [resource, setResource] = useState<Resource | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingResource, setIsLoadingResource] = useState(true);
  const [isLoadingCollections, setIsLoadingCollections] = useState(true);
  
  // Get the resource ID from URL
  const resourceId = params?.id as string;
  
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
  
  // Fetch resource data
  useEffect(() => {
    async function fetchResource() {
      if (!resourceId) return;
      
      setIsLoadingResource(true);
      try {
        const { resource } = await get<{ resource: Resource }>(`/api/resources/${resourceId}`);
        setResource(resource);
        
        // Set form values
        form.reset({
          title: resource.title,
          description: resource.description || "",
          type: resource.type,
          url: resource.url || "",
          isPublic: resource.isPublic,
          collectionIds: resource.collections.map(collection => collection.id),
        });
      } catch (error) {
        console.error('Error fetching resource:', error);
        toast({
          title: "Error",
          description: "Failed to load resource",
          variant: "destructive",
        });
        router.push('/dashboard/resources');
      } finally {
        setIsLoadingResource(false);
      }
    }
    
    fetchResource();
  }, [resourceId, toast, router, form]);
  
  // Fetch collections
  useEffect(() => {
    async function fetchCollections() {
      setIsLoadingCollections(true);
      try {
        const { collections } = await get<{ collections: Collection[] }>("/api/resource-collections");
        setCollections(collections);
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
  }, [toast]);
  
  // Handle form submission
  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    try {
      await patch(`/api/resources/${resourceId}`, values);
      
      toast({
        title: "Success",
        description: "Resource updated successfully",
      });
      
      router.push(`/dashboard/resources/${resourceId}`);
    } catch (error) {
      console.error("Error updating resource:", error);
      toast({
        title: "Error",
        description: "Failed to update resource",
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
  
  if (isLoadingResource) {
    return (
      <div className="container py-10">
        <div className="max-w-2xl mx-auto">
          <div className="h-8 w-24 bg-muted animate-pulse rounded mb-6"></div>
          <div className="h-10 w-3/4 bg-muted animate-pulse rounded mb-6"></div>
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
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
        <h1 className="text-3xl font-bold mb-6">Edit Resource</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Resource Details</CardTitle>
            <CardDescription>
              Update information about your learning resource
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
                          placeholder="Select collections"
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
                  <Button 
                    variant="outline" 
                    type="button" 
                    className="mr-2"
                    onClick={() => router.push(`/dashboard/resources/${resourceId}`)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
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