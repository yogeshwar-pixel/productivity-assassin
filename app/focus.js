// app/focus.js
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import { generateAssassinPrompt } from "../utils/assassinPrompts";

import AsyncStorage from "@react-native-async-storage/async-storage";

// -----------------------------------------------------------------------------
// OPTIONAL: expo-av sound support for Android/iOS (not used on Web)
// -----------------------------------------------------------------------------
let AudioObject = null;
if (Platform.OS !== "web") {
  try {
    const { Audio } = require("expo-av");
    AudioObject = Audio;
  } catch (e) {
    console.warn("expo-av not available.", e);
    AudioObject = null;
  }
}

// -----------------------------------------------------------------------------
// CONSTANTS
// -----------------------------------------------------------------------------
const DEFAULTS = {
  work: 25,
  shortBreak: 5,
  longBreak: 15,
};

const STORAGE_KEYS = {
  DURATIONS: "pomodoroDurations",
  SESSIONS: "focusSessions",
  PROFILE: "assassinProfile",
};

// -----------------------------------------------------------------------------
// Web sound fallback
// -----------------------------------------------------------------------------
function webBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 900;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
    osc.stop(ctx.currentTime + 0.36);
  } catch (e) {
    console.warn("Web beep failed:", e);
  }
}

// -----------------------------------------------------------------------------
// Sound player
// -----------------------------------------------------------------------------
async function playNotification() {
  if (Platform.OS === "web") {
    webBeep();
    return;
  }

  if (!AudioObject) return;

  try {
    const { Sound } = AudioObject;
    const { sound } = await Sound.createAsync(
      { uri: "https://actions.google.com/sounds/v1/alarms/beep_short.ogg" },
      { shouldPlay: true }
    );

    setTimeout(() => {
      sound.unloadAsync && sound.unloadAsync();
    }, 2000);
  } catch (e) {
    console.warn("Sound failed:", e);
  }
}

const two = (n) => String(n).padStart(2, "0");

