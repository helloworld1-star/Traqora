"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Badge } from "../../components/ui/badge"
import { Separator } from "../../components/ui/separator"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { MapPin, Plus, Trash2, Search, ArrowRight, DollarSign, Clock, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { apiClient } from "../../lib/api"

export interface FlightSegmentForm {
  origin: string
  destination: string
  date: string
  passengers: number
  travelClass?: 'economy' | 'premium_economy' | 'business' | 'first'
}

export function MultiCityTripPlanner() {
  const [segments, setSegments] = useState<FlightSegmentForm[]>([
    {
      origin: "JFK",
      destination: "LHR",
      date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      passengers: 1,
      travelClass: "economy",
    },
    {
      origin: "LHR",
      destination: "CDG",
      date: new Date(Date.now() + 4 * 86400000).toISOString().split("T")[0],
      passengers: 1,
      travelClass: "economy",
    },
  ])

  const [passengers, setPassengers] = useState(1)
  const [sortBy, setSortBy] = useState<'total_price' | 'total_duration'>('total_price')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [itineraryResult, setItineraryResult] = useState<any | null>(null)

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
        date: new Date(Date.now() + (segments.length + 1) * 86400000).toISOString().split("T")[0],
        passengers,
        travelClass: "economy",
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

  const updateSegment = (index: number, field: keyof FlightSegmentForm, value: any) => {
    const next = [...segments]
    next[index] = { ...next[index], [field]: value }
    setSegments(next)
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    for (const [idx, seg] of segments.entries()) {
      if (!seg.origin || seg.origin.length !== 3 || !seg.destination || seg.destination.length !== 3) {
        setError(`Segment ${idx + 1}: Please enter valid 3-letter IATA airport codes.`)
        setIsLoading(false)
        return
      }
    }

    try {
      const res = await apiClient.post('/api/v1/flights/multi-city', {
        segments: segments.map(s => ({
          ...s,
          origin: s.origin.toUpperCase(),
          destination: s.destination.toUpperCase(),
          passengers,
        })),
        passengers,
        sortBy,
        sortOrder,
      })

      if (res.success) {
        setItineraryResult(res.data)
        toast.success("Multi-city itinerary retrieved successfully!")
      } else {
        setError(res.error?.message || "Failed to fetch multi-city itinerary")
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during multi-city search")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
            Multi-City Journey Planner
          </CardTitle>
          <CardDescription>
            Search and combine up to 5 flight segments into a single seamless journey with per-leg pricing and open-jaw detection.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="global-passengers">Passengers</Label>
                <Input
                  id="global-passengers"
                  type="number"
                  min="1"
                  max="9"
                  value={passengers}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1
                    setPassengers(val)
                    setSegments(segments.map(s => ({ ...s, passengers: val })))
                  }}
                  className="w-32"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="space-y-1">
                  <Label htmlFor="sort-by">Sort By</Label>
                  <select
                    id="sort-by"
                    value={sortBy}
                    onChange={(e: any) => setSortBy(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="total_price">Total Price</option>
                    <option value="total_duration">Total Duration</option>
                  </select>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              {segments.map((segment, index) => (
                <div key={index} className="p-4 border rounded-xl relative space-y-4 bg-card shadow-sm">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="font-bold">
                      Leg {index + 1}
                    </Badge>
                    {segments.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSegment(index)}
                        aria-label={`Remove leg ${index + 1}`}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor={`origin-${index}`}>Origin</Label>
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
                      <Label htmlFor={`destination-${index}`}>Destination</Label>
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
                    <div>
                      <Label htmlFor={`class-${index}`}>Cabin Class</Label>
                      <select
                        id={`class-${index}`}
                        value={segment.travelClass || "economy"}
                        onChange={(e: any) => updateSegment(index, "travelClass", e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="economy">Economy</option>
                        <option value="premium_economy">Premium Economy</option>
                        <option value="business">Business</option>
                        <option value="first">First</option>
                      </select>
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
                className="w-full flex items-center justify-center gap-2 border-dashed"
              >
                <Plus className="h-4 w-4" /> Add Flight Segment
              </Button>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 animate-spin" /> Searching Multi-City Itineraries...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Search className="h-4 w-4" /> Search Journey Itinerary
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {itineraryResult && (
        <Card className="border-primary/50 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Combined Journey Itinerary</CardTitle>
                <CardDescription>
                  {itineraryResult.isOpenJaw ? (
                    <Badge variant="secondary" className="mt-1">Open-Jaw Itinerary Detected</Badge>
                  ) : (
                    <Badge variant="default" className="mt-1">Standard Round-Trip / Multi-City Circuit</Badge>
                  )}
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  ${itineraryResult.totalPrice?.toLocaleString() ?? 0}
                </div>
                <div className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                  <Clock className="h-3 w-3" /> Total Duration: {Math.round((itineraryResult.totalDuration ?? 0) / 60)}h
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {itineraryResult.segments?.map((resItem: any, idx: number) => (
                <div key={idx} className="p-4 rounded-lg bg-muted/40 border flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-semibold text-foreground">
                      <span>{resItem.segment.origin}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span>{resItem.segment.destination}</span>
                      <Badge variant="outline" className="ml-2 text-xs">{resItem.segment.date}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {resItem.bestFlight ? (
                        <span>Flight {resItem.bestFlight.flightNumber} ({resItem.bestFlight.airlineCode}) — {resItem.bestFlight.status}</span>
                      ) : (
                        <span className="text-destructive">No direct flight found for this segment</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">
                      ${resItem.bestFlight ? (resItem.bestFlight.priceCents ? resItem.bestFlight.priceCents / 100 : resItem.bestFlight.price ?? 0) : 0}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {resItem.bestFlight ? `${resItem.bestFlight.duration ?? 0} mins` : 'N/A'}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {itineraryResult.baggageAllowance && (
              <div className="p-4 rounded-lg bg-secondary/20 border text-sm space-y-1">
                <div className="font-semibold flex items-center gap-2">
                  Baggage Allowance Summary
                </div>
                <p className="text-muted-foreground">
                  Check-in: {itineraryResult.baggageAllowance.checkIn} {itineraryResult.baggageAllowance.currency} | Carry-on: {itineraryResult.baggageAllowance.carryOn} {itineraryResult.baggageAllowance.currency}
                </p>
                <p className="text-xs text-muted-foreground italic">{itineraryResult.baggageAllowance.note}</p>
              </div>
            )}

            <Button className="w-full" size="lg" onClick={() => toast.success("Journey itinerary selected for booking!")}>
              Book Combined Journey
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
