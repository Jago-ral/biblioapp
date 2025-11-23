# Bibliothèque Personnelle & Sociale (Personal & Social Library)

Bienvenue dans le projet de Bibliothèque Personnelle & Sociale. Cette application permet aux utilisateurs de gérer leurs lectures, de suivre leur progression, de participer à des challenges et de découvrir de nouveaux livres grâce à des recommandations intelligentes.

## Fonctionnalités Principales

*   **Architecture Moderne** : Next.js 14 avec App Router, Server Components et React Query.
*   **Authentification** : Système complet via NextAuth.js (Google & Email).
*   **Gestion de Bibliothèque** : Ajoutez des livres (via Google Books API), suivez votre lecture (pages lues, notes).
*   **Gamification** : Système de badges, challenges et classement (Leaderboard) pour motiver la lecture.
*   **Social** : Profils publics pour partager vos lectures terminées avec la communauté.
*   **Intelligence Artificielle** : Recommandations de livres générées par IA (Simulation) basées sur vos goûts.
*   **Performance** : Mise en cache avancée (Redis simulé) et optimisation des images.
*   **Export de Données** : Exportez votre bibliothèque en CSV, JSON ou PDF.
*   **PWA** : Application Web Progressive installable avec support hors ligne (Dexie.js).

## Installation et Démarrage

1.  **Cloner le dépôt** :
    ```bash
    git clone https://github.com/Jago-ral/biblioapp.git
    cd biblioapp
    ```

2.  **Installer les dépendances** :
    ```bash
    npm install
    ```

3.  **Configurer l'environnement** :
    Copiez `.env.example` vers `.env` (si disponible) et configurez les variables :
    *   `DATABASE_URL` (PostgreSQL)
    *   `NEXTAUTH_SECRET`
    *   `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (pour Auth)
    *   `NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY`

4.  **Préparer la base de données** :
    ```bash
    npx prisma migrate dev
    ```

5.  **Lancer le serveur de développement** :
    ```bash
    npm run dev
    ```

## Tests

Le projet inclut une suite de tests complète (Unitaire, Intégration, E2E).

*   Lancer les tests unitaires et d'intégration : `npm run test` (via Vitest)
*   Lancer les tests E2E : `npx playwright test`

## Documentation API

Une documentation Swagger complète est disponible à l'adresse `/api-doc` une fois l'application lancée.

## Stack Technique

*   **Frontend** : React 18, Tailwind CSS, Lucide Icons
*   **Backend** : Next.js API Routes, Prisma ORM
*   **Base de Données** : PostgreSQL
*   **Cache** : Redis (Simulé en mémoire pour cette version)
*   **CI/CD** : GitHub Actions

## Auteur

Développé par KEGLOH Yawo Edo 