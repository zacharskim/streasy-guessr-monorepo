import { create } from 'zustand';

export interface Apartment {
  id: number;
  listing_url: string;
  rent?: number; // Only included when validating guess
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

export interface GuessResult {
  apartment_id: number;
  guessed_rent: number;
  actual_rent: number;
  difference: number;
  percentage_off: number;
  score: number;
}

interface GameState {
  // Current game state
  currentApartment: Apartment | null;
  currentRound: number;
  totalRounds: number;
  totalScore: number;
  guesses: GuessResult[];
  submitted: boolean;
  loading: boolean;
  error: string | null;

  // Actions
  loadNewApartment: () => Promise<void>;
  submitGuess: (guessedRent: number) => Promise<GuessResult | null>;
  nextRound: () => void;
  resetGame: (rounds?: number) => void;
  clearError: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  currentApartment: null,
  currentRound: 1,
  totalRounds: 5,
  totalScore: 0,
  guesses: [],
  submitted: false,
  loading: false,
  error: null,

  // Load a new apartment from the backend
  loadNewApartment: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/apartments/random?count=1`);
      if (!response.ok) throw new Error('Failed to fetch apartment');

      const data = await response.json();
      const apartment = data.apartments[0];

      set({
        currentApartment: apartment,
        submitted: false,
        loading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'An error occurred',
        loading: false,
      });
    }
  },

  // Submit a guess and get validation
  submitGuess: async (guessedRent: number) => {
    const { currentApartment } = get();
    if (!currentApartment) return null;

    set({ loading: true, error: null });
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/apartments/validate-guess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apartment_id: currentApartment.id,
          guessed_rent: guessedRent,
        }),
      });

      if (!response.ok) throw new Error('Failed to validate guess');

      const result: GuessResult = await response.json();

      set((state) => ({
        guesses: [...state.guesses, result],
        totalScore: state.totalScore + result.score,
        submitted: true,
        loading: false,
      }));

      return result;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'An error occurred',
        loading: false,
      });
      return null;
    }
  },

  // Move to next round
  nextRound: () => {
    set((state) => ({
      currentRound: state.currentRound + 1,
      submitted: false,
    }));
    get().loadNewApartment();
  },

  // Reset game
  resetGame: (rounds = 5) => {
    set({
      currentApartment: null,
      currentRound: 1,
      totalRounds: rounds,
      totalScore: 0,
      guesses: [],
      submitted: false,
      loading: false,
      error: null,
    });
    get().loadNewApartment();
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));
