"use client"

import { useEffect, useState } from "react"
import { getDashboardData, getRecommendedResources, getMentalHealthResources } from "@/lib/actions/dashboard"

export function useDashboardData(role: "mentor" | "mentee") {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const dashboardData = await getDashboardData(role)
        setData(dashboardData)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [role])

  return { data, loading }
}

export function useRecommendedResources(role: "mentor" | "mentee") {
  const [resources, setResources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchResources() {
      try {
        const data = await getRecommendedResources(role)
        setResources(data)
      } catch (error) {
        console.error("Error fetching recommended resources:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchResources()
  }, [role])

  return { resources, loading }
}

export function useMentalHealthResources() {
  const [resources, setResources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchResources() {
      try {
        const data = await getMentalHealthResources()
        setResources(data)
      } catch (error) {
        console.error("Error fetching mental health resources:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchResources()
  }, [])

  return { resources, loading }
}
