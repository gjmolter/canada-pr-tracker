import type { AbroadPrTreatment } from "./types";

export const ABROAD_OPTIONS: {
  value: AbroadPrTreatment;
  label: string;
  hint: string;
}[] = [
  {
    value: "none",
    label: "Personal / leisure",
    hint: "Standard absence. No PR or citizenship credit abroad.",
  },
  {
    value: "canadian_employer",
    label: "Full-time for Canadian employer (abroad)",
    hint: "Often counts as a day in Canada for PR, not for citizenship (private sector).",
  },
  {
    value: "accompany_citizen",
    label: "Accompanying Canadian citizen spouse/partner",
    hint: "May count as in Canada for PR obligations; not a citizenship physical day.",
  },
  {
    value: "crown_employee",
    label: "Crown / public service abroad",
    hint: "May count for both PR and citizenship physical presence (verify eligibility).",
  },
];
