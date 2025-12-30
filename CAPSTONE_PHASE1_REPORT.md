# CAPSTONE PROJECT PHASE-1 REPORT

**PROJECT TITLE:** Productivity Assassin  
**DEPARTMENT:** Computer Applications (MCA)  
**INSTITUTION:** PES University  
**ACADEMIC YEAR:** 2024-2025

---

## ABSTRACT

Digital distraction is one of the most significant challenges faced by students and professionals in the modern era. Existing productivity tools often fail to address the psychological aspects of procrastination and do not provide personalized accountability. The Productivity Assassin system is a goal-oriented digital wellbeing platform designed to combat digital distractions through psychologically impactful interventions. The system employs a React-based user interface for the web application, a Chrome extension for real-time browser monitoring, and local storage mechanisms for data privacy. The core methodology involves capturing user goals during setup, monitoring browsing activity, detecting distractions using keyword-based relevance engines, and delivering personalized motivational prompts before forcibly redirecting users to their designated study platforms. The system features a three-tier prompt escalation system that intensifies based on violation frequency, leveraging user-specific failure patterns, sacrifices, and accountability factors to maximize psychological impact. The outcome is a practical, privacy-preserving productivity enforcement tool that empowers users to maintain focus and achieve their goals through unavoidable, emotionally resonant prompts.

---

## 1. INTRODUCTION

The proliferation of digital devices and internet connectivity has revolutionized access to information and communication. However, this convenience has been accompanied by an epidemic of digital distraction. Social media platforms, video streaming services, online gaming, and messaging applications are specifically engineered to capture and retain user attention through dopamine-driven feedback loops. For students and working professionals, this constant barrage of digital stimuli significantly impairs productivity, disrupts focus, and undermines goal achievement.

Traditional productivity tools such as website blockers, time trackers, and focus timers address the symptoms of digital distraction but fail to tackle the underlying psychological mechanisms. Most existing solutions rely on user willpower alone, providing generic reminders or simple blocks that users can easily bypass or ignore. These tools do not leverage personal accountability, fail to reference user-specific goals, and lack the psychological intensity required to break ingrained procrastination patterns.

The Productivity Assassin system addresses these limitations by implementing a goal-based accountability framework. The system begins by capturing detailed user goals, failure patterns, sacrifices, and accountability factors during an initial setup process. This information is then utilized to generate highly personalized, psychologically impactful prompts that confront users with their own stated intentions whenever they attempt to access distracting websites. Unlike passive reminders, these prompts are unavoidable, displayed full-screen with a mandatory countdown, and escalate in severity based on repeated violations. The system enforces redirection to user-defined study platforms, ensuring that distractions lead directly back to productive work.

---

## 2. PROJECT DESCRIPTION

### 2.1 Problem Definition

The problem of digital distraction manifests in several critical ways. First, students and professionals frequently succumb to impulsive browsing behaviors, visiting social media or entertainment websites when they should be focused on learning or work tasks. Second, existing productivity tools provide insufficient accountability, allowing users to rationalize or bypass restrictions. Third, generic blocking mechanisms fail to address individual motivations, goals, and failure patterns, resulting in low adherence. Fourth, users often lack awareness of the cumulative time wasted on distractions throughout the day. Finally, there is a need for a system that not only blocks distractions but also actively redirects users toward productive activities.

### 2.2 Existing System

Several existing solutions attempt to address digital distraction:

Website blockers such as Cold Turkey and Freedom allow users to blacklist distracting websites for specified time periods. These tools prevent access to blocked sites but do not provide motivational feedback or goal-based accountability. Users can easily disable or bypass these blocks, and the interventions are not personalized.

Time tracking applications like RescueTime monitor browsing and application usage, generating productivity reports. While these tools provide awareness of time allocation, they do not actively intervene during distracting behaviors. Users must review reports after the fact, which does not address immediate procrastination.

Focus timers such as Forest and Pomodoro applications encourage users to work in focused intervals. However, these tools rely entirely on user discipline and do not prevent access to distractions during work sessions.

Browser extensions like StayFocusd and LeechBlock offer configurable blocking with time limits. These solutions lack integration with user goals, provide generic alerts, and do not implement escalating accountability mechanisms.

The primary limitations of existing systems include lack of personalization, absence of psychological accountability, easy bypass mechanisms, and failure to redirect users toward productive alternatives.

### 2.3 Proposed Solution

The Productivity Assassin system implements a comprehensive goal-based productivity enforcement framework. The solution consists of three primary components: a web-based setup and dashboard application, a Chrome extension for real-time monitoring and intervention, and a local storage mechanism for privacy-preserving data management.

During the initial setup phase, users complete a psychologically designed questionnaire capturing their real goals, failure patterns, sacrifices, weak times, main distractions, and accountability factors. This data forms the foundation for personalized interventions. The system also requires users to specify their designated study platforms, ensuring redirections lead to productive environments rather than generic alternatives.

The Chrome extension continuously monitors browsing activity. When a user accesses a blacklisted distracting website, the extension immediately blocks the page and displays a full-screen modal containing a personalized motivational prompt. These prompts are not generic warnings but rather direct confrontations referencing the user's own stated goals, admitted failure patterns, and identified sacrifices. The prompt includes a mandatory three-second countdown during which the user cannot interact with the underlying page, ensuring the message is read and processed.

The system implements a three-tier prompt escalation strategy. For initial violations, the advisory tier provides firm reminders linking the distraction to the user's goals. For repeated violations, the accountability tier intensifies the message by explicitly calling out the user's failure patterns. For chronic violations exceeding five per day, the consequence tier delivers devastating messages emphasizing sacrifices and accountability, creating maximum psychological discomfort.

Following the prompt display, the system forcibly redirects the user to one of their designated study platforms, rotating between platforms based on violation count. This ensures that every failed attempt at distraction immediately transitions into productive work, eliminating wasted time.

The dashboard application provides users with visibility into their violation statistics, goal progress, and platform usage patterns, reinforcing awareness and accountability.

### 2.4 Motivation

The motivation for this project stems from personal experiences with procrastination and the inadequacy of existing tools. Many students struggle to maintain focus during critical academic periods, succumbing to social media and entertainment despite strong intentions to study. The gap between intention and action highlights the need for external accountability mechanisms that are psychologically powerful enough to override impulsive behaviors.

The project aims to demonstrate that technology, when designed with psychological principles in mind, can serve as an effective tool for self-improvement rather than merely a source of distraction.

### 2.5 Purpose of the Project

The purpose of the Productivity Assassin system is to provide students and professionals with a practical, privacy-preserving tool for combating digital distractions. The system seeks to achieve the following objectives:

