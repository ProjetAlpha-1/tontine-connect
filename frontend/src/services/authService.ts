// src/services/authService.ts
import axios from 'axios'

// ✅ URLs avec préfixe /api/v1 (selon votre main.ts)
const API_BASE_URL = 'http://localhost:3001/api/v1'

export interface SendOTPResponse {
  success: boolean
  message: string
}

export interface VerifyOTPResponse {
  success: boolean
  token: string
  user: {
    id: string
    phone: string
    name?: string
  }
}

class AuthService {
  // Formater le numéro de téléphone gabonais
  private formatPhone(phone: string): string {
    let cleaned = phone.replace(/\D/g, '')
    
    if (cleaned.startsWith('0')) {
      cleaned = '241' + cleaned.substring(1)
    }
    
    if (!cleaned.startsWith('241')) {
      cleaned = '241' + cleaned
    }
    
    return '+' + cleaned
  }

  // Envoyer OTP par SMS
  async sendOTP(phone: string): Promise<SendOTPResponse> {
    try {
      const formattedPhone = this.formatPhone(phone)
      const url = `${API_BASE_URL}/auth/send-otp`  // ✅ = /api/auth/send-otp
      
      console.log('📤 Envoi OTP vers:', formattedPhone)
      console.log('🌐 URL utilisée:', url)
      
      const response = await axios.post<SendOTPResponse>(url, {
        phone: formattedPhone
      })
      
      console.log('✅ Réponse backend:', response.data)
      return response.data
    } catch (error: any) {
      console.error('❌ Erreur envoi OTP:', error)
      
      if (error.response) {
        console.error('📊 Status:', error.response.status)
        console.error('📋 Data:', error.response.data)
        console.error('🔗 URL tentée:', error.config?.url)
      }
      
      if (error.response?.status === 404) {
        throw new Error('🔍 Route non trouvée. Vérifiez que le backend est démarré.')
      }
      
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Format de téléphone invalide')
      }
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      
      throw new Error('Erreur lors de l\'envoi du SMS')
    }
  }

  // Vérifier OTP et se connecter
  async verifyOTP(phone: string, otp: string): Promise<VerifyOTPResponse> {
    try {
      const formattedPhone = this.formatPhone(phone)
      const url = `${API_BASE_URL}/auth/verify-otp`  // ✅ = /api/auth/verify-otp
      
      console.log('🔐 Vérification OTP pour:', formattedPhone)
      console.log('🌐 URL utilisée:', url)
      
      const response = await axios.post<VerifyOTPResponse>(url, {
        phone: formattedPhone,
        otp: otp.trim()
      })
      
      console.log('✅ Réponse backend:', response.data)
      return response.data
    } catch (error: any) {
      console.error('❌ Erreur vérification OTP:', error)
      
      if (error.response?.status === 404) {
        throw new Error('🔍 Route non trouvée')
      }
      
      if (error.response?.status === 400 || error.response?.status === 401) {
        throw new Error(error.response.data?.message || 'Code OTP incorrect')
      }
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      
      throw new Error('Code OTP incorrect ou expiré')
    }
  }

  // Valider le token JWT
  async validateToken(token: string): Promise<any> {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      return response.data
    } catch (error) {
      console.error('Token invalide:', error)
      throw new Error('Session expirée')
    }
  }
}

export const authService = new AuthService()