import { createFileRoute } from "@tanstack/react-router"
import axios from "redaxios"
import { DEPLOY_URL } from "../utils/users"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { CalendarDays, Mail, User } from "lucide-react"

export const Route = createFileRoute("/agent/$agentId")({
  component: AgentDetailsComponent,
  loader: async ({ params }) => {
    return await axios
      .get(`${DEPLOY_URL}/api/agents/${params.agentId}`)
      .then((r) => r.data[0])
      .catch(() => {
        throw new Error("Failed to fetch agent details")
      })
  },
})

function AgentDetailsComponent() {
  const agent = Route.useLoaderData()

  // Format the date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${agent.name}`} alt={agent.name} />
                <AvatarFallback>{getInitials(agent.name)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{agent.name}</CardTitle>
                <CardDescription className="flex items-center mt-1">
                  <User className="h-4 w-4 mr-1" />
                  Agent ID: {agent.id}
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary">
              Active Agent
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Email:</span>
              <span>{agent.email}</span>
            </div>

            <div className="flex items-center space-x-2 text-sm">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Created:</span>
              <span>{formatDate(agent.createdAt)}</span>
            </div>
          
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

