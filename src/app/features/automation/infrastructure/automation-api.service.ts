import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { I18nService } from '../../../core/services/i18n.service';
import { API_BASE_URL } from '../../../core/tokens/api-base-url.token';
import { AutomationInsight, Blueprint, WorkflowStep } from '../domain/automation.models';

interface AutomationWorkflowResponse {
  id: string;
  name: string;
  triggerType: string;
  actionType: string;
  scheduleExpression: string | null;
  status: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AutomationApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly i18n = inject(I18nService);

  async getWorkflow(): Promise<WorkflowStep[]> {
    const workflows = await firstValueFrom(
      this.http.get<AutomationWorkflowResponse[]>(`${this.apiBaseUrl}/automation`)
    );

    return workflows.map((workflow) => ({
      id: workflow.id,
      type: this.resolveStepType(workflow),
      title: workflow.name,
      description: `${workflow.triggerType} -> ${workflow.actionType}${workflow.scheduleExpression ? ` (${workflow.scheduleExpression})` : ''}`
    }));
  }

  async createWorkflow(payload: {
    name: string;
    triggerType: string;
    actionType: string;
    scheduleExpression: string;
    active: boolean;
  }): Promise<void> {
    await firstValueFrom(
      this.http.post(`${this.apiBaseUrl}/automation`, {
        name: payload.name,
        triggerType: payload.triggerType,
        actionType: payload.actionType,
        scheduleExpression: payload.scheduleExpression,
        templateId: null,
        active: payload.active
      })
    );
  }

  async getBlueprints(): Promise<Blueprint[]> {
    const isFrench = this.i18n.language() === 'fr';
    return [
      {
        id: 'bp-review',
        name: isFrench ? 'Recuperation avis' : 'Review recovery',
        description: isFrench
          ? 'Relance apres livraison pour demander une note au client.'
          : 'Follow up after delivery and request a rating from the customer.',
        uplift: '+14%'
      },
      {
        id: 'bp-reminder',
        name: isFrench ? 'Rappel de rendez-vous' : 'Appointment reminder',
        description: isFrench
          ? "Envoi d'un rappel planifie puis attente d'une confirmation."
          : 'Send a timed reminder and wait for a confirmation reply.',
        uplift: '+18%'
      },
      {
        id: 'bp-winback',
        name: isFrench ? 'Flux de reactivation' : 'Win-back flow',
        description: isFrench
          ? 'Re-engagez les clients inactifs avec une sequence SMS.'
          : 'Re-engage inactive customers with a staged SMS sequence.',
        uplift: '+11%'
      }
    ];
  }

  async getInsights(): Promise<AutomationInsight[]> {
    const isFrench = this.i18n.language() === 'fr';
    return [
      {
        title: isFrench ? 'Les temps d attente ameliorent le timing' : 'Wait steps improve timing',
        body: isFrench
          ? 'Les workflows avec une fenetre d attente reduisent la fatigue message et ameliorent la qualite des reponses.'
          : 'Workflows with a deliberate wait window reduce message fatigue and improve response quality.'
      },
      {
        title: isFrench ? 'Les reponses pilotent la scalabilite support' : 'Reply-driven automation scales support',
        body: isFrench
          ? 'Les parcours SMS branches sur reponse aident les operateurs a absorber plus de trafic entrant.'
          : 'SMS flows that branch on replies help operators handle more inbound traffic with less manual work.'
      }
    ];
  }

  private resolveStepType(workflow: AutomationWorkflowResponse): WorkflowStep['type'] {
    const trigger = workflow.triggerType.toLowerCase();
    const action = workflow.actionType.toLowerCase();

    if (trigger.includes('wait') || workflow.scheduleExpression?.toLowerCase().includes('wait')) {
      return 'wait';
    }
    if (action.includes('branch') || action.includes('route')) {
      return 'branch';
    }
    if (action.includes('sms') || action.includes('message')) {
      return 'message';
    }
    return 'trigger';
  }
}
