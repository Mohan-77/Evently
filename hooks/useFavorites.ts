"use client";

import { useLocalStorage } from "./useLocalStorage";

const emptyFavorites: string[] = [];
function isFavoriteList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export function useFavorites() {
  const [favorites, setFavorites] = useLocalStorage<string[]>("evently-favorites", emptyFavorites, isFavoriteList);
  const toggleFavorite = (id: string) =>
    setFavorites((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  return { favorites, toggleFavorite };
}
