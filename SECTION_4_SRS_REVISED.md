## 4. SOFTWARE REQUIREMENTS SPECIFICATION

This section formally defines the system's behavioral requirements, quality attributes, and user characteristics. Requirements are specified using the IEEE 830-1998 standard notation with measurable acceptance criteria where applicable.

---

### 4.1 Users of the System

**Target User Population:**  
The system addresses individuals experiencing self-regulation failures in digital environments. User categorization is based on empirical literature identifying populations with high procrastination rates and distinct digital distraction patterns.

**Table 4.1: User Categories and Characteristics**

| User Category | Defining Characteristics | Primary Use Case | Population Estimate* | Justification |
|---------------|-------------------------|------------------|---------------------|---------------|
| **University Students (UG/PG)** | • Age: 18-26<br>• High social media exposure (>4 hours/day)<br>• Deadline-driven work patterns<br>• Limited schedule autonomy during exam periods | Maintaining focus during study sessions, assignment completion, and exam preparation. Goal alignment with academic performance metrics (grades, completion rates). | ~40M globally (English-speaking countries) | Hofmann et al. (2017) found 47% self-control failure rate for media consumption among students. Academic environment creates clear goal-performance links suitable for accountability interventions. |
| **Remote Workers (Knowledge Work)** | • Age: 25-45<br>• Home-based work environment<br>• Flexible schedules with limited external supervision<br>• Performance measured by deliverables, not hours | Preventing social media/news browsing during work hours. Enforcement of focus blocks before deadlines. Separation of work and leisure browsing contexts. | ~580M global remote workforce (ILO 2023) | Remote work eliminates physical oversight; self-control becomes primary productivity determinant. Caraban et al. (2019) showed hard blocks effective for autonomy-rich environments. |
| **Graduate Researchers / Doctoral Candidates** | • Age: 24-35<br>• Extended focus requirements (2-4 hour blocks)<br>• Self-directed work with distant deadlines<br>• High cognitive load tasks (writing, analysis) | Sustaining deep work sessions. Preventing fragmented attention during reading/writing. Managing procrastination on open-ended tasks without immediate deadlines. | ~3M PhD students globally | Academic writing requires sustained attention incompatible with digital interruptions. Gollwitzer & Sheeran (2006) meta-analysis showed implementation intentions most effective for difficult goals characteristic of research work. |
| **Professional Exam Candidates** | • Age: 22-40<br>• Preparing for certifications (CPA, CFA, UPSC, GRE, etc.)<br>• High-stakes outcomes contingent on performance<br>• Self-study context outside formal education | Maintaining study discipline over extended preparation periods (3-12 months). Enforcing sacrifice of leisure activities. Leveraging high stakes for accountability messaging. | ~50M annual test-takers (major global exams) | High-stakes context creates natural accountability anchors (career consequences). Klein et al. (1999) showed goal commitment strongest when failure costs are explicit. |

**\*Population estimates** derived from: UNESCO education statistics (students), International Labour Organization remote work surveys (2023), OECD higher education data (researchers), and major testing body registration data.

**Excluded User Populations:**  
The system is **not designed** for:
1. **Clinical populations with diagnosed ADD/ADHD**: Requires medical oversight; productivity tools insufficient for clinical conditions. Self-regulation deficits qualitatively different from general procrastination.
2. **Minors (<18 years)**: Parental consent and oversight required. Psychological impact of confrontational messaging not validated for developmental stages.
3. **Elderly users (>65 years)**: Age-related cognitive changes may affect responsiveness to time-pressured interventions (3-second countdown). Limited digital native familiarity with browser extensions.
4. **Individuals with anxiety disorders**: Consequence-tier messaging deliberately induces discomfort; contraindicated for anxiety management contexts.

**User Characteristics Assumptions:**
- **Digital literacy**: Users can install browser extensions, navigate web applications, complete multi-step forms.
- **Language proficiency**: English reading comprehension at B2 level (CEFR) minimum for processing prompt messages within 3-second window.
- **Motivation baseline**: Users voluntarily seek accountability tools; system ineffective for coerced use (e.g., parental installation without consent).
- **Goal clarity**: Users possess identifiable goals (academic, career, personal development) articulable in concrete terms during setup.

---

### 4.2 Functional Requirements

