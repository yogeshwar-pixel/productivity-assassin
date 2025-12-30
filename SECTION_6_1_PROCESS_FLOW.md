## 6. DETAILED DESIGN

This section presents the internal design of the Productivity Assassin system at the algorithmic and procedural level. While Section 5 (System Design) established the high-level architecture and component interactions, Section 6 drills down into the step-by-step logic, decision trees, and data transformations that implement core functionalities.

**Design Methodology:**  
The detailed design follows a **structured top-down decomposition** approach:
1. **Identify major processes**: Setup, Violation Detection, Intervention, Logging
2. **Decompose into sub-processes**: Each major process broken into sequential steps
3. **Define decision points**: Conditional logic with explicit branching criteria
4. **Specify data transformations**: Input → Processing → Output for each step
5. **Document error handling**: Exception paths and fallback behaviors

This methodology ensures traceability from requirements (Section 4) through high-level design (Section 5) to implementation logic (Section 6).

---

### 6.1 Process Flow Diagram with Design Methodology

The Process Flow Diagram (Figure 6.1) visualizes the end-to-end workflow from system initialization through violation intervention. The diagram employs **ANSI/ISO standard flowchart notation**:
- **Rectangles**: Processing steps (actions, computations)
- **Diamonds**: Decision points (conditional branches)
- **Parallelograms**: Input/Output operations
- **Cylinders**: Database operations (storage reads/writes)
- **Rounded rectangles**: Start/End terminals

**Design Rationale for Flow Structure:**  
The process flow is organized as a **state machine with four primary states**:
1. **Initialization State**: Profile loading and setup validation
2. **Monitoring State**: Continuous URL observation (idle loop)
3. **Intervention State**: Active blocking and prompt display
4. **Redirection State**: Platform selection and navigation

State transitions are **event-driven** (triggered by user actions) rather than time-driven, ensuring the system remains responsive without polling overhead.

---

#### 6.1.1 Setup and Initialization Process

**Figure 6.1a: Setup Wizard Process Flow**

**Start Condition**: User accesses web application URL (localhost:19006 or production host)

**Step 1: Profile Existence Check**
- **Action**: Query AsyncStorage for existing userProfile key
- **Decision**: Profile exists?
  - **YES**: Navigate to dashboard (FR-104 compliance)
  - **NO**: Proceed to Step 2

**Rationale**: Avoids forcing returning users to re-complete setup. Single-profile design assumption (one profile per browser instance) simplifies logic.

**Step 2: Display Setup Wizard Question 1**
- **Action**: Render React component with question text: "What is your REAL goal? (Be specific: exam score, job offer, skill mastery)"
- **Input**: User types goal into text field
- **Validation**: Non-empty string, 5-200 characters
- **Error Handling**: Display inline error "Goal required (5-200 chars)" if validation fails

**Design Decision**: Question 1 prioritized first because subsequent prompts reference the goal. Cascade dependency: weak prompts if goal missing.

**Step 3-7: Iterate Through Remaining Questions**
- Questions 2-7 follow identical pattern:
  - Display question
  - Capture user input
  - Validate (non-empty, character limits)
  - Store in temporary state object (React useState hook)

