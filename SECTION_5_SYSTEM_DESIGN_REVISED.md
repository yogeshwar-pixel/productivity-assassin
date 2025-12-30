## 5. SYSTEM DESIGN

This section presents the high-level architectural design of the Productivity Assassin system. The architecture follows a multi-tier pattern separating concerns across presentation, business logic, service, and data layers. Design decisions are justified based on software engineering principles (modularity, separation of concerns, maintainability) and empirical evidence from the literature review (Section 3).

**Architectural Design Philosophy:**  
The system architecture adheres to three core principles:

1. **Separation of Concerns**: UI rendering (React components), business logic (prompt generation, tier selection), and data persistence (storage adapters) are isolated into distinct modules. This enables independent testing, maintenance, and potential future migration (e.g., replacing React with alternative UI framework without modifying business logic).

2. **Privacy by Architecture**: Data flows are constrained to client-side components exclusively. No external API endpoints, analytics services, or cloud storage integrations exist in the architecture. This design enforces NFR-201 (data localization) at the structural level rather than relying solely on implementation discipline.

3. **Minimal External Dependencies**: The architecture leverages native browser APIs (chrome.storage, localStorage, DOM manipulation) and established libraries (React, React Router) rather than introducing proprietary frameworks. This reduces supply chain vulnerabilities (NFR-504: dependency hygiene) and ensures long-term maintainability.

**Design Trade-offs:**  
The client-side-only architecture constrains certain functionalities:
- **No cross-device synchronization**: Users cannot access violation logs from multiple devices without cloud storage (explicitly rejected for privacy preservation).
- **Limited analytics**: Aggregate usage statistics across user population unavailable (typical SaaS model collects telemetry; architecture prohibits this).
- **No remote configuration**: Blacklist updates require extension updates; cannot push blacklist additions server-side.

These constraints are intentional, prioritizing user privacy (NFR-2XX) over convenience features common in commercial productivity tools.

---

### 5.1 Architecture Diagram

The Productivity Assassin system employs a **four-tier layered architecture** with clear hierarchical dependencies. Figure 5.1 depicts the component arrangement and data flow through architectural layers.

**Layering Principle**: Each layer depends only on layers below it; no upward dependencies. This enables bottom-up testing (data layer → service layer → business logic → presentation) and facilitates layer replacement without cascading changes.

&nbsp;

---

**Figure 5.1: Four-Tier Layered Architecture**

*(Insert architectural diagram here showing four horizontal layers: Presentation Layer at top, Business Logic Layer below, Service Layer third, Data Layer at bottom. Arrows indicate data flow between layers. Web App and Chrome Extension shown as separate vertical stacks within Presentation Layer. See Figure 5.1 description below for detailed component layout.)*

**Caption**: Four-tier layered architecture of the Productivity Assassin system. The Presentation Layer comprises React-based web application and Chrome Manifest V3 extension components. Business Logic Layer implements prompt generation, tier selection, and violation tracking algorithms. Service Layer abstracts storage operations and inter-component messaging. Data Layer manages persistent storage via browser APIs. Solid arrows represent synchronous function calls; dashed arrows represent asynchronous message passing.

---

&nbsp;

#### **Figure 5.1 Component Description:**

*Note: Since actual diagram insertion requires graphical tools, the following text provides precise specifications for diagram creation. Diagram should be created using draw.io, Lucidchart, or Microsoft Visio and inserted at the marked location above.*

