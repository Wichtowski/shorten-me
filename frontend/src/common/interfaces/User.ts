export interface User {
  id: string;
  email: string;
  username: string;
}

export interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}