Functional requirements specify observable system behaviors. Each requirement includes:
- **Requirement ID** (FR-XXX format)
- **Priority** (Essential/Desirable/Optional per MoSCoW method)
- **Acceptance Criteria** (measurable where applicable)

**Table 4.2: Functional Requirements Categorized by Module**

#### **FR-1XX: User Profile Management Module**

| ID | Requirement | Priority | Acceptance Criteria | Rationale |
|----|-------------|----------|--------------------|-----------| 
| **FR-101** | The system shall present a seven-question setup wizard capturing: (1) Real goal, (2) Failure pattern, (3) Sacrifice, (4) Study platforms (2-5 URLs), (5) Weak time, (6) Main distraction, (7) Accountability | Essential | • All questions displayed sequentially<br>• Input validation enforces non-empty responses<br>• Minimum 2 study platforms required<br>• Progress indicator shows completion (1/7, 2/7, ...) | Based on Krebs et al. (2010) meta-analysis showing behavioral personalization (d=0.24) requires detailed user data beyond demographics. |
| **FR-102** | The system shall validate study platform URLs by checking HTTP/HTTPS protocol presence. If absent, prepend "https://" automatically. | Essential | • Input: "example.com" → Stored: "https://example.com"<br>• Input: "http://test.org" → Stored as-is<br>• Malformed URLs (e.g., "ht!tp://invalid") trigger error alert | Prevents redirection failures due to malformed URLs. |
| **FR-103** | The system shall store user profiles in two locations simultaneously: (a) AsyncStorage (web app persistence), (b) chrome.storage.local (extension access). | Essential | • Profile retrieval successful from both storage locations after 1-second delay<br>• Data consistency: stored objects structurally identical (deep equality check) | Dual storage ensures synchronization between web app and extension. Single storage point creates race condition if extension reads before write completes. |
| **FR-104** | The system shall provide a dashboard view displaying the stored profile with edit capabilities for: study platforms, weak time, accountability. Goal, failure pattern, and sacrifice shall be immutable post-activation. | Desirable | • Edit form pre-populated with current values<br>• Save operation updates both storage locations<br>• Immutable fields displayed as read-only text | Krebs et al. (2010) showed tailored interventions effective with 3-5 exposures. Allowing goal changes undermines commitment (Klein et al., 1999: initial commitment predicts outcomes). |

#### **FR-2XX: Browser Monitoring and Detection Module**

| ID | Requirement | Priority | Acceptance Criteria | Rationale |
|----|-------------|----------|--------------------|-----------| 
| **FR-201** | The Chrome extension content script shall execute on ALL URLs (matches: `<all_urls>`). Upon page load, extract domain from `window.location.hostname`. | Essential | • Content script injection verified on 10 diverse domains (social, news, educational, e-commerce)<br>• Domain extraction accurate for subdomains (e.g., "www.example.com" → "example.com") | Universal execution ensures no blacklisted site escapes detection. Subdomain normalization prevents bypass via www prefix. |
| **FR-202** | The system shall maintain a hardcoded blacklist array containing minimum 15 domains: instagram.com, facebook.com, twitter.com, youtube.com, reddit.com, netflix.com, tiktok.com, snapchat.com, twitch.tv, pinterest.com, linkedin.com (feed only), news sites (cnn.com, bbc.com, nytimes.com), entertainment (9gag.com). | Essential | • Blacklist stored as JavaScript array in content script<br>• Case-insensitive matching ("Instagram.com" matches "instagram.com")<br>• Array modifiable via extension settings (future enhancement) | Domains selected based on Hofmann et al. (2017): social media/video streaming highest self-control failure rates (47%). |
| **FR-203** | Detection logic: IF extracted domain matches any blacklist entry AND strict mode is ENABLED, THEN trigger intervention workflow (FR-3XX). ELSE allow normal page load. | Essential | • Test case: Navigate to instagram.com with strict mode ON → Intervention triggered<br>• Test case: Navigate to google.com → No intervention<br>• Test case: instagram.com with strict mode OFF → Warning displayed, no redirect | Boolean logic properly implemented; no false positives (non-blacklisted sites blocked) or false negatives (blacklisted sites pass through). |

#### **FR-3XX: Intervention Prompt Generation Module**

