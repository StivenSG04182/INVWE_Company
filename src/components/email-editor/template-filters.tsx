"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useDeferredValue, useCallback } from "react"
import { useDebounce } from "@/hooks/use-debounce"

export function TemplateFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const currentSearch = searchParams?.get("search") ?? ""
    const currentStatus = searchParams?.get("status") ?? "all"

    const deferredSearch = useDeferredValue(currentSearch)

    const updateURL = useCallback(
        (key: string, value: string) => {
            if (!searchParams) return
            const params = new URLSearchParams(searchParams.toString())
            if (value && value !== "all") {
                params.set(key, value)
            } else {
                params.delete(key)
            }
            router.push(`?${params.toString()}`, { scroll: false })
        },
        [searchParams, router],
    )

    const debouncedSearch = useDebounce((term: string) => {
        updateURL("search", term)
    }, 300)

    const handleSearchChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            debouncedSearch(e.target.value)
        },
        [debouncedSearch],
    )

    const handleStatusChange = useCallback(
        (status: string) => {
            updateURL("status", status)
        },
        [updateURL],
    )

    return (
        <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar plantillas..."
                    className="pl-10"
                    defaultValue={currentSearch}
                    onChange={handleSearchChange}
                />
            </div>
            <Tabs value={currentStatus} className="w-auto" onValueChange={handleStatusChange}>
                <TabsList>
                    <TabsTrigger value="all">Todas</TabsTrigger>
                    <TabsTrigger value="ACTIVE">Activas</TabsTrigger>
                    <TabsTrigger value="DRAFT">Borradores</TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
    )
}
