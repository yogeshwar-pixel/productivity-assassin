import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { Button, Dimensions, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { BarChart } from "react-native-chart-kit";
import ActivityMonitor from "../components/ActivityMonitor";
import RedirectionModal from "../components/RedirectionModal";
import { ActivitySimulator, detectDistractionFromActivity, shouldTriggerAlert } from "../utils/activitySimulator";
import { detectDistraction } from "../utils/distraction";
import { generateGoalOrientedMessage } from "../utils/goalOrientedPrompts";
import VisibilityTracker from "../utils/visibilityTracker";








export default function Dashboard() {
  const router = useRouter();
  const [sessions, setSessions] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [profile, setProfile] = useState(null);
  const [testInput, setTestInput] = useState("");
  const [distractionResult, setDistractionResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [snoozeActive, setSnoozeActive] = useState(false);

  // Activity Monitor State
  const [currentActivity, setCurrentActivity] = useState(null);
  const [previousActivity, setPreviousActivity] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const simulatorRef = useRef(null);

  // Visibility Tracking State
  const visibilityTrackerRef = useRef(null);
  const [isAway, setIsAway] = useState(false);
  const [awayDuration, setAwayDuration] = useState(0);

  // Strict Mode & Violation Tracking
  const [strictMode, setStrictMode] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const violationHistory = useRef([]);

  useEffect(() => {
    loadSessions();
    loadProfile();
    loadStrictMode();

    // Initialize activity simulator
    simulatorRef.current = new ActivitySimulator(handleActivityChange);

    return () => {
      if (simulatorRef.current) {
        simulatorRef.current.stop();
      }
      if (visibilityTrackerRef.current) {
        visibilityTrackerRef.current.stop();
      }
    };
  }, []);

  const loadSessions = async () => {
    const saved = await AsyncStorage.getItem("focusSessions");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSessions(parsed);
      buildWeeklyChart(parsed);
    }
  };

  const loadProfile = async () => {
    const saved = await AsyncStorage.getItem("assassinProfile");
    if (saved) {
      setProfile(JSON.parse(saved));
    }
  };

  const loadStrictMode = async () => {
    try {
      const saved = await AsyncStorage.getItem('strictMode');
      if (saved !== null) {
        setStrictMode(JSON.parse(saved));
      }

      const violations = await AsyncStorage.getItem('violationHistory');
      if (violations) {
        const history = JSON.parse(violations);
        violationHistory.current = history;
        // Count violations in last hour
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        const recentViolations = history.filter(v => v.timestamp > oneHourAgo);
        setViolationCount(recentViolations.length);
      }
    } catch (error) {
      console.error('Error loading strict mode:', error);
    }
  };

  const toggleStrictMode = async () => {
    const newValue = !strictMode;
    setStrictMode(newValue);
    await AsyncStorage.setItem('strictMode', JSON.stringify(newValue));

    // Send to Chrome Extension
    window.postMessage({
      source: 'productivity-assassin-app',
      type: 'SET_STRICT_MODE',
      enabled: newValue
    }, '*');

    console.log('🔒 Strict Mode:', newValue ? 'ENABLED' : 'DISABLED');
  };

  const handleActivityChange = (activityPayload) => {
    console.log('Activity changed:', activityPayload);

    // Check if we should trigger an alert using smart logic
    const shouldAlert = shouldTriggerAlert(activityPayload, currentActivity);

    // Update state BEFORE potentially showing modal
    setPreviousActivity(currentActivity);
    setCurrentActivity(activityPayload);

    // Only trigger modal if validation passes
    if (shouldAlert && !showModal && !snoozeActive) {
      console.log('\ud83d\udea8 Triggering modal for distraction!');
      const detection = detectDistractionFromActivity(activityPayload);
      setDistractionResult(detection);
      setShowModal(true);
    } else if (activityPayload.distraction && !shouldAlert) {
      console.log('\u23ed\ufe0f Distraction detected but alert skipped (duplicate or invalid)');
    }
  };

  const startMonitoring = () => {
    if (simulatorRef.current && !isMonitoring) {
      console.log('Starting activity monitoring...');
      simulatorRef.current.start();
      setIsMonitoring(true);
    }
  };

  const stopMonitoring = () => {
    if (simulatorRef.current && isMonitoring) {
      console.log('Stopping activity monitoring...');
      simulatorRef.current.stop();
      setIsMonitoring(false);
      setCurrentActivity(null);
    }
  };

  const toggleMonitoring = () => {
    if (isMonitoring) {
      stopMonitoring();
    } else {
      startMonitoring();
    }
  };

  const skipToNext = () => {
    if (simulatorRef.current && isMonitoring) {
      console.log('Skipping to next activity...');
      simulatorRef.current.skipToNext();
    }
  };

  const handleTestInputChange = async (text) => {
    console.log('Testing Input: ', text);
    setTestInput(text);

    if (snoozeActive) {
      console.log('Snooze is active, skipping detection');
      return; // Don't check if snoozed
    }

    // Check for distraction using existing detection
    const result = await detectDistraction(text, profile);
    console.log('Detection Result:', result);

    if (result && result.distracted) {
      console.log('DISTRACTION DETECTED! Generating personalized prompt...');

      // Generate goal-oriented message using profile
      const blockedSite = result.keyword || text;
      const personalizedPrompt = generateGoalOrientedMessage(
        profile,
        blockedSite,
        result.severity || 7,
        violationCount
      );

      // Merge personalized prompt with detection result
      const enhancedResult = {
        ...result,
        prompt: personalizedPrompt.message,
        severity: personalizedPrompt.severity,
        type: personalizedPrompt.type,
        profileUsed: personalizedPrompt.profileUsed
      };

      console.log('📝 Personalized Prompt:', personalizedPrompt.message.substring(0, 80) + '...');

      // Log violation
      const violation = {
        keyword: blockedSite,
        timestamp: Date.now(),
        severity: result.severity
      };
      violationHistory.current.push(violation);
      setViolationCount(prev => prev + 1);
      await AsyncStorage.setItem('violationHistory', JSON.stringify(violationHistory.current));

      setDistractionResult(enhancedResult);
      setShowModal(true);
    }
  };

  const forceOpenModal = () => {
    console.log('FORCE OPENING MODAL');
    // Create fake detection for testing
    const fakeDetection = {
      distracted: true,
      keyword: 'TEST',
      prompt: 'This is a test modal. The modal component is working!',
      suggestion: 'Click any button to test functionality.',
      severity: 8,
    };
    setDistractionResult(fakeDetection);
    setShowModal(true);
  };

  const handleGetBackToWork = () => {
    setShowModal(false);
    setTestInput("");
    setDistractionResult(null);
    router.push("/focus");
  };

  const handleSnooze = () => {
    setShowModal(false);
    setSnoozeActive(true);
    // Reset snooze after 5 minutes
    setTimeout(() => {
      setSnoozeActive(false);
    }, 5 * 60 * 1000);
  };

  const handleViewAlternatives = () => {
    setShowModal(false);
    if (distractionResult && distractionResult.suggestion) {
      alert("Alternative Action", distractionResult.suggestion);
    }
  };

  const buildWeeklyChart = (data) => {
    const today = new Date();
    let labels = [];
    let minutes = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dayStr = d.toISOString().split("T")[0];

      labels.push(d.toLocaleDateString("en-US", { weekday: "short" }));

      const total = data
        .filter((s) => s.timestamp.startsWith(dayStr))
        .reduce((sum, s) => sum + s.duration, 0);

      minutes.push(total);
    }

    setWeeklyData({ labels, minutes });
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const todayMinutes = sessions
    .filter((s) => s.timestamp.startsWith(todayStr))
    .reduce((sum, s) => sum + s.duration, 0);

  return (
    <ScrollView contentContainerStyle={{ padding: 20, alignItems: "center" }}>
      <Text style={{ fontSize: 26, fontWeight: "bold", marginBottom: 15 }}>
        📊 Productivity Dashboard
      </Text>

      {/* CRITICAL: Redirect Website Configuration Alert */}
      <TouchableOpacity
        onPress={() => router.push("/profiles")}
        style={{
          width: "90%",
          backgroundColor: "#2a1a1a",
          borderWidth: 3,
          borderColor: "#ff3333",
          borderRadius: 12,
          padding: 20,
          marginBottom: 20,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
          <Text style={{ fontSize: 32, marginRight: 12 }}>⚠️</Text>
          <Text style={{ color: "#ff3333", fontSize: 18, fontWeight: "bold", flex: 1 }}>
            Configure Redirect Website
          </Text>
        </View>
        <Text style={{ color: "#fff", fontSize: 14, marginBottom: 10, lineHeight: 20 }}>
          Set your organization/study website to control where you're redirected when distracted.
        </Text>
        <Text style={{ color: "#00ff99", fontSize: 14, fontWeight: "bold" }}>
          Tap here to configure →
        </Text>
      </TouchableOpacity>

      {/* Activity Monitor */}
      <ActivityMonitor
        currentActivity={currentActivity}
        onToggle={toggleMonitoring}
        isRunning={isMonitoring}
        onSkip={skipToNext}
      />

      {/* STRICT MODE CONTROL */}
      <View style={{
        width: "90%",
        backgroundColor: strictMode ? "#1a2a1a" : "#2a2a2a",
        borderWidth: 3,
        borderColor: strictMode ? "#00ff99" : "#666",
        borderRadius: 12,
        padding: 20,
        marginVertical: 15
      }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: strictMode ? "#00ff99" : "#fff", fontSize: 18, fontWeight: "bold" }}>
              🔒 Strict Mode {strictMode ? "ON" : "OFF"}
            </Text>
            <Text style={{ color: "#aaa", fontSize: 12, marginTop: 5 }}>
              {strictMode
                ? "Distractions will be blocked & redirected"
                : "Distractions will show warnings only"}
            </Text>
            {violationCount > 0 && (
              <Text style={{ color: "#ff6666", fontSize: 12, marginTop: 5, fontWeight: "bold" }}>
                ⚠️ {violationCount} distraction{violationCount > 1 ? 's' : ''} in last hour
              </Text>
            )}
          </View>
          <Switch
            value={strictMode}
            onValueChange={toggleStrictMode}
            trackColor={{ false: "#444", true: "#00ff99" }}
            thumbColor={strictMode ? "#00ff99" : "#ccc"}
          />
        </View>
      </View>


      {/* VISIBLE TEST INPUT - DEBUG MODE */}
      <View style={{ width: "90%", marginBottom: 20, marginTop: 10 }}>
        <Text style={{ color: "#ff0000", fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>
          🔴 DEBUG: DISTRACTION DETECTOR TEST
        </Text>
        <Text style={{ color: "#fff", fontSize: 12, marginBottom: 5 }}>
          Type "instagram", "pubg", "reels", etc. to trigger modal
        </Text>
        <TextInput
          style={{
            backgroundColor: "#000",
            color: "#00ff00",
            padding: 15,
            borderRadius: 8,
            borderWidth: 3,
            borderColor: "red",
            fontSize: 16,
          }}
          placeholder="Type a distraction keyword here..."
          placeholderTextColor="#666"
          value={testInput}
          onChangeText={handleTestInputChange}
          editable={!snoozeActive}
        />
        <TouchableOpacity
          onPress={forceOpenModal}
          style={{
            backgroundColor: "#ff0000",
            padding: 15,
            borderRadius: 8,
            marginTop: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
            🚨 FORCE OPEN MODAL (TEST)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={{ flexDirection: "row", marginBottom: 20, gap: 20 }}>
        <View
          style={{
            backgroundColor: "#222",
            padding: 20,
            width: 150,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "#aaa", fontSize: 12 }}>Today's Focus</Text>
          <Text style={{ color: "#0f0", fontSize: 22, fontWeight: "bold" }}>
            {todayMinutes} min
          </Text>
        </View>

        <View
          style={{
            backgroundColor: "#222",
            padding: 20,
            width: 150,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "#aaa", fontSize: 12 }}>Sessions</Text>
          <Text style={{ color: "#0af", fontSize: 22, fontWeight: "bold" }}>
            {sessions.length}
          </Text>
        </View>
      </View>

      {/* Weekly Chart */}
      <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 10 }}>
        Weekly Focus (Minutes)
      </Text>

      <BarChart
        data={{
          labels: weeklyData.labels || [],
          datasets: [
            {
              data: weeklyData.minutes || [],
            },
          ],
        }}
        width={Dimensions.get("window").width * 0.9}
        height={220}
        chartConfig={{
          backgroundColor: "#111",
          backgroundGradientFrom: "#111",
          backgroundGradientTo: "#111",
          decimalPlaces: 0,
          color: () => `#00ccff`,
          labelColor: () => "#aaa",
        }}
        style={{
          borderRadius: 12,
        }}
      />

      {/* Recent Sessions */}
      <Text style={{ fontSize: 18, fontWeight: "600", marginTop: 25 }}>
        Recent Sessions
      </Text>

      {sessions.slice(-5).reverse().map((s, i) => (
        <View
          key={i}
          style={{
            backgroundColor: "#1a1a1a",
            padding: 15,
            borderRadius: 8,
            width: "90%",
            marginTop: 10,
          }}
        >
          <Text style={{ color: "white" }}>
            🕒 {new Date(s.timestamp).toLocaleString()}
          </Text>
          <Text style={{ color: "#00ff99" }}>Duration: {s.duration} min</Text>
        </View>
      ))}

      <View style={{ marginTop: 20 }}>
        <Button title="Refresh" onPress={loadSessions} />
      </View>

      {/* Redirection Modal */}
      <RedirectionModal
        visible={showModal}
        detection={distractionResult}
        onClose={() => setShowModal(false)}
        onGetBackToWork={handleGetBackToWork}
        onSnooze={handleSnooze}
        onViewAlternatives={handleViewAlternatives}
      />
    </ScrollView>
  );
}


