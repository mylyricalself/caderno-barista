export interface User {
  email: string;
  name: string; // Derived from email part before @
}

export interface Recipe {
  id: string;
  title: string;
  method: string; // e.g., V60, Espresso, Aeropress
  notes: string;
  createdAt: number;
  rating?: number; // 1 to 5
  categories?: string[];
  imageUrl?: string; // Base64 string
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

export enum BrewMethod {
  V60 = 'V60',
  Espresso = 'Espresso',
  Aeropress = 'Aeropress',
  FrenchPress = 'Prensa Francesa',
  Chemex = 'Chemex',
  ColdBrew = 'Cold Brew',
  Other = 'Outro'
}
