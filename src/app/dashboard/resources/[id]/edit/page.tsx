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
import { ArrowLeft, FileText, Link, Upload, X } from "lucide-react"
import { useAuth } from "@/context/auth-context" 

// Update form schema to include file
const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  type: z.string().min(1, "Please select a resource type"),
  url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  fileUpload: z.instanceof(File).optional(),
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
  const { user } = useAuth(); // Get current user
  
  const [resource, setResource] = useState<Resource | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingResource, setIsLoadingResource] = useState(true);
  const [isLoadingCollections, setIsLoadingCollections] = useState(true);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
  const [filePreview, setFilePreview] = useState<string | null>(null);
  
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
        const response = await get<{ resource: Resource }>(`/api/resources/${resourceId}`);
        if (!response) {
          throw new Error('Resource not found');
        }
        const { resource } = response;
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
        const response = await get<{ collections: Collection[] }>("/api/resource-collections");
        if (response) {
          setCollections(response.collections);
        } else {
          throw new Error("Failed to load collections");
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
  }, [toast]);
  
  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("fileUpload", file);
      
      // Create a preview URL
      const fileUrl = URL.createObjectURL(file);
      setFilePreview(fileUrl);
      
      // Clear URL if we have a file
      form.setValue("url", "");
    }
  };
  
  // Modified onSubmit to handle file uploads
  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    
    try {
      // Create FormData for file uploads
      const formData = new FormData();
      formData.append("title", values.title);
      if (values.description) formData.append("description", values.description);
      formData.append("type", values.type);
      formData.append("isPublic", String(values.isPublic));
      if (values.collectionIds) {
        formData.append("collectionIds", JSON.stringify(values.collectionIds));
      }
      
      // Append either URL or file
      if (values.url) {
        formData.append("url", values.url);
      }
      
      if (values.fileUpload) {
        formData.append("file", values.fileUpload);
      }
      
      // Use fetch directly for FormData
      const response = await fetch(`/api/resources/${resourceId}`, {
        method: "PATCH",
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update resource");
      }
      
      toast({
        title: "Success",
        description: "Resource updated successfully",
      });
      
      router.push(`/dashboard/resources/${resourceId}`);
    } catch (error) {
      console.error("Error updating resource:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update resource",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  // Remove "all" from resource types for editing
  const resourceTypes = [
    { value: "article", label: "Articles" },
    { value: "video", label: "Videos" },
    { value: "book", label: "Books" },
    { value: "website", label: "Websites" },
    { value: "document", label: "Documents" }, // Add document type for files
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
        
        {/* Role-based conditional rendering */}
        {user?.role === "MENTOR" && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-md">
            <h3 className="font-medium text-blue-700 dark:text-blue-300">Mentor Tools</h3>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              As a mentor, resources you mark as public will be visible to all users.
              Consider adding detailed descriptions to help your mentees.
            </p>
          </div>
        )}
        
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
                
                {/* Upload Method Selector */}
                <div className="flex space-x-4 mb-2">
                  <Button 
                    type="button"
                    variant={uploadMethod === 'url' ? "default" : "outline"}
                    onClick={() => setUploadMethod('url')}
                    className="flex-1"
                  >
                    <Link className="mr-2 h-4 w-4" />
                    URL Link
                  </Button>
                  <Button 
                    type="button"
                    variant={uploadMethod === 'file' ? "default" : "outline"}
                    onClick={() => setUploadMethod('file')}
                    className="flex-1"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload File
                  </Button>
                </div>
                
                {/* URL Input */}
                {uploadMethod === 'url' && (
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
                )}
                
                {/* File Upload */}
                {uploadMethod === 'file' && (
                  <div className="space-y-4">
                    <FormItem>
                      <FormLabel>Upload File</FormLabel>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md p-6 text-center">
                        <Input
                          type="file"
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-upload"
                          accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx"
                        />
                        
                        {filePreview ? (
                          <div className="flex flex-col items-center">
                            <FileText className="h-10 w-10 text-primary mb-2" />
                            <p className="text-sm font-medium mb-2">
                              {form.getValues('fileUpload')?.name}
                            </p>
                            <div className="flex space-x-2">
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  form.setValue('fileUpload', undefined);
                                  setFilePreview(null);
                                }}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Remove
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => document.getElementById('file-upload')?.click()}
                              >
                                <Upload className="h-4 w-4 mr-1" />
                                Change
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                              Drag and drop or click to upload
                            </p>
                            <p className="text-xs text-muted-foreground mb-4">
                              Supports PDF, PowerPoint, Word, and Excel files
                            </p>
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => document.getElementById('file-upload')?.click()}
                            >
                              Select File
                            </Button>
                          </div>
                        )}
                      </div>
                      <FormDescription>
                        Upload documents, presentations, or spreadsheets to share with users
                      </FormDescription>
                    </FormItem>
                  </div>
                )}
                
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
                
                {/* Public/Private Setting with Conditional Rendering */}
                <FormField
                  control={form.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          // Disable for mentees if needed
                          disabled={user?.role === "MENTEE" && resource?.isPublic === false}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Make this resource public</FormLabel>
                        <FormDescription>
                          {user?.role === "MENTOR" 
                            ? "Public resources are visible to all users of the platform" 
                            : "Only mentors can make resources public"}
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                {/* Mentor-only features */}
                {user?.role === "MENTOR" && (
                  <div className="p-4 border rounded-md">
                    <h3 className="font-medium mb-2">Mentor Options</h3>
                    {/* Example additional mentor-only setting */}
                    <div className="flex items-center space-x-2">
                      <Checkbox id="feature-resource" />
                      <label htmlFor="feature-resource" className="text-sm">
                        Feature this resource on the home page
                      </label>
                    </div>
                  </div>
                )}
                
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