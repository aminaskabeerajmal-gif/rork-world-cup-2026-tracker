import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

const STORAGE_KEY = "wc26.favorites";

export const [FavoritesProvider, useFavorites] = createContextHook(() => {
  const [ids, setIds] = useState<string[]>([]);

  const query = useQuery({
    queryKey: ["favorites"],
    queryFn: async (): Promise<string[]> => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const parsed: string[] = raw ? JSON.parse(raw) : [];
        setIds(parsed);
        return parsed;
      } catch {
        return [];
      }
    },
  });

  const persist = useCallback(async (next: string[]) => {
    setIds(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore write failures
    }
  }, []);

  const toggle = useCallback(
    (id: string) => {
      const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
      persist(next);
    },
    [ids, persist]
  );

  const isFavorite = useCallback((id: string) => ids.includes(id), [ids]);

  return useMemo(
    () => ({ ids, toggle, isFavorite, isLoading: query.isLoading }),
    [ids, toggle, isFavorite, query.isLoading]
  );
});
