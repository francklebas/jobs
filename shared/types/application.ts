export const APPLICATION_STATUSES = [
  "envoyee",
  "relancee",
  "entretien",
  "offre",
  "refusee",
  "sans_reponse",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  envoyee: "Envoyée",
  relancee: "Relancée",
  entretien: "Entretien",
  offre: "Offre",
  refusee: "Refusée",
  sans_reponse: "Sans réponse",
};

/** Statuts pour lesquels une relance a encore du sens. */
export const ACTIVE_STATUSES: ApplicationStatus[] = [
  "envoyee",
  "relancee",
  "entretien",
];

export interface Application {
  id: string;
  user_id: string;
  company: string;
  position: string;
  status: ApplicationStatus;
  applied_at: string;
  follow_up_at: string | null;
  contact_name: string | null;
  contact_email: string | null;
  job_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApplicationInput {
  company: string;
  position: string;
  status?: ApplicationStatus;
  applied_at?: string | null;
  follow_up_at?: string | null;
  contact_name?: string | null;
  contact_email?: string | null;
  job_url?: string | null;
  notes?: string | null;
}
