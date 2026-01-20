import { useRouter, Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity, ImageBackground } from "react-native";
import { getTasks } from "../utils/taskManager";
import StickyTaskCard from "../components/StickyTaskCard";

export default function Index() {
  const router = useRouter();
  const [hasSetup, setHasSetup] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  useEffect(() => {
    checkSetup();
  }, []);

  const checkSetup = async () => {
    const value = await AsyncStorage.getItem("hasSetup");
    const setupComplete = value === "true";
    setHasSetup(setupComplete);

    if (setupComplete) {
      loadPressureTasks();
    }
  };

  const loadPressureTasks = async () => {
    const allTasks = await getTasks();
    // Filter for pending/in-progress
    const unfinished = allTasks.filter(t => t.status !== 'completed');
    // Sort by deadline (asc) -> priority
    unfinished.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    setTasks(unfinished);
    setLoadingTasks(false);
  };

  const handleEnter = () => {
    router.push("/dashboard");
  };

  if (hasSetup === null || (hasSetup && loadingTasks)) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#00ffcc" />
        <Text style={{ color: '#fff', marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  if (!hasSetup) {
    return <Redirect href="/setup" />;
  }

  // PRESSURE BOARD LAYOUT
  const urgentCount = tasks.filter(t => {
    const d = new Date(t.deadline);
    const today = new Date();
    return d <= today;
  }).length;

  return (
    <View style={{ flex: 1, backgroundColor: "#111", padding: 20, paddingTop: 60 }}>
      <Text style={{ color: "#fff", fontSize: 32, fontWeight: "900", marginBottom: 5 }}>
        PRESSURE BOARD
      </Text>
      <Text style={{ color: "#888", fontSize: 16, marginBottom: 30 }}>
        {urgentCount > 0 ? `⚠️ YOU HAVE ${urgentCount} URGENT ITEMS` : "Clear the board to proceed."}
      </Text>

      <ScrollView contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingBottom: 100 }}>
        {tasks.length === 0 ? (
          <View style={{ width: '100%', alignItems: 'center', marginTop: 50 }}>
            <Text style={{ fontSize: 40 }}>🧘</Text>
            <Text style={{ color: '#00ff99', fontSize: 18, fontWeight: 'bold', marginTop: 10 }}>
              No Tasks Pending
            </Text>
            <Text style={{ color: '#666' }}>You are free to enter.</Text>
          </View>
        ) : (
          tasks.map(task => (
            <StickyTaskCard
              key={task.id}
              task={task}
              onPress={() => router.push('/tasks')}
            />
          ))
        )}
      </ScrollView>

      {/* Enter Button */}
      <View style={{ position: 'absolute', bottom: 30, left: 20, right: 20 }}>
        <TouchableOpacity
          onPress={handleEnter}
          style={{
            backgroundColor: urgentCount > 0 ? '#ff3333' : '#00ff99',
            padding: 18,
            borderRadius: 12,
            alignItems: 'center',
            shadowColor: urgentCount > 0 ? "#ff0000" : "#00ff99",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.5,
            shadowRadius: 10,
            elevation: 10
          }}
        >
          <Text style={{ color: '#000', fontSize: 18, fontWeight: '900', textTransform: 'uppercase' }}>
            {urgentCount > 0 ? "IGNORE & ENTER DASHBOARD" : "ENTER DASHBOARD"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

