# Kinetic SMS Console

Frontend Angular 18 + Tailwind CSS construit en composants standalone, lazy routes et Signals.

## Structure

```text
src/
  app/
    core/
      models/
      services/
    layout/
      app-shell.component.ts
      sidebar.component.ts
      header.component.ts
      notifications.component.ts
    shared/
      ui/
        page-header.component.ts
        surface-card.component.ts
        stat-card.component.ts
        status-chip.component.ts
    features/
      dashboard/
      contacts/
      campaigns/
      chat/
      templates/
      analytics/
      automation/
      settings/
```

## Conventions

- `application/`: facades Signals et orchestration smart component.
- `domain/`: modeles metier.
- `infrastructure/`: services API mockes.
- `presentation/`: pages standalone et composants dumb.
- `layout/`: shell global responsive.
- `shared/ui/`: design system reutilisable.

## Design System

- Tokens couleur dans `src/styles.css`
- mapping Tailwind dans `tailwind.config.js`
- dark mode pilote par `ThemeService`
- surfaces tonales, glass layers et boutons gradient alignes avec Stitch
