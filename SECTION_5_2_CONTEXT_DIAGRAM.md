## 5.2 Context Flow Diagram

The Context Flow Diagram (Figure 5.4) illustrates the Productivity Assassin system as a single unified entity, depicting its interactions with external actors and data flows crossing system boundaries. This high-level view abstracts internal architecture details, focusing on the system's role within its operational environment.

**Diagram Purpose:**  
Unlike the layered architecture diagram (Figure 5.1) which shows internal component relationships, the context diagram establishes:
1. **System Scope**: Clear boundary between what the system controls and external entities
2. **Data Flows**: Information exchanged between system and environment
3. **External Dependencies**: Third-party services, user inputs, and external websites
4. **Interaction Patterns**: How users and external systems trigger system behaviors

---

### 5.2.1 External Entities

**Entity 1: User (Primary Actor)**  
The user interacts with the system through three distinct touchpoints:

*Input Interactions:*
- **Profile Creation**: User provides goal-oriented data via setup wizard (7-question workflow). Data flow: User → System (goals, failure patterns, sacrifices, study platforms, weak times, accountability factors).
- **Configuration Changes**: User modifies settings via dashboard (study platform updates, strict mode toggle, profile edits). Data flow: User → System (configuration updates).
- **Browsing Activity**: User navigates to URLs during normal web browsing. Data flow: User → System (navigation events, URL strings).

*Output Interactions:*
- **Intervention Prompts**: System displays personalized confrontational messages. Data flow: System → User (modal overlay with prompt text, countdown timer, tier indicators).
- **Statistics Dashboard**: System presents violation analytics. Data flow: System → User (daily counts, weekly trends, top blocked domains, tier distribution).
- **Feedback Notifications**: System confirms actions (profile saved, strict mode enabled/disabled). Data flow: System → User (status messages, alerts).

**Entity 2: Blacklisted Websites (Passive External Systems)**  
These are third-party websites identified as distractions (Instagram, Facebook, YouTube, Reddit, Twitter, TikTok, Netflix, news sites, etc.).

*Interaction Pattern:*
- User navigates to blacklisted domain → Browser loads page → System intercepts before rendering → Blacklist match detected.
- Data flow: Blacklisted Site → System (HTTP response headers, URL string, domain name).
- **No outbound communication**: System does not send data to blacklisted sites; interaction is purely detection-based via URL monitoring.

**Constraint**: System operates at browser level, not network level; cannot block HTTPS traffic before TLS handshake. Relies on content script injection post-page-load (introduces 100-500ms detection window where partial content may render).

**Entity 3: Study Platforms (Redirect Destinations)**  
User-designated educational/productive websites (NPTEL, Khan Academy, LeetCode, Coursera, GitHub, Stack Overflow, etc.).

*Interaction Pattern:*
- System enforces redirection after prompt countdown expires → Browser navigates to selected study platform.
- Data flow: System → Study Platform (HTTP GET request initiated by window.location.replace).
- **Platform rotation**: Algorithm selects different platform per violation (modulo-based distribution).

**No API Integration**: Study platforms unaware of redirection mechanism. From platform perspective, user arrival is indistinguishable from manual navigation.

**Entity 4: Chrome Browser (Runtime Environment)**  
The browser acts as both hosting environment and data provider.

*System Dependencies on Browser:*
- **Storage APIs**: chrome.storage.local (extension), localStorage (web app). Data flow: Bidirectional (read/write profile, logs, counts).
- **DOM Access**: Content scripts manipulate page DOM to inject modals. Data flow: System → Browser (DOM element creation/insertion).
- **Navigation Control**: System issues navigation commands. Data flow: System → Browser (location.replace calls).
- **Event Notifications**: Browser emits events monitored by system. Data flow: Browser → System (DOMContentLoaded, tabs.onUpdated).

**Browser Version Constraint**: Chrome 110+ required for Manifest V3 API compatibility. Earlier versions lack service worker support and storage quota permissions.

**Entity 5: Local File System (Implicit Dependency)**  
Browser storage APIs persist data to disk managed by OS.

*Data Flow:*
- System → File System (via browser): Profile writes, violation log appends.
- File System → System (via browser): Profile reads during intervention, dashboard data retrieval.

