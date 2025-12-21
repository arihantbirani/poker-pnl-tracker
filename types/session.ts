export interface Session {
  id: string;
  createdAt: number; // Unix timestamp
  date: string; // YYYY-MM-DD
  location: string;
  gameType: string;
  buyIn: number;
  cashOut: number;
  hours: number;
  stakeSold: number; // Percentage (0-100)
  notes: string;
}
