'use client'

import { useEffect, useState } from "react";
import { getNotifications, markNotifications } from "../actions/notification.action";
import toast from "react-hot-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { HeartIcon, MessageCircleIcon, UserPlusIcon } from "lucide-react";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "LIKE":
      return <HeartIcon className="size-4 text-red-500" />;
    case "COMMENT":
      return <MessageCircleIcon className="size-4 text-blue-500" />;
    case "FOLLOW":
      return <UserPlusIcon className="size-4 text-green-500" />;
    default:
      return null;
  }
};

const Notifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const data = await getNotifications();
        setNotifications(data);

        const unreadIds = data.filter((n) => !n.read).map((n) => n.id);
        if (unreadIds.length > 0) await markNotifications(unreadIds);

      } catch (error) {
        toast.error("Failed to fetch notifications.")
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [])

  return (
    <div className="w-full px-3 sm:px-5 py-6">
      <Card className="w-full">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>Notifications</CardTitle>
            <span className="text-sm text-muted-foreground">
              {notifications.filter((n) => !n.read).length} unread
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-12rem)]">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-10 text-center text-muted-foreground">
                No notifications yet
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`flex items-start gap-4 p-4 transition-colors hover:bg-muted/25 ${
                      !n.read ? "bg-muted/50" : ""
                    }`}
                  >
                    <Avatar className="mt-1 size-10 shrink-0">
                      <AvatarImage src={n.createdBy?.avatarUrl ?? undefined} alt={n.createdBy?.name ?? "User"} />
                      <AvatarFallback>{n.createdBy?.name?.charAt(0).toUpperCase() ?? "U"}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {getNotificationIcon(n.type)}
                        <span className="text-sm">
                          <span className="font-semibold">
                            {n.createdBy?.name ?? n.createdBy?.username}
                          </span>{" "}
                          {n.type === "FOLLOW"
                            ? "started following you"
                            : n.type === "LIKE"
                            ? "liked your post"
                            : "commented on your post"}
                        </span>
                      </div>

                      {n.post && (n.type === "LIKE" || n.type === "COMMENT") && (
                        <div className="pl-6 space-y-2">
                          <div className="text-sm text-muted-foreground rounded-md p-2 bg-muted/30 mt-2">
                            <p className="line-clamp-2">{n.post.content}</p>
                            {n.post.image && (
                              <img
                                src={n.post.image}
                                alt="Post content"
                                className="mt-2 rounded-md w-full max-w-[200px] h-auto object-cover"
                              />
                            )}
                          </div>

                          {n.type === "COMMENT" && n.comment && (
                            <div className="text-sm p-2 bg-accent/50 rounded-md">
                              {n.comment.content}
                            </div>
                          )}
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground pl-6">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

export default Notifications