**Privacy Implication**: Data remains on local disk; no cloud synchronization. User device compromise (malware, physical access) exposes stored profiles and logs.

---

### 5.2.2 Data Flow Analysis

**Table 5.2: Data Flows Across System Boundary**

| Flow ID | Source | Destination | Data Content | Trigger | Frequency |
|---------|--------|-------------|--------------|---------|-----------|
| **DF-01** | User | System | 7-question profile (goals, patterns, platforms, etc.) ~2 KB JSON | Setup wizard completion | One-time (initial), rare (profile edits) |
| **DF-02** | User | System | URL navigation events (domain strings) | Every page navigation during browsing | High (10-100s per session) |
| **DF-03** | User | System | Dashboard access request | Dashboard page load | Low (1-5 per day) |
| **DF-04** | System | User | Personalized prompt text (12-25 words) + visual styling | Blacklist match detection | Variable (0-20 per day) |
| **DF-05** | System | User | Violation statistics (counts, trends, charts) | Dashboard render | Low (1-5 per day) |
| **DF-06** | System | Study Platform | HTTP GET navigation request | Post-countdown redirect | Matches DF-04 frequency |
| **DF-07** | Blacklisted Site | System | Page load event, URL hostname | User navigation to blacklisted domain | Matches DF-04 frequency |
| **DF-08** | System | Browser Storage | Profile writes, log appends, count increments | Setup completion, violations, configuration changes | Variable (1-20 per day) |
| **DF-09** | Browser Storage | System | Profile reads, log retrieval, count reads | Intervention trigger, dashboard load | High (matches DF-02 + DF-03) |

**Critical Data Flows:**
- **DF-01 (Profile Creation)**: One-time high-value sensitive data. Contains user's personal goals, admitted weaknesses, accountability relationships. Must be protected at rest (relies on Chrome storage encryption).
- **DF-04 (Prompts)**: Real-time rendering with <500ms latency requirement (NFR-101/102). Failure to display promptly allows continued distraction access.
- **DF-06 (Redirection)**: Non-bypassable navigation requiring window.location.replace (not .href). Failure enables trivial circumvention via back button.

**Data Flow Constraint - No External Network Transmission:**  
Notably absent from Table 5.2: any data flow to external analytics services, cloud storage, or remote APIs. This architectural constraint (ADR-001: Client-Side Only) ensures privacy preservation but eliminates cross-device synchronization and aggregate usage analytics.

---

### 5.2.3 System Boundary Definition

The system boundary encompasses:

**Inside System Boundary:**
- React web application (setup wizard, dashboard, analytics)
- Chrome extension (background service worker, content scripts, popup)
- Business logic modules (prompt generation, tier selection, violation tracking, redirection)
- Service layer (storage adapters, message broker, logging service)
- Data structures in browser storage (profiles, logs, counts)

**Outside System Boundary:**
- User's cognitive processes (goal awareness, self-control capacity, motivation)
- Blacklisted websites' servers and content delivery networks
- Study platforms' servers and educational content
- Chrome browser runtime engine (JavaScript V8, rendering engine, network stack)
- Operating system (Windows/macOS/Linux file systems, process schedulers)
- Network infrastructure (ISP connections, DNS servers, HTTPS certificate authorities)

**Boundary Crossing Points:**
1. **User Interface**: HTML DOM rendered in browser viewport (system outputs visuals, user provides input events)
2. **Storage API**: chrome.storage.local and localStorage calls (system persists data, browser manages disk I/O)
3. **Navigation API**: window.location modifications (system initiates navigation, browser executes HTTP requests)
4. **Event Listeners**: DOMContentLoaded, tabs.onUpdated event handlers (browser publishes events, system subscribes)

**Design Rationale for Boundary Placement:**  
The boundary excludes browser internals (V8 engine, network stack) because these are platform-provided infrastructure outside system control. Including them would imply responsibility for browser bugs or performance issues unrelated to system logic. Conversely, data structures in browser storage are included because they represent system state, even though physical disk management is delegated to browser.

---

&nbsp;

