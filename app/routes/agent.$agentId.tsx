"use client"

import { createFileRoute } from "@tanstack/react-router"
import axios from "redaxios"
import { DEPLOY_URL } from "../utils/users"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { CalendarDays, Mail, User, DollarSign } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { useState, useEffect } from "react"
import { Skeleton } from "../components/ui/skeleton"

// Define the types for our data
interface Agent {
  id: number
  name: string
  email: string
  passwordHash: string
  createdAt: string
}

interface Sale {
  id: number
  amount: string
  soldAt: string
  ticketId: number
  agentName: string
  ticketPassengerName: string | null
}

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
  const agent = Route.useLoaderData() as Agent
  const [sales, setSales] = useState<Sale[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get(`${DEPLOY_URL}/api/sales/${agent.id}`)
        setSales(response.data)
        setError(null)
      } catch (err) {
        console.error("Error fetching sales:", err)
        setError("Failed to load sales data")
        setSales([])
      } finally {
        setIsLoading(false)
      }
    }

    if (agent?.id) {
      fetchSales()
    }
  }, [agent?.id])

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

  // Format currency
  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "MAD",
    }).format(Number.parseFloat(amount))
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
      <Card className="max-w-2xl mx-auto mb-8">
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

      {/* Sales Details Section */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Sales History
              </CardTitle>
              <CardDescription>Recent ticket sales by this agent</CardDescription>
            </div>
            {sales.length > 0 && (
              <Badge variant="secondary">
                {sales.length} {sales.length === 1 ? "Sale" : "Sales"}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>{error}</p>
            </div>
          ) : sales.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No sales records found for this agent.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Ticket ID</TableHead>
                    <TableHead>Passenger</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Sale Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.id}</TableCell>
                      <TableCell>{sale.ticketId}</TableCell>
                      <TableCell>
                        {sale.ticketPassengerName || (
                          <span className="text-muted-foreground italic">Not specified</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(sale.amount)}</TableCell>
                      <TableCell>{formatDate(sale.soldAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {sales.length > 0 && (
            <div className="mt-4 flex justify-end">
              <div className="bg-muted p-3 rounded-md">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total Sales:</span>
                  <span className="font-bold ml-4">
                    {formatCurrency(sales.reduce((sum, sale) => sum + Number.parseFloat(sale.amount), 0).toString())}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

