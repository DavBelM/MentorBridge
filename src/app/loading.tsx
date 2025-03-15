import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function Loading() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <LoadingSpinner />
    </div>
  )
}   