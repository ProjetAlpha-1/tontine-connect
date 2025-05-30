export interface User {
  id: string
  phone: string
  name?: string
  email?: string
  createdAt?: string
  updatedAt?: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface Tontine {
  id: string
  name: string
  description?: string
  amount: number
  frequency: 'daily' | 'weekly' | 'monthly'
  startDate: string
  endDate?: string
  members: TontineMember[]
  status: 'active' | 'completed' | 'paused'
  createdAt: string
  updatedAt: string
}

export interface TontineMember {
  id: string
  userId: string
  tontineId: string
  user: User
  joinedAt: string
  isActive: boolean
  reputation: number
}

export interface Payment {
  id: string
  amount: number
  method: 'moov_money' | 'airtel_money'
  status: 'pending' | 'completed' | 'failed'
  tontineId: string
  userId: string
  createdAt: string
  transactionId?: string
}

export interface ChatMessage {
  id: string
  content: string
  userId: string
  tontineId: string
  user: User
  createdAt: string
  type: 'text' | 'system' | 'payment'
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface SendOTPRequest {
  phone: string
}

export interface SendOTPResponse {
  message: string
  success: boolean
}

export interface VerifyOTPRequest {
  phone: string
  otp: string
}

export interface VerifyOTPResponse {
  success: boolean
  token: string
  user: User
}