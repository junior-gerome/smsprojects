# SMS Platform Backend

Backend Spring Boot pour une plateforme SMS entreprise avec architecture DDD modulaire.

## Stack

- Spring Boot 3.3
- Spring Security + JWT + RBAC
- Spring Data JPA
- MySQL / MariaDB / PostgreSQL / H2
- Gradle

## Modules

- `users`
- `contacts`
- `campaigns`
- `messages`
- `templates`
- `analytics`
- `automation`

## Structure

```text
src/main/java/com/signalvelocity/smsplatform/
  shared/
  security/
  users/
  contacts/
  campaigns/
  messages/
  templates/
  analytics/
  automation/
```

Chaque module suit le decoupage DDD :

- `domain/`
- `application/`
- `infrastructure/`
- `interfaces/`

## Demarrage rapide

### Local sur MySQL WAMP

Le profil `local` cible maintenant la base MySQL reelle disponible sur la machine WAMP :

- host : `127.0.0.1`
- port : `3306`
- schema : `signal_velocity_sms`
- user : `root`

Depuis Windows :

```bat
gradlew bootRun
```

Le wrapper charge automatiquement, s'ils existent :

- `.env`
- `.env.local`

Le wrapper `gradlew.bat` telecharge Gradle au premier lancement puis active automatiquement le profil `local` pour `bootRun`.
Le backend cree les tables dans MySQL si elles n'existent pas encore et bootstrappe un compte administrateur local :

- email : `admin@signalvelocity.local`
- mot de passe : `ChangeMe123!`

### Profils bases de donnees

- `local` : MySQL WAMP local
- `mysql` : MySQL generique
- `mariadb` : MariaDB generique
- `postgres` : PostgreSQL generique
- `h2` : fallback developpement / test

Exemple PostgreSQL :

```bat
set SPRING_PROFILES_ACTIVE=postgres
set DB_URL=jdbc:postgresql://localhost:5432/smsplatform
set DB_USERNAME=smsplatform
set DB_PASSWORD=change-me
gradlew bootRun
```

Exemple H2 :

```bat
set SPRING_PROFILES_ACTIVE=h2
gradlew bootRun
```

## Gestion des comptes

- `POST /auth/register` : inscription publique borne
- `POST /users` : creation d'utilisateur par administrateur
- `GET /users` : gouvernance des utilisateurs
- roles pris en charge : `ROLE_ADMIN`, `ROLE_MANAGER`, `ROLE_ANALYST`, `ROLE_OPERATOR`

Le frontend d'administration permet la creation de comptes et l'assignation du role principal.

## Endpoints principaux

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /contacts`
- `GET /contacts`
- `POST /groups`
- `GET /groups`
- `POST /campaigns`
- `GET /campaigns`
- `POST /sms/send`
- `POST /templates`
- `GET /templates`
- `GET /analytics`
- `POST /automation`
- `GET /automation`
- `GET /conversations`
- `POST /webhooks/delivery`

## Architecture SMS operateurs

Le module `messages` dispose maintenant d'un routage multi-operateurs :

- `demo` : provider de simulation locale
- `orange-cm` : adapter Orange Cameroun, avec mode `demo` et preparation `live`
- `mtn-cm` : adapter MTN Cameroun, scaffold enterprise pret a etre complete avec le contrat operateur
- `camtel` : scaffold d'integration CAMTEL

Le routage se fait par :

- normalisation MSISDN
- resolution de l'operateur par prefixes configures
- selection du provider principal
- fallback automatique vers un provider de secours

La configuration se fait dans `app.sms.*` via `application.yml` ou variables d'environnement.

### Activation Orange Cameroun live

Un exemple pret a remplir est fourni dans :

- `.env.orange.live.example`

Le plus simple est :

1. Copier `.env.orange.live.example` vers `.env`
2. Remplacer les placeholders Orange par les vraies valeurs
3. Relancer `gradlew bootRun`

Correspondance exacte avec le portail Orange :

- `Id client` -> `SMS_ORANGE_CLIENT_ID`
- `Cle secrete` -> `SMS_ORANGE_CLIENT_SECRET`
- `Entete d autorisation` -> peut etre renseigne directement dans `SMS_ORANGE_AUTHORIZATION_HEADER` si vous voulez reutiliser exactement la valeur fournie par le portail Orange. Sinon, le backend le genere automatiquement a partir du `client_id` et du `client_secret`. Dans la documentation Orange, cette valeur correspond au `Basic base64(client_id:client_secret)` pour appeler le token OAuth.
- `Nom de l application` ou nom marketing comme `Bipede` -> ne sert pas a l authentification ; utilisez-le seulement comme `SMS_ORANGE_SENDER_ID` si Orange a bien valide ce sender name
- `SMS Cameroun` -> nom du produit souscrit, pas une variable d environnement
- `Application id` du portail -> non utilise par le code actuel

Etapes conseillees :

1. Renseigner `SMS_ORANGE_CLIENT_ID` et `SMS_ORANGE_CLIENT_SECRET`.
2. Renseigner `SMS_ORANGE_SENDER_ADDRESS=tel:+2370000` pour le Cameroun.
3. Renseigner `SMS_ORANGE_SEND_URL=https://api.orange.com/smsmessaging/v1/outbound/tel%3A%2B2370000/requests`.
4. Positionner `SMS_DEFAULT_PROVIDER=orange-cm`.
5. Conserver `SMS_FALLBACK_PROVIDER=demo` tant que la recette live n'est pas terminee.

