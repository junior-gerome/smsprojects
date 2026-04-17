import { Component, computed, inject } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';
import { UiPageHeaderComponent } from '../../../shared/ui/page-header.component';
import { TemplatesFacade } from '../application/templates.facade';
import { TemplateFormComponent } from './components/template-form.component';
import { TemplateGridComponent } from './components/template-grid.component';
import { TemplatePreviewComponent } from './components/template-preview.component';

@Component({
  selector: 'app-templates-page',
  standalone: true,
  imports: [UiPageHeaderComponent, TemplateGridComponent, TemplatePreviewComponent, TemplateFormComponent],
  providers: [TemplatesFacade],
  templateUrl: `./template-page.component.html`
})
export class TemplatesPageComponent {
  protected readonly facade = inject(TemplatesFacade);
  protected readonly i18n = inject(I18nService);
  protected readonly selectedId = computed(() => this.facade.selectedTemplate()?.id ?? '');
}
