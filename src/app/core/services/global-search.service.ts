import { HttpClient } from '@angular/common/http';
import { DestroyRef, computed, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { API_BASE_URL } from '../tokens/api-base-url.token';
import { Subject, catchError, debounceTime, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';

export interface SearchResultItem {
  id: string;
  kind: string;
  title: string;
  subtitle: string;
  route: string;
  icon: string;
}

interface SearchState {
  query: string;
  loading: boolean;
  open: boolean;
  results: SearchResultItem[];
}

@Injectable({ providedIn: 'root' })
export class GlobalSearchService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchTerms = new Subject<string>();
  private readonly state = signal<SearchState>({
    query: '',
    loading: false,
    open: false,
    results: []
  });

  readonly query = computed(() => this.state().query);
  readonly loading = computed(() => this.state().loading);
  readonly open = computed(() => this.state().open);
  readonly results = computed(() => this.state().results);

  constructor() {
    this.searchTerms
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        tap((query) => {
          if (query.trim().length < 2) {
            this.state.update((state) => ({ ...state, loading: false, results: [] }));
          } else {
            this.state.update((state) => ({ ...state, loading: true }));
          }
        }),
        switchMap((query) => {
          const normalizedQuery = query.trim();
          if (normalizedQuery.length < 2) {
            return of({ query: normalizedQuery, results: [] as SearchResultItem[] });
          }

          return this.http
            .get<SearchResultItem[]>(`${this.apiBaseUrl}/search`, {
              params: { q: normalizedQuery, limit: 10 }
            })
            .pipe(
              map((results) => ({ query: normalizedQuery, results })),
              catchError(() => of({ query: normalizedQuery, results: [] as SearchResultItem[] }))
            );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(({ query, results }) => {
        if (query !== this.state().query.trim()) {
          return;
        }

        this.state.update((state) => ({
          ...state,
          loading: false,
          open: state.query.trim().length > 0,
          results
        }));
      });
  }

  updateQuery(query: string): void {
    this.state.update((state) => ({
      ...state,
      query,
      open: query.trim().length > 0
    }));
    this.searchTerms.next(query);
  }

  openPanel(): void {
    if (this.state().query.trim().length > 0) {
      this.state.update((state) => ({ ...state, open: true }));
    }
  }

  closePanel(): void {
    this.state.update((state) => ({ ...state, open: false }));
  }

  clear(): void {
    this.state.set({
      query: '',
      loading: false,
      open: false,
      results: []
    });
  }
}