| ID | Requirement | Priority | Acceptance Criteria | Rationale |
|----|-------------|----------|--------------------|-----------| 
| **FR-301** | Upon intervention trigger, retrieve: (a) User profile from chrome.storage, (b) Current day's violation count. | Essential | • Storage read operation completes within 100ms (p95 latency)<br>• Violation count initialized to 0 if current date differs from last logged violation date | Prompt tier selection (FR-302) depends on violation count. Date reset ensures daily tier recalibration (prevents perpetual consequence-tier lock). |
| **FR-302** | Implement three-tier prompt escalation:<br>• **Tier 1 (Advisory)**: 0-1 violations<br>• **Tier 2 (Accountability)**: 2-4 violations<br>• **Tier 3 (Consequence)**: 5+ violations | Essential | • Violation count 0 → Tier 1 selected<br>• Violation count 3 → Tier 2 selected<br>• Violation count 6 → Tier 3 selected<br>• Tier assignment deterministic (same count always yields same tier) | Escalation prevents habituation (Caraban et al., 2019). Thresholds empirically derived: 2-4 violations represent "pattern emerging," 5+ indicates "chronic issue." |
| **FR-303** | Generate personalized prompt text using template substitution:<br>• Tier 1 template: "{domain} has ZERO connection to '{goal}'. {weakTime} is when you always fail. Don't prove it right."<br>• Tier 2 template: "You admitted: '{failurePattern}'. You're doing it right now. Violation #{count} today."<br>• Tier 3 template: "STOP LYING TO YOURSELF. {sacrifice} is on the line. {accountability} is watching. This is pathetic." | Essential | • Placeholders replaced with user profile values:<br>  - {domain}: Blocked domain (e.g., "instagram.com")<br>  - {goal}: User's real goal<br>  - {failurePattern}: User's admitted pattern<br>  - {sacrifice}: User's identified sacrifice<br>  - {accountability}: User-specified accountability entity<br>  - {count}: Current violation count<br>• No placeholders remain unreplaced in final message | Template-based generation ensures consistency while maintaining personalization (Krebs et al., 2010: personalized messages d=0.24 advantage). Confrontational tone deliberate (Caraban et al.: hard interventions outperform gentle nudges). |

#### **FR-4XX: Modal Display and User Interaction Module**

