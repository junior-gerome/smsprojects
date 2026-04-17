import { Component, inject, input, output } from '@angular/core';
import { I18nService } from '../../../../core/services/i18n.service';
import { CampaignVariable, TemplateOption } from '../../domain/campaigns.models';

@Component({
  selector: 'app-sms-editor',
  standalone: true,
  templateUrl: `./sms-editor.component.html`
})
export class SmsEditorComponent {
  protected readonly i18n = inject(I18nService);
  readonly name = input.required<string>();
  readonly message = input.required<string>();
  readonly characters = input.required<number>();
  readonly segments = input.required<number>();
  readonly shortenLinks = input.required<boolean>();
  readonly variables = input.required<CampaignVariable[]>();
  readonly templates = input.required<TemplateOption[]>();
  readonly selectedTemplateId = input.required<string>();
  readonly saving = input(false);
  readonly canLaunch = input(true);
  readonly validationMessage = input<string | null>(null);
  readonly nameChange = output<string>();
  readonly messageChange = output<string>();
  readonly toggleLinks = output<void>();
  readonly templateChange = output<string>();
  readonly insertVariable = output<string>();
  readonly launch = output<void>();
}
