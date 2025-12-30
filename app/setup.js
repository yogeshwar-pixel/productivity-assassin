// app/setup.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const STORAGE_KEY = "assassinProfile";
const GOAL_KEY = "userGoal";

// -----------------------------------------------------------------------------
// QUESTIONS FOR ASSASSIN MODE SETUP
// -----------------------------------------------------------------------------
const QUESTIONS = [
  {
    id: 1,
    question: "What do you want to achieve in the next 30 days?",
    subtitle: "Be specific — not just 'study well', but real, measurable outcomes.",
    explanation: "This will be used when you get distracted: \"Scrolling Instagram won't help you [your answer]\"",
    placeholder: "e.g., Score 85%+ in semester exams and clear all backlogs",
    field: "realGoal",
    examples: [
      "Score 85%+ in semester exams and clear all backlogs",
      "Crack campus placement with 7+ LPA package",
      "Complete DSA practice and get LinkedIn Premium",
      "Clear GATE exam with 600+ marks"
    ]
  },
  {
    id: 2,
    question: "Be honest — why do you keep failing at this goal?",
    subtitle: "What's the real pattern that stops you every time?",
    explanation: "When you break focus repeatedly, I'll remind you: \"You said '[your answer]' — you're proving it right.\"",
    placeholder: "e.g., I scroll reels until 2 AM then wake up late",
    field: "failurePattern",
    examples: [
      "I scroll reels until 2 AM then wake up late and miss classes",
      "I tell myself 'just 5 minutes Instagram' and lose 3 hours",
      "I game with friends when I should be preparing for placement",
      "I waste time on WhatsApp groups instead of studying"
    ]
  },
  {
    id: 3,
    question: "Every hour you waste, what are you losing?",
    subtitle: "What's really at stake if you keep failing?",
    explanation: "This reminds you of consequences: \"While you're on TikTok, you're sacrificing [your answer]\"",
    placeholder: "e.g., My placement chances and my parents' expectations",
    field: "sacrifice",
    examples: [
      "My placement chances and my parents' expectations",
      "Respect from classmates who are already getting offers",
      "My chance to earn and support my family financially",
      "Self-respect because I know I'm capable of better"
    ]
  },
  {
    id: 4,
    question: "Where do you actually study/work when you're productive?",
    subtitle: "List 2-5 websites or platforms you use for REAL work (not distractions)",
    explanation: "When distracted, you'll be redirected ONLY to these sites — not random websites.",
    placeholder: "e.g., nptel.ac.in, leetcode.com, geeksforgeeks.org",
    field: "studyPlatforms",
    isMultiple: true, // Special handling for multiple inputs
    examples: [
      "NPTEL (nptel.ac.in) - course videos",
      "LeetCode (leetcode.com) - coding practice",
      "GeeksforGeeks (geeksforgeeks.org) - DSA practice",
      "Your college portal",
      "Unacademy, Coursera, HackerRank, CodeChef"
    ]
  },
  {
    id: 5,
    question: "When are you most likely to get distracted?",
    subtitle: "Be specific about your weakest hours or situations.",
    explanation: "During these times, prompts will be stricter to protect your focus.",
    placeholder: "e.g., 9-11 PM after dinner, before sleeping",
    field: "weakTime",
    examples: [
      "9-11 PM after dinner, before sleeping",
      "Sundays especially, can't focus on studying",
      "One week before exams when pressure peaks",
      "During sem breaks when I have 'plenty of time'"
    ]
  },
  {
    id: 6,
    question: "What's your #1 time-wasting weakness?",
    subtitle: "The thing that steals the most hours from your day?",
    explanation: "This will be blocked first and mentioned in every harsh prompt.",
    placeholder: "e.g., Instagram Reels",
    field: "mainDistraction",
    examples: [
      "Instagram Reels (especially trending/dance ones)",
      "YouTube Shorts or gaming videos",
      "WhatsApp group chats with college friends",
      "Discord or online gaming (BGMI/Valorant)"
    ]
  },
  {
    id: 7,
    question: "If you fail this goal, who will be most disappointed?",
    subtitle: "Who expects better from you?",
    explanation: "Used in tough prompts: \"You're letting down [your answer]\"",
    placeholder: "e.g., My parents who took loan for my college fees",
    field: "accountability",
    examples: [
      "My parents who invested everything in my education",
      "My parents who took loan for my college fees",
      "Teachers who believed I could crack placement",
      "Myself — I promised I'd get placed and help family"
    ]
  },
  {
    id: 8,
    question: "How do you want me to talk to you when you fall?",
    subtitle: "Choose your accountability tone",
    field: "mode",
    choices: ["Firm (no fluff)", "Tough (call you out)", "Merciless (push hard)"]
  }
];

