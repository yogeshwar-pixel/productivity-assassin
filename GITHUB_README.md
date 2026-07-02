# 🎯 Productivity Assassin
### *Focus or Face the Consequences.*

> **A Brutal, Psychology-Driven Focus Enforcement System for the Web.**

![Productivity Assassin Banner](https://via.placeholder.com/1200x500/000000/ff0000?text=PRODUCTIVITY+ASSASSIN)

## 💀 What is This?
**Productivity Assassin** is not your average checklist app. It is a **Client-Side Enforcer** designed to bully you into productivity. It combines a **React Web Dashboard** with a **Chrome Extension** to seize control of your browser environment.

Instead of polite notifications, it uses **psychological pressure**, **public shaming (simulated)**, and **inescapable redirection** to keep you on track.

---

## ⚔️ Key Features

### 1. **The Pressure Board**
*   **Sticky Note UI**: Tasks aren't list items; they are colored sticky notes that scream urgency.
    *   🟢 **Green**: Safe (>3 days left).
    *   🟡 **Yellow**: Warning (1-3 days left).
    *   🔴 **Red**: CRITICAL (Due Today/Tomorrow).
    *   ⚠️ **Dark Red**: OVERDUE (The system gets angry).
*   **Tough Love**: Every task requires a "Motivation" field explaining the stakes (e.g., *"If I fail this, I fail the semester"*).

### 2. **Strict Mode Enforcement**
*   **No Escape**: Once activated, you CANNOT visit blacklisted sites (YouTube, Instagram, etc.).
*   **Forced Redirection**: Accessing a blocked site immediately redirects you to a random **Study Platform** (Coursera, GitHub, etc.).
*   **Advisory -> Consequence Tiers**:
    *   *Strike 1-3*: Gentle warning.
    *   *Strike 4-7*: 15-second mandatory timeout.
    *   *Strike 8+*: **Full Lockdown** / Forced Redirection.

### 3. **Gamified "Mission Control"**
*   **Active Missions**: Lock into ONE task at a time. The entire browser environment adapts to that single goal.
*   **Selectable XP**: Earn XP based on task difficulty (Low/Medium/High/Urgent).

### 4. **Privacy-First (Local Only)**
*   **No Cloud, No Server**: All data (tasks, blacklists, violations) lives in your browser's local storage.
*   **Zero Latency**: Instant feedback and blocking.

---

## 🛠️ Tech Stack
*   **Frontend**: React Native for Web (Expo Router)
*   **Extension**: Chrome Extensions API (Manifest V3)
*   **Storage**: `@react-native-async-storage` + `chrome.storage.local`
*   **Charts**: `react-native-chart-kit`

---

## 🚀 Getting Started

### Prerequisites
*   Node.js & npm
*   Google Chrome (for the extension)

### Installation

1.  **Clone the Repo**
    ```bash
    git clone https://github.com/yourusername/productivity-assassin.git
    cd productivity-assassin
    ```

2.  **Start the Dashboard**
    ```bash
    npm install
    npm run web
    ```
    *The app runs at `http://localhost:8081`.*

3.  **Load the Extension**
    1.  Open Chrome > `chrome://extensions`.
    2.  Enable **Developer Mode** (top right).
    3.  Click **Load Unpacked**.
    4.  Select the `chrome-extension` folder in this project.

---

## 📸 Screenshots

| Pressure Board | Setup Wizard |
|:---:|:---:|
| *(Add Screenshot)* | *(Add Screenshot)* |

| Strict Mode Blocking | Daily Stats |
|:---:|:---:|
| *(Add Screenshot)* | *(Add Screenshot)* |

---

## 🤝 Contributing
Feel free to fork and submit pull requests. If you think the system isn't harsh enough, add a feature to make it meaner.

**License**: MIT
