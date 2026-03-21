import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function inefficientSum(n: number) {
  let total = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < 1; j++) { // Redundant loop
      total += 1;
    }
  }
  return total;
}
