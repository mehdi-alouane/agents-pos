"use client"

import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"

import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form"
import { Input } from "../components/ui/input"
import { Calendar } from "../components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover"
import { toast } from "sonner"
import { Toaster } from "../components/ui/sonner"

const formSchema = z.object({
  departureCity: z.string().min(2, {
    message: "Departure city must be at least 2 characters.",
  }),
  destinationCity: z.string().min(2, {
    message: "Destination city must be at least 2 characters.",
  }),
  departureDate: z.date({
    required_error: "Departure date is required.",
  }),
  price: z.coerce.number().positive({
    message: "Price must be a positive number.",
  }),
})

type FormValues = z.infer<typeof formSchema>

function BusTripForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      departureCity: "",
      destinationCity: "",
      price: undefined,
    },
  })

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)

    try {
      // Format the date to ISO string
      const formattedValues = {
        ...values,
        departureDate: values.departureDate.toISOString(),
      }

      const response = await fetch("http://localhost:3000/api/admin/bus-trip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedValues),
      })

      if (!response.ok) {
        throw new Error("Failed to create bus trip")
      }

      toast("Success!",{
        description: "Bus trip has been added successfully."
      })

      // Reset the form
      form.reset()
    } catch (error) {
      console.error("Error creating bus trip:", error)
      toast("Error",{
        description: "Failed to create bus trip. Please try again."
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Bus Trip Details</CardTitle>
          <CardDescription>Enter the details for the new bus trip.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="departureCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departure City</FormLabel>
                      <FormControl>
                        <Input placeholder="New York" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="destinationCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination City</FormLabel>
                      <FormControl>
                        <Input placeholder="Boston" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="departureDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Departure Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                            >
                              {field.value ? format(field.value, "PPP HH:mm") : <span>Select date and time</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              if (date) {
                                // Set time to current time when selecting a date
                                const now = new Date()
                                date.setHours(now.getHours())
                                date.setMinutes(now.getMinutes())
                                field.onChange(date)
                              }
                            }}
                            initialFocus
                          />
                          <div className="p-3 border-t border-border">
                            <Input
                              type="time"
                              onChange={(e) => {
                                const [hours, minutes] = e.target.value.split(":").map(Number)
                                const date = field.value || new Date()
                                date.setHours(hours)
                                date.setMinutes(minutes)
                                field.onChange(new Date(date))
                              }}
                              value={
                                field.value
                                  ? `${field.value.getHours().toString().padStart(2, "0")}:${field.value.getMinutes().toString().padStart(2, "0")}`
                                  : ""
                              }
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="49.99" {...field} />
                      </FormControl>
                      <FormDescription>Enter the price in USD</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => form.reset()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving
                  </>
                ) : (
                  "Add Trip"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      <Toaster />
    </>
  )
}

function RouteComponent() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Add New Bus Trip</h1>
      <BusTripForm />
    </div>
  )
}

export const Route = createFileRoute("/bus-trip")({
  component: RouteComponent,
})

