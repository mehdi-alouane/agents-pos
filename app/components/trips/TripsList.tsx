// File: TripsList.tsx
import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { format } from "date-fns"
import { Search } from "lucide-react"
import { Input } from "../ui/input"
import { Card, CardContent } from "../ui/card"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination"
import { BusTrip } from "types"

// Constants
const ITEMS_PER_PAGE = 6

// Format price to MAD currency
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("ar-MA", {
    style: "currency",
    currency: "MAD",
    minimumFractionDigits: 2,
  }).format(price)
}

// TripCard Component
const TripCard = ({ trip }: { trip: BusTrip }) => (
  <Link
    to="/trips/$tripId"
    params={{
      tripId: String(trip.id)
    }}
    className="block transition-transform hover:scale-[1.02]"
    key={trip.id}
  >
    <Card className="h-full">
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
  </Link>
)

// Search Component
const SearchBar = ({ value, onChange }: { value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <div className="relative">
    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    <Input placeholder="Search trips..." value={value} onChange={onChange} className="pl-9" />
  </div>
)

// PaginationBar Component
const PaginationBar = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: { 
  currentPage: number, 
  totalPages: number, 
  onPageChange: (page: number) => void 
}) => {
  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i)
        }
        pageNumbers.push("ellipsis")
        pageNumbers.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1)
        pageNumbers.push("ellipsis")
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i)
        }
      } else {
        pageNumbers.push(1)
        pageNumbers.push("ellipsis")
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i)
        }
        pageNumbers.push("ellipsis")
        pageNumbers.push(totalPages)
      }
    }

    return pageNumbers
  }

  return (
    <Pagination className="mt-8">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>

        {getPageNumbers().map((pageNumber, index) => (
          <PaginationItem key={index}>
            {pageNumber === "ellipsis" ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                onClick={() => onPageChange(pageNumber as number)}
                isActive={currentPage === pageNumber}
                className="cursor-pointer"
              >
                {pageNumber}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

// Main TripsList Component
export const TripsList = ({ trips }: { trips: BusTrip[] }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  // Filter trips based on search query
  const filteredTrips = trips?.filter(
    (trip: BusTrip) =>
      trip.price.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.destinationCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.departureCity.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Calculate pagination
  const totalItems = filteredTrips?.length || 0
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentTrips = filteredTrips?.slice(startIndex, endIndex)

  // Reset to first page when searching
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <SearchBar value={searchQuery} onChange={handleSearch} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {currentTrips?.map((trip: BusTrip) => (
          <TripCard key={trip.id} trip={trip} />
        ))}
      </div>

      {filteredTrips?.length === 0 ? (
        <p className="text-center text-muted-foreground">No trips found matching your search.</p>
      ) : (
        <>
          <PaginationBar 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
          />

          <div className="text-center text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} trips
          </div>
        </>
      )}
    </div>
  )
}