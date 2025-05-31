// frontend/src/services/enrollmentService.ts

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Types correspondant aux réponses backend
interface TontineEnrollmentData {
  id: string;
  name: string;
  description: string;
  objective: string;
  contributionAmount: number;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  maxParticipants: number;
  minParticipants: number;
  enrollmentDeadline: Date;
  plannedStartDate: Date;
  status: string;
  currentParticipants: number;
  participations: TontineParticipation[];
  invitationLink: string;
}

interface TontineParticipation {
  id: string;
  userId?: string;
  userName?: string;
  userPhone: string;
  status: 'pending' | 'approved' | 'rejected' | 'joined';
  joinedAt: Date;
  position?: number;
}

interface CreateInvitationRequest {
  phoneNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  method: 'sms' | 'link' | 'qr_code';
}

interface InvitationResponse {
  id: string;
  invitationLink: string;
  qrCodeData?: string;
  expiresAt: Date;
  method: string;
}

interface BatchInviteRequest {
  phoneNumbers: string[];
  message?: string;
}

interface BatchInviteResponse {
  success: boolean;
  sent: number;
  errors: string[];
}

class EnrollmentService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth-token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Obtenir les données complètes de la page d'enrollment
   */
  async getTontineEnrollmentData(tontineId: string): Promise<TontineEnrollmentData> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/tontines/${tontineId}/enrollment`,
      {
        method: 'GET',
        headers: this.getAuthHeaders()
      }
    );

    const data = await this.handleResponse<TontineEnrollmentData>(response);
    
    // Convertir les dates string en objets Date
    return {
      ...data,
      enrollmentDeadline: new Date(data.enrollmentDeadline),
      plannedStartDate: new Date(data.plannedStartDate),
      participations: data.participations.map(p => ({
        ...p,
        joinedAt: new Date(p.joinedAt)
      }))
    };
  }

  /**
   * Créer une invitation individuelle
   */
  async createInvitation(
    tontineId: string, 
    invitationData: CreateInvitationRequest
  ): Promise<InvitationResponse> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/tontines/${tontineId}/enrollment/invitations`,
      {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(invitationData)
      }
    );

    const data = await this.handleResponse<InvitationResponse>(response);
    
    return {
      ...data,
      expiresAt: new Date(data.expiresAt)
    };
  }

  /**
   * Inviter plusieurs personnes par SMS (pour ton formulaire téléphone)
   */
  async inviteBatch(
    tontineId: string, 
    batchData: BatchInviteRequest
  ): Promise<BatchInviteResponse> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/tontines/${tontineId}/enrollment/invite-batch`,
      {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(batchData)
      }
    );

    return this.handleResponse<BatchInviteResponse>(response);
  }

  /**
   * Approuver ou rejeter une demande de membre
   */
  async processMemberRequest(
    tontineId: string,
    memberId: string,
    action: 'approve' | 'reject',
    reason?: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/tontines/${tontineId}/enrollment/members/process`,
      {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          memberId,
          action,
          reason
        })
      }
    );

    return this.handleResponse<{ success: boolean; message: string }>(response);
  }

  /**
   * Obtenir les statistiques d'enrollment
   */
  async getEnrollmentStats(
    tontineId: string,
    maxParticipants: number,
    minParticipants: number
  ): Promise<{
    totalInvited: number;
    totalPending: number;
    totalApproved: number;
    totalJoined: number;
    totalRejected: number;
    remainingSpots: number;
    canStartConfiguration: boolean;
  }> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/tontines/${tontineId}/enrollment/stats?maxParticipants=${maxParticipants}&minParticipants=${minParticipants}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders()
      }
    );

    return this.handleResponse(response);
  }

  /**
   * Obtenir les informations publiques d'une tontine (pour la page /join)
   */
  async getTontinePublicInfo(tontineId: string, token?: string): Promise<any> {
    const url = new URL(`${API_BASE_URL}/api/v1/tontines/${tontineId}/enrollment/info`);
    if (token) {
      url.searchParams.append('token', token);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
        // Pas d'auth required pour les infos publiques
      }
    });

    return this.handleResponse(response);
  }

  /**
   * Répondre à une invitation (page publique)
   */
  async respondToInvitation(
    tontineId: string,
    invitationToken: string,
    response: 'accept' | 'decline',
    userInfo: {
      firstName: string;
      lastName: string;
      phoneNumber: string;
      email?: string;
    }
  ): Promise<{ success: boolean; message: string }> {
    const apiResponse = await fetch(
      `${API_BASE_URL}/api/v1/tontines/${tontineId}/enrollment/respond`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          invitationToken,
          response,
          userInfo
        })
      }
    );

    return this.handleResponse<{ success: boolean; message: string }>(apiResponse);
  }
}

// Export d'une instance singleton
export const enrollmentService = new EnrollmentService();

// Export des types pour utilisation dans les composants
export type {
  TontineEnrollmentData,
  TontineParticipation,
  CreateInvitationRequest,
  InvitationResponse,
  BatchInviteRequest,
  BatchInviteResponse
};