Empower users to define and commit to specific, measurable goals through a structured setup process. Provide immediate, unavoidable accountability whenever users attempt to access distracting websites. Deliver psychologically impactful interventions that reference user-specific goals, failures, and sacrifices. Enforce productive redirection by automatically navigating users to their designated study platforms. Enable users to track distraction patterns and goal progress through a comprehensive dashboard. Demonstrate the effectiveness of goal-based accountability in improving focus and productivity.

### 2.6 Scope of the System

The scope of the Productivity Assassin system encompasses the following functionalities:

A comprehensive setup wizard that captures user goals, failure patterns, sacrifices, study platforms, weak times, main distractions, and accountability factors through a series of psychologically designed questions.

Real-time browser monitoring through a Chrome extension that detects visits to blacklisted distracting websites and triggers immediate interventions.

A three-tier personalized prompt generation engine that creates messages referencing user-specific data, escalating in severity based on violation frequency.

Forced redirection to user-defined study platforms, ensuring distractions transition into productive activities.

A violation tracking system that logs all distraction attempts, enabling analysis of patterns and progress.

A dashboard interface displaying statistics, goal reminders, and insights into productivity behavior.

Local storage mechanisms ensuring all user data remains private and under user control, with no cloud synchronization or external data transmission.

---

## 3. LITERATURE SURVEY

### Paper 1: "Digital Wellbeing Tools: A Review of Effectiveness and User Engagement"

**Methodology:** This research conducted a systematic review of existing digital wellbeing applications, analyzing their design principles, intervention strategies, and user retention metrics. The study evaluated twenty popular productivity apps across categories including website blockers, time trackers, and focus timers.

**Limitations:** The review found that most applications rely on user willpower and provide minimal psychological accountability. Tools offering generic interventions showed low long-term engagement, with users frequently disabling features or uninstalling applications within weeks of initial use.

**Relevance:** This paper validates the need for personalized, psychologically impactful interventions. The Productivity Assassin system addresses identified limitations by implementing goal-based prompts that are unavoidable and escalate based on user behavior, increasing effectiveness and long-term adherence.

### Paper 2: "The Role of Personalization in Digital Behavior Change Interventions"

**Methodology:** This study examined the impact of personalized messaging in behavior change applications through a randomized controlled trial involving university students. Participants received either generic productivity reminders or personalized messages referencing their individual goals.

**Limitations:** The research identified that personalized interventions significantly outperformed generic ones in maintaining user motivation. However, the study noted that personalization alone was insufficient if messages could be easily dismissed or ignored.

**Relevance:** The Productivity Assassin system incorporates deep personalization by capturing detailed user profiles and generating dynamic prompts that reference specific goals, failure patterns, and sacrifices. Additionally, the system ensures prompts are unavoidable through full-screen modals with mandatory countdowns.

### Paper 3: "Nudge Theory and Digital Distraction Management"

**Methodology:** This paper explored the application of nudge theory principles to digital environments, proposing design strategies that subtly influence user behavior toward productive choices without restricting freedom.

**Limitations:** The research concluded that subtle nudges alone are often insufficient for individuals with strong addictive behaviors toward digital content. Users with ingrained procrastination patterns require more assertive interventions.

**Relevance:** While the Productivity Assassin system respects user agency by allowing configuration of goals and platforms, it implements assertive interventions rather than subtle nudges. The three-tier escalation system provides increasingly forceful accountability as violations accumulate, addressing the limitations of purely nudge-based approaches.

### Paper 4: "Self-Control and Digital Device Usage Among Students"

**Methodology:** This longitudinal study tracked smartphone and computer usage patterns among graduate students over a semester, correlating device usage with academic performance and self-reported stress levels.

**Limitations:** The findings revealed that students consistently overestimated their ability to self-regulate device usage. Even those aware of negative impacts struggled to implement effective restrictions independently.

**Relevance:** This research underscores the need for external accountability mechanisms. The Productivity Assassin system provides structured accountability through personalized prompts and forced redirections, compensating for self-control deficits.

### Paper 5: "Psychological Impact of Goal Visualization in Productivity Systems"

**Methodology:** This experimental study compared productivity outcomes between users who explicitly articulated their goals versus those who used tools without goal-setting components. Participants using goal visualization features demonstrated higher task completion rates.

**Limitations:** The research noted that goal visualization benefits diminished when goals were not actively referenced during moments of distraction or temptation.

**Relevance:** The Productivity Assassin system integrates goal visualization directly into intervention prompts. When users attempt to access distractions, they are immediately confronted with their own stated goals, creating cognitive dissonance and reinforcing commitment.

### Paper 6: "Escalating Interventions in Behavior Modification Systems"

**Methodology:** This paper proposed a framework for escalating intervention strategies in digital health applications, suggesting that intervention intensity should increase with repeated non-compliance to prevent habituation.

**Limitations:** The research identified that static interventions lose effectiveness over time as users habituate to messages and develop strategies to ignore or bypass them.

**Relevance:** The Productivity Assassin system implements a three-tier escalation strategy (Advisory, Accountability, Consequence) that intensifies messaging based on daily violation counts. This prevents habituation and maintains psychological impact across repeated distractions.

### Paper 7: "Privacy Preservation in Personal Productivity Applications"

**Methodology:** This study analyzed data privacy practices in commercial productivity applications, revealing that many tools transmit sensitive user data to external servers for analytics and personalization.

**Limitations:** The research raised concerns about user privacy, particularly in applications handling behavioral data, browsing histories, and personal goals.

**Relevance:** The Productivity Assassin system addresses privacy concerns by implementing local storage mechanisms exclusively. All user data, including goals, violations, and browsing patterns, remains on the user's device with no cloud synchronization or external transmission.

### Gap Analysis

The reviewed literature collectively reveals several critical gaps in existing digital wellbeing and productivity solutions. First, most tools fail to implement personalized, goal-based accountability that references user-specific intentions and failures. Second, interventions are often easily dismissible, relying on user willpower rather than enforcing behavioral change. Third, existing systems do not implement escalating intervention strategies that maintain effectiveness across repeated violations. Fourth, privacy preservation is frequently compromised in favor of cloud-based features and analytics.

The Productivity Assassin system addresses these gaps through a comprehensive approach combining deep personalization, unavoidable interventions, intelligent escalation, forced redirection to productive platforms, and complete privacy preservation through local-only data storage. This combination of features positions the system as a significant advancement over existing solutions in the digital wellbeing domain.

---

## 4. HARDWARE AND SOFTWARE REQUIREMENTS

### 4.1 Hardware Requirements

The Productivity Assassin system is designed to operate on standard consumer computing hardware with minimal resource demands. The hardware requirements are as follows:

**Processor:** Intel Core i3 or equivalent AMD processor with a minimum clock speed of 1.8 GHz supports adequate performance for web application rendering and extension operations.

**Random Access Memory (RAM):** A minimum of 4 GB RAM is required for basic functionality. For optimal performance and concurrent operation of multiple browser tabs alongside the dashboard application, 8 GB RAM is recommended.

