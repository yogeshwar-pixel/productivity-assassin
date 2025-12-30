## 7. IMPLEMENTATION

This section presents the core algorithms implemented in the Productivity Assassin system using pseudo code notation. Each algorithm is accompanied by a brief description explaining its purpose and key logic.

---

### 7.1 Pseudo Code with Description

The following pseudo code algorithms represent the critical implementation logic extracted from the JavaScript codebase. The notation follows structured programming conventions with clear control flow and data structures.

---

#### **Algorithm 1: Profile Creation and Validation**

```
ALGORITHM CreateUserProfile(answers)
INPUT: answers (object containing 7 user responses)
OUTPUT: validatedProfile (UserProfile object) OR error

BEGIN
    // Validate required fields
    IF answers.realGoal is empty OR length < 5 THEN
        RETURN error "Goal required (minimum 5 characters)"
    END IF
    
    // Parse study platforms
    platformsList ← answers.studyPlatforms
    IF length(platformsList) < 2 THEN
        RETURN error "Minimum 2 study platforms required"
    END IF
    
    parsedPlatforms ← []
    FOR EACH platformStr IN platformsList DO
        // Add protocol if missing
        IF NOT platformStr.startsWith("http://") AND NOT platformStr.startsWith("https://") THEN
            url ← "https://" + platformStr
        ELSE
            url ← platformStr
        END IF
        
        // Extract domain name
        domain ← EXTRACT_DOMAIN(url)  // Using regex pattern
        name ← CAPITALIZE(domain.split('.')[0])
        
        ADD {name: name, url: url} TO parsedPlatforms
    END FOR
    
    // Construct profile object
    profile ← {
        realGoal: answers.realGoal,
        failurePattern: answers.failurePattern,
        sacrifice: answers.sacrifice,
        studyPlatforms: parsedPlatforms,
        weakTime: answers.weakTime,
        mainDistraction: answers.mainDistraction,
        accountability: answers.accountability,
        tone: answers.tone OR "Tough",
        createdAt: CURRENT_TIMESTAMP()
    }
    
    // Persist to dual storage
    CALL WriteToAsyncStorage("userProfile", profile)
    CALL PostMessageToExtension({type: "PROFILE_SYNC", profile: profile})
    
    RETURN profile
END
```

**Description:**  
This algorithm validates user input from the 7-question setup wizard, parses study platform URLs (adding HTTPS protocol if missing), constructs a structured profile object with 9 fields, and persists data to both AsyncStorage (web app) and chrome.storage.local (extension) via message passing for redundancy.

---

#### **Algorithm 2: Blacklist Detection**

```
ALGORITHM DetectBlacklistedSite(url)
INPUT: url (string, current page URL)
OUTPUT: isBlocked (boolean)

BEGIN
    // Predefined blacklist
    blacklist ← [
        "instagram.com", "facebook.com", "twitter.com", "x.com",
        "youtube.com", "reddit.com", "tiktok.com", "snapchat.com",
        "twitch.tv", "pinterest.com", "linkedin.com", "netflix.com",
        "hulu.com", "disneyplus.com", "cnn.com", "bbc.com", "nytimes.com"
    ]
    
    // Extract and normalize domain
    domain ← EXTRACT_HOSTNAME(url)           // e.g., "www.Instagram.com"
    normalizedDomain ← LOWERCASE(domain)     // → "www.instagram.com"
    normalizedDomain ← REMOVE_PREFIX(normalizedDomain, "www.")  // → "instagram.com"
    
    // O(1) lookup using Set data structure
    blacklistSet ← CONVERT_TO_SET(blacklist)
    isBlocked ← blacklistSet.contains(normalizedDomain)
    
    RETURN isBlocked
END
```

**Description:**  
This algorithm performs efficient blacklist matching by extracting the hostname from the current URL, normalizing it (lowercase, stripping "www." prefix), and checking membership in a predefined set of 17 distraction domains using O(1) hash-based lookup for performance.

---

#### **Algorithm 3: Tier Selection Based on Violation Count**

