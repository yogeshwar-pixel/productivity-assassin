// components/FocusModeBlocker.js
import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function FocusModeBlocker({ visible, blockedApp, onEndFocus, onContinueAnyway }) {
    if (!blockedApp) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onEndFocus}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    {/* Block Icon */}
                    <View style={styles.iconContainer}>
                        <Text style={styles.blockIcon}>🚫</Text>
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>Focus Mode: App Blocked</Text>

                    {/* Blocked App Info */}
                    <View style={styles.appInfo}>
                        <Text style={styles.appName}>{blockedApp.activeApp}</Text>
                        <Text style={styles.appTitle} numberOfLines={2}>
                            {blockedApp.windowTitle}
                        </Text>
                    </View>

                    {/* Reason */}
                    <View style={styles.reasonBox}>
                        <Text style={styles.reasonLabel}>❌ Why it's blocked:</Text>
                        <Text style={styles.reasonText}>
                            {blockedApp.focusModeReason || "This app is not productive during Focus Mode"}
                        </Text>
                    </View>

                    {/* Message */}
                    <Text style={styles.message}>
                        Focus Mode is active. Only whitelisted productive apps are allowed.
                    </Text>

                    {/* Suggestion */}
                    <View style={styles.suggestionBox}>
                        <Text style={styles.suggestionLabel}>💡 What to do instead:</Text>
                        <Text style={styles.suggestionText}>
                            Return to your work. Use VS Code, documentation, or other productive tools.
                        </Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.primaryButton]}
                            onPress={onEndFocus}
                        >
                            <Text style={styles.primaryButtonText}>🎯 End Focus Mode</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.dangerButton]}
                            onPress={onContinueAnyway}
                        >
                            <Text style={styles.dangerButtonText}>⚠️ Continue Anyway (Break Focus)</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Stats */}
                    <View style={styles.stats}>
                        <Text style={styles.statsText}>
                            Category: <Text style={styles.statsBold}>{blockedApp.focusModeCategory || "blacklist"}</Text>
                        </Text>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.95)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        backgroundColor: "#1a1a1a",
        borderRadius: 16,
        padding: 24,
        width: "90%",
        maxWidth: 450,
        borderWidth: 3,
        borderColor: "#ff0000",
    },
    iconContainer: {
        alignItems: "center",
        marginBottom: 16,
    },
    blockIcon: {
        fontSize: 64,
    },
    title: {
        color: "#ff3333",
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
    },
    appInfo: {
        backgroundColor: "#2a2a2a",
        padding: 16,
        borderRadius: 10,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: "#ff3333",
    },
    appName: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 6,
    },
    appTitle: {
        color: "#aaa",
        fontSize: 14,
    },
    reasonBox: {
        backgroundColor: "#331a1a",
        padding: 14,
        borderRadius: 8,
        marginBottom: 16,
    },
    reasonLabel: {
        color: "#ff6666",
        fontSize: 12,
        fontWeight: "bold",
        marginBottom: 6,
    },
    reasonText: {
        color: "#ffcccc",
        fontSize: 14,
        lineHeight: 20,
    },
    message: {
        color: "#ccc",
        fontSize: 14,
        textAlign: "center",
        marginBottom: 16,
        lineHeight: 20,
    },
    suggestionBox: {
        backgroundColor: "#1a2a1a",
        padding: 14,
        borderRadius: 8,
        marginBottom: 20,
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
        color: "#ccffee",
        fontSize: 13,
        lineHeight: 18,
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
    dangerButton: {
        backgroundColor: "#442222",
        borderWidth: 2,
        borderColor: "#ff3333",
    },
    dangerButtonText: {
        color: "#ff6666",
        fontSize: 14,
        fontWeight: "600",
    },
    stats: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "#333",
        alignItems: "center",
    },
    statsText: {
        color: "#666",
        fontSize: 12,
    },
    statsBold: {
        color: "#ff3333",
        fontWeight: "bold",
    },
});
