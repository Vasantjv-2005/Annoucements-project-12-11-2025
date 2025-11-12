export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  is_admin: boolean
}

export interface Announcement {
  id: string
  title: string
  message: string
  author_id: string
  author?: User
  tags: string[]
  image_url?: string
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
}
