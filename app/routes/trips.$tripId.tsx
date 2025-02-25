"use client"

import type React from "react"

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { DEPLOY_URL } from "../utils/users"
import axios from "redaxios"
import { format, parseISO } from "date-fns"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Check } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Switch } from "../components/ui/switch"
import { Toaster } from "../components/ui/sonner"
import { toast } from "sonner"

// Define the trip type
interface Trip {
  id: number
  departureCity: string
  destinationCity: string
  departureDate: string
  price: number
  createdBy: number
  createdAt: string
}

interface Agent {
  id: number
  name: string
  email: string
}

interface BookingData {
  busTripId: number
  seatNumber: number | null
  passengerName: string
  passengerPhone: string
  isPaid: boolean
  paymentMethod: string
  agentId: number | null
}

// Agent data from the provided list
const agents: Agent[] = [
  { id: 1, name: "Karim Tazi", email: "karim.tazi@buscompany.ma" },
  { id: 2, name: "Amina Bouabid", email: "amina.bouabid@buscompany.ma" },
  { id: 3, name: "Mohammed Ziani", email: "mohammed.ziani@buscompany.ma" },
  { id: 4, name: "Nadia El Mansouri", email: "nadia.elmansouri@buscompany.ma" },
  { id: 5, name: "Omar Bensouda", email: "omar.bensouda@buscompany.ma" },
]

// Payment methods
const paymentMethods = ["Credit Card", "Cash", "Bank Transfer", "Mobile Payment"]

export const Route = createFileRoute("/trips/$tripId")({
  component: TripDetail,
  loader: async ({ params }) => {
    return await axios
      .get(`${DEPLOY_URL}/api/trips/${params.tripId}`)
      .then((r) => r.data.data)
      .catch(() => {
        throw new Error("Failed to fetch trip details")
      })
  },
})