**Figure 5.4: Context Flow Diagram**

*(Insert context diagram here showing central "Productivity Assassin System" box with bidirectional arrows connecting to: User (top), Blacklisted Websites (left), Study Platforms (right), Chrome Browser (bottom-left), Local File System (bottom-right). Each arrow labeled with data flow content from Table 5.2. See Mermaid code in supplementary file.)*

**Caption**: Context flow diagram depicting the Productivity Assassin system (central box) and external entities with which it exchanges data. Arrows indicate data flows across system boundary: User provides profile data and navigation events, system delivers prompts and statistics. Blacklisted websites trigger detection via navigation events. Study platforms receive redirection requests. Chrome browser provides runtime environment and storage APIs. All data persists locally; no external network transmission occurs (privacy-by-architecture principle).

---

&nbsp;

### 5.2.4 Interaction Scenarios

**Scenario 1: Initial Setup Flow**
1. User navigates to web application URL (localhost:19006 or production host)
2. System detects no existing profile in browser storage → Displays setup wizard
3. User completes 7 questions, submits form
4. System validates inputs (Platform validation via FR-102, minimum count enforcement via FR-101)
5. System writes profile to AsyncStorage (web app) and sends via postMessage to extension
6. Extension background worker receives message, writes profile to chrome.storage.local
7. System displays confirmation alert → User redirected to dashboard
8. **Data Flows**: DF-01 (User → System), DF-08 (System → Browser Storage)

**Scenario 2: Violation Detection and Intervention**
1. User browses normally, navigates to instagram.com
2. Browser initiates page load, emits DOMContentLoaded event
3. Content script executes (injected per manifest matches), extracts domain
4. System checks domain against blacklist → Match found
5. System retrieves profile (DF-09) and violation count (DF-09) from storage
6. System calculates tier (count=3 → Tier 2), generates personalized prompt
7. System injects modal DOM elements into page, displays prompt (DF-04)
8. System starts 3-second countdown (user cannot dismiss modal)
9. Countdown expires → System calculates platform index (3 % 2 = 1)
10. System executes redirection (DF-06) to platforms[1].url (e.g., LeetCode)
11. System increments violation count, creates log entry, persists to storage (DF-08)
12. Browser loads study platform → User views educational content
13. **Data Flows**: DF-07 (Blacklisted Site → System), DF-09 (×2 reads), DF-04 (prompt display), DF-06 (redirect), DF-08 (log write)

