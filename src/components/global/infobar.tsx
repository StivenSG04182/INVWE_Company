"use client"

import type { NotificationWithUser } from "@/lib/types"
import { UserButton } from "@clerk/nextjs"
import { useState, useEffect } from "react"
import { twMerge } from "tailwind-merge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "../ui/sheet"
import { Bell, Check, Clock, Filter, MoreHorizontal } from "lucide-react"
import type { Role } from "@prisma/client"
import { Card, CardContent } from "../ui/card"
import { Switch } from "../ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { ModeToggle } from "./mode-toggle"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs"
import { motion, AnimatePresence } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"

type Props = {
  notifications: NotificationWithUser
  role?: Role
  className?: string
  subAccountId?: string
}

const InfoBar = ({ notifications, subAccountId, className, role }: Props) => {
  const [allNotifications, setAllNotifications] = useState<NotificationWithUser>([])
  const [showAll, setShowAll] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    if (notifications) {
      setAllNotifications(notifications)
      // Count unread notifications - assuming read status is tracked elsewhere
      const count = notifications.length // Remove .filter((n) => !n.read) for now
      setUnreadCount(count)
    }
  }, [notifications])

  const handleClick = () => {
    if (!showAll) {
      setAllNotifications(notifications || [])
    } else {
      if (notifications?.length !== 0) {
        setAllNotifications(
          notifications?.filter((item) => item.subAccountId === subAccountId) ?? [],
        )
      }
    }
    setShowAll((prev) => !prev)
  }

  const handleMarkAllRead = () => {
    // In a real app, you would call an API to mark notifications as read
    // For now, we'll just update the local state
    setAllNotifications((prev) =>
      prev?.map((notification) => ({
        ...notification,
        // read: true, // Remove this for now as read property doesn't exist
      })) || [],
    )
    setUnreadCount(0)
  }

  const handleMarkAsRead = (id: string) => {
    setAllNotifications((prev) =>
      prev?.map((notification) => (notification.id === id ? { ...notification } : notification)) || [],
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    return `${Math.floor(diffInSeconds / 86400)} days ago`
  }

  const filteredNotifications = () => {
    if (activeTab === "unread") {
      return allNotifications?.filter((n) => true) || [] // Remove read check for now
    }
    return allNotifications || []
  }

  return (
    <>
      <div
        className={twMerge(
          "fixed z-[20] md:left-[300px] left-0 right-0 top-0 p-4 bg-background/80 backdrop-blur-md flex gap-4 items-center border-b-[1px]",
          className,
        )}
      >
        <div className="flex items-center gap-3 ml-auto">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative rounded-full h-9 w-9 flex items-center justify-center hover:bg-muted"
                    >
                      <Bell size={18} className="text-muted-foreground" />
                      {unreadCount > 0 && (
                        <Badge
                          className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-[10px]"
                          variant="destructive"
                        >
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-full sm:max-w-md p-0 overflow-hidden">
                    <div className="flex flex-col h-full">
                      <SheetHeader className="px-6 py-4 border-b">
                        <div className="flex items-center justify-between">
                          <SheetTitle className="text-xl">Notificaciones</SheetTitle>
                          <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                              <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="text-xs h-8">
                                <Check size={14} className="mr-1" />
                                Marcar todo lo leído
                              </Button>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Filter size={14} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {(role === "AGENCY_ADMIN" || role === "AGENCY_OWNER") && (
                                  <div className="flex items-center justify-between px-3 py-2">
                                    <span className="text-sm">Tienda actual</span>
                                    <Switch checked={!showAll} onCheckedChange={handleClick} />
                                  </div>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mt-2">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="all" className="text-xs">
                              Todos
                            </TabsTrigger>
                            <TabsTrigger value="unread" className="text-xs">
                              No leídos
                              {unreadCount > 0 && (
                                <Badge variant="secondary" className="ml-1.5 h-5 text-[10px]">
                                  {unreadCount}
                                </Badge>
                              )}
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </SheetHeader>

                      <div className="flex-1 overflow-y-auto">
                        <AnimatePresence>
                          {filteredNotifications().length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[300px] text-center p-4">
                              <div className="bg-muted/30 p-3 rounded-full mb-3">
                                <Bell size={24} className="text-muted-foreground" />
                              </div>
                              <h3 className="font-medium mb-1">Sin notificaciones</h3>
                              <p className="text-sm text-muted-foreground max-w-[250px]">
                                {activeTab === "unread"
                                  ? "Has leído todas tus notificaciones"
                                  : "No tienes ninguna notificación aún"}
                              </p>
                            </div>
                          ) : (
                            filteredNotifications().map((notification) => (
                              <motion.div
                                key={notification.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                layout
                              >
                                <Card
                                  className={twMerge(
                                    "rounded-none border-x-0 border-t-0 relative",
                                  )}
                                >
                                  <CardContent className="p-4 flex gap-3">
                                    <Avatar className="h-9 w-9">
                                      <AvatarImage
                                        src={notification.User.avatarUrl || "/placeholder.svg"}
                                        alt={notification.User.name}
                                      />
                                      <AvatarFallback className="bg-primary text-xs">
                                        {notification.User.name.slice(0, 2).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-2">
                                        <div>
                                          <p className="text-sm leading-tight">
                                            <span className="font-medium">
                                              {notification.notification.split("|")[0]}
                                            </span>
                                            <span className="text-muted-foreground">
                                              {notification.notification.split("|")[1]}
                                            </span>
                                            <span className="font-medium">
                                              {notification.notification.split("|")[2]}
                                            </span>
                                          </p>
                                          <div className="flex items-center mt-1 text-xs text-muted-foreground">
                                            <Clock size={12} className="mr-1" />
                                            {getTimeAgo(notification.createdAt)}
                                          </div>
                                        </div>

                                        <div className="flex items-center">
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                                <MoreHorizontal size={14} />
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                              <DropdownMenuItem
                                                onClick={() => handleMarkAsRead(notification.id)}
                                              >
                                                Marcar como leído
                                              </DropdownMenuItem>
                                              <DropdownMenuItem className="text-destructive">Eliminar</DropdownMenuItem>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))
                          )}
                        </AnimatePresence>
                      </div>

                      <SheetFooter className="flex-shrink-0 border-t p-4">
                        <Button variant="outline" size="sm" className="w-full" onClick={() => setIsOpen(false)}>
                          Cerrar
                        </Button>
                      </SheetFooter>
                    </div>
                  </SheetContent>
                </Sheet>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Notificaciones</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <UserButton afterSignOutUrl="/site" />
          <ModeToggle />
        </div>
      </div>
    </>
  )
}

export default InfoBar
