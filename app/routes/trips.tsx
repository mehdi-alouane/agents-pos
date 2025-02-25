// File: trips.route.tsx
import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router"
import axios from "redaxios"
import { DEPLOY_URL } from "../utils/users"
import { TripsList } from "../components/trips/TripsList" // Import the new component

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
  const location = useLocation()
  
  return (
    <>
      {location.pathname === "/trips" ? (
        <TripsList trips={trips} />
      ) : (
        <Outlet />
      )}
    </>
  )
}