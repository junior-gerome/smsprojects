import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { I18nService } from '../services/i18n.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const i18n = inject(I18nService);
  const token = authService.token();
  const headers: Record<string, string> = {
    'Accept-Language': i18n.language()
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return next(
    request.clone({
      setHeaders: headers
    })
  ).pipe(
    catchError((error) => {
      if (error.status === 401 && !request.url.includes('/auth/')) {
        void authService.handleUnauthorized();
      }

      return throwError(() => error);
    })
  );
};
