// app/testlab.js
import { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";

import { detectDistraction } from "../utils/distraction";
import { getRedirectionMessage } from "../utils/redirectionPrompts";






export default function TestLab() {
  const [input, setInput] = useState("");

  const runTest = async () => {
    if (!input.trim()) {
      Alert.alert("Enter something to test");
      return;
    }

    const result = await detectDistraction(input.trim());
    Alert.alert("Detection Result", JSON.stringify(result, null, 2));
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000", padding: 20 }}>
      <Text style={{ color: "#fff", fontSize: 22, marginBottom: 20 }}>
        🧪 Distraction Detection — Test Lab
      </Text>

      <TextInput
        placeholder="Type something like: 'instagram reels again'"
        placeholderTextColor="#666"
        style={{
          backgroundColor: "#111",
          color: "#fff",
          padding: 12,
          borderRadius: 8,
          marginBottom: 20,
        }}
        value={input}
        onChangeText={setInput}
      />

      <Button title="Run Detection" onPress={runTest} />
    </View>
  );
}