// -----------------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------------
export default function FocusMode() {
  const [durations, setDurations] = useState({ ...DEFAULTS });
  const [minutes, setMinutes] = useState(DEFAULTS.work);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState("work"); // work | break
  const [cycle, setCycle] = useState(1);

  const [showSettings, setShowSettings] = useState(false);
  const [editing, setEditing] = useState({});
  const intervalRef = useRef(null);

  // Load durations from storage
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.DURATIONS);
        if (raw) {
          const parsed = JSON.parse(raw);
          setDurations(parsed);
          setMinutes(parsed.work);
        }
      } catch {
        console.warn("Failed to load durations");
      }
    })();

    return () => clearInterval(intervalRef.current);
  }, []);

  // ⏱ TIMER TICK
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => tick(), 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [running, minutes, seconds]);

  const tick = () => {
    setSeconds((s) => {
      if (s === 0) {
        if (minutes === 0) {
          endSession();
          return 0;
        }
        setMinutes((m) => m - 1);
        return 59;
      }
      return s - 1;
    });
  };

  // Record completed session
  const logWorkSession = async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.SESSIONS);
    const arr = raw ? JSON.parse(raw) : [];
    arr.push({
      timestamp: new Date().toISOString(),
      duration: durations.work,
    });
    await AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(arr));
  };

  // 🔥 END SESSION
  const endSession = async () => {
    playNotification();
    if (Platform.OS !== "web") Vibration.vibrate(400);

    if (mode === "work") {
      await logWorkSession();
      await showAssassinPrompt();

      if (cycle < 4) {
        setMode("break");
        setMinutes(durations.shortBreak);
        setSeconds(0);
        setCycle((c) => c + 1);
      } else {
        setMode("break");
        setMinutes(durations.longBreak);
        setSeconds(0);
        setCycle(1);
      }
      setRunning(true);
    } else {
      setMode("work");
      setMinutes(durations.work);
      setSeconds(0);
      setRunning(true);
    }
  };

  // 🔥 TOUGH-LOVE PROMPT AFTER WORK SESSION
  const showAssassinPrompt = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE);
      if (!raw) return;

      const profile = JSON.parse(raw);
      const message = generateAssassinPrompt(profile, durations.work);

      Alert.alert("Assassin Mode", message);
    } catch (e) {
      console.warn("AI prompt failed:", e);
    }
  };

  // Controls
  const start = () => setRunning(true);
  const pause = () => setRunning(false);
  const toggle = () => (running ? pause() : start());
  const reset = () => {
    setRunning(false);
    setMode("work");
    setCycle(1);
    setMinutes(durations.work);
    setSeconds(0);
  };

  // Settings modal
  const openSettings = () => {
    setEditing({
      work: String(durations.work),
      shortBreak: String(durations.shortBreak),
      longBreak: String(durations.longBreak),
    });
    setShowSettings(true);
  };

  const saveSettings = async () => {
    const w = Math.max(1, parseInt(editing.work || "25"));
    const sb = Math.max(1, parseInt(editing.shortBreak || "5"));
    const lb = Math.max(1, parseInt(editing.longBreak || "15"));

    const payload = { work: w, shortBreak: sb, longBreak: lb };
    setDurations(payload);
    await AsyncStorage.setItem(STORAGE_KEYS.DURATIONS, JSON.stringify(payload));

    if (mode === "work") setMinutes(w);
    else setMinutes(sb);

    setSeconds(0);
    setShowSettings(false);
  };

  const formatted = `${two(minutes)}:${two(seconds)}`;

  return (
    <View style={{ flex: 1, backgroundColor: "#0b0b0b", justifyContent: "center", alignItems: "center", padding: 20 }}>
      <Text style={{ color: "white", fontSize: 28, fontWeight: "700" }}>
        {mode === "work" ? "🔴 Work Session" : "🟢 Break Session"}
      </Text>

      <Text style={{ color: "#00ffcc", fontSize: 64, fontWeight: "800", marginVertical: 20 }}>
        {formatted}
      </Text>

      <TouchableOpacity onPress={toggle}>
        <View style={{ backgroundColor: "#222", padding: 12, borderRadius: 8 }}>
          <Text style={{ color: "white", fontSize: 18 }}>{running ? "Pause" : "Start"}</Text>
        </View>
      </TouchableOpacity>

      <View style={{ flexDirection: "row", marginTop: 20 }}>
        <TouchableOpacity onPress={reset} style={{ marginHorizontal: 6 }}>
          <View style={{ backgroundColor: "#222", padding: 12, borderRadius: 8 }}>
            <Text style={{ color: "white" }}>Reset</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={openSettings} style={{ marginHorizontal: 6 }}>
          <View style={{ backgroundColor: "#222", padding: 12, borderRadius: 8 }}>
            <Text style={{ color: "white" }}>Settings</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* SETTINGS MODAL */}
      <Modal visible={showSettings} transparent animationType="fade">
        <View style={{ flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.6)", padding: 20 }}>
          <View style={{ backgroundColor: "#111", padding: 20, borderRadius: 12 }}>
            <Text style={{ color: "white", fontSize: 20, marginBottom: 10 }}>
              Pomodoro Settings
            </Text>

            <TextInput
              value={editing.work}
              onChangeText={(t) => setEditing((p) => ({ ...p, work: t }))}
              keyboardType="numeric"
              placeholder="Work (min)"
              style={{ backgroundColor: "#000", color: "white", padding: 10, marginBottom: 10 }}
            />

            <TextInput
              value={editing.shortBreak}
              onChangeText={(t) => setEditing((p) => ({ ...p, shortBreak: t }))}
              keyboardType="numeric"
              placeholder="Short break"
              style={{ backgroundColor: "#000", color: "white", padding: 10, marginBottom: 10 }}
            />

            <TextInput
              value={editing.longBreak}
              onChangeText={(t) => setEditing((p) => ({ ...p, longBreak: t }))}
              keyboardType="numeric"
              placeholder="Long break"
              style={{ backgroundColor: "#000", color: "white", padding: 10, marginBottom: 20 }}
            />

            <Button title="Save" onPress={saveSettings} />
            <View style={{ height: 10 }} />
            <Button title="Cancel" onPress={() => setShowSettings(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}
