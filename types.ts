import { LucideIcon } from 'lucide-react';

export interface Tool {
  id: string;
  name: string;
  description: string;
  path: string;
  icon: LucideIcon;
}

export interface CalculationResult {
  decimal: string;
  hex: string;
  isError: boolean;
  errorMessage?: string;
}
