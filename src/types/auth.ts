export type UserRole = 'MENTOR' | 'MENTEE';

export interface RegisterFormData {
  fullName: string;
  username: string;
  email: string;
  password: string;
  role: UserRole | string;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    fullname: string;
    email: string;
    role: UserRole;
    profile?: Profile | null;
  }
}

export interface Profile {
  id: number;
  bio?: string | null;
  location?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
  profilePicture?: string | null;
  experience?: string | null;
  skills?: string | null;
  availability?: string | null;
  interests?: string | null;
  learningGoals?: string | null;
  userId: number;
  createdAt: string;
  updatedAt: string;
}