import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../../../core/tokens/api-base-url.token';

export interface AnalyticsOverviewResponse {
  totalUsers: number;
  totalContacts: number;
  totalGroups: number;
  totalCampaigns: number;
  scheduledCampaigns: number;
  totalMessages: number;
  deliveredMessages: number;
  failedMessages: number;
  activeAutomations: number;
  deliveryRate: number;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  async getOverview(): Promise<AnalyticsOverviewResponse> {
    return firstValueFrom(this.http.get<AnalyticsOverviewResponse>(`${this.apiBaseUrl}/analytics`));
  }
}
