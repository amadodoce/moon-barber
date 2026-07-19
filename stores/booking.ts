"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const safeLocalStorage = {
  getItem: (name: string): string | null => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      localStorage.setItem(name, value);
    } catch {
      // Safari private mode / storage quota
    }
  },
  removeItem: (name: string): void => {
    try {
      localStorage.removeItem(name);
    } catch {
      // ignore
    }
  },
};

export interface BookingState {
  step: 1 | 2 | 3 | 4;
  serviceIds: string[];
  serviceDetails: Array<{
    id: string;
    name: string;
    durationMinutes: number;
    price: number;
  }>;
  date: string | null;
  startTime: string | null;
  endTime: string | null;
  barberId: string | null;
  barberName: string | null;
  notes: string;
  _hasHydrated: boolean;

  // Computed
  totalDuration: number;
  totalPrice: number;

  // Actions
  setStep: (step: 1 | 2 | 3 | 4) => void;
  toggleService: (service: {
    id: string;
    name: string;
    durationMinutes: number;
    price: number;
  }) => void;
  setDate: (date: string) => void;
  setTime: (start: string, end: string) => void;
  setBarber: (id: string | null, name: string | null) => void;
  setNotes: (notes: string) => void;
  setHasHydrated: (value: boolean) => void;
  reset: () => void;
}

const initialState = {
  step: 1 as const,
  serviceIds: [] as string[],
  serviceDetails: [] as Array<{
    id: string;
    name: string;
    durationMinutes: number;
    price: number;
  }>,
  date: null as string | null,
  startTime: null as string | null,
  endTime: null as string | null,
  barberId: null as string | null,
  barberName: null as string | null,
  notes: "",
  _hasHydrated: false,
  totalDuration: 0,
  totalPrice: 0,
};

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      ...initialState,

      setStep: (step) => set({ step }),
      setHasHydrated: (value) => set({ _hasHydrated: value }),

      toggleService: (service) =>
        set((state) => {
          const exists = state.serviceIds.includes(service.id);
          const newIds = exists
            ? state.serviceIds.filter((id) => id !== service.id)
            : [...state.serviceIds, service.id];
          const newDetails = exists
            ? state.serviceDetails.filter((s) => s.id !== service.id)
            : [...state.serviceDetails, service];

          return {
            serviceIds: newIds,
            serviceDetails: newDetails,
            totalDuration: newDetails.reduce(
              (sum, s) => sum + s.durationMinutes,
              0
            ),
            totalPrice: newDetails.reduce((sum, s) => sum + s.price, 0),
          };
        }),

      setDate: (date) => set({ date, startTime: null, endTime: null }),
      setTime: (start, end) => set({ startTime: start, endTime: end }),
      setBarber: (id, name) => set({ barberId: id, barberName: name }),
      setNotes: (notes) => set({ notes }),
      reset: () => set({ ...initialState, _hasHydrated: true }),
    }),
    {
      name: "barber-booking",
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (state) => ({
        serviceIds: state.serviceIds,
        serviceDetails: state.serviceDetails,
        date: state.date,
        startTime: state.startTime,
        endTime: state.endTime,
        barberId: state.barberId,
        barberName: state.barberName,
        notes: state.notes,
        totalDuration: state.totalDuration,
        totalPrice: state.totalPrice,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
