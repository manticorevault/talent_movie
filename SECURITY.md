# Security Policy

At Talent Movie Explorer, we take security seriously. While this project functions fundamentally as a Single Page Application (SPA), we enforce strict security boundaries, defensive programming practices, and secure data handling mechanisms relative to its underlying architecture.

---

## Supported Versions

Only the latest `main` branch of the client repository guarantees full patch coverage and validation against known vulnerabilities.

| Version | Supported          |
| ------- | ------------------ |
| v1      | :white_check_mark: |
| < v1    | :x:                |

---

## 🛡 Security Architecture & Assumptions

### 1. API Token Management (The SPA Constraint)

This application interacts directly with the **TMDB (The Movie Database)** API.
Because this is a pure client-side SPA without a dedicated proxy or BFF (Backend-For-Frontend) layer, the TMDB Read Access Token is inherently injected into the runtime environment via Vite (`import.meta.env`).

- **Constraint Handling:** The API Key is **never** committed to version control. It resides solely in local `.env` files and production CI/CD environment secrets.
- **Request Obfuscation:** The token is injected transparently as an `Authorization: Bearer <token>` header entirely enclosed within the internal RTK Query `fetchBaseQuery` configuration (`entities/movie/model/movieApi.ts`). We actively avoid passing API keys as raw `?api_key=` URL parameters, preventing accidental leakage through standard network referrer headers or analytics tracking.
- _Note:_ It is a known architectural trade-off of this SPA architecture that the token is ultimately visible to end-users analyzing their own network payloads. This application relies on restricted API keys scoped explicitly to public GET endpoints by TMDB.

### 2. Input Validation & XSS Defense

- **Defensive Encoding:** All user inputs (Search queries) undergo strict string sanitization. Characters prone to executing Cross-Site Scripting (XSS) (`<, >, ", ', &`) are actively stripped or encoded prior to query resolution.
- **URL Parameter Hardening:** Relying on **Zod**, all inbound URL search parameters (such as `page`, `sort`, `genres`) undergo strict schema parsing. Malformed routes or injected payload strings are coerced into safe fallbacks, effectively mitigating mass-assignment URL poisoning.
- **No `dangerouslySetInnerHTML`:** The architecture completely bars the usage of unsafe DOM injections. If complex string parsing is required in future modifications, `DOMPurify` will be instated.

### 3. Client Storage Security

- **Defensive Execution:** State persistence logic, specifically for the `favoritesSlice` saving to `localStorage`, is wrapped cautiously in `try/catch` enclosures.
- **Schema Validation Check:** Data re-hydrated back from local storage ensures primitive structural compliance, preventing the UI from catastrophically crashing should a malicious third-party script meddle with the user's browser storage instances.

---

## ⚠️ Reporting a Vulnerability

If you discover a security vulnerability within this project, please follow these steps:

1. **Do not submit an issue or pull request publicly.**
2. Assemble a concise report detailing the vulnerability, how to reproduce it, and the potential impact vector.
3. Forward the report directly to the architectural maintainers.
4. We aim to acknowledge receipt of vulnerabilities within 48 hours and typically commit a patch resolving catastrophic workflows within an isolated deployment channel prior to merging into the main orchestrating branch.

By treating security as continuous compliance, we ensure that architectural shifts map back to secure-by-default paradigms.