```
ALGORITHM DetermineTier(violationCount)
INPUT: violationCount (integer, daily violations)
OUTPUT: tier (string: "advisory", "accountability", or "consequence")

BEGIN
    IF violationCount <= 1 THEN
        tier ← "advisory"           // Tier 1: First-time or second violation
    ELSE IF violationCount <= 4 THEN
        tier ← "accountability"     // Tier 2: Pattern emerging (2-4 violations)
    ELSE
        tier ← "consequence"        // Tier 3: Chronic issue (5+ violations)
    END IF
    
    RETURN tier
END
```

**Description:**  
This simple threshold-based algorithm categorizes violation severity into three escalating tiers based on daily count, supporting adaptive intervention intensity (gentle reminders → accountability pressure → severe consequences) to prevent habituation.

---

#### **Algorithm 4: Personalized Prompt Generation**

```
ALGORITHM GeneratePrompt(tier, profile, blockedDomain, count)
INPUT: tier (string), profile (UserProfile object), blockedDomain (string), count (integer)
OUTPUT: personalizedMessage (string)

BEGIN
    // Define tier-specific templates
    templates ← {
        "advisory": "{domain} has ZERO connection to '{goal}'. {weakTime} is when you always fail. Don't prove it right. Get back to work.",
        
        "accountability": "You admitted: '{failurePattern}'. You're doing it RIGHT NOW. This is violation #{count} today. Stop lying to yourself.",
        
        "consequence": "STOP. LYING. TO. YOURSELF. {sacrifice} is on the line. {accountability} is watching you waste time. This is pathetic. Violation #{count}."
    }
    
    // Select template based on tier
    template ← templates[tier]
    
    // Substitute placeholders with user-specific data
    message ← REPLACE(template, "{domain}", UPPERCASE(blockedDomain))
    message ← REPLACE(message, "{goal}", profile.realGoal)
    message ← REPLACE(message, "{failurePattern}", profile.failurePattern)
    message ← REPLACE(message, "{sacrifice}", profile.sacrifice)
    message ← REPLACE(message, "{accountability}", profile.accountability)
    message ← REPLACE(message, "{weakTime}", profile.weakTime)
    message ← REPLACE(message, "{count}", TO_STRING(count))
    
    RETURN message
END
```

**Description:**  
This template-based algorithm generates personalized confrontational messages by selecting a tier-appropriate template and performing string substitution with user's goal, admitted failures, stakes, and current violation count for psychological impact.

---

#### **Algorithm 5: Modal Rendering and Countdown**

```
ALGORITHM DisplayInterventionModal(promptMessage, tier, onComplete)
INPUT: promptMessage (string), tier (string), onComplete (callback function)
OUTPUT: none (side effect: DOM manipulation)

BEGIN
    // Define tier-specific visual styling
    tierColors ← {
        "advisory": "#ff9500",        // Orange
        "accountability": "#ff3b30",  // Red
        "consequence": "#8B0000"      // Dark red
    }
    
    borderColor ← tierColors[tier]
    pulseAnimation ← (tier == "consequence") ? "pulse 1s infinite" : "none"
    
    // Create modal DOM structure
    modal ← CREATE_ELEMENT("div")
    SET_STYLE(modal, {
        position: "fixed", top: 0, left: 0,
        width: "100vw", height: "100vh",
        background: "rgba(0,0,0,0.95)",
        zIndex: 999999
    })
    
    content ← CREATE_ELEMENT("div")
    SET_STYLE(content, {
        border: "6px solid " + borderColor,
        animation: pulseAnimation
    })
    
    content.innerHTML ← "
        <div style='font-size:48px; text-align:center;'>🚫</div>
        <h2 style='color:#ff3b30;'>" + UPPERCASE(blockedDomain) + " BLOCKED</h2>
        <p style='font-size:24px;'>" + promptMessage + "</p>
        <p>Redirecting in <span id='timer'>3</span>...</p>
    "
    
    APPEND(modal, content)
    APPEND(document.body, modal)
    
    // Execute 3-second countdown
    secondsRemaining ← 3
    timerElement ← GET_ELEMENT_BY_ID("timer")
    
    countdownInterval ← SET_INTERVAL(FUNCTION() {
        secondsRemaining ← secondsRemaining - 1
        timerElement.textContent ← TO_STRING(secondsRemaining)
        
        IF secondsRemaining <= 0 THEN
            CLEAR_INTERVAL(countdownInterval)
            CALL onComplete()  // Trigger redirection
        END IF
    }, 1000)  // Execute every 1000ms
    
    // Prevent dismissal
    BLOCK_ESCAPE_KEY()
    BLOCK_CLICK_OUTSIDE()
END
```