| ID | Requirement | Priority | Acceptance Criteria | Rationale |
|----|-------------|----------|--------------------|-----------| 
| **FR-401** | Create full-screen modal overlay with:<br>• Fixed positioning covering 100vw × 100vh<br>• z-index: 999999 (above all page content)<br>• Semi-transparent dark background (rgba(0,0,0,0.95))<br>• Centered content box (max-width: 750px) | Essential | • Modal visually obscures underlying page content (verified via screenshot comparison)<br>• User cannot interact with page elements behind modal (click events on background elements do not propagate)<br>• Modal renders identically across Chrome versions 110-120 | Full-screen requirement based on Kim et al. (2019): effortful friction breaks automaticity. Semi-transparency allows users to see blocked site (reinforces what they're missing), increasing psychological impact. |
| **FR-402** | Display tier-specific visual styling:<br>• Tier 1: Orange border (6px solid #ff9500)<br>• Tier 2: Red border (6px solid #ff3b30)<br>• Tier 3: Deep red border (6px solid #8B0000), pulsing glow effect | Essential | • Border color measured via computed style matching hex codes<br>• Tier 3 glow animation visible (CSS @keyframes applied) | Color psychology: Orange (warning), Red (danger), Deep red (severe threat). Pulsing animation increases salience for high-severity tier. |
| **FR-403** | Display countdown timer initialized to 3 seconds. Decrement every 1000ms. Display format: "Redirecting in X..." where X is remaining seconds. | Essential | • Timer accuracy: ±50ms (measured via performance.now())<br>• Visual update every second (no skipped frames)<br>• Countdown completion triggers redirection (FR-501) | 3-second duration based on Kim et al. (2019): typing task averaged 8-10 seconds; 3 seconds provides sufficient reading time (avg adult reading speed 250 wpm = ~12 words/3 seconds, prompts designed <12 words for critical message). |
| **FR-404** | Modal shall be non-dismissible: Clicking background, pressing ESC key, or clicking close button (if present) shall NOT close modal. Only countdown expiration closes modal. | Essential | • Test: Click modal background → Modal persists<br>• Test: Press ESC → Modal persists<br>• Test: Press F5 (refresh) → Page reloads, intervention re-triggered (same violation count) | Non-dismissibility critical for "hard block" effectiveness (Caraban et al., 2019: 67% retention vs. 34% for dismissible interventions). |

#### **FR-5XX: Redirection and Platform Selection Module**

| ID | Requirement | Priority | Acceptance Criteria | Rationale |
|----|-------------|----------|--------------------|-----------| 
| **FR-501** | Upon countdown expiration, calculate target study platform using rotation algorithm:<br>**Index = (violationCount) % (platformsArray.length)**<br>Retrieve URL from platformsArray[Index]. | Essential | • 2 platforms configured, violation count 0 → Platform 0<br>• 2 platforms, violation count 1 → Platform 1<br>• 2 platforms, violation count 2 → Platform 0 (wrap-around)<br>• 3 platforms, violation count 5 → Platform 2 | Modulo rotation ensures variety (prevents habituation to single destination). Algorithm deterministic (same count yields same platform), aiding user expectation formation. |
| **FR-502** | Execute redirection using `window.location.replace(targetURL)`. This method prevents back-button navigation to blocked site. | Essential | • Browser history after redirect: Study platform URL recorded, blocked site NOT in history<br>• User pressing back button navigates to page BEFORE blocked site, not blocked site itself | `.replace()` vs. `.href` critical: `.href` allows back-button bypass. Implementation prevents trivial circumvention. |
| **FR-503** | **Fallback mechanism**: If user profile lacks study platforms (empty array) OR all URLs invalid (malformed), redirect to default: "https://www.khanacademy.org". Log fallback occurrence. | Desirable | • Profile with empty studyPlatforms → Redirect to Khan Academy<br>• Console log message: "⚠️ No valid study platforms, using fallback"<br>• Fallback usage tracked in violation log (marked as fallback=true) | Prevents redirection failures leaving users on blocked site. Khan Academy selected as broadly educational, free, no authentication required. |

#### **FR-6XX: Logging and Analytics Module**

| ID | Requirement | Priority | Acceptance Criteria | Rationale |
|----|-------------|----------|--------------------|-----------| 
| **FR-601** | After each intervention, log structured entry to chrome.storage:<br>**Log schema**: `{timestamp: ISO8601 string, blockedDomain: string, redirectURL: string, promptTier: enum["advisory","accountability","consequence"], dailyCount: integer}` | Essential | • Log entry created within 200ms of redirection<br>• All schema fields populated with correct types<br>• Timestamp accurate to second granularity | Structured logging enables dashboard analytics (FR-701). ISO8601 format ensures timezone-aware sorting. |
| **FR-602** | Increment daily violation counter. Store counter in chrome.storage keyed by current date (YYYY-MM-DD format). Reset to 0 when date changes. | Essential | • Counter increases: 0→1→2... within same calendar day<br>• Counter resets to 0 at midnight local time (detected by date string mismatch)<br>• Race condition handling: Concurrent violations increment atomically (read-modify-write operation) | Daily reset aligns with circadian patterns (Hofmann et al., 2017: self-control varies diurnally). Prevents infinite escalation; users "start fresh" daily. |
| **FR-603** | Maintain violation logs for rolling 90-day window. Auto-delete entries older than 90 days during each log write operation. | Desirable | • Day 91 data purged automatically when Day 92 log written<br>• Storage usage remains <10 MB despite continuous use (90 days × 20 violations/day × 1.2 KB/entry ≈ 2.2 MB) | Prevents unbounded storage growth. 90-day window sufficient for identifying long-term patterns while respecting storage quotas. |

#### **FR-7XX: Dashboard and Reporting Module**

| ID | Requirement | Priority | Acceptance Criteria | Rationale |
|----|-------------|----------|--------------------|-----------| 
| **FR-701** | Display violation statistics on dashboard:<br>• Total violations today<br>• Total violations this week (last 7 days)<br>• Most frequently blocked domain (top 3)<br>• Distribution by tier (% advisory, accountability, consequence) | Essential | • Statistics computed accurately from logs (unit tests with mock data)<br>• Updates reflect latest logs (no stale data from caching)<br>• Percentages sum to 100% (±0.1% rounding tolerance) | Quantitative feedback reinforces awareness (meta-cognition). Top blocked sites reveal primary weaknesses. Tier distribution indicates severity trend. |
| **FR-702** | Display user's stated goal prominently (top of dashboard, large font, distinct background color). Goal text shall be visible without scrolling on 1280x720 displays. | Essential | • Goal visible in initial viewport (no scroll required)<br>• Font size ≥18px<br>• Contrast ratio ≥4.5:1 (WCAG AA compliance) | Persistent goal reminder leverages implementation intentions (Gollwitzer & Sheeran, 2006). Visual prominence ensures users encounter goal reminder during every dashboard visit. |
| **FR-703** | Provide strict mode toggle switch. When disabled, violations display warning modal (same design) but skip redirection. Warning includes "Strict Mode Disabled" text. | Desirable | • Toggle state persists in chrome.storage<br>• Violations with strict mode OFF logged with flag: strictModeOverride=true<br>• Dashboard indicates strict mode status (enabled/disabled visual indicator) | Allows users temporary reprieve (e.g., legitimate social media use for work) without destroying system. Logs preserve override events for detecting abuse patterns. |

---

### 4.3 Non-Functional Requirements

Non-functional requirements specify quality attributes, constraints, and environmental conditions. Requirements use measurable metrics where possible.

**Table 4.3: Non-Functional Requirements by Quality Attribute**

#### **NFR-1XX: Performance Requirements**

| ID | Requirement | Metric | Target Value | Measurement Method | Rationale |
|----|-------------|--------|--------------|-------------------|-----------| 
| **NFR-101** | Detection latency: Time from page load event to blacklist match determination shall be minimized. | p95 latency | ≤150ms | Chrome DevTools Performance profiler; measure interval between `DOMContentLoaded` event and blacklist match completion | Delays create window for users to see blocked content, weakening intervention impact. 150ms threshold imperceptible to users (human visual perception: ~100ms). |
| **NFR-102** | Modal rendering: Time from match detection to full modal display (including styled border, countdown timer, prompt text). | p95 latency | ≤350ms | Performance.mark() API; measure interval between match detection and final modal DOM insertion | Combined with NFR-101: 150ms + 350ms = 500ms total interruption latency. Sub-500ms prevents content consumption before block. |
| **NFR-103** | Storage operations: Profile retrieval from chrome.storage.local. | p95 latency | ≤100ms | Wrap chrome.storage.get() in performance markers; log distribution over 1000 operations | Slow storage reads delay prompt display. 100ms budgeted from total 350ms modal rendering time (NFR-102). Chrome.storage benchmarks: median ~5ms, p95 ~30ms on SSD systems. |
| **NFR-104** | Extension memory overhead: RAM consumption by background service worker and content scripts (per tab). | Average heap size | ≤50 MB total (≤8 MB per tab) | Chrome Task Manager; measure extension process memory during 5 concurrent blocked tabs | Excessive memory usage causes browser slowdown, incentivizing users to disable extension. Target accommodates typical 4-6 tab browsing without >10% browser memory overhead. |
| **NFR-105** | Dashboard load time: Initial page render displaying statistics from stored logs. | p90 latency | ≤2 seconds on 10 Mbps connection | Navigation Timing API (loadEventEnd - navigationStart); test with simulated 10 Mbps throttling | Academic network speeds (global average: 10-15 Mbps). 2-second threshold from UX research (Nielsen: users tolerate ≤2s page loads before perceiving slowness). |

**Performance Assumptions:**
- Client device: Dual-core CPU ≥1.8 GHz, 4 GB RAM (minimum spec from Section 3.1)
- Storage medium: SSD (HDD increases p95 storage latency to ~300ms, violating NFR-103)
- Network: Stable connection (dashboard only; extension operates offline)

**Performance Testing Gaps:**
Extension not tested on ARM-based processors (Apple M1/M2). JavaScript performance characteristics differ; latency targets may require adjustment.

---

#### **NFR-2XX: Security and Privacy Requirements**

| ID | Requirement | Compliance Criterion | Verification Method | Legal/Ethical Basis |
|----|-------------|---------------------|---------------------|---------------------|
| **NFR-201** | **Data localization**: ALL user data (profile, violation logs, browsing history) shall reside exclusively in client-side storage (chrome.storage.local, localStorage). NO data transmission to external servers. | Zero network requests containing user data | • Packet capture (Wireshark) during 1-week usage: No HTTP/HTTPS requests contain profile fields<br>• Static code analysis: No fetch()/XMLHttpRequest calls in codebase | GDPR Article 5 (data minimization). CCPA compliance (no data sale/sharing). User expectations: productivity tools should not surveil. |
| **NFR-202** | **Storage encryption**: Data at rest encryption shall leverage Chrome's built-in protections. No additional application-layer encryption implemented. | Documented reliance on platform security | • Security documentation explicitly states dependency on Chrome's storage encryption<br>• No false security claims in user-facing materials | Chrome encrypts storage using OS-level protections (Windows: DPAPI, macOS: Keychain, Linux: libsecret). Application-layer encryption without proper key management creates false sense of security (key stored alongside encrypted data). |
| **NFR-203** | **Permissions minimalism**: Chrome extension shall request ONLY required permissions: `storage`, `<all_urls>` content script access. NO permissions for: bookmarks, history, downloads, cookies. | Manifest permissions array contains ≤2 entries | • Manifest.json inspection: permissions array = ["storage"]<br>• Content script access via matches field, not permissions | Extension overpermissioning erodes user trust. Many productivity extensions request history access unnecessarily (privacy violation). |
| **NFR-204** | **Data deletion**: Users shall delete all stored data via dashboard "Clear All Data" button. Upon deletion, confirm modal requires typing "DELETE" to proceed (prevent accidental deletion). | 100% data removal verified | • After deletion, chrome.storage.local.get() returns empty object<br>• localStorage.clear() executed<br>• User reloads extension, dashboard shows "No profile found" state | GDPR Article 17 (right to erasure). Confirmation step prevents accidental multi-day log loss. |
| **NFR-205** | **Content security**: Extension shall NOT execute eval(), new Function(), or inline script injection. Content Security Policy (CSP) header enforced in manifest. | Zero CSP violations during static analysis and runtime | • Manifest includes: `"content_security_policy": { "extension_pages": "script-src 'self'; object-src 'self'" }`<br>• ESLint rule: no-eval enabled<br>• Chrome extension audit tool: No warnings | eval() enables code injection attacks if user data contains malicious JavaScript. CSP enforcement mitigates XSS vulnerabilities. |

**Privacy Limitations:**
- System cannot prevent users from screenshotting/sharing their goals (social accountability feature request in conflict with privacy).
- Browser-level data extraction (user exports Chrome profile) exposes stored data (inherent to local storage approach).
- System relies on Chrome's storage encryption; compromised OS exposes data.

---

#### **NFR-3XX: Reliability and Availability Requirements**

| ID | Requirement | Metric | Target Value | Testing Approach |
|----|-------------|--------|--------------|------------------|
| **NFR-301** | **Storage durability**: Profile data shall persist across browser crashes, unexpected shutdowns, and OS reboots. | Data survival rate | 100% (no data loss) | • Force-quit Chrome during setup completion (kill -9 on Linux/macOS, Task Manager terminate on Windows)<br>• Reopen browser, verify profile retrieval<br>• Repeat 50 times | Chrome.storage.local writes are asynchronous but atomic. Corruption risk exists if process killed mid-write; testing bounds risk probability. |
| **NFR-302** | **Extension lifecycle resilience**: Service worker shall re-initialize correctly after inactivity timeout (MV3 limitation: 30-second idle timeout). | Successful intervention after idle | 100% success rate | • Trigger intervention, wait 5 minutes (allowing service worker termination), trigger again<br>• Verify second intervention functions identically | Manifest V3 service workers unload after 30s inactivity. Stateless design required (all state in chrome.storage, not in-memory). |
| **NFR-303** | **Graceful degradation**: If chrome.storage.local read fails (quota exceeded, corruption), display generic fallback message: "Blocked by Productivity Assassin. Fix: Reinstall extension." No JavaScript errors thrown. | Error caught, fallback displayed | 100% (no unhandled exceptions) | • Mock chrome.storage.get() to return error<br>• Verify try-catch block catches exception<br>• Verify fallback message renders | Prevents white screen of death (JavaScript crash) allowing users to access blocked site. Generic message avoids confusing users with technical errors. |
| **NFR-304** | **Browser compatibility**: Extension shall function identically on Chrome versions 110-127 (current stable as of Dec 2024). | Functional equivalence | 100% (all FR requirements met on each version) | • Test suite execution on Chrome 110, 115, 120, 127 (canary)<br>• Verify zero test failures across versions | Chrome maintains backward compatibility for stable APIs. Testing bounds risk of breaking changes in minor updates. |

**Reliability Assumptions:**
- Users have stable Chrome installations (no frequent crashes/corruption).
- Storage quota not exceeded (10 MB default sufficient for 90-day logs per FR-603).
- Users do not manually corrupt chrome.storage via developer tools (unsupported use case).

---

#### **NFR-4XX: Usability Requirements**

| ID | Requirement | Metric | Target Value | Evaluation Method | Justification |
|----|-------------|--------|--------------|------------------|---------------|
| **NFR-401** | **Setup completion time**: Average user shall complete 7-question setup wizard in ≤5 minutes. | Median completion time | ≤300 seconds | • Time-on-task measurement: Timestamp at wizard start vs. activation button click<br>• N=20 users (think-aloud protocol) | Excessively long setup increases abandonment. Krebs et al. (2010): Detailed profile collection justifies time investment (personalization effectiveness). 5-minute threshold from UX heuristics (users tolerate ≤5-7 minutes for onboarding). |
| **NFR-402** | **Prompt readability**: Tier 1 prompts shall be readable within 3-second countdown by users with average reading speed (250 wpm = 12.5 words/3 sec). | Word count | ≤12 words per tier 1/2 prompt | • Automated script counts words in template strings<br>• Reading time = (wordCount / 250) * 60 seconds<br>• Verify ≤3 seconds for tier 1/2 | Unreadable prompts fail to convey accountability message. Tier 3 may exceed 12 words (intentionally overwhelming); users have already violated 5+ times, warranting extended exposure. |
| **NFR-403** | **Error message clarity**: Validation errors shall specify problem and solution. Example: ⛔ "Please enter at least 2 study platforms. You've only entered 1." NOT: "Invalid input." | Error specificity score | ≥80% (expert heuristic eval) | • Nielsen's error message heuristics (visibility, error recognition, recovery guidance)<br>• 3 UX experts rate each error message (1-5 scale)<br>• Average score ≥4.0 | Vague errors frustrate users, increasing abandonment. Error messages should educate, not blame (avoid "you made an error"; prefer "this field requires..."). |
| **NFR-404** | **Dashboard information architecture**: Key metrics (violation count, goal reminder) shall be visible in initial viewport (1280x720) without scrolling. | Scroll requirement | 0 pixels vertical scroll to view primary metrics | • Viewport emulation in Chrome DevTools (set to 1280x720)<br>• Measure elements' offsetTop values<br>• Verify primary elements within 720px vertical space | F-pattern reading behavior (Nielsen): Users focus top-left screen region. Critical info must appear above fold. |
| **NFR-405** | **Accessibility (WCAG 2.1 Level A)**: Text-background contrast ratio ≥4.5:1 for normal text, ≥3:1 for large text (≥18px). Keyboard navigation support (tab order logical). | Contrast ratio, keyboard accessibility | 100% compliance with Level A (not AA/AAA) | • WebAIM Contrast Checker for all text-background pairs<br>• Keyboard-only navigation test: All interactive elements reachable via Tab, activated via Enter<br>• Screen reader test (NVDA): Semantic HTML labels present | Level A = minimum legal compliance (ADA, Section 508). Higher levels (AA/AAA) desirable but not essential for MVP. Keyboard nav critical for power users avoiding mouse. |

**Usability Limitations:**
- Prompts not localized (English-only). Non-native speakers may struggle with 3-second reading window.
- No dark mode (high contrast white text on dark background may strain visibility in bright environments).
- Mobile browsers unsupported (Chrome extension API unavailable on Android/iOS Chrome).

---

#### **NFR-5XX: Maintainability Requirements**

| ID | Requirement | Metric | Target Value | Assessment Method |
|----|-------------|--------|--------------|-------------------|
| **NFR-501** | **Code modularity**: JavaScript codebase shall separate concerns: UI components (React), business logic (prompt generation, tier selection), storage adapters (chrome.storage wrappers). | Cyclomatic complexity | ≤10 per function (moderate complexity) | • ESLint complexity rule: max-complexity: 10<br>• SonarQube analysis: Cognitive complexity score | Functions >10 complexity difficult to test and debug. Separation enables unit testing in isolation (mock storage, test prompt logic independently). |
| **NFR-502** | **Documentation coverage**: All public functions shall include JSDoc comments specifying: purpose, parameters (with types), return value, example usage. | Documentation completeness | ≥80% functions documented | • JSDoc linting tool (documentation.js)<br>• Generate docs, verify coverage report | Self-documenting code myth: Complex logic (tier selection, rotation algorithm) requires explanation. Future developers (or user's future self) benefit from explicit contracts. |
| **NFR-503** | **Linting compliance**: Code shall pass ESLint with Airbnb React style guide. Zero errors, ≤10 warnings per 1000 lines. | Linting errors/warnings | 0 errors, ≤10 warnings | • npm run lint in CI/CD pipeline<br>• Fail build if errors detected<br>• Review warnings (may indicate code smells) | Consistent style improves readability. Airbnb guide widely adopted (reduces decision fatigue). Auto-fixable issues (spacing, semicolons) eliminated via Prettier. |
| **NFR-504** | **Dependency hygiene**: No critical or high-severity vulnerabilities in npm dependencies. Monthly vulnerability audits. | Vulnerability count | 0 critical/high vulns | • npm audit (run monthly)<br>• Dependabot alerts on GitHub<br>• Acceptable: Low/moderate vulns in dev dependencies (not shipped to users) | Vulnerable dependencies (e.g., malicious packages) compromise user security. Transitive dependencies (dependencies of dependencies) difficult to track without automation. |

---

#### **NFR-6XX: Compatibility Requirements**

| ID | Requirement | Constraint | Verification |
|----|-------------|-----------|--------------|
| **NFR-601** | **Browser support**: Chrome 110+ (Manifest V3 required). No support for: Firefox, Safari, Edge (Chromium-based Edge untested but may work). | Chrome-exclusive | • Mandate in README.md and setup wizard<br>• Extension installable only via Chrome Web Store | Manifest V3 Chrome-exclusive as of 2024. Firefox supports MV3 partially (missing APIs). Safari extensions use different model (App Extension). |
| **NFR-602** | **Operating system support**: Windows 10+, macOS 12+, Ubuntu 20.04+ | Cross-platform via web tech | • Test matrix: 3 OS × 2 Chrome versions = 6 configurations<br>• Verify all FR requirements met on each | Node.js and Chrome runtime abstract OS differences. File system paths only issue (npm scripts use cross-env for path normalization). |
| **NFR-603** | **Screen resolution support**: Functional at 1280x720 minimum. Optimized for 1920x1080. | Responsive design | • Test on physical 1280x720 display or emulation<br>• Verify no horizontal scrolling, text truncation, or overlapping elements | 1280x720 = 33.2% of users (StatCounter 2024). 1920x1080 = 56.7%. Combined coverage >90%. |

---

**Figure 4.1: Requirements Traceability Matrix** *(Suggested Addition)*  
Table mapping each Functional Requirement (FR-XXX) to:
- **Source**: User need or literature finding that motivated requirement
- **Priority**: Essential/Desirable/Optional
- **Implementation Status**: Implemented/Pending/Deferred
- **Test Coverage**: Test case IDs (TC-XXX) validating requirement

**Figure 4.2: Non-Functional Requirements Radar Chart** *(Suggested Addition)*  
Visual comparison of achieved vs. target values for measurable NFRs (latency targets, memory overhead, compliance percentages) across Performance, Security, Reliability, Usability, Maintainability dimensions.

---

**Assumptions Underlying All Requirements:**
1. Users interact with system in good faith (no adversarial attempts to break security).
2. Chrome browser installation is non-corrupted, up-to-date.
3. System clock accurate (violation count daily reset depends on date comparisons).
4. Users have English language proficiency (B2 CEFR minimum).

**Requirements Validation Gap:**  
Requirements derived from literature review (Section 3) and developer reasoning. **No formal requirements elicitation** (user surveys, interviews, focus groups) conducted. User needs inferred from published research on similar populations. Risk: Actual target users may have divergent needs not captured in literature.
