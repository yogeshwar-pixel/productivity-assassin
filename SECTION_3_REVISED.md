## 3. HARDWARE AND SOFTWARE REQUIREMENTS

### 3.1 Hardware Requirements

**Assumptions:**  
The hardware specifications assume deployment on consumer-grade computing devices commonly available to university students and working professionals. Requirements are derived from the resource consumption patterns of web browsers, JavaScript runtime environments, and extension processes observed during development and testing.

**Table 3.1: Minimum and Recommended Hardware Specifications**

| Component | Minimum Specification | Recommended Specification | Justification |
|-----------|----------------------|---------------------------|---------------|
| **Processor** | Intel Core i3 (8th Gen) or AMD Ryzen 3 (2000 series), 1.8 GHz dual-core | Intel Core i5 (10th Gen) or AMD Ryzen 5 (3000 series), 2.4 GHz quad-core | React application rendering requires moderate CPU for DOM manipulation. Extension content scripts execute JavaScript asynchronously; dual-core sufficient for basic functionality, quad-core ensures responsive UI during concurrent tab operations. |
| **RAM** | 4 GB DDR4 | 8 GB DDR4 | Chrome browser baseline: 1.5-2 GB. React dev server: 500-800 MB. Extension overhead: 100-200 MB per tab with injected content scripts. 4 GB supports 2-3 concurrent tabs; 8 GB accommodates typical multitasking (5+ tabs, dashboard, IDE). |
| **Storage** | 500 MB available space | 1 GB available space | Application files: ~50 MB (node_modules excluded). Extension resources: ~5 MB. Violation logs (1 year, 20 violations/day): ~10 MB JSON storage. Buffer for browser cache and temporary files. |
| **Display** | 1280×720 pixels (HD Ready) | 1920×1080 pixels (Full HD) | Modal prompts designed with 700px width; requires minimum 1024px horizontal space for readability. Dashboard grid layout optimized for 1280px+ viewports. Higher resolutions improve text clarity and reduce cognitive load. |
| **Network** | Stable internet connection, 1 Mbps download | Broadband, 5+ Mbps download | Required only for: (1) Initial npm dependency installation (~50 MB). (2) Accessing study platforms post-redirect. (3) Chrome Web Store extension updates. No real-time network dependency for core blocking functionality. |

**Limitations:**
1. System not tested on ARM-based processors (Apple M1/M2); x86-64 architecture assumed.
2. Low-end devices (2 GB RAM) may experience degraded performance with >3 concurrent tabs.
3. SSD strongly recommended over HDD; mechanical drives introduce latency in storage I/O operations affecting prompt display times.

---

### 3.2 Software Requirements

**Assumptions:**  
Software versions reflect the development environment configuration as of December 2024. Version constraints are based on documented API stability, security patches, and feature availability required by the implementation.

**Table 3.2: Development and Runtime Software Stack**

| Software Component | Version | Purpose | Version Justification |
|--------------------|---------|---------|----------------------|
| **Node.js** | 18.0.0 or later (LTS) | JavaScript runtime for React development server and build tools | Version 18 introduces native Fetch API, optimized garbage collection, and experimental ESM support. Backward compatibility with 16.x not guaranteed due to OpenSSL 3.0 dependency. LTS ensures security patches until April 2025. |
| **npm** | 9.0.0+ (bundled with Node 18) | Package manager for dependency resolution | Ships with Node 18. Required for installing React 18.x which uses peer dependency resolution incompatible with npm 6.x. |
| **React** | 18.2.0 | UI library for component-based interface construction | Automatic batching improves render performance by 30-40% vs. React 17. Concurrent features (useTransition, Suspense) enable non-blocking UI updates critical for dashboard statistics rendering. |
| **React Router DOM** | 6.8.0 | Client-side routing without server round-trips | Data router APIs introduced in 6.4+ enable loader functions for pre-fetching violation logs before dashboard render. Replaces legacy BrowserRouter with createBrowserRouter for improved error boundaries. |
| **@react-native-async-storage/async-storage** | 1.19.0 (web polyfill) | Persistent key-value storage for user profiles | Provides AsyncStorage API compatible with React Native for potential future mobile port. Web implementation wraps localStorage with Promise-based interface. |
| **Google Chrome** | 110.0 or later | Browser environment for extension deployment | Manifest V3 mandatory from Chrome 127+ (Jan 2024 deadline). Version 110 ensures MV3 API stability (declarativeNetRequest, chrome.storage.local with unlimited quota flag). Earlier versions lack required permissions model. |
| **Chrome Extension APIs** | Manifest V3 | Platform APIs for browser integration | **Key APIs used:** <br>• `chrome.storage.local`: Persistent storage (quota: 10 MB default, unlimited with permission). <br>• `chrome.tabs.onUpdated`: Tab navigation event monitoring. <br>• `content_scripts`: DOM injection for modal rendering. <br>• Service workers replace background pages (MV2 deprecation). |