**Description:**  
This algorithm constructs a full-screen, non-dismissible modal overlay using DOM manipulation, applies tier-specific visual styling (colors, pulsing animation for Tier 3), displays the personalized prompt, and executes a 3-second countdown before triggering the redirection callback.

---

#### **Algorithm 6: Study Platform Rotation**

```
ALGORITHM SelectStudyPlatform(violationCount, platforms)
INPUT: violationCount (integer), platforms (array of {name, url} objects)
OUTPUT: redirectURL (string)

BEGIN
    // Handle edge case: no platforms defined
    IF platforms is empty OR platforms is null THEN
        redirectURL ← "https://www.khanacademy.org"  // Fallback
        LOG_WARNING("No study platforms, using fallback")
        RETURN redirectURL
    END IF
    
    // Modulo-based rotation ensures fair distribution
    platformIndex ← violationCount MOD length(platforms)
    
    selectedPlatform ← platforms[platformIndex]
    redirectURL ← selectedPlatform.url
    
    LOG_INFO("Selected platform " + (platformIndex + 1) + "/" + length(platforms) + 
             ": " + selectedPlatform.name + " (" + redirectURL + ")")
    
    RETURN redirectURL
END
```

**Description:**  
This algorithm implements fair rotation across user-defined study platforms using modulo arithmetic (index = count % platformCount), ensuring each platform receives approximately equal redirections over time, with fallback to Khan Academy if platform array is empty.

---

#### **Algorithm 7: Violation Logging**

```
ALGORITHM LogViolationEvent(domain, redirectURL, tier, count)
INPUT: domain (string), redirectURL (string), tier (string), count (integer)
OUTPUT: none (side effect: storage write)

BEGIN
    // Get current date in YYYY-MM-DD format
    currentDate ← FORMAT_DATE(CURRENT_DATE(), "YYYY-MM-DD")
    
    // Construct log entry
    logEntry ← {
        timestamp: CURRENT_TIMESTAMP_ISO8601(),
        blockedDomain: domain,
        redirectURL: redirectURL,
        promptTier: tier,
        dailyCount: count,
        fallback: (redirectURL == "https://www.khanacademy.org"),
        strictModeOverride: false
    }
    
    // Retrieve existing logs for today
    storageKey ← "violationLog_" + currentDate
    todayLogs ← READ_FROM_STORAGE(storageKey) OR []
    
    // Append new entry
    APPEND(todayLogs, logEntry)
    
    // Persist updated logs
    WRITE_TO_STORAGE(storageKey, todayLogs)
    
    // Update daily count
    countKey ← "violationCount_" + currentDate
    WRITE_TO_STORAGE(countKey, count)
    
    LOG_DEBUG("Logged violation #" + count + " for " + currentDate)
END
```

**Description:**  
This algorithm creates a structured log entry with timestamp, domain, tier, and metadata, retrieves today's existing log array from storage (keyed by date), appends the new entry, and persists both the updated log and incremented violation count for dashboard analytics.

---

#### **Algorithm 8: Dashboard Statistics Computation**