function TripDetail() {
  const trip = Route.useLoaderData()
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  // const { toast } = useToast()

  const [bookingData, setBookingData] = useState<BookingData>({
    busTripId: trip?.id || 0,
    seatNumber: null,
    passengerName: "",
    passengerPhone: "",
    isPaid: false,
    paymentMethod: "Credit Card",
    agentId: null,
  })

  // Mock available seats (in a real app, this would come from an API)
  const totalSeats = 20
  const unavailableSeats = [3, 7, 12, 15]

  // Safe date formatting function
  const formatDate = (dateString: string, formatStr: string) => {
    try {
      // Try to parse using parseISO first (for ISO format strings)
      return format(parseISO(dateString), formatStr)
    } catch (e) {
      try {
        // If that fails, try direct Date constructor
        return format(new Date(dateString), formatStr)
      } catch (e) {
        // If all parsing fails, return the original string
        return dateString
      }
    }
  }

  const handleSeatSelect = (seatNumber: number) => {
    if (unavailableSeats.includes(seatNumber)) return

    setBookingData((prev) => ({
      ...prev,
      seatNumber: prev.seatNumber === seatNumber ? null : seatNumber,
    }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setBookingData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setBookingData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setBookingData((prev) => ({
      ...prev,
      isPaid: checked,
    }))
  }

  // Update the handleBooking function to use the API endpoint and redirect on success
  const handleBooking = async () => {
    try {
      setIsSubmitting(true)

      // Convert agentId from string to number if needed
      const finalBookingData = {
        ...bookingData,
        agentId: typeof bookingData.agentId === "string" ? Number.parseInt(bookingData.agentId) : bookingData.agentId,
        busTripId: trip.id, // Ensure we're using the current trip ID
      }

      // Send POST request to the ticket endpoint
      const response = await axios.post(`${DEPLOY_URL}/api/ticket`, finalBookingData)

      console.log("Booking successful:", response.data)

      // Reset form and close modal
      setBookingData({
        busTripId: trip?.id || 0,
        seatNumber: null,
        passengerName: "",
        passengerPhone: "",
        isPaid: false,
        paymentMethod: "Credit Card",
        agentId: null,
      })
      setIsModalOpen(false)

      // Show success toast
      toast({
        title: "Booking Successful",
        description: "Redirecting to your ticket...",
        variant: "default",
      })

      // Redirect to the ticket page with the ticket data
      // In a real app, you would use the ticket ID from the response
      const ticketId = response.data?.tickets?.id || "new"

      // Store ticket data in sessionStorage for the ticket page to access
      sessionStorage.setItem(
        "ticketData",
        JSON.stringify({
          ...finalBookingData,
          trip: {
            departureCity: trip.departureCity,
            destinationCity: trip.destinationCity,
            departureDate: trip.departureDate,
            price: trip.price,
          },
          ticketId: ticketId,
          bookingDate: new Date().toISOString(),
          agent: agents.find((agent) => agent.id === Number(finalBookingData.agentId))?.name,
        }),
      )

      // Redirect to the ticket page
      navigate({ to: `/tickets/${ticketId}` })
    } catch (error) {
      console.error("Booking failed:", error)

      // Show error toast
      toast({
        title: "Booking Failed",
        description: "There was an error booking your ticket. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid =
    bookingData.passengerName &&
    bookingData.passengerPhone &&
    bookingData.seatNumber !== null &&
    bookingData.agentId !== null

  return (
    <div className="container mx-auto p-4">
      <Toaster />
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Trip Details</h1>
          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">ID: {trip.id}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Route Information</h2>
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">From:</span>
                <span className="font-medium">{trip.departureCity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">To:</span>
                <span className="font-medium">{trip.destinationCity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Departure:</span>
                <span className="font-medium">{formatDate(trip.departureDate, "PPP 'at' p")}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Ticket Information</h2>
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Price:</span>
                <span className="font-medium text-green-600">
                  ${typeof trip.price === "number" ? trip.price.toFixed(2) : trip.price}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created by:</span>
                <span className="font-medium">User #{trip.createdBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Added on:</span>
                <span className="font-medium">{formatDate(trip.createdAt, "PPP")}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsModalOpen(true)}>
            Book This Trip
          </Button>
          <Link to="/trips" className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition">
            Back to Trips
          </Link>
        </div>
      </div>

      {/* Booking Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Book a Seat</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Seat Selection */}
            <div className="space-y-2">
              <Label>Select a Seat</Label>
              <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
                {Array.from({ length: totalSeats }, (_, i) => i + 1).map((seatNumber) => (
                  <button
                    key={seatNumber}
                    onClick={() => handleSeatSelect(seatNumber)}
                    disabled={unavailableSeats.includes(seatNumber)}
                    className={`
                      h-12 rounded-md flex items-center justify-center text-sm font-medium transition-colors
                      ${
                        unavailableSeats.includes(seatNumber)
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : bookingData.seatNumber === seatNumber
                            ? "bg-green-100 text-green-800 border-2 border-green-500"
                            : "bg-white border border-gray-300 hover:bg-gray-100"
                      }
                    `}
                  >
                    {seatNumber}
                    {bookingData.seatNumber === seatNumber && <Check className="ml-1 h-4 w-4" />}
                  </button>
                ))}
              </div>
              <div className="flex justify-center gap-6 mt-2 text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-white border border-gray-300"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-gray-200"></div>
                  <span>Unavailable</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-green-100 border-2 border-green-500"></div>
                  <span>Selected</span>
                </div>
              </div>
            </div>

            {/* Passenger Details */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="passengerName">Passenger Name</Label>
                <Input
                  id="passengerName"
                  name="passengerName"
                  value={bookingData.passengerName}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passengerPhone">Phone Number</Label>
                <Input
                  id="passengerPhone"
                  name="passengerPhone"
                  value={bookingData.passengerPhone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            {/* Agent Selection */}
            <div className="space-y-2">
              <Label htmlFor="agentId">Select Agent</Label>
              <Select
                onValueChange={(value) => handleSelectChange("agentId", value)}
                value={bookingData.agentId?.toString() || ""}
              >
                <SelectTrigger id="agentId">
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id.toString()}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Information */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="isPaid">Payment Status</Label>
                <div className="flex items-center space-x-2">
                  <Switch id="isPaid" checked={bookingData.isPaid} onCheckedChange={handleSwitchChange} />
                  <span className={bookingData.isPaid ? "text-green-600" : "text-gray-500"}>
                    {bookingData.isPaid ? "Paid" : "Unpaid"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  onValueChange={(value) => handleSelectChange("paymentMethod", value)}
                  value={bookingData.paymentMethod}
                  disabled={!bookingData.isPaid}
                >
                  <SelectTrigger id="paymentMethod">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBooking}
              disabled={!isFormValid || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? "Processing..." : "Confirm Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

