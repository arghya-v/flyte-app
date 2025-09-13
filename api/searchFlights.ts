const AMADEUS_API = "https://test.api.amadeus.com";

async function getAccessToken() {
  const response = await fetch(`${AMADEUS_API}/v1/security/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.EXPO_PUBLIC_AMADEUS_CLIENT_ID || "",
      client_secret: process.env.EXPO_PUBLIC_AMADEUS_CLIENT_SECRET || "",
    }).toString(),
  });

  const text = await response.text();
  if (!response.ok) throw new Error("Failed to get access token: " + text);
  return JSON.parse(text);
}

type FlightSearchParams = {
  origin: string;
  destination: string;
  date: string;
  returnDate?: string;
  adults?: number;
  children?: number;
  infants?: number;
  flightType?: string;
  serviceClass?: string;
};

export async function searchFlights(params: FlightSearchParams) {
  const {
    origin,
    destination,
    date,
    returnDate,
    adults,
    children,
    infants,
    flightType,
    serviceClass,
  } = params;

  if (!origin || !destination || !date) {
    throw new Error("Missing required parameters");
  }

  // Step 1: Get access token
  const tokenData = await getAccessToken();

  // Step 2: Build Amadeus API URL
  let apiUrl = `${AMADEUS_API}/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destination}&departureDate=${date}&max=20`;

  apiUrl += `&adults=${adults || 1}`;
  apiUrl += `&children=${children || 0}`;
  apiUrl += `&infants=${infants || 0}`;

  if ((flightType?.toLowerCase() === "roundtrip") && returnDate) {
    apiUrl += `&returnDate=${returnDate}`;
  }

  const travelClassMap: Record<string, string> = {
    economy: "ECONOMY",
    "premium economy": "PREMIUM_ECONOMY",
    business: "BUSINESS",
    first: "FIRST",
  };
  if (serviceClass) {
    const tc = travelClassMap[serviceClass.toLowerCase()];
    if (tc) apiUrl += `&travelClass=${tc}`;
  }

  // Step 3: Fetch flights
  const flightResponse = await fetch(apiUrl, {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  const text = await flightResponse.text();
  if (!flightResponse.ok) {
    throw new Error("Failed to fetch flights: " + text);
  }

  const flights = JSON.parse(text);

  // Step 4: Transform into detailed format
  return (flights.data || []).map((f: any) => ({
    id: f.id,
    price: f.price, // total price
    travelers: f.travelerPricings?.map((tp: any) => ({
      travelerId: tp.travelerId,
      fareOption: tp.fareOption,
      travelerType: tp.travelerType,
      price: tp.price,
    })),
    itineraries: f.itineraries.map((it: any) => ({
      duration: it.duration,
      segments: it.segments.map((seg: any) => ({
        carrier: seg.carrierCode,
        flightNumber: seg.number,
        departure: {
          iataCode: seg.departure.iataCode,
          at: seg.departure.at,
        },
        arrival: {
          iataCode: seg.arrival.iataCode,
          at: seg.arrival.at,
        },
        duration: seg.duration,
        aircraft: seg.aircraft?.code || null,
      })),
    })),
  }));
}