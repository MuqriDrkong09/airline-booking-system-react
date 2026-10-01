import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FlightSearchFormValues } from '../types/search';
import {
  RECENT_SEARCH_HISTORY_LIMIT,
  type RecentFlightSearch,
} from '../types/recentSearch';
import { prependRecentSearch, recentSearchFromFormValues } from '../utils/recentSearch';

interface RecentSearchesState {
  searches: RecentFlightSearch[];
  addSearch: (values: FlightSearchFormValues) => RecentFlightSearch | null;
  removeSearch: (id: string) => void;
  clearHistory: () => void;
}

export const useRecentSearchesStore = create<RecentSearchesState>()(
  persist(
    (set, get) => ({
      searches: [],

      addSearch: (values) => {
        const entry = recentSearchFromFormValues(values);
        if (!entry) {
          return null;
        }

        set({
          searches: prependRecentSearch(
            get().searches,
            entry,
            RECENT_SEARCH_HISTORY_LIMIT,
          ),
        });
        return entry;
      },

      removeSearch: (id) => {
        set({
          searches: get().searches.filter((item) => item.id !== id),
        });
      },

      clearHistory: () => set({ searches: [] }),
    }),
    {
      name: 'aerobook-recent-searches',
      partialize: (state) => ({ searches: state.searches }),
    },
  ),
);