**Questions**:
2. Failure Pattern (what user does instead of working)
3. Sacrifice (what's at stake)
4. Study Platforms (2-5 URLs, special validation per FR-102)
5. Weak Time (when most vulnerable)
6. Main Distraction (primary time-waster)
7. Accountability (who user is letting down)

**Step 8: Study Platform Parsing (FR-102)**
- **Input**: Array of 2-5 strings (user-entered URLs)
- **Processing**: For each string:
  1. Trim whitespace
  2. Check for protocol prefix (http:// or https://)
  3. If absent, prepend "https://"
  4. Extract domain via regex: `(?:https?://)?(?:www\.)?([^/]+)`
  5. Derive name: Capitalize first letter of base domain
- **Output**: Array of `{name: string, url: string}` objects
- **Example**: 
  - Input: `["nptel.ac.in", "https://leetcode.com"]`
  - Output: `[{name: "Nptel", url: "https://nptel.ac.in"}, {name: "Leetcode", url: "https://leetcode.com"}]`

**Validation Error Handling**:
- If <2 platforms: Alert "Please enter at least 2 study platforms"
- If platform URL malformed (no domain extractable): Alert "Invalid URL: [url]"

**Step 9: Construct Profile Object**
```javascript
const userProfile = {
  realGoal: answers.realGoal,
  failurePattern: answers.failurePattern,
  sacrifice: answers.sacrifice,
  studyPlatforms: parsedPlatforms,
  weakTime: answers.weakTime,
  mainDistraction: answers.mainDistraction,
  accountability: answers.accountability,
  tone: answers.tone || 'Tough',
  createdAt: new Date().toISOString()
};
```

**Step 10: Dual Storage Write (FR-103)**
- **Write 1**: `AsyncStorage.setItem('userProfile', JSON.stringify(userProfile))`
  - **Purpose**: Web app persistence (dashboard access)
- **Write 2**: `window.postMessage({type: 'PROFILE_SYNC', profile: userProfile}, '*')`
  - **Purpose**: Signal extension to save to chrome.storage.local
- **Write 3** (Extension side, triggered by postMessage):
  - `chrome.storage.local.set({userProfile: profile})`
  - **Purpose**: Extension access during violations

**Error Handling**: 
- If AsyncStorage write fails (quota exceeded): Display error modal "Storage full. Clear browser data."
- If postMessage not acknowledged within 2 seconds: Log warning (extension may not be installed)

**Step 11: Confirmation and Navigation**
- **Action**: Display success alert "✅ Assassin Mode Activated!"
- **Navigation**: Redirect to `/dashboard` route
- **End State**: User viewing dashboard with profile displayed

**Total Setup Time Target**: ≤5 minutes median (NFR-401)

---

#### 6.1.2 Violation Detection and Intervention Process

**Figure 6.1b: Violation Detection Process Flow**

**Start Condition**: Content script injected into page (triggers on every page load per manifest `matches: ["<all_urls>"]`)

**Step 1: Extract Current Domain**
- **Input**: `window.location.hostname`
- **Processing**: 
  1. Convert to lowercase (case-insensitive matching)
  2. Strip "www." prefix if present: `hostname.replace(/^www\./, '')`
- **Output**: Normalized domain string (e.g., "instagram.com")

**Example Normalization**:
- `https://www.Instagram.com/explore/` → `"instagram.com"`
- `https://m.facebook.com/` → `"m.facebook.com"` (subdomain preserved; blacklist must include mobile variants)

**Step 2: Blacklist Matching (FR-203)**
- **Input**: Normalized domain
- **Blacklist Array** (hardcoded in content script):
```javascript
const BLACKLIST = [
  'instagram.com', 'facebook.com', 'twitter.com', 'x.com',
  'youtube.com', 'reddit.com', 'tiktok.com', 'snapchat.com',
  'twitch.tv', 'pinterest.com', 'linkedin.com',
  'netflix.com', 'hulu.com', 'disneyplus.com',
  'cnn.com', 'bbc.com', 'nytimes.com', '9gag.com'
];
```
- **Matching Logic**: `BLACKLIST.includes(domain.toLowerCase())`
- **Decision**: Match found?
  - **NO**: Exit process (allow normal browsing)
  - **YES**: Proceed to Step 3

**Design Limitation**: Hardcoded blacklist. Future enhancement: User-customizable blacklist via dashboard (FR-extensible).

**Step 3: Strict Mode Check**
- **Action**: Read `strictModeEnabled` flag from chrome.storage.local
- **Decision**: Strict mode enabled?
  - **NO**: Display warning modal (no redirection), log event with `strictModeOverride: true`, exit
  - **YES**: Proceed to Step 4 (full intervention)

**Step 4: Retrieve User Profile (DF-09)**
- **Action**: `chrome.storage.local.get(['userProfile'])`
- **Timeout**: 100ms read operation (NFR-103)
- **Error Handling**: 
  - If profile not found: Display generic message "Productivity Assassin: Site blocked. Complete setup at localhost:19006"
  - If read timeout: Log error, display fallback message

**Step 5: Retrieve Daily Violation Count**
- **Action**: `chrome.storage.local.get(['violationCount_' + currentDate])`
  - `currentDate` format: `YYYY-MM-DD` (e.g., "2024-12-29")
- **Default**: If key absent (first violation of day), initialize count = 0
- **Increment**: `count = (retrievedCount || 0) + 1` (pre-increment for current violation)

**Date Reset Logic**:
```javascript
const currentDate = new Date().toISOString().split('T')[0];
// If stored date ≠ currentDate, count resets to 0 automatically
// (different storage key, old key ignored)
```

**Step 6: Determine Prompt Tier (FR-302)**
- **Input**: Updated violation count
- **Logic**:
```javascript
let tier;
if (count <= 1) tier = 'advisory';      // Tier 1: 0-1 violations
else if (count <= 4) tier = 'accountability';  // Tier 2: 2-4 violations
else tier = 'consequence';              // Tier 3: 5+ violations
```
- **Output**: Tier string ('advisory', 'accountability', or 'consequence')

**Rationale for Thresholds**:
- **0-1**: User's first slip; gentle reminder suffices
- **2-4**: Pattern emerging; escalate to accountability
- **5+**: Chronic issue; maximum psychological pressure

**Empirical Basis**: Caraban et al. (2019) showed hard interventions most effective for repeated violations (subgroup analysis: high procrastination tendencies).

**Step 7: Generate Personalized Prompt (FR-303)**
- **Input**: Tier, user profile, blocked domain
- **Template Selection**:

**Tier 1 (Advisory) Template**:
```
{domain} has ZERO connection to '{goal}'.
{weakTime} is when you always fail. Don't prove it right.
Get back to work.
```

**Tier 2 (Accountability) Template**:
```
You admitted: '{failurePattern}'.
You're doing it RIGHT NOW.
This is violation #{count} today. Stop lying to yourself.
```

**Tier 3 (Consequence) Template**:
```
STOP. LYING. TO. YOURSELF.
{sacrifice} is on the line.
{accountability} is watching you waste time.
This is pathetic. Violation #{count}.
```

- **Placeholder Substitution**:
```javascript
let message = templates[tier];
message = message.replace('{domain}', domain.toUpperCase());
message = message.replace('{goal}', profile.realGoal);
message = message.replace('{failurePattern}', profile.failurePattern);
message = message.replace('{sacrifice}', profile.sacrifice);
message = message.replace('{accountability}', profile.accountability);
message = message.replace('{weakTime}', profile.weakTime);
message = message.replace('{count}', count.toString());
```

- **Output**: Fully personalized prompt string (12-25 words typically)

**Design Decision**: Template-based over AI-generated for:
- Determinism (testing reproducibility)
- Zero latency (no API calls)
- Content control (no inappropriate outputs)
- Privacy (no data sent externally)

**Step 8: Render Full-Screen Modal (FR-401)**
- **DOM Construction**:
```javascript
const modal = document.createElement('div');
modal.id = 'productivity-assassin-modal';
modal.style.cssText = `
  position: fixed; top: 0; left: 0; 
  width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.95);
  z-index: 999999;
  display: flex; justify-content: center; align-items: center;
`;

const content = document.createElement('div');
content.style.cssText = `
  background: #1a1a1a; padding: 40px;
  border-radius: 12px; max-width: 700px;
  border: 6px solid ${tierColors[tier]};
  ${tier === 'consequence' ? 'animation: pulse 1s infinite;' : ''}
`;

content.innerHTML = `
  <div style="font-size: 48px; text-align: center;">🚫</div>
  <h2 style="color: #ff3b30; text-align: center;">${domain.toUpperCase()} BLOCKED</h2>
  <p style="font-size: 24px; line-height: 1.6; color: #fff;">${promptMessage}</p>
  <p style="text-align: center; font-size: 18px; color: #888;">Redirecting in <span id="timer">3</span>...</p>
`;

modal.appendChild(content);
document.body.appendChild(modal);
```

**Tier-Specific Colors** (FR-402):
- Advisory: `#ff9500` (orange)
- Accountability: `#ff3b30` (red)
- Consequence: `#8B0000` (dark red with pulsing glow effect)

**Non-Dismissible Implementation** (FR-404):
```javascript
modal.addEventListener('click', (e) => e.stopPropagation()); // Block clicks
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' || e.key === 'F5') e.preventDefault(); // Block ESC, F5
});
// No close button; only countdown expiration closes modal
```

**Step 9: Execute 3-Second Countdown (FR-403)**
- **Implementation**:
```javascript
let secondsRemaining = 3;
const timerElement = document.getElementById('timer');

const countdownInterval = setInterval(() => {
  secondsRemaining--;
  timerElement.textContent = secondsRemaining;
  
  if (secondsRemaining <= 0) {
    clearInterval(countdownInterval);
    executeRedirection(); // Proceed to Step 10
  }
}, 1000); // Update every 1000ms
```

**Timing Accuracy**: ±50ms (NFR-403). JavaScript setInterval not guaranteed precise; acceptable variance for UX purpose.

**Design Rationale - 3 Seconds**:
- Based on Kim et al. (2019): Effortful friction effective at ~10 seconds
- Reduced to 3 seconds balancing:
  - **Long enough**: Read 12-25 word prompt at 250 wpm (~3 seconds)
  - **Short enough**: Avoid excessive frustration (user already interrupted)

**Step 10: Select Study Platform (FR-501)**
- **Input**: Violation count, user's study platforms array
- **Algorithm**:
```javascript
const platformIndex = violationCount % profile.studyPlatforms.length;
const selectedPlatform = profile.studyPlatforms[platformIndex];
let redirectURL = selectedPlatform.url;
```

**Modulo Rotation Example**:
- User has 3 platforms: [NPTEL, LeetCode, Coursera]
- Violation 1: `1 % 3 = 1` → LeetCode
- Violation 2: `2 % 3 = 2` → Coursera
- Violation 3: `3 % 3 = 0` → NPTEL (wraps around)

**Fallback Logic** (FR-503):
```javascript
if (!profile.studyPlatforms || profile.studyPlatforms.length === 0) {
  redirectURL = 'https://www.khanacademy.org'; // Default fallback
  console.warn('⚠️ No study platforms defined, using fallback');
}
```

**Step 11: Execute Forced Redirection (FR-502)**
- **Implementation**:
```javascript
window.location.replace(redirectURL);
// NOT window.location.href (allows back-button bypass)
// replace() removes blocked site from browser history
```

**Timing**: Redirection executes immediately upon countdown expiration (no additional delay).

**User Experience Post-Redirect**: Browser navigates to study platform; user sees educational content (NPTEL lecture, LeetCode problem, etc.). Original distraction (Instagram) inaccessible via back button.

**Step 12: Log Violation Event (FR-601)**
- **Async Logging** (non-blocking):
```javascript
const logEntry = {
  timestamp: new Date().toISOString(),
  blockedDomain: domain,
  redirectURL: redirectURL,
  promptTier: tier,
  dailyCount: violationCount,
  fallback: !profile.studyPlatforms || profile.studyPlatforms.length === 0,
  strictModeOverride: false
};

// Append to today's log array
const dateKey = `violationLog_${currentDate}`;
chrome.storage.local.get([dateKey], (result) => {
  const todayLogs = result[dateKey] || [];
  todayLogs.push(logEntry);
  chrome.storage.local.set({[dateKey]: todayLogs});
});
```

**Step 13: Update Violation Count**
- **Implementation**:
```javascript
const countKey = `violationCount_${currentDate}`;
chrome.storage.local.set({[countKey]: violationCount});
```

**Storage Schema**:
- `violationCount_2024-12-29`: `7` (integer)
- `violationLog_2024-12-29`: `[{...}, {...}, ...]` (array of log entries)

**End State**: User redirected to study platform, violation logged, count incremented, ready for next detection cycle.

---

#### 6.1.3 Dashboard Statistics Process

**Figure 6.1c: Dashboard Analytics Process Flow**

**Start Condition**: User navigates to `/dashboard` route

**Step 1: Retrieve User Profile**
- **Action**: `AsyncStorage.getItem('userProfile')`
- **Parse**: `JSON.parse(profileString)`
- **Error Handling**: If parse fails, display "Profile corrupted. Re-run setup."

**Step 2: Display Goal Reminder (FR-702)**
- **Action**: Render goal text prominently at top of page
- **Styling**: Font size 24px, background accent color, visible without scrolling

**Step 3: Retrieve All Violation Logs**
- **Action**: Query chrome.storage.local for keys matching `violationLog_*` pattern
- **Date Range**: Last 90 days (keys older than 90 days not queried)
- **Implementation**:
```javascript
const endDate = new Date();
const startDate = new Date();
startDate.setDate(endDate.getDate() - 90);

const dateKeys = [];
for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
  const dateStr = d.toISOString().split('T')[0];
  dateKeys.push(`violationLog_${dateStr}`);
}

chrome.storage.local.get(dateKeys, (results) => {
  const allLogs = Object.values(results).flat(); // Merge arrays
  computeStatistics(allLogs);
});
```

**Step 4: Compute Daily Count**
- **Logic**: Filter logs where `timestamp.startsWith(currentDate)`, count array length
- **Display**: "Today: X violations"

**Step 5: Compute Weekly Trend**
- **Logic**: 
  1. Group logs by date (last 7 days)
  2. Count violations per day
  3. Generate array: `[{date: '2024-12-23', count: 5}, ...]`
- **Visualization**: Line chart showing trend (increasing/decreasing)

**Step 6: Identify Top Blocked Domains**
- **Logic**:
  1. Create frequency map: `{domain: count}`
  2. Sort by count descending
  3. Take top 3
- **Display**: "Most blocked: 1. instagram.com (12×), 2. youtube.com (8×), ..."

**Step 7: Calculate Tier Distribution**
- **Logic**:
  1. Count logs where `promptTier === 'advisory'` (Tier 1 count)
  2. Count logs where `promptTier === 'accountability'` (Tier 2 count)
  3. Count logs where `promptTier === 'consequence'` (Tier 3 count)
  4. Calculate percentages
- **Display**: "Advisory: 40%, Accountability: 35%, Consequence: 25%"

**Interpretation Guidance**: High consequence percentage (>30%) suggests chronic distraction issue; user should consider environmental changes (block distractions at router level, physical phone separation).

**Step 8: Render Statistics Dashboard**
- **React Components**: Cards displaying each statistic
- **Updates**: Re-compute on every dashboard visit (no caching; always fresh data)

**End State**: User viewing comprehensive violation statistics, can adjust settings if needed.

---

&nbsp;

**Figure 6.1: Complete Process Flow Diagram**

*(Insert comprehensive flowchart here combining Figures 6.1a, 6.1b, and 6.1c. Use swimlane format with three lanes: User Actions, System Processing, Storage Operations. See Mermaid code in supplementary file for detailed implementation.)*

**Caption**: End-to-end process flow diagram for the Productivity Assassin system. The flow is divided into three major processes: (A) Setup and Initialization (left lane), (B) Violation Detection and Intervention (center lane), (C) Dashboard Analytics (right lane). Decision diamonds represent conditional branches (profile exists, blacklist match, strict mode check, tier thresholds). Rounded rectangles indicate start/end points. Cylinders represent storage operations (chrome.storage.local, AsyncStorage). Arrows show process sequence; dashed arrows indicate error/fallback paths. Timing annotations show critical latency requirements (NFR-101/102: <500ms detection-to-modal, NFR-103: <100ms storage reads).

---

&nbsp;

### 6.1.4 Design Methodology - Structured Decomposition Analysis

**Top-Down Decomposition Hierarchy:**

**Level 0 (System)**:
- Productivity Enforcement System

**Level 1 (Subsystems)**:
- Profile Management Subsystem
- Monitoring Subsystem
- Intervention Subsystem
- Analytics Subsystem

**Level 2 (Modules per Subsystem)**:
- **Profile Management**: Setup Wizard, Validation Logic, Dual Storage Sync
- **Monitoring**: URL Extraction, Blacklist Matching, Strict Mode Filtering
- **Intervention**: Tier Selection, Prompt Generation, Modal Rendering, Redirection Logic
- **Analytics**: Log Retrieval, Statistics Computation, Visualization Rendering

**Level 3 (Functions per Module)**:
- Example - Prompt Generation Module:
  - `selectTier(count: int) → tierString`
  - `getTemplate(tier: string) → templateString`
  - `substitutePlaceholders(template: string, profile: object) → finalMessage`
  - `validatePromptLength(message: string) → boolean` (NFR-402: ≤12 words Tier 1/2)

**Decomposition Benefits**:
1. **Modularity**: Each level independently testable (unit tests at L3, integration at L2, system at L1)
2. **Traceability**: Requirements (FR-XXX) map to L2 modules (e.g., FR-302 → Tier Selection module)
3. **Maintainability**: Changes isolated to specific modules (e.g., adding Tier 4 only affects Tier Selection, not monitoring)

**Design Pattern Application**:
- **Template Method**: Prompt generation (skeleton: select tier → get template → substitute → validate)
- **Strategy**: Tier-based prompt selection (three strategies: advisory, accountability, consequence)
- **Adapter**: Storage operations (chrome.storage and AsyncStorage wrapped behind common interface)

**Data Flow Transformations**:

**Transformation 1: User Input → Structured Profile**
- Input: 7 text strings (user answers)
- Processing: Validation, platform URL parsing, JSON serialization
- Output: `UserProfile` object (~2 KB)

**Transformation 2: URL → Detection Signal**
- Input: `window.location.hostname` (string)
- Processing: Normalization, blacklist lookup (O(1) hash table)
- Output: Boolean (blocked: true/false)

**Transformation 3: Violation Count → Tier**
- Input: Integer (0-∞)
- Processing: Threshold comparison (if-else ladder)
- Output: Enum string ('advisory'|'accountability'|'consequence')

**Transformation 4: Template + Profile → Prompt**
- Input: Template string + UserProfile object
- Processing: Regex-based placeholder substitution
- Output: Personalized prompt string

**Transformation 5: Logs Array → Statistics Object**
- Input: Array of violation log entries (potentially 1000s)
- Processing: Grouping (by date, domain, tier), counting, percentage calculation
- Output: Statistics object with 5 metrics

**Error Handling Taxonomy**:

**Category 1: User Input Errors**
- Invalid URL format in study platforms → Alert with corrected format
- Empty required fields → Inline error message, prevent submission
- Platform count <2 → Alert requiring minimum platforms

**Category 2: Storage Errors**
- Quota exceeded → Warning message, auto-delete old logs (90-day retention)
- Corrupted profile JSON → Display setup wizard, overwrite corrupted data
- Read timeout →Display generic fallback message

**Category 3: Runtime Errors**
- Extension not installed (postMessage not received) → Log warning, continue (web app still functional)
- Blacklist match after modal already visible → Ignore duplicate (race condition mitigation)
- Countdown interval desynchronization → Acceptable (±50ms variance tolerated)

**No Category 4** (Network Errors): Architecture eliminates network dependencies; all operations local.

---

### 6.1.5 Process Flow Optimization and Performance Considerations

**Critical Path Analysis**:
The **detection-to-modal** sequence (Steps 1-8 in Section 6.1.2) lies on the critical path for NFR-101/102 compliance (p95 latency ≤500ms). Optimization focus:

**Optimization 1: Blacklist Lookup**
- **Original**: Array.find() → O(n) complexity (n=17 domains)
- **Optimized**: Convert to Set → O(1) lookup
```javascript
const BLACKLIST_SET = new Set(BLACKLIST_ARRAY);
const isBlocked = BLACKLIST_SET.has(domain);
```
- **Performance Gain**: ~0.5ms → ~0.01ms (negligible at n=17, future-proofs for expanded blacklists)

**Optimization 2: Storage Read Batching**
- **Original**: Sequential reads (profile, count) → 2× round-trip latency
- **Optimized**: Batch read → Single operation
```javascript
chrome.storage.local.get(['userProfile', 'violationCount_' + date], (result) => {
  const profile = result.userProfile;
  const count = result['violationCount_' + date] || 0;
  // Process with both values
});
```
- **Performance Gain**: 100ms → 50ms (halved latency, NFR-103 compliance)

**Optimization 3: Template Pre-compilation**
- **Original**: Generate template object on-demand
- **Optimized**: Templates stored as constants, instantiated once at script load
```javascript
const TEMPLATES = Object.freeze({
  advisory: "...",
  accountability: "...",
  consequence: "..."
});
```
- **Performance Gain**: Eliminates redundant object creation, reduces GC pressure

**Non-Optimizations** (Intentionally Avoided):
- **Caching profile in memory**: Rejected to ensure updates (via dashboard) immediately reflected. Slight read latency (50-100ms) acceptable vs. stale data risk.
- **Preloading modal DOM**: Rejected due to memory overhead (modal exists for <1% of browsing time; wasteful to keep in DOM constantly).

**Scalability Considerations**:

**Current Scale**:
- User base: 1 (single-user desktop application)
- Blacklist size: 17 domains
- Log retention: 90 days × 20 violations/day = 1,800 entries max
- Storage: ~2.2 MB (well below 10 MB quota)

**Hypothetical Growth Scenarios**:
1. **Blacklist → 1000 domains**: Set-based lookup still O(1), no performance impact
2. **Logs → 10,000 entries**: Dashboard statistics computation degrades (currently O(n) aggregation). Mitigation: Maintain running totals in storage (update incrementally instead of recomputing from scratch).
3. **Multi-user (cloud architecture)**: Would require backend API for profile sync, database for aggregate analytics. Outside current scope (ADR-001: client-only).

**Performance Measurement Strategy**:
```javascript
// Instrumentation for NFR validation
performance.mark('detection-start');
// ... detection logic ...
performance.mark('modal-rendered');
performance.measure('detection-to-modal', 'detection-start', 'modal-rendered');

const latency = performance.getEntriesByName('detection-to-modal')[0].duration;
if (latency > 500) console.warn(`⚠️ NFR-101/102 violation: ${latency}ms`);
```

Telemetry logged client-side for development/testing; no external reporting (privacy preservation).

---

## Summary

The Process Flow Diagram (Figure 6.1) operationalizes the high-level architecture (Section 5) into executable workflows. The design employs structured decomposition methodology, breaking the system into four major processes (Setup, Detection, Intervention, Analytics) each further decomposed into 10-13 discrete steps with explicit decision points and data transformations.

Critical design decisions include: (1) template-based prompt generation for determinism and privacy, (2) modulo-based platform rotation for fair distribution, (3) dual storage writes for redundancy, (4) batch storage reads for latency optimization, and (5) non-dismissible modals enforcing minimum exposure time (3 seconds per Kim et al., 2019 findings on effortful friction).

Performance optimizations target the critical path (detection→modal rendering, ≤500ms per NFR-101/102), achieved through Set-based blacklist lookups (O(1) complexity), batched storage operations (halved latency), and pre-compiled templates (eliminated runtime overhead). The design scales to hypothetical growth scenarios (1000-domain blacklists, 10,000-entry logs) without algorithmic complexity degradation.

Error handling taxonomy addresses three categories (user input, storage, runtime) with appropriate recovery strategies (inline validation, fallback messages, graceful degradation). The client-only architecture (ADR-001) eliminates an entire error category (network failures), simplifying fault tolerance design.

Traceability is maintained throughout: functional requirements (FR-XXX) map to Level 2 modules (e.g., FR-302 tier escalation → Tier Selection module), which decompose into Level 3 functions (selectTier, getTemplate, substitutePlaceholders), ensuring implementation fidelity to specifications.
