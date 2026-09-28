import React, { useState } from 'react';
import { MultiCitySearchResponse, LegSearchRequest } from '../../../backend/src/services/multi-city-search';

export const MultiCitySearch: React.FC = () => {
  const [legs, setLegs] = useState<LegSearchRequest[]>([
    { origin: '', destination: '', date: '' },
    { origin: '', destination: '', date: '' }
  ]);
  const [passengers, setPassengers] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MultiCitySearchResponse | null>(null);

  const handleLegChange = (index: number, field: keyof LegSearchRequest, value: string) => {
    const updated = [...legs];
    updated[index][field] = value;
    setLegs(updated);
  };

  const addLeg = () => {
    setLegs([...legs, { origin: '', destination: '', date: '' }]);
  };

  const removeLeg = (index: number) => {
    if (legs.length <= 1) return;
    const updated = legs.filter((_, i) => i !== index);
    setLegs(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      for (const leg of legs) {
        if (!leg.origin || !leg.destination || !leg.date) {
          throw new Error('Please fill in all fields for every leg.');
        }
      }

      const response = await fetch('/api/journeys/multi-city', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ legs, passengers })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch multi-city journey results');
      }

      const data: MultiCitySearchResponse = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="multi-city-search-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Multi-City Trip Planning</h2>
      <form onSubmit={handleSubmit} aria-label="Multi-city journey search form">
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="passengers-input" style={{ marginRight: '10px' }}>Passengers:</label>
          <input
            id="passengers-input"
            type="number"
            min="1"
            max="10"
            value={passengers}
            onChange={(e) => setPassengers(parseInt(e.target.value) || 1)}
          />
        </div>

        {legs.map((leg, index) => (
          <fieldset key={index} style={{ marginBottom: '15px', padding: '15px', border: '1px solid #ccc' }}>
            <legend>Leg {index + 1}</legend>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div>
                <label htmlFor={`origin-${index}`}>Origin: </label>
                <input
                  id={`origin-${index}`}
                  type="text"
                  placeholder="e.g. NYC"
                  value={leg.origin}
                  onChange={(e) => handleLegChange(index, 'origin', e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor={`destination-${index}`}>Destination: </label>
                <input
                  id={`destination-${index}`}
                  type="text"
                  placeholder="e.g. LON"
                  value={leg.destination}
                  onChange={(e) => handleLegChange(index, 'destination', e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor={`date-${index}`}>Date: </label>
                <input
                  id={`date-${index}`}
                  type="date"
                  value={leg.date}
                  onChange={(e) => handleLegChange(index, 'date', e.target.value)}
                  required
                />
              </div>
              {legs.length > 1 && (
                <button type="button" onClick={() => removeLeg(index)} style={{ marginTop: '15px' }}>
                  Remove Leg
                </button>
              )}
            </div>
          </fieldset>
        ))}

        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <button type="button" onClick={addLeg}>Add Another Leg</button>
          <button type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Search Journeys'}
          </button>
        </div>
      </form>

      {error && <div role="alert" style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

      {result && (
        <div className="search-results" style={{ marginTop: '20px', borderTop: '2px solid #333', paddingTop: '15px' }}>
          <h3>Combined Itinerary</h3>
          <p><strong>Total Price:</strong> {result.totalPrice} {result.currency}</p>
          <ul>
            {result.legs.map((l, idx) => (
              <li key={idx} style={{ marginBottom: '10px', padding: '10px', background: '#f9f9f9', border: '1px solid #ddd' }}>
                <strong>Leg {idx + 1}:</strong> {l.origin} &rarr; {l.destination} on {l.date}<br />
                <small>Carrier: {l.carrier} ({l.flightNumber}) | Price: {l.price} {l.currency}</small>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
