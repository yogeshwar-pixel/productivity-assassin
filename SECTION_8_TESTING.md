## 8. SOFTWARE TESTING

This section documents the testing approach and results for the Productivity Assassin system. Testing focuses on functional verification through manual test cases covering all major features and user workflows.

---

### 8.1 User Interface Testing

**Testing Approach:**  
The Productivity Assassin system consists of two primary user interfaces: (1) React-based web application (setup wizard and dashboard), and (2) Chrome extension content scripts (intervention modals). UI testing validates visual rendering, user interactions, and responsiveness across these interfaces.

**Web Application UI Testing:**
- **Setup Wizard Interface**: Validated proper rendering of 7-question form with input fields, labels, and validation error messages. Tested navigation between questions, progress indication, and submit button state (disabled until all fields valid).
- **Dashboard Interface**: Verified statistics display accuracy (daily count, weekly trend chart, top domains list, tier distribution percentages), goal reminder visibility, and settings panel functionality (strict mode toggle, platform editor).
- **Responsive Design**: Tested layout adaptation at three viewport sizes: 1920×1080 (desktop), 1366×768 (laptop), 1280×720 (minimum supported). Confirmed no horizontal scroll at minimum width.

**Chrome Extension UI Testing:**
- **Intervention Modal**: Validated full-screen overlay rendering, tier-specific border colors (orange/red/dark red), pulsing animation for Tier 3, countdown timer display updates (3→2→1→0), and non-dismissibility (ESC key blocked, click-outside ignored).
- **Popup Interface**: Tested extension icon popup display showing current strict mode status and daily violation count.

**Cross-Browser Compatibility:**  
Tested on Chrome versions 110, 115, 120, 127 (latest) on Windows 10, macOS 12, and Ubuntu 22.04. All features functionally equivalent across tested configurations.

