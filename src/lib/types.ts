export type AbroadPrTreatment =
  | "none"
  | "canadian_employer"
  | "accompany_citizen"
  | "crown_employee";

export interface Trip {
  id: string;
  departureDate: string; // YYYY-MM-DD
  returnDate: string;
  abroadPrTreatment: AbroadPrTreatment;
}

export interface TrackerProfile {
  arrivalDate: string;
  prDate: string | null;
}

export interface TrackerState {
  profile: TrackerProfile;
  trips: Trip[];
}

export const DEFAULT_PROFILE: TrackerProfile = {
  arrivalDate: "",
  prDate: null,
};
