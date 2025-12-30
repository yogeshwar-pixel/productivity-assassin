import { View, Text, Button } from "react-native";
import { Link } from "expo-router";

export default function Stats() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>📈 Productivity Stats</Text>
      <Text style={{ fontSize: 16, marginBottom: 10 }}>Daily / Weekly Reports will appear here.</Text>

      <Link href="/dashboard">
        <Button title="Back to Dashboard" />
      </Link>
    </View>
  );
}