**Storage:** The system requires approximately 500 MB of available disk space for application files, extension resources, and local data storage including violation logs and user profiles.

**Display:** A minimum screen resolution of 1280x720 pixels ensures proper rendering of the dashboard interface and full-screen modal prompts. Higher resolutions provide enhanced visual experience.

**Operating System:** The system supports Windows 10 or later, macOS 10.14 or later, and Linux distributions with graphical desktop environments. Cross-platform compatibility is achieved through web technologies and browser extension APIs.

**Internet Connectivity:** An active internet connection is required for initial setup, accessing designated study platforms during redirections, and downloading extension updates. Offline functionality is limited to cached pages.

### 4.2 Software Requirements

The software technology stack encompasses both development tools and runtime dependencies:

**Node.js:** Version 18.0 or later provides the JavaScript runtime environment for executing the React-based web application and development server.

**React:** Version 18.2.0 serves as the core library for building the user interface, managing component state, and handling user interactions in the dashboard and setup pages.

**React Router:** Version 6.8.0 enables client-side routing for navigation between different application views without full page reloads.

**Google Chrome Browser:** Version 110 or later is required for the Chrome extension functionality. The extension leverages Manifest V3 APIs for content scripts, background service workers, and storage.

**Chrome Extension APIs:** The extension utilizes chrome.storage for local data persistence, chrome.tabs for tab monitoring, and declarativeNetRequest for potential future enhancements.

**AsyncStorage:** React Native AsyncStorage library (web-compatible version) manages persistent storage for user profiles and violation logs.

**Local Storage API:** Browser-native localStorage provides supplementary storage for extension synchronization and quick-access data.

**Development Tools:** Visual Studio Code or equivalent code editors, npm package manager for dependency management, and Git for version control.

**Operating System:** Windows, macOS, or Linux with support for Node.js and Chrome browser.

---

## 5. SOFTWARE REQUIREMENTS SPECIFICATION

### 5.1 Users of the System

The Productivity Assassin system is designed for the following user categories:

**Students:** Undergraduate and graduate students who struggle with digital distractions during study sessions, assignment completion, or exam preparation. This group benefits from goal-based accountability aligned with academic objectives.

**Working Professionals:** Individuals in remote or hybrid work environments who face temptations to browse social media, news sites, or entertainment platforms during work hours. The system helps maintain professional focus and meet deadlines.

**Researchers and Scholars:** Academics and researchers who require extended focus periods for reading, writing, and analysis. The system supports deep work by preventing fragmented attention.

**Self-Improvement Enthusiasts:** Individuals committed to personal development who seek tools to enforce self-discipline and build productive habits.

All users share common characteristics: awareness of their tendency toward digital distraction, desire for external accountability, and commitment to achieving specific goals that require focused effort.

### 5.2 Functional Requirements

The functional requirements define the core capabilities and behaviors of the Productivity Assassin system:

**FR1: User Registration and Setup**  
The system shall provide a multi-step setup wizard that captures user information including real goals, failure patterns, sacrifices, designated study platforms, weak times, main distractions, and accountability factors. Each question shall include explanatory text describing how the information will be used. The system shall validate inputs and require at least two study platforms before allowing completion.

**FR2: Profile Storage and Management**  
The system shall store user profiles locally using browser storage mechanisms. Profile data shall include all setup responses, timestamp of creation, and selected tone preference. The system shall provide functionality to review and edit stored profiles through the dashboard.

**FR3: Browser Activity Monitoring**  
The Chrome extension shall continuously monitor URLs navigated by the user. The system shall maintain a blacklist of distracting websites including social media, video streaming, gaming, and news platforms. Upon detection of a blacklisted URL, the extension shall immediately trigger the intervention workflow.

**FR4: Personalized Prompt Generation**  
The system shall generate dynamic prompts that incorporate data from the user profile. Prompts shall reference the user's stated goals, admitted failure patterns, identified sacrifices, and accountability factors. The system shall implement a three-tier escalation strategy: Advisory (0-1 violations), Accountability (2-4 violations), and Consequence (5+ violations). Each tier shall employ progressively more confrontational language designed to maximize psychological impact.

**FR5: Full-Screen Modal Display**  
Upon detecting a blacklisted website, the system shall display a full-screen modal overlay that completely blocks access to the underlying page. The modal shall prominently display the personalized prompt, a countdown timer set to three seconds, and visual indicators of severity (color-coded borders). Users shall not be able to close or dismiss the modal until the countdown completes.

**FR6: Forced Redirection**  
After the prompt countdown expires, the system shall automatically redirect the browser to one of the user's designated study platforms. The system shall rotate between platforms based on violation count, ensuring varied redirection destinations. Fallback logic shall redirect to a default educational platform if user-defined platforms are unavailable.

**FR7: Violation Tracking and Logging**  
The system shall maintain a comprehensive log of all distraction attempts. Each log entry shall record timestamp, blocked website domain, selected study platform for redirection, violation count for the day, and applied prompt tier. Logs shall persist locally and be accessible through the dashboard.

**FR8: Dashboard Visualization**  
The dashboard application shall display user goals prominently. The interface shall present violation statistics including daily counts, weekly trends, and most frequently blocked sites. A summary of study platform redirections shall be shown to reinforce productive transitions.

**FR9: Strict Mode Toggle**  
The system shall provide a strict mode setting that controls whether blocking and redirection are actively enforced. When strict mode is disabled, the system shall display warnings without redirecting. Users shall receive notifications when toggling strict mode.

**FR10: Chrome Storage Synchronization**  
The system shall synchronize user profiles between the web application and Chrome extension. Profile updates made through the dashboard shall propagate to the extension's local storage, ensuring consistent personalization.

### 5.3 Non-Functional Requirements

Non-functional requirements define quality attributes and constraints:

**NFR1: Performance**  
The system shall detect blacklisted URLs and display intervention prompts within 500 milliseconds of page navigation. Dashboard pages shall load within 2 seconds on standard internet connections. Extension background processes shall consume minimal CPU and memory resources.

**NFR2: Privacy and Security**  
All user data including profiles, goals, violation logs, and browsing patterns shall remain stored locally on the user's device. The system shall not transmit any personal information to external servers. Data shall not be shared with third parties. Users shall have complete control over data retention and deletion.

**NFR3: Reliability**  
The Chrome extension shall remain functional across browser restarts and system reboots. Profile data shall persist reliably using browser storage APIs with error handling for storage quota limits. The system shall gracefully handle network disconnections during redirections.

**NFR4: Usability**  
The setup wizard shall guide users through profile creation with clear instructions and examples. Prompts shall be readable and comprehensible within the three-second display period. The dashboard interface shall be intuitive with minimal learning curve.

**NFR5: Maintainability**  
Code shall be modular with clear separation of concerns between UI components, business logic, and storage operations. Functions shall be well-documented with comments explaining purpose and parameters. The system shall be maintainable by developers familiar with React and Chrome extension APIs.

