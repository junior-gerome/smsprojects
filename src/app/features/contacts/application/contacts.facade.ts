import { computed, inject, Injectable, signal } from '@angular/core';
import { extractApiErrorMessage } from '../../../core/models/api.models';
import { I18nService } from '../../../core/services/i18n.service';
import { Contact, ContactDraft, ContactGroupDraft, ContactGroupOption, ImportedContactRow } from '../domain/contacts.models';
import { ContactsApiService } from '../infrastructure/contacts-api.service';

interface ContactsState {
  contacts: Contact[];
  groups: ContactGroupOption[];
  selectedIds: string[];
  formOpen: boolean;
  groupFormOpen: boolean;
  importOpen: boolean;
  loading: boolean;
  saving: boolean;
  error: string | null;
  successMessage: string | null;
  page: number;
  totalElements: number;
}

@Injectable()
export class ContactsFacade {
  private readonly api = inject(ContactsApiService);
  private readonly i18n = inject(I18nService);
  private readonly pageSize = 20;
  private readonly state = signal<ContactsState>({
    contacts: [],
    groups: [],
    selectedIds: [],
    formOpen: false,
    groupFormOpen: false,
    importOpen: false,
    loading: true,
    saving: false,
    error: null,
    successMessage: null,
    page: 0,
    totalElements: 0
  });

  readonly contacts = computed(() => this.state().contacts);
  readonly groups = computed(() => this.state().groups);
  readonly selectedIds = computed(() => this.state().selectedIds);
  readonly formOpen = computed(() => this.state().formOpen);
  readonly groupFormOpen = computed(() => this.state().groupFormOpen);
  readonly importOpen = computed(() => this.state().importOpen);
  readonly loading = computed(() => this.state().loading);
  readonly saving = computed(() => this.state().saving);
  readonly error = computed(() => this.state().error);
  readonly successMessage = computed(() => this.state().successMessage);
  readonly totalElements = computed(() => this.state().totalElements);
  readonly activeFilters = computed(() => this.state().groups.slice(0, 3).map((group) => group.name));
  readonly topGroup = computed(
    () =>
      [...this.state().groups].sort((left, right) => right.memberCount - left.memberCount)[0] ?? null
  );

  constructor() {
    void this.load();
  }

  async load(page = this.state().page): Promise<void> {
    this.state.update((state) => ({ ...state, loading: true, error: null, page }));

    try {
      const [contactsPage, groups] = await Promise.all([
        this.api.getContacts(page, this.pageSize),
        this.api.getGroups()
      ]);

      this.state.update((state) => ({
        ...state,
        contacts: contactsPage.items,
        groups,
        selectedIds: contactsPage.items[0] ? [contactsPage.items[0].id] : [],
        totalElements: contactsPage.totalElements,
        loading: false
      }));
    } catch (error) {
      this.state.update((state) => ({
        ...state,
        loading: false,
        error: extractApiErrorMessage(
          error,
          this.i18n.language() === 'fr' ? 'Impossible de charger les contacts.' : 'Unable to load contacts.'
        )
      }));
    }
  }

  toggleSelection(id: string): void {
    this.state.update((state) => ({
      ...state,
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((item) => item !== id)
        : [...state.selectedIds, id]
    }));
  }

  openForm(): void {
    this.state.update((state) => ({ ...state, formOpen: true, groupFormOpen: false, successMessage: null }));
  }

  closeForm(): void {
    this.state.update((state) => ({ ...state, formOpen: false }));
  }

  openGroupForm(): void {
    this.state.update((state) => ({ ...state, groupFormOpen: true, formOpen: false, successMessage: null }));
  }

  closeGroupForm(): void {
    this.state.update((state) => ({ ...state, groupFormOpen: false }));
  }

  openImport(): void {
    this.state.update((state) => ({ ...state, importOpen: true, successMessage: null }));
  }

  closeImport(): void {
    this.state.update((state) => ({ ...state, importOpen: false }));
  }

  async saveContact(draft: ContactDraft): Promise<void> {
    this.state.update((state) => ({ ...state, saving: true, error: null, successMessage: null }));

    try {
      await this.api.createContact(draft);
      await this.load(0);
      this.state.update((state) => ({
        ...state,
        formOpen: false,
        saving: false,
        successMessage:
          this.i18n.language() === 'fr' ? 'Contact cree avec succes.' : 'Contact created successfully.'
      }));
    } catch (error) {
      this.state.update((state) => ({
        ...state,
        saving: false,
        error: extractApiErrorMessage(
          error,
          this.i18n.language() === 'fr' ? 'La creation du contact a echoue.' : 'Contact creation failed.'
        )
      }));
    }
  }

  async saveGroup(draft: ContactGroupDraft): Promise<void> {
    this.state.update((state) => ({ ...state, saving: true, error: null, successMessage: null }));

    try {
      await this.api.createGroup(draft);
      await this.load(0);
      this.state.update((state) => ({
        ...state,
        groupFormOpen: false,
        saving: false,
        successMessage:
          this.i18n.language() === 'fr' ? 'Groupe cree avec succes.' : 'Group created successfully.'
      }));
    } catch (error) {
      this.state.update((state) => ({
        ...state,
        saving: false,
        error: extractApiErrorMessage(
          error,
          this.i18n.language() === 'fr' ? 'La creation du groupe a echoue.' : 'Group creation failed.'
        )
      }));
    }
  }

  async importContacts(rows: ImportedContactRow[]): Promise<void> {
    if (!rows.length) {
      this.state.update((state) => ({
        ...state,
        error:
          this.i18n.language() === 'fr'
            ? "Selectionnez un fichier CSV valide avant l'import."
            : 'Select a valid CSV file before importing.',
        successMessage: null
      }));
      return;
    }

    this.state.update((state) => ({
      ...state,
      saving: true,
      error: null,
      successMessage: null
    }));

    const groupIndex = new Map(
      this.state().groups.map((group) => [group.name.trim().toLowerCase(), group.id] as const)
    );

    try {
      const result = await this.api.importContacts(
        rows.map((row) => ({
          firstName: row.firstName,
          lastName: row.lastName,
          email: row.email,
          phoneNumber: row.phoneNumber,
          groupIds: row.groupNames
            .map((groupName) => groupIndex.get(groupName.trim().toLowerCase()) ?? null)
            .filter((groupId): groupId is string => !!groupId),
          tags: row.tags
        }))
      );

      await this.load(0);
      this.state.update((state) => ({
        ...state,
        importOpen: false,
        saving: false,
        error:
          result.failedCount && !result.importedCount
            ? this.i18n.language() === 'fr'
              ? "Aucun contact n'a pu etre importe depuis ce fichier CSV."
              : 'No contact could be imported from this CSV file.'
            : null,
        successMessage: result.importedCount
          ? this.i18n.language() === 'fr'
            ? `${result.importedCount} contact(s) importe(s)${result.failedCount ? `, ${result.failedCount} echec(s)` : ''}.`
            : `${result.importedCount} contact(s) imported${result.failedCount ? `, ${result.failedCount} failed` : ''}.`
          : null
      }));
    } catch (error) {
      this.state.update((state) => ({
        ...state,
        saving: false,
        error: extractApiErrorMessage(
          error,
          this.i18n.language() === 'fr'
            ? "L'import des contacts a echoue."
            : 'Contact import failed.'
        )
      }));
    }
  }
}
