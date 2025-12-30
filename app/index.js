import { Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";

export default function Index() {
  const [hasSetup, setHasSetup] = useState(null);

  useEffect(() => {
    const checkSetup = async () => {
      const value = await AsyncStorage.getItem("hasSetup");
      setHasSetup(value === "true");
    };
    checkSetup();
  }, []);

  if (hasSetup === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#00ffcc" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return hasSetup ? <Redirect href="/dashboard" /> : <Redirect href="/setup" />;
}