// ---------------------------------------------------------------------------
// URL VALIDATION FUNCTION
// ---------------------------------------------------------------------------
function validatePlatformUrl(input) {
  try {
    let url = input.trim();

    // Empty check
    if (!url) {
      return { valid: false, error: 'URL cannot be empty' };
    }

    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // Parse URL
    const urlObj = new URL(url);

    // Validation rules
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return { valid: false, error: 'Must be HTTP or HTTPS URL' };
    }

    // Reject localhost and IP addresses
    if (urlObj.hostname === 'localhost' ||
      urlObj.hostname.match(/^\d+\.\d+\.\d+\.\d+$/) ||
      urlObj.hostname.match(/^\[.*\]$/)) { // IPv6
      return { valid: false, error: 'Cannot use localhost or IP addresses' };
    }

    // Check for valid TLD (basic check)
    const parts = urlObj.hostname.split('.');
    if (parts.length < 2) {
      return { valid: false, error: 'Invalid domain - must have extension (e.g., .com, .edu)' };
    }

    const tld = parts[parts.length - 1];
    if (tld.length < 2 || !tld.match(/^[a-z]+$/i)) {
      return { valid: false, error: 'Invalid domain extension' };
    }

    // Check hostname is not empty
    if (!urlObj.hostname || urlObj.hostname === '') {
      return { valid: false, error: 'Invalid hostname' };
    }

    return {
      valid: true,
      url: url,
      hostname: urlObj.hostname,
      displayName: parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
    };
  } catch (e) {
    return { valid: false, error: 'Invalid URL format. Example: mysite.com or https://portal.myorg.edu' };
  }
}

