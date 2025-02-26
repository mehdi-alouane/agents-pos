import { createFileRoute } from "@tanstack/react-router"
import axios from "redaxios"
import { DEPLOY_URL } from "~/utils/users"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"

export const Route = createFileRoute("/admin")({
  component: RouteComponent,
  loader: async () => {
    return await axios
      .get(`${DEPLOY_URL}/api/admin/sales`)
      .then((r) => r.data.data)
      .catch(() => {
        throw new Error("Failed to fetch sales data")
      })
  },
})

function formatCurrency(value: number | string): string {
  const numValue = typeof value === "string" ? Number.parseFloat(value) : value

  return new Intl.NumberFormat("fr-Ma", {
    style: "currency",
    currency: "MAD",
    minimumFractionDigits: 2,
  }).format(numValue)
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)

  return new Intl.DateTimeFormat("fr-MA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function RouteComponent() {
  const { totalSales, soldTickets } = Route.useLoaderData()

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sales Dashboard</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-3">
          <CardHeader className="bg-muted/50">
            <CardTitle>Total Sales</CardTitle>
            <CardDescription>Overview of all ticket sales</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-4xl font-bold">{formatCurrency(totalSales)}</div>
            <p className="text-muted-foreground mt-2">{soldTickets.length} tickets sold</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="bg-muted/50">
          <CardTitle>Sales Records</CardTitle>
          <CardDescription>List of all sold tickets</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Passenger</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {soldTickets.length > 0 ? (
                  soldTickets.map((ticket) => (
                    <TableRow key={ticket.ticketId}>
                      <TableCell className="font-medium">{ticket.ticketId}</TableCell>
                      <TableCell>
                        <div>{ticket.passengerName}</div>
                        <div className="text-sm text-muted-foreground">{ticket.passengerPhone}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span>{ticket.departureCity}</span>
                          <span className="text-muted-foreground">→</span>
                          <span>{ticket.destinationCity}</span>
                        </div>
                      </TableCell>
                      <TableCell>{ticket.agentName}</TableCell>
                      <TableCell>{ticket.paymentMethod}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(ticket.saleAmount)}</TableCell>
                      <TableCell>{formatDate(ticket.soldAt)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      No sales records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

