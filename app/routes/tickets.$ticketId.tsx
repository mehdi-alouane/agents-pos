"use client"

import { createFileRoute, Link } from "@tanstack/react-router"
import { useEffect, useState, useRef } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { format, parseISO } from "date-fns"
import { Download, Printer, ArrowLeft } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

interface TicketData {
  ticketId: string
  busTripId: number
  seatNumber: number
  passengerName: string
  passengerPhone: string
  isPaid: boolean
  paymentMethod: string
  agentId: number
  bookingDate: string
  agent: string
  trip: {
    departureCity: string
    destinationCity: string
    departureDate: string
    price: number
  }
}

export const Route = createFileRoute("/tickets/$ticketId")({
  component: TicketDetail,
})

function TicketDetail() {
  const { ticketId } = Route.useParams()
  const [ticketData, setTicketData] = useState<TicketData | null>(null)
  const ticketRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // In a real app, you would fetch the ticket data from the API
    // For now, we'll get it from sessionStorage where we stored it during booking
    const storedTicketData = sessionStorage.getItem("ticketData")
    if (storedTicketData) {
      setTicketData(JSON.parse(storedTicketData))
    }
  }, [])

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // This is a simple approach - in a production app you might want to use a PDF library
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const ticketHtml = ticketRef.current?.innerHTML

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bus Ticket - ${ticketData?.passengerName}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .ticket { max-width: 800px; margin: 0 auto; border: 1px solid #ccc; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .details { margin-bottom: 20px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .label { font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            ${ticketHtml}
            <div class="footer">
              <p>Thank you for traveling with us!</p>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `)

    printWindow.document.close()
  }

  // Format date helper
  const formatDate = (dateString: string, formatStr: string) => {
    try {
      return format(parseISO(dateString), formatStr)
    } catch (e) {
      try {
        return format(new Date(dateString), formatStr)
      } catch (e) {
        return dateString
      }
    }
  }

  if (!ticketData) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>Loading ticket information...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <Link to="/trips" className="flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Trips
        </Link>
        <div className="print:hidden flex gap-2">
          <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button onClick={handleDownload} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <Card className="mx-auto max-w-3xl shadow-lg" ref={ticketRef}>
        <CardHeader className="border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Bus Ticket</CardTitle>
              <p className="text-sm text-gray-500">Ticket #{ticketData.ticketId}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Booking Date</p>
              <p className="text-sm text-gray-500">{formatDate(ticketData.bookingDate, "PPP")}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-4 md:col-span-2">
              <div>
                <h3 className="text-lg font-semibold">Trip Details</h3>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">From</p>
                    <p className="font-medium">{ticketData.trip.departureCity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">To</p>
                    <p className="font-medium">{ticketData.trip.destinationCity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Departure Date</p>
                    <p className="font-medium">{formatDate(ticketData.trip.departureDate, "PPP 'at' p")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Seat Number</p>
                    <p className="font-medium">{ticketData.seatNumber}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold">Passenger Information</h3>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{ticketData.passengerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{ticketData.passengerPhone}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold">Payment Information</h3>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className={`font-medium ${ticketData.isPaid ? "text-green-600" : "text-amber-600"}`}>
                      {ticketData.isPaid ? "Paid" : "Unpaid"}
                    </p>
                  </div>
                  {ticketData.isPaid && (
                    <div>
                      <p className="text-sm text-gray-500">Method</p>
                      <p className="font-medium">{ticketData.paymentMethod}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="font-medium">${ticketData.trip.price}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Agent</p>
                    <p className="font-medium">{ticketData.agent}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border bg-gray-50 p-4">
              <div className="bg-white p-2">
                <QRCodeSVG
                  value={`TICKET:${ticketData.ticketId}|TRIP:${ticketData.busTripId}|SEAT:${ticketData.seatNumber}|NAME:${ticketData.passengerName}`}
                  size={150}
                />
              </div>
              <p className="text-center text-sm text-gray-500">Scan this code to verify your ticket</p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t bg-gray-50 px-6 py-4">
          <div className="w-full text-center">
            <p className="text-sm text-gray-500">
              This ticket is valid only for the date and time specified. Please arrive at least 30 minutes before
              departure.
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

