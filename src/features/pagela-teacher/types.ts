export type Pagela = {
  id: string;
  shelteredId: string;
  teacherProfileId: string | null;
  referenceDate: string;
  year: number;
  week: number;
  present: boolean;
  didMeditation: boolean;
  recitedVerse: boolean;
  notes: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type PageDto<T> = { items: T[]; total: number; page: number; limit: number };


export type CreatePagelaPayload = {
  shelteredId: string;
  teacherProfileId?: string | null;
  referenceDate: string;
  week: number;
  year?: number;
  present: boolean;
  didMeditation: boolean;
  recitedVerse: boolean;
  notes?: string | null;
};

export type UpdatePagelaPayload = Partial<Omit<CreatePagelaPayload, "shelteredId">> & {
  teacherProfileId?: string | null;
};