```
ALGORITHM ComputeStatistics(profileData, logData)
INPUT: profileData (UserProfile object), logData (array of ViolationLog arrays)
OUTPUT: statistics (object containing daily count, weekly trend, top domains, tier distribution)

BEGIN
    currentDate ← FORMAT_DATE(CURRENT_DATE(), "YYYY-MM-DD")
    
    // Flatten all logs into single array
    allLogs ← FLATTEN(logData)
    
    // 1. Daily count: Filter logs matching today's date
    todayLogs ← FILTER(allLogs, FUNCTION(log) {
        RETURN log.timestamp.startsWith(currentDate)
    })
    dailyCount ← length(todayLogs)
    
    // 2. Weekly trend: Group by date for last 7 days
    weeklyData ← []
    FOR i ← 0 TO 6 DO
        date ← SUBTRACT_DAYS(CURRENT_DATE(), i)
        dateStr ← FORMAT_DATE(date, "YYYY-MM-DD")
        dateLogs ← FILTER(allLogs, FUNCTION(log) {
            RETURN log.timestamp.startsWith(dateStr)
        })
        APPEND(weeklyData, {date: dateStr, count: length(dateLogs)})
    END FOR
    
    // 3. Top blocked domains: Frequency count
    domainFrequency ← {}  // Map: domain → count
    FOR EACH log IN allLogs DO
        domain ← log.blockedDomain
        IF domain IN domainFrequency THEN
            domainFrequency[domain] ← domainFrequency[domain] + 1
        ELSE
            domainFrequency[domain] ← 1
        END IF
    END FOR
    
    topDomains ← SORT_BY_VALUE_DESC(domainFrequency)
    topThree ← TAKE_FIRST(topDomains, 3)
    
    // 4. Tier distribution: Count by tier
    tierCounts ← {advisory: 0, accountability: 0, consequence: 0}
    FOR EACH log IN allLogs DO
        tier ← log.promptTier
        tierCounts[tier] ← tierCounts[tier] + 1
    END FOR
    
    totalViolations ← length(allLogs)
    tierPercentages ← {
        advisory: (tierCounts.advisory / totalViolations) * 100,
        accountability: (tierCounts.accountability / totalViolations) * 100,
        consequence: (tierCounts.consequence / totalViolations) * 100
    }
    
    // Return aggregated statistics
    statistics ← {
        goal: profileData.realGoal,
        dailyCount: dailyCount,
        weeklyTrend: weeklyData,
        topDomains: topThree,
        tierDistribution: tierPercentages
    }
    
    RETURN statistics
END
```

**Description:**  
This comprehensive algorithm computes dashboard analytics by processing violation logs: filters today's violations for daily count, groups last 7 days for weekly trends, builds frequency map for top 3 blocked domains, and calculates tier distribution percentages for visualizing intervention escalation patterns.

---

## Summary

The eight algorithms presented demonstrate the core implementation logic of the Productivity Assassin system. Key design decisions include:

1. **Dual Storage Persistence** (Algorithm 1): Redundant writes to AsyncStorage and chrome.storage.local ensure data availability across web app and extension contexts.

2. **Efficient Detection** (Algorithm 2): O(1) Set-based blacklist lookup minimizes performance overhead during real-time URL monitoring (NFR-101: <150ms detection latency).

3. **Progressive Escalation** (Algorithm 3): Simple threshold-based tier selection enables adaptive intervention intensity without complex state machines.

4. **Template-Based Personalization** (Algorithm 4): Deterministic string substitution provides personalization while maintaining testability and avoiding external API dependencies.

5. **Non-Dismissible UI** (Algorithm 5): Modal rendering with blocked user interactions enforces minimum exposure time (3 seconds) as per effortful friction research (Kim et al., 2019).

6. **Fair Distribution** (Algorithm 6): Modulo arithmetic ensures equitable rotation across user-defined study platforms, preventing bias toward specific platforms.

7. **Structured Logging** (Algorithm 7): Date-keyed storage schema enables efficient daily reset and targeted log retrieval for analytics.

8. **Aggregate Analytics** (Algorithm 8): Array manipulation and frequency counting compute meaningful statistics from raw log data without external analytics services.

All algorithms prioritize simplicity, determinism, and privacy preservation (no external network calls) consistent with the client-side-only architectural principle (ADR-001).