**Development Tools (Not Required for End Users):**

| Tool | Version | Purpose |
|------|---------|---------|
| Visual Studio Code | 1.85+ | Code editor with React and JavaScript IntelliSense |
| Git | 2.40+ | Version control for source code management |
| Chrome DevTools | Built-in with Chrome 110+ | Extension debugging, storage inspection, console logging |

**Operating System Compatibility:**

**Table 3.3: Tested Operating System Environments**

| OS Family | Tested Versions | Compatibility Notes |
|-----------|----------------|---------------------|
| Windows | Windows 10 (21H2), Windows 11 (22H2) | Native Chrome support. PowerShell 5.1+ required for npm scripts. |
| macOS | macOS Monterey (12.0), macOS Ventura (13.0) | Bash/Zsh shell compatible. Rosetta 2 enables x86 Node.js on Apple Silicon. |
| Linux | Ubuntu 22.04 LTS, Fedora 38 | Chromium-based browsers supported. Wayland display protocol compatible. |

**Assumptions:**
1. Chrome browser is pre-installed; no bundled Chromium distribution provided.
2. Node.js installation includes npm; manual npm installation not required.
3. User has administrative privileges to install Chrome extensions in developer mode.

**Limitations:**
1. Extension incompatible with Firefox, Safari, Edge (Chromium-based Edge untested but theoretically compatible).
2. React 18 requires JavaScript enabled; no graceful degradation for JS-disabled environments.
3. AsyncStorage polyfill stores data in localStorage; 10 MB quota limit may restrict long-term log retention (affects users logging >100 violations/day for >6 months).
4. Service worker lifecycle in Manifest V3 introduces 30-second inactivity timeout; profile synchronization message passing may fail if extension unloaded during web app interaction.

**Dependency Vulnerability Disclosure:**  
As of December 2024, all dependencies have no known critical CVEs. Minor vulnerabilities in transitive dependencies (e.g., `nth-check` <2.0.1) are acknowledged but do not affect core functionality as they relate to unused CSS selector parsing.

**Version Pinning Rationale:**  
Exact version specifications (e.g., React 18.2.0) chosen over semver ranges (^18.0.0) to ensure reproducible builds. Future updates require explicit testing to verify breaking change compatibility.

---

**Figure 3.1: Software Dependency Graph** *(Suggested Diagram)*  
A directed graph showing Node.js → npm → React/React Router → Browser APIs, with extension as separate branch dependent on Chrome APIs. Highlights runtime vs. development-only dependencies.

**Table 3.4: Storage Requirements Breakdown** *(Data-Driven Estimation)*

| Component | Size Estimate | Calculation Basis |
|-----------|--------------|-------------------|
| React app (build) | 2.5 MB | Webpack/Vite production bundle with minification, gzip compression disabled |
| Chrome extension | 5 MB | Includes icons (16×16, 48×48, 128×128 PNG), manifest.json, multiple JS files |
| User profile (JSON) | ~2 KB | 7 fields × avg 50 characters × 2 bytes (UTF-16) + overhead |
| Violation logs (1 year) | 8.76 MB | 20 violations/day × 365 days × 1,200 bytes per entry (timestamp, domain, tier, count) |
| Browser cache/temp | 200 MB (variable) | Chrome-managed; outside direct control |
| **Total (excluding cache)** | **16.26 MB** | Well within 500 MB minimum specification |

This quantitative breakdown justifies the 500 MB minimum requirement with substantial safety margin.
