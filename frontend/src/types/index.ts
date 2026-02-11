// types/auth.ts
export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

// types/chat.ts
export interface Message {
  id: number;
  user_id: number;
  role: 'user' | 'assistant';
  content: string;
  pokemon_context?: string;
  created_at: string;
}

export interface ChatResponse {
  message: string;
  pokemon_data?: PokemonData;
  suggestions?: string[];
}

export interface ConversationHistory {
  messages: Message[];
  total: number;
}

// types/pokemon.ts
export interface PokemonType {
  name: string;
  url: string;
}

export interface PokemonAbility {
  name: string;
  url: string;
  is_hidden: boolean;
}

export interface PokemonStat {
  name: string;
  base_stat: number;
  effort: number;
}

export interface PokemonSprites {
  front_default?: string;
  front_shiny?: string;
  front_female?: string;
  back_default?: string;
  other?: {
    'official-artwork'?: {
      front_default?: string;
    };
  };
}

export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience?: number;
  types: Array<{ type: PokemonType }>;
  abilities: Array<{ ability: PokemonAbility; is_hidden: boolean }>;
  stats: Array<{ stat: { name: string }; base_stat: number }>;
  sprites: PokemonSprites;
  species: { name: string; url: string };
}

export interface PokemonData {
  id: number;
  name: string;
  types: string[];
  sprite?: string;
  stats: Record<string, number>;
}

export interface PokemonListItem {
  name: string;
  url: string;
}

export interface PokemonList {
  count: number;
  next?: string;
  previous?: string;
  results: PokemonListItem[];
}