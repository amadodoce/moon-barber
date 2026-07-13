"use client";

import { create } from "zustand";

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
  totalDuration: 0,
  totalPrice: 0,
};

export const useBookingStore = create<BookingState>((set) => ({
  ...initialState,

  setStep: (step) => set({ step }),

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
  reset: () => set(initialState),
}));
