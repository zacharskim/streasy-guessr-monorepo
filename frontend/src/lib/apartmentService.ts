/**
 * Apartment API Service
 * Handles all API calls to the backend for apartment data
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface ApartmentResponse {
  id: number;
  listing_url: string;
  sqft: number | null;
  bedrooms: number;
  bathrooms: number;
  neighborhood: string;
  borough: string;
  address: string;
  amenities: string[];
  year_built: number | null;
  photo_count: number;
  home_features: string[];
  listing_id: number;
  property_id: number;
}

export interface RandomApartmentsResponse {
  apartments: ApartmentResponse[];
  count: number;
}

export interface ValidateGuessResponse {
  apartment_id: number;
  guessed_rent: number;
  actual_rent: number;
  difference: number;
  percentage_off: number;
  score: number;
}

/**
 * Get random apartments for gameplay
 * @param count - Number of random apartments to fetch (default: 1)
 */
export async function getRandomApartments(
  count: number = 1,
): Promise<ApartmentResponse[]> {
  try {
    const response = await fetch(
      `${API_BASE}/apartments/random?count=${Math.min(count, 10)}`,
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: RandomApartmentsResponse = await response.json();
    return data.apartments;
  } catch (error) {
    console.error("Failed to fetch random apartments:", error);
    throw error;
  }
}

/**
 * Validate a rent guess for a specific apartment
 * @param apartmentId - The apartment ID
 * @param guessedRent - The user's guessed rent amount
 */
export async function validateGuess(
  apartmentId: number,
  guessedRent: number,
): Promise<ValidateGuessResponse> {
  try {
    const response = await fetch(`${API_BASE}/apartments/validate-guess`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apartment_id: apartmentId,
        guessed_rent: guessedRent,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to validate guess:", error);
    throw error;
  }
}

/**
 * Get a specific apartment by ID (includes rent for verification)
 * @param apartmentId - The apartment ID
 */
export async function getApartment(
  apartmentId: number,
): Promise<ApartmentResponse & { rent: number }> {
  try {
    const response = await fetch(`${API_BASE}/apartments/${apartmentId}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch apartment:", error);
    throw error;
  }
}

/**
 * Construct image URL for an apartment from local backend storage
 * Images are stored as {listing_id}_{photo_index}.webp
 * Note: Images are served at /images, not /api/images
 */
export function getApartmentImageUrl(
  apartment: ApartmentResponse,
  photoIndex: number = 0,
): string {
  if (photoIndex < 0 || photoIndex >= apartment.photo_count) {
    return "/placeholder.png"; // Fallback
  }

  // Get base URL without /api suffix (images are served at root /images)
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const imageBase = baseUrl.replace("/api", ""); // Remove /api if present
  return `${imageBase}/images/${apartment.listing_id}_${photoIndex}.webp`;
}
