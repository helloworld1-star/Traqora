import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { MultiCityTripPlanner } from "../../components/journey/multi-city-trip-planner"
import { apiClient } from "../../lib/api"

jest.mock("../../lib/api", () => ({
  apiClient: {
    post: jest.fn(),
  },
}))

describe("MultiCityTripPlanner Component", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders default segments and form controls", () => {
    render(<MultiCityTripPlanner />)
    expect(screen.getByText(/Multi-City Journey Planner/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Passengers/i)).toBeInTheDocument()
    expect(screen.getByText(/Leg 1/i)).toBeInTheDocument()
    expect(screen.getByText(/Leg 2/i)).toBeInTheDocument()
  })

  it("allows adding and removing flight segments", () => {
    render(<MultiCityTripPlanner />)
    const addButton = screen.getByText(/Add Flight Segment/i)
    fireEvent.click(addButton)
    expect(screen.getByText(/Leg 3/i)).toBeInTheDocument()

    const removeButtons = screen.getAllByLabelText(/Remove leg/i)
    fireEvent.click(removeButtons[removeButtons.length - 1])
    expect(screen.queryByText(/Leg 3/i)).not.toBeInTheDocument()
  })

  it("calls multi-city API on submit and renders itinerary result", async () => {
    const mockItinerary = {
      segments: [
        {
          segment: { origin: "JFK", destination: "LHR", date: "2026-08-01", passengers: 1 },
          bestFlight: { flightNumber: "TQ101", airlineCode: "TQ", priceCents: 25000, duration: 420, status: "SCHEDULED" },
        },
      ],
      totalPrice: 250,
      totalDuration: 420,
      isOpenJaw: false,
      baggageAllowance: { checkIn: 23, carryOn: 10, currency: "kg", note: "test" },
    }

    ;(apiClient.post as jest.Mock).mockResolvedValueOnce({ success: true, data: mockItinerary })

    render(<MultiCityTripPlanner />)
    const submitButton = screen.getByRole("button", { name: /Search Journey Itinerary/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledTimes(1)
      expect(screen.getByText(/Combined Journey Itinerary/i)).toBeInTheDocument()
      expect(screen.getByText(/TQ101/i)).toBeInTheDocument()
    })
  })
})
