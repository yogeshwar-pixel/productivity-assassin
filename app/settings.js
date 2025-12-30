import { View, Text, TouchableOpacity, Alert, ScrollView } from "react-native";
import { Link, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";

export default function Settings() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const saved = await AsyncStorage.getItem("assassinProfile");
    if (saved) {
      setProfile(JSON.parse(saved));
    }
  };

  const handleEditProfile = () => {
    // Allow re-entering setup to edit platforms and other settings
    router.push("/setup");
  };

  const handleResetSetup = async () => {
    Alert.alert(
      "Reset Setup",
      "This will clear your profile and let you start fresh. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem("hasSetup");
            await AsyncStorage.removeItem("assassinProfile");
            router.push("/setup");
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#000" }}>
      <View style={{ padding: 20 }}>
        <Text style={{ color: "#00ffcc", fontSize: 28, fontWeight: "bold", marginBottom: 20 }}>
          ⚙️ Settings
        </Text>

        {/* Current Study Platforms */}
        {profile && profile.studyPlatforms && (
          <View style={{
            backgroundColor: "#1a1a1a",
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
            borderLeftWidth: 4,
            borderLeftColor: "#00ffcc"
          }}>
            <Text style={{ color: "#00ffcc", fontSize: 16, fontWeight: "bold", marginBottom: 10 }}>
              📚 Your Study Platforms:
            </Text>
            {profile.studyPlatforms.map((platform, idx) => (
              <Text key={idx} style={{ color: "#fff", fontSize: 14, marginBottom: 5 }}>
                {idx + 1}. {platform}
              </Text>
            ))}
          </View>
        )}

        {/* Edit Profile Button */}
        <TouchableOpacity
          onPress={handleEditProfile}
          style={{
            backgroundColor: "#00ff99",
            padding: 16,
            borderRadius: 12,
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Text style={{ color: "#000", fontSize: 16, fontWeight: "bold" }}>
            ✏️ Edit Profile & Platforms
          </Text>
        </TouchableOpacity>

        {/* Reset Setup Button */}
        <TouchableOpacity
          onPress={handleResetSetup}
          style={{
            backgroundColor: "#ff3333",
            padding: 16,
            borderRadius: 12,
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
            🔄 Reset Setup
          </Text>
        </TouchableOpacity>

        {/* Back to Dashboard */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            backgroundColor: "#333",
            padding: 16,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
            ← Back to Dashboard
          </Text>
        </TouchableOpacity>

        {/* Help Text */}
        <View style={{
          backgroundColor: "#1a1a1a",
          borderRadius: 12,
          padding: 16,
          marginTop: 20,
        }}>
          <Text style={{ color: "#999", fontSize: 12, lineHeight: 18 }}>
            💡 Tip: Use "Edit Profile & Platforms" to update your organization/study websites.
            These are the sites you'll be redirected to when distracted.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
