"client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@components/ui/card"
import { Button } from "@components/ui/button"
import { Input } from "@components/ui/input"
import { Label } from "@components/ui/label"
import { Badge } from "@components/ui/badge"
import { Alert, AlertDescription } from "@components/ui/alert"
import { Plus, Trash2, Search, Plane, Clock, DollarSign, ShieldAlert } from "lucide-react"

export interface MultiCitySegmentInput {
  origin: string
  destination: string
  date: string
  passengers: number
  travelClass?: 'economy' | 'premium_economy' | 'business' | 'first'
}

export function MultiCityTripPlanner() {
  const [segments, setSegments] = useState<MultiCitySegmentInput[]>([
    { origin: "JFK", destination: "LHR", date: "2026-09-01", passengers: 1, travelClass: "economy" },
    { origin: "LHR", destination: "CDG", date: "2026-09-05", passengers: 1, travelClass: "economy" },
  ])
  const [passengers, setPassengers] = useState<number>(1)
  const [sortBy, setSortBy] = useState<'total_price' | 'total_duration'>('total_price')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any | null>(null)

  const handleAddSegment = () => {
    if (segments.length >= 5) {
      setError("Maximum of 5 segments allowed for multi-city trips.")
      return
    }
    setError(null)
    const lastDest = segments[segments.length - 1]?.destination || ""
    setSegments([
      ...segments,
      {
        origin: lastDest,
        destination: "",
        date: new Date().toISOString().slice(0, 10),
        passengers,
        travelClass: "economy",
      },
    ])
  }

  const handleRemoveSegment = (index: number) => {
    if (segments.length <= 2) {
      setError("Multi-city search requires at least 2 segments.")
      return
    }
    setError(null)
    setSegments(segments.filter((_, i) => i !== index))
  }

  const handleSegmentChange = (index: number, field: keyof MultiCitySegmentInput, value: any) => {
    const next = [...segments]
    next[index] = { ...next[index], [field]: value }
    setSegments(next)
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/v1/flights/multi-city", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          segments: segments.map((s) => ({
            ...s,
            origin: s.origin.toUpperCase(),
            destination: s.destination.toUpperCase(),
            passengers,
          })),
          passengers,
          sortBy,
          sortOrder,
        }),
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || "Failed to fetch multi-city journey itinerary")
      }

      setResult(data.data)
    } catch (err: any) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5 text-primary" aria-hidden="true" />
            Multi-City Journey Planner
          </CardTitle>
          <CardDescription>
            Plan custom itineraries across multiple destinations with per-leg pricing and open-jaw detection.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="passengers-input">Passengers</Label>
                <Input
                  id="passengers-input"
                  type="number"
                  min={1}
                  max={9}
                  value={passengers}
                  onChange={(e) => setPassengers(parseInt(e.target.value) || 1)}
                  className="w-32"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Flight Segments</h3>
              {segments.map((segment, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 border rounded-lg bg-card items-end">
                  <div>
                    <Label htmlFor={`origin-${index}`}>Origin (IATA)</Label>
                    <Input
                      id={`origin-${index}`}
                      maxLength={3}
                      value={segment.origin}
                      onChange={(e) => handleSegmentChange(index, "origin", e.target.value.toUpperCase())}
                      placeholder="JFK"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`dest-${index}`}>Destination (IATA)</Label>
                    <Input
                      id={`dest-${index}`}
                      maxLength={3}
                      value={segment.destination}
                      onChange={(e) => handleSegmentChange(index, "destination", e.target.value.toUpperCase())}
                      placeholder="LHR"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`date-${index}`}>Date</Label>
                    <Input
                      id={`date-${index}`}
                      type="date"
                      value={segment.date}
                      onChange={(e) => handleSegmentChange(index, "date", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`class-${index}`}>Class</Label>
                    <select
                      id={`class-${index}`}
                      value={segment.travelClass || "economy"}
                      onChange={(e) => handleSegmentChange(index, "travelClass", e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="economy">Economy</option>
                      <option value="premium_economy">Premium Economy</option>
                      <option value="business">Business</option>
                      <option value="first">First</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-end">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemoveSegment(index)}
                      aria-label={`Remove segment ${index + 1}`}
                      disabled={segments.length <= 2}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <div className="flex justify-between items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddSegment}
                  disabled={segments.length >= 5}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" /> Add Stop ({segments.length}/5)
                </Button>

                <Button type="submit" disabled={loading} className="flex items-center gap-2">
                  <Search className="h-4 w-4" /> {loading ? "Searching Itinerary..." : "Search Multi-City"}
                </Button>
              </div>
            </div>
          </form>

          {error && (
            <Alert variant="destructive" className="mt-6">
              <ShieldAlert className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="mt-8 space-y-6 border-t pt-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Combined Itinerary Results</h3>
                  <p className="text-sm text-muted-foreground">
                    Total Price: <span className="font-bold text-foreground">${result.totalPrice}</span> | Total Duration: <span className="font-bold text-foreground">{Math.round(result.totalDuration / 60)}h</span>
                  </p>
                </div>
                {result.isOpenJaw && (
                  <Badge variant="secondary" className="text-sm">
                    Open-Jaw Trip Detected
                  </Badge>
                )}
              </div>

              <div className="space-y-4">
                {result.segments?.map((segRes: any, i: number) => (
                  <div key={i} className="p-4 border rounded-lg bg-card space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        Leg {i + 1}: {segRes.segment.origin} → {segRes.segment.destination}
                      </span>
                      <Badge variant="outline">{segRes.segment.date}</Badge>
                    </div>
                    {segRes.bestFlight ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-muted-foreground pt-2 border-t">
                        <div>Flight: <span className="text-foreground font-semibold">{segRes.bestFlight.flightNumber}</span></div>
                        <div>Price: <span className="text-foreground font-semibold">${segRes.bestFlight.price}</span></div>
                        <div>Duration: <span className="text-foreground font-semibold">{segRes.bestFlight.duration}m</span></div>
                      </div>
                    ) : (
                      <p className="text-sm text-red-500 italic">No direct flight found for this segment.</p>
                    )}
                  </div>
                ))}
              </div>

              {result.baggageAllowance && (
                <div className="p-4 rounded-lg bg-muted text-sm space-y-1">
                  <p className="font-semibold text-foreground">Baggage Allowance Summary</p>
                  <p className="text-muted-foreground">
                    Carry-On: {result.baggageAllowance.carryOn} {result.baggageAllowance.currency} | Check-In: {result.baggageAllowance.checkIn} {result.baggageAllowance.currency}
                  </p>
                  <p className="text-xs text-muted-foreground italic">{result.baggageAllowance.note}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