**Scenario 3: Dashboard Statistics Review**
1. User navigates to dashboard URL (http://localhost:19006/dashboard)
2. System retrieves profile (DF-09) and violation logs (DF-09) from storage
3. System computes aggregates: daily count (sum violations for current date), weekly trend (group by date for last 7 days), top domains (frequency count), tier distribution (count by tier)
4. System renders React components displaying statistics (DF-05)
5. User reviews data, decides whether to adjust strict mode or study platforms
6. (Optional) User modifies study platforms, clicks Save → System validates, persists (DF-08)
7. **Data Flows**: DF-03 (dashboard request), DF-09 (×2 reads), DF-05 (statistics display), optionally DF-08 (settings write)

---

### 5.2.5 External System Dependencies and Risks

**Table 5.3: External Dependencies and Mitigation Strategies**

| External Entity | Dependency Type | Failure Mode | Impact | Mitigation |
|-----------------|----------------|--------------|--------|------------|
| **Chrome Browser** | Platform (mandatory) | Browser crash during profile write | Data loss if write incomplete | chrome.storage.local provides atomic writes; tested via NFR-301 (50 force-quit trials, 100% survival) |
| **Blacklisted Sites** | Detection target | Site uses subdomains (e.g., m.instagram.com) | Bypass detection if subdomain not in blacklist | Subdomain normalization in FR-201 (strip www, match base domain) |
| **Study Platforms** | Redirect destination | Platform down/unreachable | User reaches error page post-redirect | Acceptable; user already interrupted from distraction. Fallback URL (Khan Academy) used if user-defined platforms empty (FR-503) |
| **Browser Storage APIs** | Data persistence | Quota exceeded (>10 MB) | Write failures, profile loss | FR-603: 90-day log retention with auto-deletion keeps usage <10 MB. Storage Adapter catches quota errors, logs warnings |
| **User Motivation** | Behavioral prerequisite | User uninstalls extension or disables strict mode | System ineffective | Acceptance criteria: Users voluntarily seeking accountability tools (Section 4.1). No technical mitigation; usage requires commitment |
| **Operating System** | Disk I/O, process scheduling | OS-level storage corruption | Profile/log corruption or loss | No direct mitigation (reliant on OS reliability). User advised to backup profile via dashboard export feature (future enhancement) |

**External Dependency Minimization Principle:**  
The architecture intentionally minimizes external dependencies. No third-party analytics SDKs (Google Analytics, Mixpanel), no cloud storage providers (Firebase, AWS S3), no authentication services (Auth0, Google Sign-In). Each eliminated dependency reduces:
- **Attack surface**: Fewer third-party libraries reduce supply chain vulnerability (NFR-504)
- **Privacy leakage risk**: No external HTTP requests means zero data exfiltration paths (NFR-201)
- **Single points of failure**: Cloud service outages do not affect system functionality

**Accepted External Dependencies:**  
Only unavoidable platform dependencies retained:
- Chrome browser (justified: target platform for extension model)
- Node.js/npm (justified: development tooling, not runtime dependency for end users)
- React library (justified: widespread adoption, mature ecosystem, acceptable bundle size)

---

### 5.2.6 Comparison to Alternative System Contexts

**Alternative Context 1: Cloud-Based Architecture**  
If the system employed backend servers:
- Additional external entities: AWS/GCP servers, authentication providers, analytics databases
- New data flows: Profile upload (User → Cloud), cross-device sync (Cloud → Multiple Devices), aggregate analytics (Cloud → Admin Dashboard)
- **Rejected** per ADR-001 due to privacy concerns and hosting costs

**Alternative Context 2: Mobile Application**  
If implemented as iOS/Android native app:
- Different runtime environment: Android OS / iOS replacing Chrome Browser
- Modified interactions: App usage monitoring instead of URL navigation events
- Study platform redirection replaced by: App switching (open Duolingo, close Instagram)
- **Deferred** to future work (Section 5.5); requires React Native port and platform-specific permissions

**Alternative Context 3: Network-Level Blocking (Pi-hole style)**  
If implemented as network appliance:
- External entity change: Router/DNS Server replaces Chrome Browser
- System boundary expands: Includes network packet inspection, DNS request interception
- Lost functionality: Cannot personalize prompts (network level has no user context), cannot display modal (no UI access)
- **Rejected** due to loss of core value proposition (personalized accountability)

The chosen context (browser extension + web app) balances:
- **Accessibility**: No network infrastructure changes required, works on any device with Chrome
- **Personalization**: Direct access to user profile and browser DOM for prompt customization
- **Privacy**: Local-only architecture with zero backend dependencies
- **Portability**: Web technologies enable future mobile ports with code reuse

---

## Summary

The Context Flow Diagram establishes the Productivity Assassin system within its operational environment, clarifying the boundary between system-controlled logic and external platform dependencies. The system interacts with five primary external entities: User (bidirectional profile creation and intervention delivery), Blacklisted Websites (passive detection targets), Study Platforms (redirect destinations), Chrome Browser (runtime environment and storage provider), and Local File System (persistent data storage).

Critical design decisions evident in the context diagram include: (1) absence of external network services (no analytics, cloud storage, or authentication providers), enforcing privacy-by-architecture, (2) reliance on browser-provided APIs (chrome.storage, DOM manipulation) rather than OS-level controls, enabling cross-platform compatibility, and (3) placement of intervention logic entirely within client-side JavaScript, eliminating server-side computational dependencies.

The diagram validates architectural principle ADR-001 (Client-Side Only Architecture) by demonstrating zero data flows crossing network boundaries to external services. All nine identified data flows (Table 5.2) remain within the local device context: User ↔ System ↔ Browser Storage. This constraint, while eliminating convenient features like cloud sync, ensures compliance with privacy requirements (NFR-2XX) and reduces operational complexity (zero hosting costs, no server maintenance).
