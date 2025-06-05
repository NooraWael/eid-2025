export interface EidSubmission {
  id: string;
  name: string;
  html_content: string;
  css_content: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      eid_submissions: {
        Row: EidSubmission;
        Insert: Omit<EidSubmission, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<EidSubmission, "id" | "created_at">>;
      };
    };
  };
}
