export type User = {
  id: string;
  email: string;
  created_at: string;
};

export type AuthState = {
  user: User | null;
  loading: boolean;
};