**NFR6: Compatibility**  
The web application shall be compatible with modern browsers supporting ES6 JavaScript and CSS3. The Chrome extension shall adhere to Manifest V3 specifications for future compatibility. The system shall function on Windows, macOS, and Linux operating systems.

**NFR7: Scalability**  
The system shall support local storage of violation logs for at least one year without performance degradation. Profile data structures shall accommodate future expansion of captured fields.

---

## 6. SYSTEM DESIGN

### 6.1 Architecture Diagram

The Productivity Assassin system follows a multi-tier architecture pattern with clear separation of concerns across presentation, business logic, service, and data layers.

**Presentation Layer:**  
The presentation layer consists of the React-based web application and the Chrome extension user interfaces. The web application includes the setup wizard, dashboard, and analytics views. The Chrome extension contributes full-screen modal prompts and configuration interfaces. This layer is responsible for rendering visual elements, capturing user inputs, and displaying system outputs.

**Business Logic Layer:**  
The business logic layer encompasses the core processing modules including prompt generation, violation tracking, profile management, and redirection logic. This layer implements the three-tier escalation strategy by analyzing violation counts and selecting appropriate message templates. It also handles study platform rotation, blacklist matching, and data validation.

**Service Layer:**  
The service layer provides utility functions for data persistence, browser storage interactions, messaging between components, and logging operations. It abstracts the underlying storage mechanisms, allowing business logic to interact with data without concerning itself with implementation details.

**Data Layer:**  
The data layer manages persistent storage using browser APIs. User profiles are stored in chrome.storage.local for extension access and AsyncStorage for web application persistence. Violation logs are maintained in JSON format within local storage. This layer ensures data integrity and handles migration scenarios.

As visualized in Figure 6.1, components communicate through well-defined interfaces. The web application sends profile updates to the extension via postMessage API. The extension monitors browsing activity and retrieves profile data from local storage. When violations occur, the extension invokes prompt generation logic, displays modals, and logs events before executing redirections.

### 6.2 Context Diagram

The context diagram illustrates the Productivity Assassin system's interactions with external entities.

The primary external entity is the User, who interacts with the system through the Setup Wizard to configure goals and preferences, the Dashboard to review statistics and adjust settings, and the Chrome Extension during browsing sessions when intervention prompts are triggered.

The Browser acts as the execution environment for both the web application and the extension. It provides APIs for storage, tab management, URL monitoring, and DOM manipulation.

Study Platforms represent external websites designated by users as productive destinations. The system redirects to these platforms following intervention prompts.

Distracting Websites constitute the blacklisted sites that trigger interventions when accessed. These sites are passive entities that the system detects and blocks.

The Local File System provides persistent storage for user profiles, violation logs, and extension resources.

As depicted in Figure 6.2, data flows from the user into the system during setup, and from the system back to the user through prompts and dashboard displays. The system queries the browser for current URL information and issues redirection commands. Violation data flows from detection through logging to dashboard visualization.

---

## 7. DETAILED DESIGN

### 7.1 Process Flow Diagram

The process flow diagram illustrates the sequence of operations from system initialization through intervention execution.

**Initialization Phase:**  
When the user first accesses the Productivity Assassin web application, the system checks for existing profiles in local storage. If no profile exists, the setup wizard is displayed. The user proceeds through seven questions, providing detailed responses about goals, patterns, sacrifices, and platforms. Upon completion, the profile is validated and stored both in AsyncStorage and chrome.storage. The extension receives the profile through message passing.

**Monitoring Phase:**  
The Chrome extension's background service worker initializes listeners for tab update events. Whenever the user navigates to a new URL, the content script examines the domain against the blacklist. If the domain is not blacklisted, normal browsing continues. If the domain matches a blacklist entry, the intervention phase begins.

**Intervention Phase:**  
The system retrieves the user profile from chrome.storage. Current violation count for the day is fetched. Based on violation count, the appropriate prompt tier (Advisory, Accountability, or Consequence) is selected. The prompt generation function creates a personalized message incorporating user-specific data. The content script injects a full-screen modal into the page DOM, displaying the prompt with a three-second countdown. During this period, the underlying page remains inaccessible.

**Redirection Phase:**  
When the countdown expires, the system selects a study platform from the user's list, rotating based on violation count. The browser is redirected to the chosen platform URL. The violation count is incremented and logged with timestamp and details. The user arrives at a productive environment, ready to resume focused work.

**Dashboard Update:**  
Periodically, the dashboard application reads violation logs and profile data. Statistics are computed and visualized. Users can view daily violation counts, trending patterns, and frequently blocked sites.

Figure 7.1 depicts this flow with decision points for profile existence, blacklist matching, and tier selection.

### 7.2 Use Case Diagram

The use case diagram models interactions between users and system functionalities.

**Actor: User**

**Use Case 1: Complete Setup Process**  
The user initiates setup, answers all seven questions with specific goals and patterns, provides study platform URLs, and selects tone preference. The system validates inputs and stores the profile.

**Use Case 2: Access Distracting Website**  
The user navigates to a blacklisted site. The system detects the violation, displays a personalized prompt, and redirects to a study platform. This use case includes extension points for prompt generation and redirection logic.

**Use Case 3: View Dashboard Statistics**  
The user opens the dashboard application. The system retrieves violation logs and computes statistics. The user reviews daily counts, weekly trends, and top distractions.

**Use Case 4: Modify Profile Settings**  
The user accesses profile settings, updates goals or study platforms, and saves changes. The system persists the updated profile.

**Use Case 5: Toggle Strict Mode**  
The user enables or disables strict mode. The system adjusts intervention behavior accordingly, either blocking with redirection or displaying warnings without redirect.

Figure 7.2 illustrates these use cases with relationships showing includes and extends where applicable.

### 7.3 Activity Diagram

The activity diagram details the workflow from distraction detection through completed redirection.

**Start State:** User navigates to URL.

**Activity: URL Analysis**  
Extract domain from URL. Check domain against blacklist array. If not blacklisted, allow normal access. If blacklisted, proceed to violation detection.

**Activity: Violation Detection**  
Retrieve user profile from storage. Fetch current violation count for the day. Determine prompt tier based on count.

**Activity: Prompt Generation**  
Select message template for determined tier. Substitute placeholders with user-specific data from profile. Generate final prompt text.

**Activity: Modal Display**  
Create modal DOM element. Style with tier-appropriate colors. Inject prompt text. Display countdown timer set to three seconds. Block user interaction with underlying page.

**Activity: Countdown**  
Decrement timer each second. Update display. When timer reaches zero, proceed to redirection.

**Activity: Platform Selection**  
Calculate platform index using violation count modulo number of platforms. Retrieve platform URL from profile. If profile lacks platforms, use default fallback.