**Accessibility Considerations:**  
Keyboard navigation tested for setup wizard (Tab key progression through questions, Enter to submit). Modal prompts readable with screen readers (tested with Chrome's built-in reader). Color contrast ratios measured: 4.8:1 for tier 1 (orange on black), 5.2:1 for tier 2/3 (red on black), meeting WCAG 2.1 Level A minimum (4.5:1).

**UI Testing Limitations:**  
- Mobile browsers not tested (system targets desktop Chrome only)
- Touch interactions not validated (mouse/keyboard input only)
- No automated UI tests implemented (Selenium, Cypress); all testing manual
- Dark mode not available (interface uses fixed dark theme)

---

### 8.2 Manual Test Cases

The following tables document manual test cases executed to verify functional requirements (Section 4.2) and non-functional requirements (Section 4.3). Each test case includes test ID, description, preconditions, test steps, expected result, and actual result.

---

#### **Table 8.1: Setup and Profile Management Test Cases**

| Test ID | Test Description | Preconditions | Test Steps | Expected Result | Actual Result | Status |
|---------|------------------|---------------|------------|-----------------|---------------|--------|
| **TC-01** | Complete setup with valid inputs | No existing profile, web app loaded | 1. Enter goal "Complete MCA degree"<br/>2. Enter failure pattern "Scrolling Instagram"<br/>3. Enter sacrifice "Career opportunities"<br/>4. Enter platforms: "nptel.ac.in", "leetcode.com"<br/>5. Enter weak time "Late evening"<br/>6. Enter distraction "Social media"<br/>7. Enter accountability "My parents"<br/>8. Click Submit | Profile saved to storage, redirected to dashboard, success alert displayed | Profile created successfully, dashboard shows goal reminder | ✅ Pass |
| **TC-02** | Setup fails with <2 platforms | No existing profile | 1. Fill all fields<br/>2. Enter only 1 platform URL<br/>3. Click Submit | Error alert: "Minimum 2 platforms required" | Alert displayed, form not submitted | ✅ Pass |
| **TC-03** | Platform URL auto-correction | Setup wizard open | 1. Enter platform "khanacademy.org" (no HTTPS)<br/>2. Submit form | System adds "https://" prefix, platform saved as "https://khanacademy.org" | URL corrected, profile contains HTTPS version | ✅ Pass |
| **TC-04** | Edit profile from dashboard | Profile exists, dashboard open | 1. Click Settings<br/>2. Modify goal to "Pass semester exams"<br/>3. Save changes | Updated goal persisted to storage, dashboard reflects new goal | Goal updated successfully | ✅ Pass |

---

#### **Table 8.2: Violation Detection and Intervention Test Cases**

| Test ID | Test Description | Preconditions | Test Steps | Expected Result | Actual Result | Status |
|---------|------------------|---------------|------------|-----------------|---------------|--------|
| **TC-05** | Blacklist detection triggers intervention | Profile exists, strict mode ON, count=0 | 1. Navigate to instagram.com | Modal displayed with Tier 1 (Advisory) prompt, orange border, 3s countdown | Modal rendered, countdown executed, redirected after 3s | ✅ Pass |
| **TC-06** | Non-blacklisted site allowed | Profile exists, strict mode ON | 1. Navigate to github.com | No intervention, normal browsing allowed | Page loaded normally, no modal | ✅ Pass |
| **TC-07** | Tier escalation (2nd violation) | Profile exists, count=1 | 1. Navigate to youtube.com | Tier 2 (Accountability) prompt, red border, message references failure pattern | Tier 2 modal displayed with accountability message | ✅ Pass |
| **TC-08** | Tier escalation (5+ violations) | Profile exists, count=5 | 1. Navigate to facebook.com | Tier 3 (Consequence) prompt, dark red pulsing border, harsh language | Tier 3 modal with pulsing animation, consequence message shown | ✅ Pass |
| **TC-09** | Strict mode OFF bypasses intervention | Profile exists, strict mode OFF | 1. Toggle strict mode OFF in dashboard<br/>2. Navigate to instagram.com | Warning message displayed, no forced redirection | Warning shown, site accessible | ✅ Pass |
| **TC-10** | Modal non-dismissible | Intervention modal active | 1. Press ESC key<br/>2. Click outside modal<br/>3. Press F5 (refresh) | Modal remains visible, keys blocked | Modal persists, keys ignored, countdown continues | ✅ Pass |

---

#### **Table 8.3: Redirection and Platform Rotation Test Cases**

| Test ID | Test Description | Preconditions | Test Steps | Expected Result | Actual Result | Status |
|---------|------------------|---------------|------------|-----------------|---------------|--------|
| **TC-11** | Redirect to first platform (count=1) | Profile with 2 platforms: [NPTEL, LeetCode], count=0 | 1. Trigger violation (count→1)<br/>2. Wait for countdown | Redirected to platforms[1 % 2 = 1] = LeetCode | LeetCode opened after countdown | ✅ Pass |
| **TC-12** | Platform rotation (count=2) | Same profile, count=1 | 1. Trigger violation (count→2)<br/>2. Wait for countdown | Redirected to platforms[2 % 2 = 0] = NPTEL | NPTEL opened, rotation working | ✅ Pass |
| **TC-13** | Fallback when no platforms | Profile with empty platforms array | 1. Trigger violation | Redirected to fallback: https://khanacademy.org | Khan Academy opened | ✅ Pass |
| **TC-14** | Back button blocked | Redirected to study platform | 1. Click browser back button | Cannot return to blocked site (removed from history) | Back button navigates to page before blocked site | ✅ Pass |

---

#### **Table 8.4: Data Persistence and Logging Test Cases**

| Test ID | Test Description | Preconditions | Test Steps | Expected Result | Actual Result | Status |
|---------|------------------|---------------|------------|-----------------|---------------|--------|
| **TC-15** | Profile survives browser crash | Profile exists | 1. Note current profile data<br/>2. Force-quit Chrome (kill process)<br/>3. Reopen browser, access dashboard | Profile data intact, all fields preserved | Profile restored from storage, no data loss | ✅ Pass |
| **TC-16** | Violation logged with metadata | Profile exists, count=3 | 1. Trigger violation on instagram.com<br/>2. Check chrome.storage logs | Log entry created with: timestamp, domain="instagram.com", tier="accountability", count=4 | Log entry found with all expected fields | ✅ Pass |
| **TC-17** | Daily count resets at midnight | Violation count=5 on Dec 28 | 1. Wait for date change to Dec 29<br/>2. Check storage for Dec 29 count | New key "violationCount_2024-12-29" = 0, Dec 28 key unchanged | Count reset for new day, old count preserved | ✅ Pass |
| **TC-18** | 90-day log auto-deletion | Logs exist for 95 days ago | 1. System runs for 1 day<br/>2. Check storage keys | Logs older than 90 days deleted, recent logs retained | Auto-deletion working (simulated via manual date manipulation) | ⚠️ Partial (Not tested in real-time due to 90-day wait) |

---

#### **Table 8.5: Dashboard Analytics Test Cases**

| Test ID | Test Description | Preconditions | Test Steps | Expected Result | Actual Result | Status |
|---------|------------------|---------------|------------|-----------------|---------------|--------|
| **TC-19** | Daily count accuracy | 7 violations logged today | 1. Open dashboard<br/>2. View daily count | Display shows "Today: 7 violations" | Correct count displayed | ✅ Pass |
| **TC-20** | Weekly trend calculation | Violations: Mon=5, Tue=3, Wed=8, Thu=2, Fri=6, Sat=4, Sun=7 | 1. Open dashboard<br/>2. View weekly trend chart | Chart shows 7 data points with correct daily counts | All 7 days plotted accurately | ✅ Pass |
| **TC-21** | Top domains display | Logs: instagram=12, youtube=8, reddit=5, twitter=3 | 1. Open dashboard<br/>2. View top blocked sites | Display shows: 1. instagram.com (12×), 2. youtube.com (8×), 3. reddit.com (5×) | Top 3 domains displayed correctly | ✅ Pass |
| **TC-22** | Tier distribution percentages | 40% Tier 1, 35% Tier 2, 25% Tier 3 (from 100 total violations) | 1. Open dashboard<br/>2. View tier distribution | Display shows: Advisory 40%, Accountability 35%, Consequence 25% | Percentages calculated correctly | ✅ Pass |

---

#### **Table 8.6: Performance and Non-Functional Test Cases**

| Test ID | Test Description | Preconditions | Test Steps | Expected Result | Actual Result | Status |
|---------|------------------|---------------|------------|-----------------|---------------|--------|
| **TC-23** | Detection latency <500ms | Profile exists | 1. Navigate to blacklisted site<br/>2. Measure time from navigation to modal appearance (Chrome DevTools Performance) | p95 latency ≤500ms | Measured: p95=320ms (10 trials) | ✅ Pass |
| **TC-24** | Setup completion ≤5 minutes | New user | 1. Start timer<br/>2. Complete setup wizard<br/>3. Stop timer at dashboard display | Median time ≤5 minutes | Measured: median=3m 45s (5 users tested) | ✅ Pass |
| **TC-25** | Extension memory usage ≤50MB | Extension running, 5 tabs open (3 allowed, 2 blocked) | 1. Open Chrome Task Manager<br/>2. Check extension memory | Memory usage ≤50MB | Measured: 42 MB with 5 tabs | ✅ Pass |
| **TC-26** | Dashboard load time <2s | Profile exists, 90 days of logs | 1. Navigate to dashboard<br/>2. Measure load time (Navigation Timing API) | p90 load time <2s | Measured: p90=1.6s | ✅ Pass |

---

### Test Summary

**Total Test Cases Executed**: 26  
**Passed**: 25 (96.2%)  
**Partial Pass**: 1 (TC-18: 90-day deletion not testable in real-time)  
**Failed**: 0 (0%)

**Test Coverage:**
- Setup and Profile Management: 4/4 requirements tested (100%)
- Violation Detection: 6/6 requirements tested (100%)
- Redirection Logic: 4/4 requirements tested (100%)
- Data Persistence: 4/4 requirements tested (100%)
- Dashboard Analytics: 4/4 requirements tested (100%)
- Performance (NFRs): 4/4 requirements tested (100%)

**Known Issues:**
- **TC-18 (90-day deletion)**: Requires longitudinal testing over 90 days; simulated via manual date manipulation of storage keys. Full validation deferred to production monitoring.

**Testing Environment:**
- **OS**: Windows 10 (21H2), macOS 12 Monterey, Ubuntu 22.04 LTS
- **Browser**: Chrome 110, 115, 120, 127
- **Node.js**: 18.16.0
- **Test Duration**: December 24-28, 2024 (5 days)
- **Testers**: 1 developer (self-testing), 5 volunteer users (setup timing tests)

**Test Limitations:**
- No automated test suite (Selenium, Jest, Cypress) implemented
- Edge cases not exhaustively tested (e.g., storage quota exceeded, network offline during setup)
- Performance tests limited to single machine (no distributed load testing)
- Accessibility testing basic (screen reader compatibility not fully validated)
- Security testing not performed (XSS vulnerability scanning, CSP validation)

**Validation Against Requirements:**
All functional requirements (FR-101 through FR-702, Section 4.2) validated through manual test cases. All critical non-functional requirements (NFR-101 through NFR-105, Section 4.3) verified within acceptable margins (≤10% variance from targets).

---

## Conclusion

Manual testing confirms the Productivity Assassin system meets all specified functional requirements and performance targets. The 96.2% pass rate (25/26 tests) demonstrates functional correctness across setup, detection, intervention, redirection, logging, and analytics workflows. Performance benchmarks (detection <500ms, setup <5 min, dashboard load <2s, memory <50MB) achieved in all measured scenarios.

The single partial pass (TC-18: 90-day log deletion) reflects practical testing constraints rather than implementation defects; the auto-deletion logic is correctly implemented and validated through simulated date shifts.

Future testing enhancements should include automated regression test suites (unit tests for Algorithm 1-8, integration tests for end-to-end workflows), expanded edge case coverage (storage quota exhaustion, concurrent tab violations), and accessibility audits (WCAG 2.1 Level AA compliance verification).
