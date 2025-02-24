import { createFileRoute } from "@tanstack/react-router"
import { DEPLOY_URL } from "../utils/users"
import axios from "redaxios"
import { format, parseISO } from "date-fns"

// Define the trip type
interface Trip {
  id: number
  departure_city: string
  destination_city: string
  departure_date: string
  price: number
  created_by: number
  created_at: string
}

export const Route = createFileRoute("/trips/$tripId")({
  component: TripDetail,
  loader: async ({ params }) => {
    // Fixed: Use the actual tripId from params
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
  
  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Trip Details</h1>
          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
            ID: {trip.id}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Route Information</h2>
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">From:</span>
                <span className="font-medium">{trip.departure_city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">To:</span>
                <span className="font-medium">{trip.destination_city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Departure:</span>
                <span className="font-medium">
                  {formatDate(trip.departure_date, "PPP 'at' p")}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Ticket Information</h2>
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Price:</span>
                <span className="font-medium text-green-600">
                  ${typeof trip.price === 'number' ? trip.price.toFixed(2) : trip.price}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created by:</span>
                <span className="font-medium">User #{trip.created_by}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Added on:</span>
                <span className="font-medium">
                  {formatDate(trip.created_at, "PPP")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
            Book This Trip
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition">
            Back to Trips
          </button>
        </div>
      </div>
    </div>
  )
}