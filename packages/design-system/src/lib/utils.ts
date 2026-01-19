import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes intelligently
 * Handles conflicts by giving precedence to the last class
 * @example
 * cn("px-2 px-4") // returns "px-4"
 * cn("text-red-500 text-blue-500") // returns "text-blue-500"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
