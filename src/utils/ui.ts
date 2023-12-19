import { type ClassValue, clsx } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | number | Date, formatStr: string) {
  // @ts-expect-error - date-fns types are exported wrong
  return format(date, formatStr);
}