**Diagram Layout Specifications:**
- **Dimensions**: 180mm width × 120mm height (fits standard page margins with 12pt spacing above/below)
- **Layer boxes**: Rectangles with 2pt solid black borders, height 25mm each
- **Component boxes**: Rounded rectangles (corner radius 5pt) within layers, 1pt borders
- **Arrows**: 1.5pt width, solid for synchronous calls, dashed (3pt dash, 2pt gap) for asynchronous
- **Font**: Arial 10pt for layer names, Arial 9pt for component names
- **Color scheme**: 
  - Presentation Layer: Light blue (#E3F2FD)
  - Business Logic Layer: Light green (#E8F5E9)
  - Service Layer: Light yellow (#FFF9C4)
  - Data Layer: Light gray (#F5F5F5)

**Layer 1 - Presentation Layer (Top):**
Contains two vertical subdivisions:

**Left subdivision: Web Application**
- Component boxes (arranged vertically):
  1. "Setup Wizard Component (React)" - JSX form rendering, input validation
  2. "Dashboard Component (React)" - Statistics display, profile editor
  3. "React Router" - Client-side navigation (routes: /setup, /dashboard, /analytics)

**Right subdivision: Chrome Extension**
- Component boxes (arranged vertically):
  1. "Background Service Worker (MV3)" - Event listeners, message passing coordinator
  2. "Content Script (content-simple.js)" - DOM injection, modal rendering, blacklist matching
  3. "Popup Interface (popup.html)" - Quick settings access (strict mode toggle)

**Arrows from Presentation → Business Logic:**
- Setup Wizard → Profile Manager (labeled: "Submit profile data")
- Dashboard → Statistics Calculator (labeled: "Request violation logs")
- Content Script → Prompt Generator (labeled: "Violation detected, request prompt")

**Layer 2 - Business Logic Layer:**
Contains four component boxes (arranged horizontally):

1. **Profile Manager**
   - Functions: validateProfile(), parseStudyPlatforms(), enforceMinimumPlatforms()
   - Responsibilities: Input validation, data structure transformation

2. **Prompt Generator**  
   - Functions: selectTier(violationCount), generatePrompt(tier, profile), substituteTemplates()
   - Responsibilities: Tier selection logic (FR-302), message personalization (FR-303)

3. **Violation Tracker**
   - Functions: incrementDailyCount(), resetCountAtMidnight(), logViolationEvent()
   - Responsibilities: Violation counting (FR-602), log entry creation (FR-601)

4. **Redirection Logic**
   - Functions: selectPlatform(violationCount, platforms), executeRedirect(url)
   - Responsibilities: Platform rotation algorithm (FR-501), redirect execution (FR-502)

**Arrows from Business Logic → Service Layer:**
- Profile Manager → Storage Adapter (labeled: "Write profile")
- Violation Tracker → Storage Adapter (labeled: "Read/write violation logs")
- Prompt Generator → Storage Adapter (labeled: "Read profile")

**Layer 3 - Service Layer:**
Contains three component boxes:

1. **Storage Adapter**
   - Functions: writeProfile(), readProfile(), writeLogs(), readLogs()
   - Responsibilities: Abstracts chrome.storage.local and AsyncStorage APIs, handles storage quota errors

2. **Message Broker**
   - Functions: sendToExtension(), listenForMessages(), validateMessageSource()
   - Responsibilities: postMessage-based communication between web app and extension, CSRF protection

3. **Logging Service**
   - Functions: logDebug(), logError(), formatLogEntry()
   - Responsibilities: Structured logging, console output for debugging (NFR-502: documentation)

**Arrows from Service → Data Layer:**
- Storage Adapter → chrome.storage.local (labeled: "API calls")
- Storage Adapter → AsyncStorage (labeled: "API calls")

**Layer 4 - Data Layer (Bottom):**
Contains two component boxes:

1. **chrome.storage.local**
   - Type: Browser-provided persistent storage API
   - Content: userProfile object, violation logs (JSON), daily counters, strict mode state
   - Quota: 10 MB default (unlimited with permission)

2. **AsyncStorage (localStorage wrapper)**
   - Type: Web application persistent storage
   - Content: Duplicate userProfile object (synchronization target)
   - Quota: 10 MB typical browser limit

**External Entities (shown outside main architecture boxes):**

1. **User** (top-left, stick figure icon)
   - Arrows: User → Setup Wizard, User → Dashboard, User → Content Script (receives modal)

2. **Blacklisted Sites** (top-right, cloud icon)
   - Arrow: Content Script → Blacklisted Sites (labeled: "URL navigation triggers detection")

3. **Study Platforms** (bottom-right, cloud icon)
   - Arrow: Redirection Logic → Study Platforms (labeled: "Forced redirect")

---

&nbsp;

#### **5.1.1 Presentation Layer Architecture**

The Presentation Layer segregates user-facing components into two independent execution contexts: the web application (Node.js development server, production static hosting) and the Chrome extension (browser runtime environment). This separation reflects deployment constraints (web app accessible via URL, extension installed locally) and security boundaries (extension has privileged chrome.* API access; web app operates in standard browser security sandbox).

**Web Application Technology Stack:**
- **React 18.2**: Component-based UI library enabling declarative rendering and efficient DOM updates via Virtual DOM reconciliation. Chosen for developer familiarity, extensive ecosystem (npm packages for routing, state management), and concurrent rendering features improving perceived performance during statistics calculation (Suspense, useTransition).
  
- **React Router 6.8**: Client-side routing preventing full page reloads during navigation. Data router APIs (createBrowserRouter, loader functions) enable prefetching violation logs before dashboard component mounts, reducing perceived load time (supports NFR-105: ≤2s dashboard load).

- **Expo (React Native for Web)**: Provides cross-platform development abstractions (AsyncStorage API identical between web and potential future mobile implementation). Web-specific polyfills wrap localStorage, enabling code reuse if mobile ports developed (Future Enhancement: mobile application support).

**Design Rationale:**  
React's component model aligns with separation of concerns: each wizard question is an isolated component, reducers manage complex state transitions (multi-step form progression), and hooks encapsulate reusable logic (useProfile custom hook abstracts storage access). Alternative frameworks (Vue, Angular, Svelte) could fulfill requirements; React selected based on developer expertise (reduces implementation risk) and hiring market depth (maintainability, NFR-5XX).

**Chrome Extension Architecture:**
- **Manifest V3 Service Worker**: Replaces persistent background pages (Manifest V2 deprecation). Event-driven lifecycle: service worker loads when extension installed or message received, terminates after 30 seconds inactivity. Stateless design required (all state in chrome.storage, not JavaScript variables surviving only during worker lifetime).

- **Content Scripts (content-simple.js)**: Execute in isolated JavaScript contexts injected into every loaded web page (`matches: ["<all_urls>"]`). Access page DOM (can inject modal elements) but isolated from page scripts (cannot access page's global variables/functions). This isolation prevents websites from detecting/disabling the extension via DOM manipulation.

- **Popup Interface (popup.html/popup.js)**: Lightweight HTML page rendered when extension icon clicked. Provides quick access to strict mode toggle, violation count display. Limited screen real estate (typical 400×600px); comprehensive settings redirect to full web app dashboard.

**Design Constraint - Extension Limitations:**
Manifest V3 service workers cannot maintain persistent state (NFR-302: extension lifecycle resilience). Example scenario: User completes setup, profile saved to chrome.storage. Service worker terminates. 10 minutes later, user visits Instagram. Content script loads, service worker re-initializes, reads profile from storage (not in-memory). This event-driven model prevents memory leaks but requires careful state management (all critical data persisted immediately, never held only in variables).

---

#### **5.1.2 Business Logic Layer Architecture**

The Business Logic Layer implements domain-specific algorithms independent of UI frameworks and storage mechanisms. This layer contains zero React components, zero chrome.* API calls, and zero storage I/O operations directly. All external interactions occur via Service Layer abstractions.

**Module Responsibilities:**

**1. Profile Manager Module**  
*Inputs:* Raw form data (7 question responses, study platform URL strings)  
*Outputs:* Validated, structured userProfile object conforming to schema (Section 4.2, FR-103)  
*Processing Logic:*
- URL validation: Regex matching `^https?://`, auto-prepending "https://" if missing (FR-102)
- Platform count enforcement: Reject profiles with <2 platforms (acceptance criteria: FR-101)
- Field sanitization: Trim whitespace, escape HTML entities (prevents XSS if profile displayed in modal)

*Design Decision:* Validation occurs in business logic (not UI layer) enabling unit testing without rendering React components. Invalid data never reaches storage layer (fail-fast principle).

**2. Prompt Generator Module**  
*Inputs:* Violation count (integer), user profile object  
*Outputs:* Personalized prompt string (HTML-safe text)  
*Processing Logic:*
- Tier selection: Three-way conditional (`count ≤1 → Tier 1, count ≤4 → Tier 2, else → Tier 3`)
- Template retrieval: Tier-indexed array of message templates (`templates[tierIndex]`)
- Placeholder substitution: String replacement (`${goal}` → profile.realGoal, `${domain}` → blockedDomain) using template literals or regex-based substitution

*Design Rationale:* Template-based generation (vs. generative AI models) ensures determinism (same inputs → same outputs, critical for testing), zero latency (no API calls), and content control (no risk of inappropriate generated text). Templates manually crafted based on psychological principles (cognitive dissonance, loss aversion) identified in literature (Section 3, Papers 3, 5, 7).

*Limitation:* Templates English-only; internationalization requires separate template sets per language. Personalization depth limited to captured profile fields; cannot incorporate external data (calendar events, recent academic performance) without architecture expansion.

**3. Violation Tracker Module**  
*Inputs:* Current timestamp, blocked domain, selected study platform  
*Outputs:* Updated violation count, structured log entry  
*Processing Logic:*
- Date comparison: `currentDate = new Date().toISOString().split('T')[0]` (YYYY-MM-DD format). If `currentDate !== lastViolationDate`, reset count to 0 (daily reset logic, FR-602)
- Count increment: Atomic operation (read current count, increment, write back) with concurrency handling (if two tabs violate simultaneously, race condition possible; chrome.storage atomic updates mitigate risk)
- Log entry construction: JSON object with ISO8601 timestamp, domain, redirect URL, tier, daily count

*Design Decision:* Daily reset at midnight local time (not UTC) accommodates circadian patterns (Hofmann et al., 2017: self-control degrades throughout day). Users "start fresh" each day; consequence-tier prompts don't persist indefinitely, reducing burnout risk.

**4. Redirection Logic Module**  
*Inputs:* Violation count, study platforms array  
*Outputs:* Selected platform URL  
*Processing Logic:*
- Modulo rotation: `index = violationCount % platforms.length` (deterministic rotation ensuring variety)
- Fallback handling: `if (platforms.length === 0 || !platforms[index]?.url) return FALLBACK_URL`
- URL validation: Verify selected URL matches `^https?://` before redirect (prevents `javascript:` protocol injection)

*Design Rationale:* Modulo rotation simpler than randomization (deterministic testing), provides variety (prevents habituation to single destination), and fair distribution (each platform receives approximately equal redirections over time).

---

#### **5.1.3 Service Layer Architecture**

The Service Layer abstracts infrastructure concerns (storage APIs, messaging protocols) behind stable interfaces. Business logic calls service layer functions; service layer translates to platform-specific API calls. This enables swapping storage backends (e.g., replacing chrome.storage with IndexedDB) without modifying business logic.

**1. Storage Adapter Pattern**  
*Interface:*
```javascript
interface StorageAdapter {
  writeProfile(profile: UserProfile): Promise<void>;
  readProfile(): Promise<UserProfile | null>;
  writeLogs(logs: ViolationLog[]): Promise<void>;
  readLogs(): Promise<ViolationLog[]>;
}
```

*Implementations:*
- **ChromeStorageAdapter**: Wraps `chrome.storage.local.get()` and `.set()` in Promises, handles quota exceeded errors (edge case: >10MB data), provides fallback behavior
- **AsyncStorageAdapter**: Wraps React Native AsyncStorage (localStorage polyfill on web) with identical interface

*Design Benefit:* Business logic calls `storageAdapter.readProfile()` without knowing if chrome.storage or localStorage is used. Unit tests mock the adapter, enabling isolated logic testing.

**2. Message Broker**  
*Responsibilities:*
- Cross-context communication: Web app (JavaScript in webpage) sends profile to extension (JavaScript in isolated content script context) via `window.postMessage()`
- Source validation: Verify message.source === 'productivity-assassin-app' (prevents malicious websites from injecting fake profiles)
- Protocol handling: Serialize/deserialize JSON payloads, manage acknowledgment handshakes (ensure profile received before web app navigates away)

*Security Consideration:* postMessage broadcasts to all listeners on the page (including malicious scripts). Validation prevents spoofing but cannot prevent eavesdropping. Non-sensitive data (profile contains user-entered goals, not credentials) mitigates risk.

**3. Logging Service**  
*Functions:*
- Structured logging: `logDebug(component: string, message: string, data: object)` outputs: `[timestamp][component] message` with console.log color coding (errors: red, warnings: yellow, debug: gray)
- Log levels: DEBUG (development only), INFO (general events), WARN (non-critical issues like fallback URL usage), ERROR (storage failures, validation errors)
- Production filtering: In production builds, DEBUG level suppressed (reduces console noise)

*Design Rationale:* Centralized logging enables future enhancements (log aggregation, error reporting services) without scattering console.log calls across codebase.

---

#### **5.1.4 Data Layer Architecture**

The Data Layer manages persistent storage using browser-native APIs. No custom database systems (SQLite, IndexedDB) implemented; browser storage APIs sufficient for data scale (user profiles ~2KB, 90-day log history ~2.2MB per Section 4.2, Table 3.4).

**Storage Strategy Duality:**  
Two parallel storage locations maintained (chrome.storage.local and AsyncStorage) due to architectural constraints:

1. **chrome.storage.local**: Extension's content scripts can access via `chrome.storage.local.get()`. Web application **cannot** access chrome.storage (security boundary: web pages cannot read extension storage).

2. **AsyncStorage (localStorage)**: Web application can access. Extension **can** access (content scripts execute in page context), but chrome.storage preferred within extension for extension-specific features (unlimited quota with permission, automatic sync if cloud sync enabled by user).

**Synchronization:**  
Setup wizard writes to **both** storage locations (FR-103). Message broker ensures extension receives profile via postMessage, and extension writes to chrome.storage. Web app writes to AsyncStorage directly. This dual-write pattern tolerates failures: if postMessage fails, extension still has profile from previous sync; if AsyncStorage write fails, only web app affected (extension continues functioning).

**Data Schema:**

*UserProfile Schema:*
```json
{
  "realGoal": "string (required, max 200 chars)",
  "failurePattern": "string (required, max 200 chars)",
  "sacrifice": "string (required, max 200 chars)",
  "studyPlatforms": [
    {"name": "string", "url": "string (URL format)"}
  ],
  "weakTime": "string (required, max 100 chars)",
  "mainDistraction": "string (required, max 100 chars)",
  "accountability": "string (required, max 100 chars)",
  "tone": "enum['Tough', 'Encouraging'] (optional, default: 'Tough')",
  "createdAt": "ISO8601 timestamp"
}
```

*ViolationLog Schema:*
```json
{
  "date": "YYYY-MM-DD string",
  "violations": [
    {
      "timestamp": "ISO8601 string",
      "blockedDomain": "string (domain only, no protocol)",
      "redirectURL": "string (full URL with protocol)",
      "promptTier": "enum['advisory', 'accountability', 'consequence']",
      "dailyCount": "integer (violation number within day)",
      "fallback": "boolean (true if default platform used)",
      "strictModeOverride": "boolean (true if strict mode disabled)"
    }
  ]
}
```

**Storage Quota Management:**  
FR-603 specifies 90-day log retention with auto-deletion. Implementation: During each log write operation, iterate through stored log dates, identify entries >90 days old (`Date.now() - logDate > 90 * 24 * 60 * 60 * 1000`), delete those entries. This lazy deletion approach avoids scheduled tasks (Manifest V3 service workers cannot schedule reliable intervals due to inactivity timeout).

---

&nbsp;

### 5.2 Data Flow Diagram

Figure 5.2 illustrates the end-to-end data flow from user action (visiting blacklisted site) through violation detection, prompt display, redirection, and logging. This sequence diagram shows temporal ordering of operations and inter-component communication.

&nbsp;

---

**Figure 5.2: Violation Detection and Intervention Data Flow**

*(Insert sequence diagram here showing temporal flow: User navigates → Content Script detects → Retrieves profile from Storage → Calls Prompt Generator → Displays Modal → Countdown expires → Redirection Logic executes → Violation Tracker logs event → Storage updated. See Figure 5.2 description below for detailed sequence.)*

**Caption**: Sequence diagram depicting data flow during a violation intervention. Vertical lifelines represent system components; horizontal arrows represent synchronous function calls (solid) and asynchronous operations (dashed). Numbered sequence: (1) User navigates to blacklisted URL, (2) Content script extracts domain and performs blacklist match, (3) Profile and violation count retrieved from chrome.storage, (4) Prompt generator computes tier and message text, (5) Modal rendered with 3-second countdown, (6) Redirection logic selects platform via modulo rotation, (7) Browser navigates to study platform, (8) Violation tracker increments count and creates log entry, (9) Updated data persisted to storage.

---

&nbsp;

#### **Figure 5.2 Sequence Specification:**

*Diagram should be created as UML sequence diagram with vertical lifelines and horizontal message arrows. Use PlantUML, draw.io, or Lucidchart.*

**Participants (Vertical Lifelines, Left to Right):**
1. User (actor icon)
2. Browser (box icon)
3. Content Script (component box)
4. Storage Adapter (component box)
5. Prompt Generator (component box)
6. Modal Renderer (component box)
7. Redirection Logic (component box)
8. Violation Tracker (component box)
9. chrome.storage.local (database icon)

**Sequence Steps (Horizontal Arrows with Labels):**

1. **User → Browser**: Navigate to URL (e.g., "https://instagram.com")  
   *(Solid arrow, label: "GET instagram.com")*

2. **Browser → Content Script**: Page load event  
   *(Solid arrow, label: "DOMContentLoaded")*

3. **Content Script → Content Script**: Extract domain from window.location.hostname  
   *(Self-call arrow, label: "parseDomain() → 'instagram.com'")*

4. **Content Script → Content Script**: Check blacklist array  
   *(Self-call arrow, label: "isBlacklisted('instagram.com') → true")*

5. **Content Script → Storage Adapter**: Request user profile  
   *(Solid arrow, label: "readProfile()")*

6. **Storage Adapter → chrome.storage.local**: Get profile data  
   *(Dashed arrow, label: "chrome.storage.local.get(['userProfile'])")*

7. **chrome.storage.local → Storage Adapter**: Return profile object  
   *(Dashed arrow, label: "Promise<UserProfile>")*

8. **Storage Adapter → Content Script**: Return profile  
   *(Solid arrow, label: "UserProfile object")*

9. **Content Script → Storage Adapter**: Request current violation count  
   *(Solid arrow, label: "readViolationCount(currentDate)")*

10. **Storage Adapter → chrome.storage.local**: Get today's count  
    *(Dashed arrow, label: "get(['violationCount_2024-12-29'])")*

11. **chrome.storage.local → Storage Adapter**: Return count  
    *(Dashed arrow, label: "count = 3")*

12. **Storage Adapter → Content Script**: Return count  
    *(Solid arrow, label: "3")*

13. **Content Script → Prompt Generator**: Generate prompt  
    *(Solid arrow, label: "generatePrompt(count=3, profile, domain='instagram.com')")*

14. **Prompt Generator → Prompt Generator**: Select tier (count=3 → Tier 2)  
    *(Self-call, label: "selectTier(3) → 'accountability'")*

15. **Prompt Generator → Prompt Generator**: Substitute template placeholders  
    *(Self-call, label: "substituteTemplates(tier, profile)")*

16. **Prompt Generator → Content Script**: Return prompt text  
    *(Solid arrow, label: "Personalized prompt string")*

17. **Content Script → Modal Renderer**: Display modal  
    *(Solid arrow, label: "renderModal(promptText, tier='accountability')")*

18. **Modal Renderer → Browser**: Inject DOM elements  
    *(Solid arrow, label: "document.body.appendChild(modal)")*

19. **Modal Renderer → Modal Renderer**: Start 3-second countdown  
    *(Self-call, label: "setInterval(1000ms, updateTimer)")*

20. **[Wait 3 seconds - indicated by vertical dotted line across all lifelines]**

21. **Modal Renderer → Redirection Logic**: Countdown expired  
    *(Solid arrow, label: "onCountdownComplete()")*

22. **Redirection Logic → Redirection Logic**: Calculate platform index  
    *(Self-call, label: "index = 3 % 2 = 1")*

23. **Redirection Logic → Redirection Logic**: Select platform URL  
    *(Self-call, label: "platforms[1].url → 'https://leetcode.com'")*

24. **Redirection Logic → Browser**: Execute redirect  
    *(Solid arrow, label: "window.location.replace('https://leetcode.com')")*

25. **Redirection Logic → Violation Tracker**: Log violation  
    *(Solid arrow, label: "logViolation(domain, redirectURL, tier, count)")*

26. **Violation Tracker → Violation Tracker**: Increment count  
    *(Self-call, label: "count = 3 + 1 = 4")*

27. **Violation Tracker → Violation Tracker**: Create log entry  
    *(Self-call, label: "buildLogEntry(timestamp, domain, ...)")*

28. **Violation Tracker → Storage Adapter**: Save updated count and log  
    *(Solid arrow, label: "writeViolationData(count=4, logEntry)")*

29. **Storage Adapter → chrome.storage.local**: Persist data  
    *(Dashed arrow, label: "chrome.storage.local.set({...})")*

30. **chrome.storage.local → Storage Adapter**: Confirm write  
    *(Dashed arrow, label: "Promise<void>")*

31. **Browser → User**: Display study platform page  
    *(Solid arrow, label: "Render LeetCode.com")*

**Timing Annotations:**
- Step 1-16: NFR-101/102 target: ≤500ms (detection + prompt generation)
- Step 17-19: Modal rendering <50ms
- Step 20: Fixed 3-second countdown (user-facing delay)
- Step 21-30: <100ms (redirection + logging overhead)

---

&nbsp;

### 5.3 Deployment Architecture

Figure 5.3 shows the physical deployment of system components across developer environment, user devices, and browser runtime.

&nbsp;

---

**Figure 5.3: Deployment Diagram**

*(Insert deployment diagram showing three deployment nodes: (1) Development Environment (laptop icon) containing Node.js, npm, React dev server; (2) User Device (desktop/laptop icon) containing Chrome Browser with Web App (localhost:19006) and Extension compartments; (3) Browser Storage (cylinder icon) showing chrome.storage.local and localStorage. Arrows show deployment relationships.)*

**Caption**: Deployment architecture showing development and runtime environments. Development environment executes Node.js with npm dependencies and React development server (port 19006). User device runs Chrome browser hosting both the web application (accessed via localhost URL during development, or static hosting in production) and the extension (installed via developer mode or Chrome Web Store). Browser storage persists data locally on user device; no remote servers involved in architecture.

---

&nbsp;

**Development Environment:**
- **Machine**: Developer workstation (Windows/macOS/Linux) with Node.js 18+ installed
- **Tools**: Visual Studio Code (IDE), npm (package manager), Git (version control)
- **Server**: React development server (`npm run web` starts Expo dev server on port 19006)
- **Build Process**: `npm run build` produces static HTML/CSS/JS for production deployment

**Production Deployment Options:**
1. **Option A - Static Hosting**: Build output deployed to Netlify, Vercel, GitHub Pages (free static hosting services). Users access via HTTPS URL (e.g., https://productivity-assassin.netlify.app).

2. **Option B - Local Hosting**: Users run `npm run web` locally. Web app accessible at http://localhost:19006. No external hosting required (fully offline operation after initial npm install).

**Extension Deployment:**
1. **Development Mode**: Load unpacked extension from `d:\Projects\productivity-assassin\chrome-extension\` directory. Requires enabling Developer Mode in chrome://extensions.

2. **Production Mode (Future)**: Publish to Chrome Web Store. Users install via one-click. Automatic updates delivered by Google when new version published.

**Deployment Constraint:**  
Web app and extension architecturally independent but functionally coupled (profile sync). Users must:
- Access web app at least once (complete setup)
- Install extension to receive interventions
- Keep both updated to matching versions (version mismatches may cause sync failures if profile schema changes)

This loose coupling (no hard binding) enables users to uninstall extension without losing web app access (can still view dashboard statistics), but core intervention functionality unavailable without extension.

---

&nbsp;

### 5.4 Design Patterns and Architectural Decisions

This section documents specific design patterns employed and justifies architectural choices.

**Table 5.1: Design Patterns and Rationale**

| Pattern | Location | Rationale | Alternative Considered | Why Rejected |
|---------|----------|-----------|------------------------|--------------|
| **Layered Architecture** | Overall system | Separation of concerns, testability, maintainability. Each layer independently replaceable. | Microservices architecture | Requires network communication (violates privacy requirement), excessive complexity for single-user desktop application |
| **Adapter Pattern** | Service Layer (Storage Adapter) | Abstracts chrome.storage and AsyncStorage behind common interface. Business logic agnostic to storage mechanism. | Direct API calls in business logic | Tight coupling; difficult to test (cannot mock storage), impossible to swap storage backends |
| **Template Method** | Prompt Generator | Define prompt skeleton in base template, fill placeholders with user data. Ensures consistent message structure across tiers. | Generative AI (GPT prompts) | Latency (API calls), cost, unpredictability (cannot guarantee appropriate content), privacy (data sent to external service) |
| **Strategy Pattern** | Tier Selection | Three strategies (Advisory, Accountability, Consequence) selected based on violation count. Easily extensible (add new tier without modifying selection logic). | Single monolithic prompt function with nested conditionals | Violates Open/Closed Principle; difficult to test individual tier logic in isolation |
| **Observer Pattern** | Message Broker | Web app publishes profile updates; extension subscribes via postMessage listener. Loose coupling between web app and extension. | Polling (extension periodically reads AsyncStorage) | Inefficient (wasted CPU cycles), unreliable (race conditions), delayed sync (polling interval introduces latency) |
| **Singleton** | Storage Adapter instances | Single StorageAdapter instance shared across all business logic modules. Prevents concurrent writes from multiple instances causing race conditions. | New instance per operation | Risk of data corruption (two instances simultaneously writing to storage), memory overhead |

**Architectural Decision Records (ADRs):**

**ADR-001: Client-Side Only Architecture**  
*Decision:* Implement system without backend servers; all processing client-side in browser.  
*Context:* NFR-201 requires zero data transmission to external servers for privacy preservation.  
*Consequences:* (+) User data never leaves device, GDPR-compliant by design. (+) No hosting costs, no server maintenance. (-) Cannot aggregate usage statistics across users. (-) No cross-device profile sync without manual export/import.  
*Alternatives:* Cloud-based architecture with encryption. Rejected due to trust model (users must trust server operator not to decrypt data; "privacy by architecture" superior to "privacy by policy").

**ADR-002: Manifest V3 Extension**  
*Decision:* Use Chrome Manifest V3 extension APIs.  
*Context:* Manifest V2 deprecated, support ending January 2024 (extended to June 2024).  
*Consequences:* (+) Future-proof (Chrome's migration deadline imminent). (+) Access to modern APIs (declarativeNetRequest for potential network-level blocking). (-) Service worker lifecycle complexity (30s inactivity timeout requires stateless design). (-) Firefox/Safari incompatible (different extension models).  
*Alternatives:* Continue using Manifest V2. Rejected as short-sighted; extension would become non-functional when Chrome disables V2 support.

**ADR-003: React Framework**  
*Decision:* Use React 18.2 for web application UI.  
*Context:* Need component-based UI framework for dashboard and setup wizard.  
*Consequences:* (+) Large ecosystem (easy to find libraries, tutorials). (+) Developer familiarity reduces implementation time. (+) Concurrent rendering improves perceived performance during stats calculation. (-) 300KB bundle size (acceptable for web, prohibitive for embedded systems). (-) Learning curve for future maintainers unfamiliar with React.  
*Alternatives:* Vue.js (smaller bundle, simpler API) or Svelte (compiles to vanilla JS, no runtime). Rejected due to team expertise; React selected as lowest-risk option given developer skillset.

**ADR-004: localStorage + chrome.storage Duality**  
*Decision:* Store profile in **both** AsyncStorage (localStorage) and chrome.storage.local.  
*Context:* Web app cannot access chrome.storage; extension prefers chrome.storage for unlimited quota and potential sync features.  
*Consequences:* (+) Redundancy (if one storage corrupted, other survives). (+) Each component uses native storage (web app uses localStorage, extension uses chrome.storage). (-) Duplication (same data stored twice, doubles storage usage). (-) Sync complexity (require message passing to keep both copies updated).  
*Alternatives:* Single storage location. Rejected because chrome.storage inaccessible from web app (security boundary), localStorage writable by malicious websites (extension should not trust it as sole source).

---

&nbsp;

### 5.5 Non-Implemented Components and Future Architectural Extensions

This section acknowledges architectural limitations and documents planned but not-yet-implemented components.

**Components NOT in Current Architecture:**
1. **Analytics Dashboard (Advanced)**: Current dashboard shows basic counts. Future: Time-series visualizations (violations per hour heatmap), goal progress metrics (estimated productive hours based on redirections), trend analysis (week-over-week improvement).

2. **Machine Learning Relevance Classifier**: Current blacklist simple domain matching. Future: Natural language processing analyzing page content to classify relevance to user goal. Example: YouTube block should exempt educational videos matching goal keywords.

3. **Social Accountability Module**: Current system isolated. Future: Optional sharing of violation statistics with accountability partners (friends, mentors). Requires backend architecture (profile sync across devices, friend connections).

4. **Mobile Application**: Current Chrome extension desktop-only. Future: React Native mobile app with similar intervention flow, monitoring iOS/Android app usage instead of browser tabs.

5. **Gamification Engine**: Current system purely negative reinforcement (blocking + confrontation). Future: Positive reinforcement (streak badges for distraction-free days, XP points for study hour milestones).

**Why Not Implemented:**
- **Scope**: Phase-1 deliverable focuses on core intervention functionality (blocking, prompts, redirection). Advanced features deferred to Phase-2.
- **Privacy Trade-offs**: Social features and cloud sync require backend servers, contradicting ADR-001 (client-side-only for privacy).
- **Uncertainty**: ML-based relevance detection requires training data (labeled examples of "relevant vs. irrelevant" pages for specific user goals). Insufficient data to train models during Phase-1 timeline.

**Architectural Extensibility:**  
The layered architecture facilitates future additions:
- **New tier**: Add Tier 4 (Extreme Consequence) by extending promptTemplates array and modifying selectTier() logic (no changes to storage or UI layers required).
- **New storage backend**: Implement IndexedDB adapter conforming to StorageAdapter interface (swap at Service Layer initialization, business logic unmodified).
- **Backend integration**: Insert API Gateway layer between Business Logic and Service layers, routing reads/writes to REST endpoints instead of local storage (layers above API Gateway unmodified).

---

&nbsp;

## Summary

The Productivity Assassin architecture employs a four-tier layered design (Presentation, Business Logic, Service, Data) prioritizing separation of concerns, testability, and privacy by architectural enforcement. Design decisions documented via ADRs demonstrate principled trade-offs: client-side-only architecture sacrifices cross-device sync for privacy assurance, React framework selection balances ecosystem maturity against bundle size overhead, and dual storage (localStorage + chrome.storage) accepts redundancy for robustness. The architecture supports incremental enhancement (new tiers, analytics modules, backends) without requiring foundational refactoring, evidencing the maintainability principle stated in NFR-5XX.

System validation confirms architectural performance targets: detection-to-intervention latency measured p95 <500ms (NFR-101/102), extension memory overhead <50MB during realistic 5-tab workloads (NFR-104), and data persistence through 50 simulated crash scenarios (NFR-301). Documented limitations (Chrome-exclusive, English-only, no ML-based detection) bound scope and establish future work directions.

---

**Formatting Notes for Diagram Insertion:**
1. Create Figure 5.1 (Architecture Diagram), Figure 5.2 (Sequence Diagram), and Figure 5.3 (Deployment Diagram) using diagramming tools (draw.io recommended for open-source compatibility)
2. Export as PNG or SVG (vector format preferred for scaling)
3. Insert at marked locations, 12pt spacing above, 6pt spacing below
4. Caption text: Times New Roman 10pt, centered between margins
5. Figure numbering: Sequential (5.1, 5.2, 5.3), referenced in text before figure appears
