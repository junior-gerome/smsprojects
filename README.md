# SMS Projects

Plateforme SMS modulaire composee d'un frontend Angular et d'un backend Spring Boot pour la gestion des campagnes, des contacts, des templates, des conversations et des integrations operateurs.

## Apercu

Le projet est organise par branches pour separer clairement la documentation et les applications :

- `main` : documentation generale et presentation du projet
- `frontend` : console d'administration Angular 18
- `backend` : API Spring Boot 3.3 / Java 21

Acces direct aux branches :

- Frontend : [github.com/junior-gerome/smsprojects/tree/frontend](https://github.com/junior-gerome/smsprojects/tree/frontend)
- Backend : [github.com/junior-gerome/smsprojects/tree/backend](https://github.com/junior-gerome/smsprojects/tree/backend)

## Ce Que Fait Le Projet

- tableau de bord et console d'administration SMS
- gestion des utilisateurs, roles et authentification JWT
- gestion des contacts, groupes et campagnes
- gestion des templates, analytics et automatisations
- messagerie conversationnelle et routage SMS
- integration multi-operateurs avec une base avancee pour Orange Cameroun

## Stack Technique

### Frontend

- Angular 18
- TypeScript
- Tailwind CSS
- architecture en composants standalone, lazy routes et Signals

### Backend

- Spring Boot 3.3
- Spring Security
- JWT + RBAC
- Spring Data JPA
- MySQL / MariaDB / PostgreSQL / H2
- Gradle

## Organisation

### Frontend

Le frontend fournit l'interface d'administration avec les modules principaux suivants :

- dashboard
- contacts
- campaigns
- chat
- templates
- analytics
- automation
- settings

### Backend

Le backend suit une architecture modulaire avec les domaines suivants :

- users
- contacts
- campaigns
- messages
- templates
- analytics
- automation

Le module `messages` inclut un routage multi-operateurs avec :

- `demo`
- `orange-cm`
- `mtn-cm`
- `camtel`

## Demarrage Rapide

Si tu veux recuperer directement une branche applicative :

```bash
git clone -b frontend git@github.com:junior-gerome/smsprojects.git smsprojects-frontend
git clone -b backend git@github.com:junior-gerome/smsprojects.git smsprojects-backend
```

Si tu travailles avec les deux dossiers localement :

### Frontend

```bash
cd frontend
npm install
npm start
```

### Backend

```bat
cd backend
gradlew.bat test
gradlew.bat bootRun
```

## API Orange Cameroun

Le backend contient deja une integration Orange Cameroun avec :

- cache du token OAuth
- preparation du mode `live`
- configuration par variables d'environnement
- fallback possible vers le provider `demo`

Le point d'entree pour la configuration est documente sur la branche backend.

## Tests

Validations effectuees localement sur le projet :

- `backend` : `gradlew.bat test`
- `frontend` : `npm test -- --watch=false --browsers=ChromeHeadless`
- `frontend` : `npm run build`

## Depot GitHub

Depot principal : [github.com/junior-gerome/smsprojects](https://github.com/junior-gerome/smsprojects)
