Convert my existing React Native Expo app into a React PWA (web app) while preserving the same business logic, app flow, screens, and UI design as closely as possible.

Project details:

Existing React Native App Location:
`/Users/jayanthbharadwajm/development/jayledger`

Target Web App:
Already initialized using Create React App (CRA) in JavaScript (not TypeScript). Continue using the existing CRA setup and keep the project in JavaScript only.

Requirements:

1. Full migration of all screens, flows, and features from the React Native Expo app to the React web app (PWA style).

2. Maintain the same UI/UX and design as closely as possible:

* same layout
* same navigation flow
* same forms
* same dashboard
* same expense tracking logic
* same reports and calculations
* same categories/accounts handling
* same filters/search behavior

3. Responsive design is mandatory:

* must work properly on mobile, tablet, laptop, and desktop screens
* should feel like an app on mobile devices
* should behave like a proper modern responsive PWA
* layouts should adapt smoothly across all screen sizes
* no broken UI on smaller screens

4. Preserve existing business logic and service logic wherever possible:

* API calls
* Supabase integration
* validation logic
* calculations
* helpers
* state handling
* transaction processing
* reports logic

5. Technology replacements:

React Native / Expo → React Web

* expo-sqlite → replace with Dexie.js (IndexedDB)
* AsyncStorage → replace with localStorage
* expo-location → replace with browser geolocation API (`navigator.geolocation`) if used
* React Navigation → replace with React Router
* Supabase → continue using Supabase for auth + backend sync

6. Features to ignore completely:

* Expo Notifications
* Biometrics / Local Authentication

Do not migrate notification logic or biometric authentication.

7. Important architecture requirement:

This must be an offline-first expense tracker PWA.

Rules:

* all transactions, categories, accounts, reports, and calculations should work from local database first using Dexie.js
* Supabase should be used for cloud sync + auth only
* local database should be the primary source for fast reads and calculations
* sync to Supabase should happen in background

8. Use proper production-grade structure:

* reusable services
* clean folder structure
* maintainable code
* scalable architecture
* PWA-ready approach

9. Do not rewrite blindly.
   First analyze the existing React Native project structure carefully, understand all screens, flows, and dependencies, then migrate module by module properly.

10. Keep code quality high and avoid unnecessary complexity.

11. Before starting migration:
    Provide a migration plan showing:

* screens to migrate
* dependencies to replace
* database migration approach
* sync strategy
* routing structure
* responsive layout strategy

Then begin implementation step by step.

Goal:
A proper React PWA replica of the existing Expo app with offline-first architecture using Dexie + Supabase, while preserving the original app behavior, responsive design, and UI/UX as closely as possible across all devices.
