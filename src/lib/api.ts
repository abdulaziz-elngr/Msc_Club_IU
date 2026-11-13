/**
 * API Client Layer for MSC-IU Full-Stack Platform
 * Interacts with /api endpoints served by the Express backend.
 */

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {})
      }
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(errBody.error || `HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn(`[API] Error on ${url}:`, err);
    throw err;
  }
}

export const api = {
  // Auth & Roles
  async getMe() {
    return request<{ user: any }>('/api/auth/me');
  },
  async switchRole(_role: 'STUDENT' | 'TEAM_LEAD' | 'ADMIN') {
    throw new Error('Role switching is disabled. Authenticate and authorize users server-side.');
  },

  // Stats
  async getStats() {
    return request<{ stats: any }>('/api/stats');
  },

  // Tracks & Courses
  async getTracks() {
    return request<{ tracks: any[] }>('/api/tracks');
  },
  async getCourses(trackId?: string) {
    const query = trackId ? `?trackId=${encodeURIComponent(trackId)}` : '';
    return request<{ courses: any[] }>(`/api/courses${query}`);
  },
  async reorderCourse(courseId: string, direction: 'UP' | 'DOWN') {
    return request<{ success: boolean }>('/api/courses/reorder', {
      method: 'POST',
      body: JSON.stringify({ courseId, direction })
    });
  },
  async togglePublishCourse(courseId: string) {
    return request<{ success: boolean; course: any }>(`/api/courses/${courseId}/publish`, {
      method: 'PATCH'
    });
  },

  // Progress & Heartbeat
  async getProgress() {
    return request<{ enrollments: any[] }>('/api/progress');
  },
  async sendHeartbeat(courseId: string, lessonId: string, watchedSeconds: number) {
    return request<{ success: boolean; enrollment: any; newlyCompleted: boolean; awardedXp: number }>('/api/progress/heartbeat', {
      method: 'POST',
      body: JSON.stringify({ courseId, lessonId, watchedSeconds })
    });
  },

  // Tasks & Submissions
  async getTasks() {
    return request<{ tasks: any[]; submissions: any[] }>('/api/tasks');
  },
  async submitTask(taskId: string, githubUrl: string, notes: string) {
    return request<{ success: boolean; submission: any }>(`/api/tasks/${taskId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ githubUrl, notes })
    });
  },
  async reviewSubmission(submissionId: string, status: 'APPROVED' | 'REJECTED', reviewerFeedback: string) {
    return request<{ success: boolean; submission: any }>(`/api/submissions/${submissionId}/review`, {
      method: 'POST',
      body: JSON.stringify({ status, reviewerFeedback })
    });
  },

  // Events & Passes
  async getEvents() {
    return request<{ events: any[]; registrations: any[] }>('/api/events');
  },
  async registerForEvent(eventId: string) {
    return request<{ success: boolean; registration: any; message?: string }>(`/api/events/${eventId}/register`, {
      method: 'POST'
    });
  },
  async checkInAttendee(hmacToken: string, eventId: string, attendeeStudentId?: string) {
    return request<{ success: boolean; registration: any; awardedXp: number }>(`/api/events/checkin`, {
      method: 'POST',
      body: JSON.stringify({ hmacToken, eventId, attendeeStudentId })
    });
  },

  // Certificates
  async getCertificates() {
    return request<{ certificates: any[] }>('/api/certificates');
  },
  async verifyCertificate(code: string) {
    return request<{ isValid: boolean; certificate?: any; issuer?: any }>(`/api/certificates/verify/${encodeURIComponent(code)}`);
  },
  async issueCertificate(payload: { recipientName: string; recipientNameAr: string; title: string; titleAr: string; studentId: string; type: string }) {
    return request<{ success: boolean; certificate: any }>('/api/certificates/issue', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Leaderboard & XP
  async getLeaderboard() {
    return request<{ leaderboard: any[] }>('/api/leaderboard');
  },
  async getXpHistory() {
    return request<{ transactions: any[] }>('/api/xp/history');
  },

  // Projects
  async getProjects() {
    return request<{ projects: any[] }>('/api/projects');
  },
  async submitProject(projectData: any) {
    return request<{ success: boolean; project: any }>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(projectData)
    });
  },

  // Resources
  async getResources() {
    return request<{ resources: any[] }>('/api/resources');
  },
  async downloadResource(resourceId: string) {
    return request<{ success: boolean; downloadsCount: number }>(`/api/resources/${resourceId}/download`, {
      method: 'POST'
    });
  },

  // Applications
  async submitApplication(data: any) {
    return request<{ success: boolean; applicationCode: string; status: string }>('/api/applications', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  async lookupApplication(code: string) {
    return request<{ applicationCode: string; status: string; estimatedDecisionDate: string; notes: string }>(`/api/applications/${encodeURIComponent(code)}`);
  },

  // Audit Logs
  async getAuditLogs() {
    return request<{ logs: any[] }>('/api/audit-logs');
  }
};
