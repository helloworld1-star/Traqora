"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, Plus, Trash2, Search, Clock, Plane, AlertCircle, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { apiClient } from "@/lib/api"

export interface MultiCitySegmentInput {
  origin: string
  destination: string
  date: string
  passengers: number
  travelClass?: 'economy' | 'premium_economy' | 'business' | 'first'
}

export interface SegmentResultItem {
  segment: MultiCitySegmentInput
  flights: any[]
  bestFlight: any | null
}

export interface MultiCityItineraryResult {
  segments: SegmentResultItem[]
  totalPrice: number
  totalDuration: number
  isOpenJaw: boolean
  baggageAllowance: {
    checkIn: number
    carryOn: number
    currency: string
    note: string
  }
}

export function JourneyPlannerUI() {
  const [segments, setSegments] = useState<MultiCitySegmentInput[]>([
    {
      origin: "JFK",
      destination: "LHR",
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      passengers: 1,
      travelClass: 'economy',
    },
    {
      origin: "LHR",
      destination: "CDG",
      date: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
      passengers: 1,
      travelClass: 'economy',
    },
  ])

  const [passengers, setPassengers] = useState<number>(1)
  const [sortBy, setSortBy] = useState<'total_price' | 'total_duration'>('total_price')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [itinerary, setItinerary] = useState<MultiCityItineraryResult | null>(null)

  const addSegment = () => {
    if (segments.length >= 5) {
      toast.error("Multi-city search supports at most 5 segments")
      return
    }
    const lastSegment = segments[segments.length - 1]
    setSegments([
      ...segments,
      {
        origin: lastSegment ? lastSegment.destination : "",
        destination: "",
        date: new Date(Date.now() + (segments.length + 1) * 86400000).toISOString().split('T')[0],
        passengers,
        travelClass: 'economy',
      },
    ])
  }

  const removeSegment = (index: number) => {
    if (segments.length <= 2) {
      toast.error("Multi-city search requires at least 2 segments")
      return
    }
    setSegments(segments.filter((_, i) => i !== index))
  }

  const updateSegment = (index: number, field: keyof MultiCitySegmentInput, value: any) => {
    const next = [...segments]
    next[index] = { ...next[index], [field]: value }
    setSegments(next)
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    setItinerary(null)

    try {
      const formattedSegments = segments.map(s => ({
        ...s,
        origin: s.origin.toUpperCase().trim(),
        destination: s.destination.toUpperCase().trim(),
        passengers,
      }))

      const res = await apiClient.post('/api/v1/flights/multi-city', {
        segments: formattedSegments,
        passengers,
        sortBy,
        sortOrder,
      })

      if (res.success && res.data) {
        setItinerary(res.data)
        toast.success("Multi-city itinerary generated successfully!")
      } else {
        throw new Error(res.error?.message || "Failed to search multi-city itinerary")
      }
    } catch (err: any) {
      const msg = err.message || "An error occurred while searching multi-city flights"
      setError(msg)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 p-4" role="region" aria-label="Multi-City Journey Planner">
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Plane className="h-6 w-6 text-primary" aria-hidden="true" />
            Multi-City Journey Planner
          </CardTitle>
          <CardDescription>
            Plan custom multi-stop trips and search combined itineraries with per-leg pricing and baggage allowances.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="flex flex-wrap gap-4 items-center justify-between bg-muted/30 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <Label htmlFor="global-passengers" className="font-medium">Passengers:</Label>
                <Input
                  id="global-passengers"
                  type="number"
                  min={1}
                  max={9}
                  value={passengers}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1
                    setPassengers(val)
                    setSegments(segments.map(s => ({ ...s, passengers: val })))
                  }}
                  className="w-24"
                />
              </div>
              <div className="flex items-center gap-3">
                <Label htmlFor="sort-by" className="font-medium">Sort By:</Label>
                <select
                  id="sort-by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="border rounded-md px-3 py-2 text-sm bg-background"
                >
                  <option value="total_price">Total Price</option>
                  <option value="total_duration">Total Duration</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {segments.map((segment, index) => (
                <div key={index} className="p-4 border rounded-xl bg-card space-y-4 relative shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold text-primary">
                      <MapPin className="h-4 w-4" aria-hidden="true" />
                      Segment {index + 1}
                    </div>
                    {segments.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSegment(index)}
                        aria-label={`Remove segment ${index + 1}`}
                        className="text-destructive hover:text-destructive/90"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor={`origin-${index}`}>Origin (IATA)</Label>
                      <Input
                        id={`origin-${index}`}
                        value={segment.origin}
                        onChange={(e) => updateSegment(index, "origin", e.target.value.toUpperCase())}
                        placeholder="JFK"
                        maxLength={3}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor={`destination-${index}`}>Destination (IATA)</Label>
                      <Input
                        id={`destination-${index}`}
                        value={segment.destination}
                        onChange={(e) => updateSegment(index, "destination", e.target.value.toUpperCase())}
                        placeholder="LHR"
                        maxLength={3}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor={`date-${index}`}>Departure Date</Label>
                      <Input
                        id={`date-${index}`}
                        type="date"
                        value={segment.date}
                        onChange={(e) => updateSegment(index, "date", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {segments.length < 5 && (
              <Button
                type="button"
                variant="outline"
                onClick={addSegment}
                className="w-full border-dashed py-6 flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add Another Flight Leg
              </Button>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full py-6 text-base" disabled={isLoading}>
              {isLoading ? "Searching Multi-City Flights..." : "Search Multi-City Itinerary"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {itinerary && (
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Journey Itinerary Result</span>
              <div className="flex items-center gap-2">
                {itinerary.isOpenJaw && (
                  <Badge variant="secondary">Open-Jaw Trip</Badge>
                )}
                <Badge variant="default">
                  Total: ${itinerary.totalPrice.toFixed(2)}
                </Badge>
              </div>
            </CardTitle>
            <CardDescription>
              Combined itinerary across {itinerary.segments.length} flight legs. Total duration: {Math.round(itinerary.totalDuration / 60)}h.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {itinerary.segments.map((resItem, idx) => (
                <div key={idx} className="p-4 border rounded-xl space-y-3 bg-muted/20">
                  <div className="flex items-center justify-between font-medium">
                    <span className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-primary" aria-hidden="true" />
                      Leg {idx + 1}: {resItem.segment.origin} to {resItem.segment.destination}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Date: {resItem.segment.date}
                    </span>
                  </div>

                  {resItem.bestFlight ? (
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-3 bg-background rounded-lg border text-sm items-center">
                      <div>
                        <p className="font-semibold">Flight {resItem.bestFlight.flightNumber}</p>
                        <p className="text-muted-foreground text-xs">Airline: {resItem.bestFlight.airlineCode}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Departure</p>
                        <p className="font-medium">{new Date(resItem.bestFlight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Duration</p>
                        <p className="font-medium">{resItem.bestFlight.duration ? `${Math.round(resItem.bestFlight.duration / 60)}h` : 'Direct'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground">Price</p>
                        <p className="font-bold text-primary">${(resItem.bestFlight.price ?? 0).toFixed(2)}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
                      No available direct flight found for this segment on the selected date.
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Separator />

            <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
              <p className="font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
                Baggage Allowance Summary
              </p>
              <p className="text-muted-foreground">
                Check-in: {itinerary.baggageAllowance.checkIn}{itinerary.baggageAllowance.currency} | Carry-on: {itinerary.baggageAllowance.carryOn}{itinerary.baggageAllowance.currency}
              </p>
              <p className="text-xs text-muted-foreground italic">
                {itinerary.baggageAllowance.note}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
