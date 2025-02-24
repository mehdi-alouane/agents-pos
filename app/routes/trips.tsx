"use client"

import { createFileRoute } from "@tanstack/react-router"
import axios from "redaxios"
import { useState } from "react"
import { format } from "date-fns"
import { DEPLOY_URL } from "../utils/users"
import { Input } from "../components/ui/input"
import { Card, CardContent } from "../components/ui/card"
import { Search } from "lucide-react"

// Format price to MAD currency
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("ar-MA", {
    style: "currency",
    currency: "MAD",
    minimumFractionDigits: 2,
  }).format(price)
}

export const Route = createFileRoute("/trips")({
  component: RouteComponent,
  loader: async () => {
    return await axios
      .get(DEPLOY_URL + "/api/trips")
      .then((r) => r.data.data)
      .catch(() => {
        throw new Error("Failed to fetch trips")
      })
  },
})

function RouteComponent() {
  const trips = Route.useLoaderData()
  const [searchQuery, setSearchQuery] = useState("")

  // Filter trips based on search query
  const filteredTrips = trips?.filter(
    (trip) =>
      trip.price.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.destinationCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.departureCity.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search trips..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTrips?.map((trip) => (
          <Card key={trip.id}>
            <CardContent className="p-4 space-y-2">
              <p className="text-sm text-muted-foreground">From</p>
              <p className="text-lg font-medium">{trip.departureCity}</p>
              <p className="text-sm text-muted-foreground">To</p>
              <p className="text-lg font-medium">{trip.destinationCity}</p>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="text-lg font-medium">{format(new Date(trip.departureDate), "EEEE, MMMM d, yyyy")}</p>
              <p className="text-sm text-muted-foreground">Price</p>
              <p className="text-lg font-medium text-primary">{formatPrice(trip.price)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTrips?.length === 0 && (
        <p className="text-center text-muted-foreground">No trips found matching your search.</p>
      )}
    </div>
  )
}

