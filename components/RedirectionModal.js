// components/RedirectionModal.js
import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function RedirectionModal({ visible, onClose, detection, onGetBackToWork, onSnooze, onViewAlternatives }) {
    if (!detection || !detection.distracted) {
        return null;
    }

    const { keyword, prompt, suggestion, severity } = detection;

    // Determine urgency level based on severity
    const urgencyColor = severity >= 8 ? "#ff3333" : severity >= 6 ? "#ff9933" : "#ffcc00";
    const urgencyText = severity >= 8 ? "HIGH ALERT" : severity >= 6 ? "WARNING" : "NOTICE";

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    {/* Urgency Badge */}
                    <View style={[styles.urgencyBadge, { backgroundColor: urgencyColor }]}>
                        <Text style={styles.urgencyText}>⚠️ {urgencyText}</Text>
                    </View>

                    {/* Detected Keyword */}
                    <Text style={styles.keywordText}>
                        Detected: <Text style={styles.keywordHighlight}>"{keyword}"</Text>
                    </Text>

                    {/* Tough-Love Message */}
                    <Text style={styles.messageText}>{prompt}</Text>

                    {/* Suggestion */}
                    <View style={styles.suggestionBox}>
                        <Text style={styles.suggestionLabel}>💡 Instead:</Text>
                        <Text style={styles.suggestionText}>{suggestion}</Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.primaryButton]}
                            onPress={onGetBackToWork}
                        >
                            <Text style={styles.primaryButtonText}>🎯 Get Back to Work</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.secondaryButton]}
                            onPress={onViewAlternatives}
                        >
                            <Text style={styles.secondaryButtonText}>📋 View Alternatives</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.snoozeButton]}
                            onPress={onSnooze}
                        >
                            <Text style={styles.snoozeButtonText}>⏱️ Snooze (5 min)</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        backgroundColor: "#1a1a1a",
        borderRadius: 16,
        padding: 24,
        width: "85%",
        maxWidth: 400,
        borderWidth: 2,
        borderColor: "#ff3333",
    },
    urgencyBadge: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignSelf: "center",
        marginBottom: 16,
    },
    urgencyText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 14,
        textAlign: "center",
    },
    keywordText: {
        color: "#aaa",
        fontSize: 14,
        marginBottom: 12,
        textAlign: "center",
    },
    keywordHighlight: {
        color: "#ff3333",
        fontWeight: "bold",
        fontSize: 16,
    },
    messageText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
        textAlign: "center",
        marginBottom: 20,
        lineHeight: 24,
    },
    suggestionBox: {
        backgroundColor: "#2a2a2a",
        padding: 16,
        borderRadius: 10,
        marginBottom: 24,
        borderLeftWidth: 4,
        borderLeftColor: "#00ff99",
    },
    suggestionLabel: {
        color: "#00ff99",
        fontSize: 12,
        fontWeight: "bold",
        marginBottom: 6,
    },
    suggestionText: {
        color: "#ddd",
        fontSize: 14,
        lineHeight: 20,
    },
    buttonContainer: {
        gap: 12,
    },
    button: {
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
    },
    primaryButton: {
        backgroundColor: "#00ff99",
    },
    primaryButtonText: {
        color: "#000",
        fontSize: 16,
        fontWeight: "bold",
    },
    secondaryButton: {
        backgroundColor: "#333",
        borderWidth: 1,
        borderColor: "#00ccff",
    },
    secondaryButtonText: {
        color: "#00ccff",
        fontSize: 15,
        fontWeight: "600",
    },
    snoozeButton: {
        backgroundColor: "#222",
        borderWidth: 1,
        borderColor: "#666",
    },
    snoozeButtonText: {
        color: "#999",
        fontSize: 14,
        fontWeight: "500",
    },
});