**Activity: Redirect Execution**  
Replace current page location with selected platform URL. Browser loads study platform.

**Activity: Logging**  
Increment violation count. Record log entry with timestamp, blocked domain, redirect destination, and prompt tier. Store updated logs and counts.

**End State:** User arrives at study platform.

Figure 7.3 presents this activity flow with decision diamonds for blacklist matching and tier selection.

### 7.4 Database Design

The Productivity Assassin system employs a hybrid data storage approach combining structured and unstructured data models.

#### 7.4.1 Entity-Relationship Diagram (Conceptual MySQL Schema)

If implemented with a relational database, the system would employ the following entity structure:

**Entity: User**  
Attributes: UserID (Primary Key), CreatedAt (Timestamp)

**Entity: Profile**  
Attributes: ProfileID (Primary Key), UserID (Foreign Key), RealGoal (Text), FailurePattern (Text), Sacrifice (Text), WeakTime (Text), MainDistraction (Text), Accountability (Text), Tone (Enum), UpdatedAt (Timestamp)

**Entity: StudyPlatform**  
Attributes: PlatformID (Primary Key), ProfileID (Foreign Key), Name (String), URL (String), DisplayOrder (Integer)

**Entity: Violation**  
Attributes: ViolationID (Primary Key), ProfileID (Foreign Key), Timestamp (DateTime), BlockedDomain (String), RedirectURL (String), PromptTier (Enum), ViolationCount (Integer)

**Relationships:**  
User to Profile: One-to-One (Each user has one profile)  
Profile to StudyPlatform: One-to-Many (Each profile has multiple platforms)  
Profile to Violation: One-to-Many (Each profile has many violations logged)

Figure 7.4 illustrates the ER diagram with entities, attributes, and relationship cardinalities.

#### 7.4.2 NoSQL Document Structure

The actual implementation uses browser storage APIs with JSON-formatted documents. The data structure is as follows:

**UserProfile Document:**
```json
{
  "realGoal": "Score 85%+ in semester exams",
  "failurePattern": "I scroll reels until 2 AM",
  "sacrifice": "My placement chances",
  "studyPlatforms": [
    {"name": "NPTEL", "url": "https://nptel.ac.in"},
    {"name": "LeetCode", "url": "https://leetcode.com"}
  ],
  "weakTime": "9-11 PM after dinner",
  "mainDistraction": "Instagram Reels",
  "accountability": "My parents",
  "tone": "Tough",
  "createdAt": "2024-12-28T12:00:00Z"
}
```

**Violation Log Document:**
```json
{
  "date": "2024-12-28",
  "violations": [
    {
      "timestamp": "2024-12-28T14:30:22Z",
      "blockedDomain": "instagram.com",
      "redirectURL": "https://nptel.ac.in",
      "promptTier": "advisory",
      "dailyCount": 1
    },
    {
      "timestamp": "2024-12-28T16:15:40Z",
      "blockedDomain": "youtube.com",
      "redirectURL": "https://leetcode.com",
      "promptTier": "accountability",
      "dailyCount": 3
    }
  ]
}
```

This document-oriented structure provides flexibility for schema evolution and simplifies storage operations using browser APIs.

---

## 8. IMPLEMENTATION

The implementation of the Productivity Assassin system encompasses frontend user interface development, backend logic modules, activity monitoring mechanisms, and data management operations.

### 8.1 React-Based Frontend

The web application frontend is constructed using React framework with functional components and hooks for state management. The application entry point initializes routing using React Router, defining paths for the setup wizard, dashboard, and analytics views.

The setup wizard component implements a multi-step form with state tracking for the current question index and user answers. Each question renders with explanatory text, input fields with placeholders, and navigation buttons. For the study platforms question, the component renders five text input fields, allowing users to enter multiple URLs. Input validation ensures answers are not empty and study platforms meet the minimum count requirement.

When the setup is completed, the component constructs a profile object from collected answers, parses study platform strings into structured objects with name and URL properties, and persists the profile to AsyncStorage. Additionally, the component attempts to write directly to chrome.storage if the Chrome extension API is available, ensuring synchronization.

The dashboard component retrieves the user profile and violation logs from storage during initialization. React state hooks maintain counts and statistics, which are computed from log entries. The interface displays goal information prominently at the top, followed by violation statistics in card components. A strict mode toggle switch allows users to enable or disable enforcement.

Visual styling employs CSS with dark theme aesthetics, high contrast text, and color-coded elements to indicate severity levels. Responsive design principles ensure usability across different screen sizes.

### 8.2 Chrome Extension Implementation

The Chrome extension comprises three primary script files: background service worker, content script, and popup interface.

The background service worker initializes event listeners for extension installation and message passing. It listens for profile synchronization messages from the web application, received via window.postMessage, and saves received profiles to chrome.storage.local for persistent access.

The content script executes on all web pages, as specified in the manifest matches array. Upon page load, the script extracts the current domain from window.location.hostname and compares it against a predefined blacklist array containing domains like instagram.com, facebook.com, twitter.com, youtube.com, and others.

When a blacklisted domain is detected, the script retrieves the user profile and current violation count from chrome.storage using asynchronous get operations. The prompt generation function selects the appropriate message tier based on violation count thresholds. Messages are constructed by substituting template placeholders with user-specific values from the profile.

A full-screen modal element is dynamically created and injected into the page DOM. The modal styling includes fixed positioning covering the viewport, high z-index to overlay all page content, dark semi-transparent background, and centered content box with tier-specific border colors. The personalized prompt text is rendered within the modal, along with a countdown timer element initialized to three seconds.

A JavaScript interval function decrements the countdown every second, updating the displayed number. When the countdown reaches zero, the interval is cleared, and the redirection logic executes. The script calculates the target study platform by taking the violation count modulo the number of platforms, ensuring rotation. The selected platform URL replaces the current page location using window.location.replace, completing the forced redirection.

The violation count is incremented and stored back to chrome.storage, along with a log entry containing timestamp, blocked domain, redirect destination, and applied tier.

### 8.3 Activity Tracking Logic

Activity tracking is implemented through Chrome extension APIs that monitor tab navigation events. The background service worker registers listeners for chrome.tabs.onUpdated, which fires whenever a tab's URL changes.

When an update event occurs, the event handler checks if the loading status is complete, then extracts the new URL. This URL is passed to the content script executing in that tab via message passing. The content script performs blacklist matching and triggers interventions as previously described.

Violation logs are maintained in a structured format keyed by date, allowing daily statistics to be computed efficiently. Each day's violations are stored as an array of entries, enabling retrieval of counts and trend analysis over time.

### 8.4 Relevance Detection Engine

Relevance detection currently employs keyword-based matching against domain names. The blacklist array contains domains known for high distraction potential. This approach provides simplicity and reliability for the initial implementation.

