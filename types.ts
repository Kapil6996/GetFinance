export type Category = string;

export interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
  category: Category;
  date: string;
  isImportant: boolean; // Replaces isRecurring
  isPaid: boolean;
}

export interface HistoryItem {
  month: string; // e.g., "Oct 2023"
  totalSpent: number;
  income: number;
  saved: number;
}

export interface UserSettings {
  monthlyIncome: number;
  currencySymbol: string;
  userName: string;
  categories: string[];
  isOnboardingComplete: boolean;
  history: HistoryItem[];
}

export type Page = 'dashboard' | 'spreadsheet' | 'advisor' | 'settings';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isLoading?: boolean;
}