Cas d usage Orange :

- Offre standard avec sender name par defaut Orange :
  - `SMS_ORANGE_SENDER_ID=` vide
  - `SMS_ORANGE_SENDER_ADDRESS=tel:+2370000`
  - `SMS_ORANGE_SEND_URL=https://api.orange.com/smsmessaging/v1/outbound/tel%3A%2B2370000/requests`
- Offre standard avec sender name personnalise :
  - `SMS_ORANGE_SENDER_ID=Bipede`
  - `Bipede` doit etre approuve et white-liste par Orange
- Offre `Orange Only` :
  - conserver `SMS_ORANGE_SENDER_ADDRESS=tel:+2370000`
  - ajouter `?resource_type_parameter_management=SMS_OCB2` a `SMS_ORANGE_SEND_URL`
  - exemple :
    `https://api.orange.com/smsmessaging/v1/outbound/tel%3A%2B2370000/requests?resource_type_parameter_management=SMS_OCB2`

Points d exploitation importants selon la documentation Orange :

- le token OAuth est valable 1 heure
- le backend gere deja le cache et le renouvellement du token
- le debit est limite a 5 SMS / seconde
- il faut un contrat actif et un bundle SMS avec un solde positif

Notes importantes Orange :

- `senderAddress` est l'adresse Orange technique, pas le nom d'emetteur marketing ; pour le Cameroun, la valeur documentee est `tel:+2370000`
- `sender-id` dans ce projet est mappe vers `senderName` quand il est renseigne
- le `sendUrl` doit etre coherent avec le `senderAddress`
- le sender name doit rester conforme aux contraintes Orange ; `Bipede` est acceptable, `bipede` ou `bipede!` ne le sont pas forcement
- si le sender name n est pas white-liste, Orange renverra une erreur `400 requestError`
- pour les delivery receipts, votre endpoint doit etre en `https`, accessible sur le port `443`, retourner `200 OK`, et etre prealablement declare chez Orange

Le backend inclut maintenant :

- cache de token OAuth Orange en memoire
- routage par prefixes operateurs
- fallback automatique
- persistance du provider utilise sur chaque message

## Notes

- Le CORS de developpement accepte les origins `localhost:*` et `127.0.0.1:*`.
- Le profil `local` utilise MySQL WAMP, pas H2.
- Le code JPA reste portable entre MySQL, MariaDB, PostgreSQL et H2 tant qu'on reste sur les profils fournis.
- Les prefixes operateurs fournis en `local` sont des exemples de routage et doivent etre verifies avant activation live.
- L'adapter Orange est le plus avance. Les adapters MTN/CAMTEL sont volontairement scaffoldes tant que les contrats API exacts ne sont pas renseignes.