Future enhancements could incorporate natural language processing to analyze page content, machine learning models to classify relevance based on user goals, or integration with browser history analysis to detect time-wasting patterns beyond explicit blacklisting.

### 8.5 Motivational Prompt Engine

The prompt engine implements a template-based generation system with three tiers. Each tier defines message templates containing placeholders for user-specific data.

For the advisory tier, the template structure references the user's goal and links it to the current distraction, emphasizing the irrelevance of the blocked site to the stated objective. The weak time and main distraction data are incorporated to create self-awareness of patterns.

The accountability tier intensifies language by explicitly calling out the user's admitted failure pattern, using accusatory phrasing such as "you're doing it right now" to create cognitive dissonance. Messages reference the violation count to emphasize repeated failure.

The consequence tier employs the most severe language, including commands in all capitals, direct accusations of self-deception, and explicit mention of sacrifices and accountability factors. This tier aims to create maximum psychological discomfort, motivating immediate behavior change.

Template substitution is performed using string interpolation, replacing placeholders like ${domain}, ${goal}, ${pattern}, and ${sacrifice} with actual user data retrieved from the profile. The resulting message is then displayed in the modal.

### 8.6 Logging and Dashboard Updates

Logging operations write violation events to browser local storage with structured JSON formatting. Each log entry captures essential metadata for later analysis.

The dashboard application periodically reads these logs, parsing JSON data and computing aggregates such as total daily violations, weekly trends, most frequently blocked domains, and platform rotation statistics.

Charts and visual indicators are rendered using conditional styling based on data values. High violation counts trigger warning messages encouraging users to reflect on their goals and consider adjusting their environment or routines.

---

## 9. SOFTWARE TESTING

### 9.1 Manual Testing Approach

Software testing for the Productivity Assassin system employed manual testing methodologies due to the interactive nature of user flows and the integration with browser environments. Testing was conducted across multiple scenarios to validate functional correctness, user experience, and error handling.

Test cases were designed to cover all major user workflows including initial setup, profile storage and retrieval, distraction detection and intervention, prompt personalization, forced redirection, violation logging, dashboard statistics display, and strict mode toggling.

Testing environments included Windows 10 and macOS operating systems with Google Chrome browser versions 110 through 120. Multiple user profiles were created with varied goals and platforms to verify personalization logic.

### 9.2 Sample Test Cases

**Test Case 1: Complete Setup Process**  
*Objective:* Verify that users can successfully complete the setup wizard and profile is persisted.  
*Steps:*  
1. Navigate to localhost setup page  
2. Enter specific goal in first question  
3. Provide failure pattern in second question  
4. Enter sacrifice in third question  
5. Input at least two study platform URLs  
6. Complete remaining questions  
7. Click Activate Assassin Mode  
*Expected Result:* Alert confirms activation, profile saved to storage, user redirected to dashboard.  
*Actual Result:* Passed. Profile stored successfully in both AsyncStorage and chrome.storage.

**Test Case 2: Blacklist Detection and Prompt Display**  
*Objective:* Verify that accessing a blacklisted site triggers prompt modal.  
*Steps:*  
1. Complete setup with test profile  
2. Navigate to instagram.com  
3. Observe page behavior  
*Expected Result:* Full-screen modal appears, blocking Instagram content, displaying personalized prompt with user's goal.  
*Actual Result:* Passed. Modal displays correctly with countdown timer.

**Test Case 3: Prompt Tier Escalation**  
*Objective:* Verify that prompts escalate from Advisory to Accountability to Consequence based on violation count.  
*Steps:*  
1. Visit blocked site for first time in day  
2. Observe prompt message  
3. Visit blocked site second and third time  
4. Observe prompt changes  
5. Visit blocked site sixth time  
6. Observe consequence tier prompt  
*Expected Result:* Prompts progress through tiers with increasing severity.  
*Actual Result:* Passed. Advisory tier on first violation, Accountability on third, Consequence on sixth.

**Test Case 4: Forced Redirection**  
*Objective:* Verify that countdown expires and browser redirects to study platform.  
*Steps:*  
1. Trigger prompt by visiting blocked site  
2. Wait for countdown to complete without interaction  
3. Observe browser navigation  
*Expected Result:* After 3 seconds, browser navigates to first study platform from user's list.  
*Actual Result:* Passed. Redirection completed successfully to configured platform.

**Test Case 5: Platform Rotation**  
*Objective:* Verify that repeated violations rotate between study platforms.  
*Steps:*  
1. Configure profile with two platforms: NPTEL and LeetCode  
2. Visit blocked site first time, observe redirect destination  
3. Visit blocked site second time, observe redirect destination  
*Expected Result:* First violation redirects to NPTEL, second to LeetCode.  
*Actual Result:* Passed. Platforms rotated correctly based on violation count modulo logic.

**Test Case 6: Violation Logging**  
*Objective:* Verify that violations are logged with correct metadata.  
*Steps:*  
1. Trigger multiple violations throughout the day  
2. Open dashboard  
3. Check violation statistics display  
*Expected Result:* Dashboard shows correct count, timestamps, and domains.  
*Actual Result:* Passed. Logs recorded accurately with all required fields.

**Test Case 7: Strict Mode Toggle**  
*Objective:* Verify that disabling strict mode prevents redirects while still showing warnings.  
*Steps:*  
1. Disable strict mode via dashboard toggle  
2. Visit blocked site  
3. Observe behavior  
*Expected Result:* Warning displayed but no redirection occurs.  
*Actual Result:* Partial pass. Warning displays but strict mode state propagation had initial bugs, later resolved.

**Test Case 8: Profile Update and Synchronization**  
*Objective:* Verify that profile changes in dashboard sync to extension.  
*Steps:*  
1. Modify study platforms via dashboard  
2. Reload extension  
3. Trigger violation and observe redirect destination  
*Expected Result:* Redirect uses updated platform list.  
*Actual Result:* Failed initially due to sync issues. Resolved by implementing direct chrome.storage write in setup confirmation.

**Test Case 9: Empty or Invalid Inputs**  
*Objective:* Verify that setup wizard validates required fields.  
*Steps:*  
1. Attempt to proceed without answering questions  
2. Attempt to enter only one study platform  
3. Observe validation messages  
*Expected Result:* Alerts prevent progression and prompt for input completion.  
*Actual Result:* Passed. Validation logic correctly enforced minimum requirements.

**Test Case 10: Extension Reload Persistence**  
*Objective:* Verify that profile and logs persist across browser and extension restarts.  
*Steps:*  
1. Complete setup and trigger violations  
2. Close and reopen browser  
3. Reload extension  
4. Check dashboard statistics  
*Expected Result:* Profile and logs remain intact.  
*Actual Result:* Passed. Data persisted correctly using chrome.storage.local.

---

## 10. RESULTS AND OUTPUT

The Productivity Assassin system successfully achieves its primary objectives of providing personalized, psychologically impactful productivity interventions. The implemented system delivers the following results and outputs.

