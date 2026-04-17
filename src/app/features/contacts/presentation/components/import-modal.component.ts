import { Component, inject, input, output, signal } from '@angular/core';
import { I18nService } from '../../../../core/services/i18n.service';
import { ContactGroupOption, ImportedContactRow } from '../../domain/contacts.models';

@Component({
  selector: 'app-import-modal',
  standalone: true,
  templateUrl: `./import-modal.component.html`
})
export class ImportModalComponent {
  protected readonly i18n = inject(I18nService);
  readonly open = input(false);
  readonly busy = input(false);
  readonly groups = input<ContactGroupOption[]>([]);
  readonly close = output<void>();
  readonly confirm = output<ImportedContactRow[]>();

  protected readonly selectedFileName = signal('');
  protected readonly parsedRows = signal<ImportedContactRow[]>([]);
  protected readonly parseError = signal<string | null>(null);

  protected async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];

    if (!file) {
      return;
    }

    try {
      const content = await file.text();
      const rows = this.parseCsv(content);
      this.selectedFileName.set(file.name);
      this.parsedRows.set(rows);
      this.parseError.set(
        rows.length
          ? null
          : this.i18n.language() === 'fr'
            ? "Aucune ligne de contact valide n'a ete detectee dans ce fichier CSV."
            : 'No valid contact row was detected in this CSV file.'
      );
    } catch {
      this.selectedFileName.set(file.name);
      this.parsedRows.set([]);
      this.parseError.set(
        this.i18n.language() === 'fr' ? "Le fichier CSV n'a pas pu etre analyse." : 'The CSV file could not be parsed.'
      );
    } finally {
      if (input) {
        input.value = '';
      }
    }
  }

  private parseCsv(content: string): ImportedContactRow[] {
    const lines = content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      return [];
    }

    const headers = this.parseCsvLine(lines[0]).map((header) => header.trim().toLowerCase());
    return lines
      .slice(1)
      .map((line) => this.parseRow(headers, this.parseCsvLine(line)))
      .filter((row): row is ImportedContactRow => row !== null);
  }

  private parseRow(headers: string[], values: string[]): ImportedContactRow | null {
    const record = new Map<string, string>();
    headers.forEach((header, index) => record.set(header, values[index]?.trim() ?? ''));

    const fullName = record.get('name') || record.get('full_name') || '';
    const derivedNameParts = fullName.trim().split(/\s+/).filter(Boolean);
    const firstName =
      record.get('firstname') || record.get('first_name') || derivedNameParts.slice(0, -1).join(' ') || fullName;
    const lastName =
      record.get('lastname') || record.get('last_name') || derivedNameParts.slice(-1).join(' ') || 'Contact';
    const phoneNumber = record.get('phone') || record.get('phone_number') || record.get('msisdn') || '';

    if (!firstName.trim() || !lastName.trim() || !phoneNumber.trim()) {
      return null;
    }

    return {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: (record.get('email') || '').trim(),
      phoneNumber: phoneNumber.trim(),
      groupNames: this.splitList(record.get('groups') || record.get('group') || ''),
      tags: this.splitList(record.get('tags') || record.get('tag') || '')
    };
  }

  private splitList(value: string): string[] {
    return value
      .split(/[|,;]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  private parseCsvLine(line: string): string[] {
    const cells: string[] = [];
    let current = '';
    let insideQuotes = false;

    for (let index = 0; index < line.length; index += 1) {
      const character = line[index];

      if (character === '"') {
        const nextCharacter = line[index + 1];
        if (insideQuotes && nextCharacter === '"') {
          current += '"';
          index += 1;
        } else {
          insideQuotes = !insideQuotes;
        }
        continue;
      }

      if (character === ',' && !insideQuotes) {
        cells.push(current);
        current = '';
        continue;
      }

      current += character;
    }

    cells.push(current);
    return cells;
  }
}
