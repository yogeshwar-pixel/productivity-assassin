// app/ai_insight.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Button, ScrollView, Text, View } from "react-native";

export default function AIInsight() {
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [goal, setGoal] = useState("");
  const [metrics, setMetrics] = useState(null);
  const [summary, setSummary] = useState("");

  useEffect(() => {
    (async () => {
      const s = await AsyncStorage.getItem("focusSessions");
      const g = await AsyncStorage.getItem("userGoal");
      setSessions(s ? JSON.parse(s) : []);
      setGoal(g || "");
    })();
  }, []);

  const generateInsight = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/ai_insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, sessions }),
      });

      if (!response.ok) throw new Error("Backend error: " + response.status);
      const data = await response.json();
      setMetrics(data.metrics);
      setSummary(data.summary);
    } catch (err) {
      console.error("Insight fetch failed:", err);
      Alert.alert("Network error", err.message || "Failed to fetch insights");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 10 }}>🤖 AI Insights</Text>

      <Text style={{ marginBottom: 8 }}>Goal: <Text style={{ color: "#0f0" }}>{goal || "Not set"}</Text></Text>

      <View style={{ marginVertical: 10 }}>
        <Button title="Generate Insight" onPress={generateInsight} disabled={loading} />
      </View>

      {loading && <ActivityIndicator size="large" />}

      {metrics && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: "600" }}>Metrics</Text>
          <Text>Total sessions: {metrics.total_sessions}</Text>
          <Text>Today's minutes: {metrics.today_minutes} min</Text>
          <Text>Avg session: {metrics.avg_session_minutes} min</Text>
          <Text>Current streak: {metrics.streak_days} days</Text>
          <Text>Busiest hour: {metrics.busiest_hour !== null ? metrics.busiest_hour + ":00" : "—"}</Text>

          <Text style={{ marginTop: 10, fontWeight: "600" }}>This week (minutes)</Text>
          <View style={{ marginTop: 6 }}>
            {metrics.weekly.map((w) => (
              <Text key={w.date}>
                {new Date(w.date).toLocaleDateString()} — {w.minutes} min
              </Text>
            ))}
          </View>
        </View>
      )}

      {summary ? (
        <View style={{ marginTop: 20, padding: 12, backgroundColor: "#111", borderRadius: 8 }}>
          <Text style={{ color: "#fff", fontSize: 16 }}>{summary}</Text>
        </View>
      ) : null}

      <View style={{ height: 20 }} />
      <Link href="/dashboard">
        <Button title="Back to Dashboard" />
      </Link>
    </ScrollView>
  );
}