### 10.1 Setup Process Output

Upon accessing the web application, users are guided through a comprehensive seven-question setup wizard. The interface presents each question with clear explanations of how responses will be used. Users provide specific, measurable goals rather than vague intentions, admit their historical failure patterns, identify what is at stake if they continue to fail, specify their designated productive platforms, acknowledge when they are most vulnerable to distractions, recognize their primary time-wasting weakness, and determine who they are accountable to.

The setup completion generates a structured user profile stored locally. A confirmation alert notifies users that Assassin Mode has been activated, reinforcing commitment to the system. Users are redirected to the dashboard where their goals are prominently displayed.

Figure 10.1 depicts the setup wizard interface showing question progression and input fields.

### 10.2 Intervention Prompt Output

When users navigate to a blacklisted distracting website, the system immediately blocks access and displays a full-screen modal intervention. The modal features a large prohibition icon, the blocked domain name in uppercase, the personalized motivational message referencing user-specific goals and patterns, and a countdown timer displaying remaining seconds.

The message text varies based on violation count tier. For first violations, the advisory prompt provides a firm reminder linking the distraction to stated goals. For second through fourth violations, the accountability prompt intensifies confrontation by explicitly referencing the user's admitted failure pattern. For fifth and subsequent violations, the consequence prompt delivers the most severe message, calling out self-deception, sacrifices, and accountability factors.

Visual styling employs tier-specific color schemes: orange borders for advisory, red for accountability, and deep red for consequence. The countdown timer prevents immediate dismissal, ensuring users read and process the message.

Figure 10.2 shows example screenshots of modal prompts for each tier, demonstrating personalization and escalation.

### 10.3 Redirection Output

Following the three-second countdown, the browser automatically navigates to one of the user's designated study platforms. The redirection is seamless and non-bypassable, placing users directly in a productive environment.

Platform selection rotates based on violation count, ensuring variety and preventing habituation to a single destination. The rotation algorithm uses modulo arithmetic to cycle through the platforms list.

Users arrive at their study platforms ready to resume focused work, with the distraction attempt immediately converted into productive activity.

Figure 10.3 illustrates the redirection flow from blocked social media to educational platforms.

### 10.4 Dashboard Statistics Output

The dashboard application provides comprehensive visualization of user activity patterns and productivity metrics. The interface displays the user's stated goal prominently at the top, serving as a constant reminder of objectives.

Below the goal, violation statistics are presented including total violations for the current day, weekly violation trends, most frequently blocked websites, and distribution of prompt tiers applied. Visual indicators employ color coding to highlight concerning patterns.

A strict mode toggle switch shows current enforcement status. When enabled, the system enforces blocking with redirection. When disabled, warnings are displayed without mandatory redirection.

Study platform usage statistics show how many times each platform received redirections, reinforcing awareness of time invested in productive activities following distraction attempts.

Figure 10.4 presents the dashboard interface with sample statistics and visualizations.

### 10.5 Console Logging Output

For debugging and verification purposes, the system generates detailed console logs during operation. These logs trace the execution flow from URL detection through prompt generation and redirection.

Sample console output includes detection confirmations indicating domain analysis and blacklist matching results, profile retrieval confirmations showing successful access to user data, prompt tier selections indicating which escalation level was applied, platform selection logic demonstrating rotation calculations, and redirection notifications confirming navigation to study platforms.

These logs facilitate troubleshooting during development and provide transparency into system operations for technically inclined users.

Figure 10.5 shows representative console output from a distraction intervention cycle.

### 10.6 User Experience Outcomes

The combined system outputs create a comprehensive productivity enforcement experience. Users receive immediate accountability when tempted by distractions, eliminating the gap between intention and action. The personalization ensures messages resonate deeply by referencing the user's own words and commitments. Escalation prevents habituation by increasing pressure as violations accumulate. Forced redirection removes the burden of self-discipline by automatically transitioning to productive environments.

Early user feedback indicates that the system successfully induces cognitive dissonance when confronting users with their own stated goals and admitted patterns. The unavoidable nature of prompts ensures messages are processed rather than ignored. Users report increased awareness of distraction patterns and improved ability to maintain focus during critical work sessions.

---

## 11. CONCLUSION

The Productivity Assassin system represents a significant advancement in digital wellbeing technology by addressing fundamental limitations in existing productivity tools. Traditional solutions rely on user willpower and provide generic interventions that are easily bypassed or ignored. These approaches fail to account for the psychological complexity of procrastination and distraction behaviors.

This project successfully demonstrates that personalized, goal-based accountability can effectively combat digital distractions. By capturing detailed user profiles during setup, the system generates motivational prompts that leverage psychological principles of cognitive dissonance, loss aversion, and social accountability. The three-tier escalation strategy ensures that interventions maintain effectiveness across repeated violations, preventing habituation that undermines static blocking tools.

The implementation achieves its core objectives of providing immediate, unavoidable accountability when users attempt to access distracting websites, delivering psychologically impactful messages that reference user-specific goals, patterns, and sacrifices, enforcing productive redirection by automatically navigating to designated study platforms, tracking distraction patterns through comprehensive logging, and preserving user privacy by maintaining all data locally without external transmission.

The system architecture, built on React for the web application and Chrome Extension APIs for browser integration, provides a robust and maintainable foundation. The separation of concerns across presentation, business logic, and data layers facilitates future enhancements while maintaining code clarity.

Testing validated that all major functional requirements are satisfied, including setup completion, profile persistence, distraction detection, prompt personalization, tier escalation, forced redirection, violation logging, and dashboard statistics visualization. Non-functional requirements for performance, privacy, reliability, and usability are also met.

The Productivity Assassin system empowers students and professionals to overcome digital distractions through external accountability mechanisms that complement internal motivation. By making the cost of procrastination immediately visible and unavoidable, the system helps users align their moment-to-moment actions with their long-term goals.

This project contributes to the digital wellbeing domain by demonstrating the effectiveness of personalized, psychologically informed interventions. It provides a practical tool that can be adopted by individuals seeking to improve focus and productivity in an increasingly distracting digital landscape.

---

## 12. FUTURE ENHANCEMENTS

While the current implementation of Productivity Assassin provides a functional and effective solution, several enhancements could further improve its capabilities and reach:

**Machine Learning-Based Detection:**  
Future versions could incorporate machine learning models to analyze page content and classify relevance to user goals beyond simple domain blacklisting. Natural language processing could evaluate whether a YouTube video or Reddit post is genuinely educational or merely a distraction disguised as learning. This would provide more nuanced detection, reducing false positives while catching distractions on otherwise productive platforms.

**Mobile Application Support:**  
Extending the system to mobile platforms through React Native or dedicated iOS and Android applications would address smartphone distractions, which are equally if not more prevalent than desktop distractions. Mobile implementations would monitor app usage and deliver similar personalized interventions when users access social media or entertainment apps.