export default function Setup() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [studyPlatformInputs, setStudyPlatformInputs] = useState(["", "", "", "", ""]);
  const [loadingSaved, setLoadingSaved] = useState(true);

  // ---------------------------------------------------------------------------
  // LOAD ANY PREVIOUS SETUP
  // ---------------------------------------------------------------------------
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);

        if (raw) {
          setAnswers(JSON.parse(raw));
        } else {
          const savedGoal = await AsyncStorage.getItem(GOAL_KEY);
          if (savedGoal) setAnswers((prev) => ({ ...prev, goal: savedGoal }));
        }
      } catch (err) {
        console.warn("Failed to load saved data:", err);
      } finally {
        setLoadingSaved(false);
      }
    })();
  }, []);

  const q = QUESTIONS[index];

  const setAnswer = (field, value) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  };
  // ---------------------------------------------------------------------------
  // NEXT QUESTION HANDLER
  // ---------------------------------------------------------------------------
  const next = () => {
    const current = QUESTIONS[index];
    const val = answers[current.field];

    // For study platforms, check if at least 2 are filled
    if (current.isMultiple) {
      const filled = (val || []).filter(v => v && v.trim()).length;
      if (filled < 2) {
        window.alert("Need at least 2 platforms\nAdd at least 2 study platforms to continue.");
        return;
      }
    } else if (!val || String(val).trim() === "") {
      window.alert("Answer Required\nBe honest. Fill this to continue.");
      return;
    }

    if (index < QUESTIONS.length - 1) setIndex(index + 1);
    else setIndex(QUESTIONS.length); // move to review page
  };

  const back = () => {
    if (index > 0) setIndex(index - 1);
    else router.back();
  };

  // SAVE PROGRESS CONTINUOUSLY
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
  }, [answers]);

  // ---------------------------------------------------------------------------
  // FINAL SAVE + ACTIVATE
  // ---------------------------------------------------------------------------
  const confirmAndActivate = async () => {
    console.log('🔵 Activate button clicked');
    console.log('📋 Current answers:', answers);

    if (!answers.realGoal || !answers.mode) {
      console.log('❌ Validation failed:', { realGoal: answers.realGoal, mode: answers.mode });
      window.alert("Incomplete: Goal and tone must be filled.");
      return;
    }

    const finalProfile = {
      ...answers,
      assassinMode: true,
      activatedAt: new Date().toISOString(),
    };

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(finalProfile));
      await AsyncStorage.setItem(GOAL_KEY, answers.realGoal);

      // SYNC PROFILE TO CHROME EXTENSION
      // Map setup answers to extension profile format
      // Parse study platforms into array of {name, url} objects
      const studyPlatformsList = answers.studyPlatforms || [];
      console.log('📚 Raw study platforms from answers:', studyPlatformsList);

      const parsedPlatforms = [];
      const invalidPlatforms = [];

      for (const platformStr of studyPlatformsList) {
        if (!platformStr || !platformStr.trim()) continue;

        const validation = validatePlatformUrl(platformStr);

        if (validation.valid) {
          parsedPlatforms.push({
            name: validation.displayName,
            url: validation.url
          });
          console.log(`✅ Valid platform: ${validation.displayName} → ${validation.url}`);
        } else {
          invalidPlatforms.push({
            input: platformStr,
            error: validation.error
          });
          console.warn(`❌ Invalid platform: "${platformStr}" - ${validation.error}`);
        }
      }

      // Alert user if some platforms were invalid
      if (invalidPlatforms.length > 0) {
        const errorMsg = invalidPlatforms
          .map(p => `• ${p.input}\n  ${p.error}`)
          .join('\n\n');

        window.alert(
          `⚠️ Some platforms were invalid:\n\n${errorMsg}\n\n` +
          `${parsedPlatforms.length > 0 ? `Continuing with ${parsedPlatforms.length} valid platform(s).` : 'Cannot proceed without valid platforms.'}`
        );

        if (parsedPlatforms.length === 0) {
          return; // Don't save if no valid platforms
        }
      }

      console.log('✅ Parsed platforms:', parsedPlatforms);

      const extensionProfile = {
        realGoal: answers.realGoal || 'your goals',
        failurePattern: answers.failurePattern || 'getting distracted',
        sacrifice: answers.sacrifice || 'your future',
        studyPlatforms: parsedPlatforms, // Use parsed platforms (could be empty)
        weakTime: answers.weakTime || 'evenings',
        mainDistraction: answers.mainDistraction || 'social media',
        accountability: answers.accountability || 'yourself',
        tone: answers.mode || 'Tough',
        createdAt: new Date().toISOString()
      };

      // Send to extension via postMessage (extension will listen and save to chrome.storage)
      console.log('📤 Sending profile to Chrome extension...');

      // WAIT FOR CONFIRMATION from extension
      const syncPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.warn('⏱️ Extension sync timeout (5s) - extension may not be loaded');
          reject('timeout');
        }, 5000);

        const listener = (event) => {
          if (event.data &&
            event.data.source === 'productivity-assassin-extension' &&
            event.data.type === 'PROFILE_SYNCED' &&
            event.data.success) {
            console.log('✅ Extension confirmed profile received!');
            clearTimeout(timeout);
            window.removeEventListener('message', listener);
            resolve(true);
          }
        };

        window.addEventListener('message', listener);
      });

      // Send profile - FORCE STRICT MODE ON SETUP
      window.postMessage({
        source: 'productivity-assassin-app',
        type: 'SYNC_PROFILE',
        profile: extensionProfile,
        strictMode: true,
        violationCount: 0
      }, '*');

      console.log('✅ Profile sent via postMessage:', extensionProfile);

      // Wait for confirmation or timeout
      try {
        await syncPromise;
        console.log('✅ Profile sync confirmed by extension');
      } catch (error) {
        console.warn('⚠️ Extension may not be installed or responding');
        console.warn('💡 User can still proceed - profile saved locally');
        console.warn('💡 User should install Chrome extension from: d:\\Projects\\productivity-assassin\\chrome-extension');
      }

      // CRITICAL: ALSO save directly to chrome.storage if available
      // This ensures profile reaches extension even if postMessage fails
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        try {
          chrome.storage.local.set({
            userProfile: extensionProfile,
            violationCount: 0,  // Reset violation count
            strictMode: true    // Force Strict Mode ON
          }, () => {
            if (chrome.runtime.lastError) {
              console.error('Chrome storage error:', chrome.runtime.lastError);
            } else {
              console.log('✅ Profile saved DIRECTLY to chrome.storage.local');
              console.log('📚 Study platforms in storage:', extensionProfile.studyPlatforms);
            }
          });
        } catch (err) {
          console.error('Failed to save to chrome.storage:', err);
        }
      }

      // Use window.alert for web compatibility
      window.alert("✅ Assassin Mode Activated!\n\nGood. No more excuses.");
      router.push("/dashboard");

    } catch (err) {
      console.error('❌ Save Error:', err);
      window.alert(`Save Error: Couldn't save your profile\n${err.message}`);
    }
  };

  // ---------------------------------------------------------------------------
  // REVIEW PAGE
  // ---------------------------------------------------------------------------
  const Review = () => (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text
        style={{
          color: "#ff6666",
          fontSize: 22,
          fontWeight: "700",
          marginBottom: 15,
        }}
      >
        Review — Confirm Your Answers
      </Text>

      {QUESTIONS.map((qq) => (
        <View key={qq.id} style={{ marginBottom: 12 }}>
          <Text style={{ color: "#ccc" }}>{qq.question}</Text>
          <Text style={{ color: "#fff", marginTop: 6 }}>
            {qq.field === 'studyPlatforms'
              ? (answers[qq.field] || []).join(', ') || "—"
              : answers[qq.field] || "—"}
          </Text>
        </View>
      ))}

      <View style={{ height: 20 }} />

      <Button title="Edit Answers" onPress={() => setIndex(0)} />
      <View style={{ height: 10 }} />

      <Button title="Activate Assassin Mode" onPress={confirmAndActivate} />
    </ScrollView>
  );

  // ---------------------------------------------------------------------------
  // LOADING
  // ---------------------------------------------------------------------------
  if (loadingSaved) {
    return (
      <View
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <Text>Loading...</Text>
      </View>
    );
  }

  // ---------------------------------------------------------------------------
  // SHOW REVIEW PAGE
  // ---------------------------------------------------------------------------
  if (index >= QUESTIONS.length) return <Review />;

  // ---------------------------------------------------------------------------
  // RENDER CURRENT QUESTION
  // ---------------------------------------------------------------------------
  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#000" }}>
      <Text
        style={{
          color: "#ff6666",
          fontSize: 22,
          fontWeight: "900",
          marginBottom: 10,
        }}
      >
        ASSASSIN MODE — Setup
      </Text>

      <Text style={{ color: "#999", marginBottom: 20 }}>
        These answers shape the tough-love prompts you’ll get when you slack.
      </Text>

      <ScrollView>
        <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold", marginBottom: 5 }}>
          {q.question}
        </Text>

        {q.subtitle && (
          <Text style={{ color: "#aaa", fontSize: 14, marginBottom: 10 }}>
            {q.subtitle}
          </Text>
        )}

        {q.explanation && (
          <View style={{ backgroundColor: "#1a1a1a", padding: 12, borderRadius: 8, marginBottom: 15, borderLeftWidth: 3, borderLeftColor: "#ff6666" }}>
            <Text style={{ color: "#999", fontSize: 12 }}>
              💡 {q.explanation}
            </Text>
          </View>
        )}

        {q.isMultiple ? (
          <View>
            <Text style={{ color: "#ccc", fontSize: 13, marginBottom: 8 }}>Enter 2-5 platforms:</Text>
            {studyPlatformInputs.map((val, idx) => (
              <TextInput
                key={idx}
                value={val}
                onChangeText={(t) => {
                  const newInputs = [...studyPlatformInputs];
                  newInputs[idx] = t;
                  setStudyPlatformInputs(newInputs);
                  setAnswer(q.field, newInputs.filter(v => v.trim()));
                }}
                placeholder={`Platform ${idx + 1} (e.g., leetcode.com)`}
                placeholderTextColor="#666"
                style={{
                  backgroundColor: "#111",
                  color: "#fff",
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              />
            ))}
            {q.examples && (
              <View style={{ marginTop: 8, backgroundColor: "#0a0a0a", padding: 10, borderRadius: 6 }}>
                <Text style={{ color: "#666", fontSize: 11, marginBottom: 4 }}>Examples:</Text>
                {q.examples.map((ex, i) => (
                  <Text key={i} style={{ color: "#888", fontSize: 10 }}>• {ex}</Text>
                ))}
              </View>
            )}
          </View>
        ) : q.choices ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {q.choices.map((c) => {
              const selected = answers[q.field] === c;
              return (
                <TouchableOpacity
                  key={c}
                  onPress={() => setAnswer(q.field, c)}
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    backgroundColor: selected ? "#ff6666" : "#222",
                    marginRight: 8,
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ color: selected ? "#000" : "#fff" }}>{c}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View>
            <TextInput
              value={answers[q.field] || ""}
              onChangeText={(t) => setAnswer(q.field, t)}
              placeholder={q.placeholder}
              placeholderTextColor="#666"
              style={{
                backgroundColor: "#111",
                color: "#fff",
                padding: 12,
                borderRadius: 8,
                minHeight: 60,
              }}
              multiline
            />
            {q.examples && (
              <View style={{ marginTop: 8, backgroundColor: "#0a0a0a", padding: 10, borderRadius: 6 }}>
                <Text style={{ color: "#666", fontSize: 11, marginBottom: 4 }}>Examples:</Text>
                {q.examples.slice(0, 3).map((ex, i) => (
                  <Text key={i} style={{ color: "#888", fontSize: 10 }}>• {ex}</Text>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 30,
        }}
      >
        <Button title="Back" onPress={back} />
        <Button
          title={index === QUESTIONS.length - 1 ? "Review" : "Next"}
          onPress={next}
        />
      </View>

      <Text style={{ color: "#666", marginTop: 15, fontSize: 12 }}>
        {index + 1}/{QUESTIONS.length}
      </Text>
    </View>
  );
}