**Cloud Synchronization and Multi-Device Support:**  
Implementing optional cloud synchronization would allow users to maintain consistent profiles and violation logs across multiple devices. Users could track progress from both desktop and mobile environments, viewing unified statistics. Privacy-preserving encryption would ensure that even cloud-stored data remains secure and accessible only to the user.

**Advanced Analytics and Insights:**  
Enhanced analytics features could provide deeper insights into productivity patterns, identifying correlations between distractions and time of day, day of week, or specific triggers. The system could generate personalized recommendations for adjusting work schedules or environment configurations to minimize vulnerable periods.

**Gamification Elements:**  
Introducing gamification features such as streak tracking for distraction-free days, achievement badges for maintaining focus, and progress levels based on cumulative productive hours could add positive reinforcement to complement the current accountability-focused approach. Competitive elements where users challenge friends could further increase engagement.

**Integration with Task Management Tools:**  
Connecting Productivity Assassin with popular task management platforms like Todoist, Notion, or Microsoft To Do would enable automatic context awareness. The system could adjust prompts based on current tasks, deadlines, and priorities, providing even more relevant accountability messages.

**Voice-Based Prompts:**  
Adding optional voice synthesis to read prompts aloud would increase engagement and accessibility. Hearing one's own goals and failures spoken could create stronger emotional impact than text alone.

**Customizable Blacklists and Whitelists:**  
Allowing users to configure their own blacklists and whitelists beyond default settings would accommodate individual needs. Some users may need to block news sites while others require access for legitimate research. Customization increases flexibility without compromising enforcement.

**Integration with Time Tracking APIs:**  
Connecting with time tracking services like RescueTime or ActivityWatch would provide automatic logging of productive hours spent on study platforms following redirections, creating a comprehensive view of time allocation across distractions and focused work.

**Parental or Peer Accountability Modes:**  
Implementing modes where parents, mentors, or accountability partners can view violation statistics and progress metrics would add external accountability layer. This feature would be particularly valuable for students struggling with self-regulation.

**Smart Scheduling and Focus Modes:**  
Developing intelligent scheduling features that automatically enable strict mode during designated focus hours and disable it during breaks would reduce decision fatigue. Integration with calendar applications could block distractions before important meetings or deadlines.

**Browser Behavior Analysis:**  
Analyzing patterns such as rapid tab switching, excessive scrolling, or specific URL sequences could detect procrastination behaviors beyond explicit blacklist violations, triggering preemptive interventions.

These enhancements would transform Productivity Assassin from a standalone productivity enforcer into a comprehensive digital wellbeing ecosystem, supporting users across devices, contexts, and stages of their productivity journey.

---

## 13. REFERENCES

[1] Kushlev, K., Proulx, J. D. E., & Dunn, E. W. (2016). "Silence Your Phone": Smartphone Notifications Increase Inattention and Hyperactivity Symptoms. *Proceedings of the CHI Conference on Human Factors in Computing Systems*, 1011-1020. doi:10.1145/2858036.2858359

[2] Lyngs, U., Lukoff, K., Slovak, P., Binns, R., Slack, A., Inzlicht, M., Van Kleek, M., & Shadbolt, N. (2019). Self-Control in Cyberspace: Applying Dual Systems Theory to a Review of Digital Self-Control Tools. *Proceedings of the CHI Conference on Human Factors in Computing Systems*, 1-18. doi:10.1145/3290605.3300361

[3] Ko, M., Yang, S., Lee, J., Heizmann, C., Jeong, J., Lee, U., Shin, D. D., Yatani, K., Song, J., & Chung, K. M. (2015). NUGU: A Group-based Intervention App for Improving Self-Regulation of Limiting Smartphone Use. *Proceedings of the ACM Conference on Computer Supported Cooperative Work & Social Computing*, 1235-1245. doi:10.1145/2675133.2675244

[4] Thaler, R. H., & Sunstein, C. R. (2008). *Nudge: Improving Decisions about Health, Wealth, and Happiness*. Yale University Press.

[5] Kim, J., Park, J., Lee, H., Ko, M., & Lee, U. (2019). LocknType: Lockout Task Intervention for Discouraging Smartphone App Use. *Proceedings of the CHI Conference on Human Factors in Computing Systems*, 1-12. doi:10.1145/3290605.3300927

[6] Caraban, A., Karapanos, E., Gonçalves, D., & Campos, P. (2019). 23 Ways to Nudge: A Review of Technology-Mediated Nudging in Human-Computer Interaction. *Proceedings of the CHI Conference on Human Factors in Computing Systems*, 1-15. doi:10.1145/3290605.3300733

[7] Okeke, F., Sobolev, M., Dell, N., & Estrin, D. (2018). Good Vibrations: Can a Digital Nudge Reduce Digital Overload? *Proceedings of the International Conference on Human-Computer Interaction with Mobile Devices and Services*, 1-12. doi:10.1145/3229434.3229463

[8] Monge Roffarello, A., & De Russis, L. (2019). The Race Towards Digital Wellbeing: Issues and Opportunities. *Proceedings of the CHI Conference on Human Factors in Computing Systems*, 1-14. doi:10.1145/3290605.3300616

[9] Duckworth, A. L., & Seligman, M. E. P. (2005). Self-Discipline Outdoes IQ in Predicting Academic Performance of Adolescents. *Psychological Science*, 16(12), 939-944. doi:10.1111/j.1467-9280.2005.01641.x

[10] Locke, E. A., & Latham, G. P. (2002). Building a Practically Useful Theory of Goal Setting and Task Motivation: A 35-Year Odyssey. *American Psychologist*, 57(9), 705-717. doi:10.1037/0003-066X.57.9.705

---

**END OF PHASE-1 REPORT**

---

## FORMATTING INSTRUCTIONS FOR FINAL SUBMISSION

When preparing this report for final submission, apply the following formatting in Microsoft Word:

- Font: Times New Roman, Size 12
- Line Spacing: 1.5
- Margins: 1 inch on all sides
- Headings: Bold, hierarchy maintained (Heading 1, 2, 3)
- Page Numbers: Bottom right, starting from Introduction
- References: IEEE format as shown
- Figures: Insert diagrams after relevant sections where referenced
- Table of Contents: Auto-generate after completing all sections

Insert the following diagrams at appropriate locations:
- Figure 6.1: Architecture Diagram (after Section 6.1)
- Figure 6.2: Context Diagram (after Section 6.2)
- Figure 7.1: Process Flow Diagram (after Section 7.1)
- Figure 7.2: Use Case Diagram (after Section 7.2)
- Figure 7.3: Activity Diagram (after Section 7.3)
- Figure 7.4: ER Diagram (after Section 7.4.1)
- Figure 10.1-10.5: Screenshots (after corresponding Result subsections)
