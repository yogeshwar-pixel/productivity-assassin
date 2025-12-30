// components/ActivityMonitor.js
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function ActivityMonitor({ currentActivity, onToggle, isRunning, onSkip }) {
    const [elapsedTime, setElapsedTime] = useState(0);

    useEffect(() => {
        if (!isRunning) {
            setElapsedTime(0);
            return;
        }

        const interval = setInterval(() => {
            setElapsedTime((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [isRunning, currentActivity]);

    useEffect(() => {
        // Reset timer when app changes
        setElapsedTime(0);
    }, [currentActivity?.windowTitle]);

    if (!currentActivity) return null;

    const statusColor = currentActivity.distraction ? "#ff3333" : "#00ff99";
    const statusText = currentActivity.distraction ? "⚠️ DISTRACTION DETECTED" : "✅ PRODUCTIVE";

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>🔍 Live Activity Monitor</Text>
                <View style={styles.controls}>
                    <TouchableOpacity onPress={onToggle} style={styles.toggleButton}>
                        <Text style={styles.toggleText}>{isRunning ? "⏸️ Pause" : "▶️ Start"}</Text>
                    </TouchableOpacity>
                    {isRunning && (
                        <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
                            <Text style={styles.skipText}>⏭️ Skip</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={[styles.statusBar, { backgroundColor: statusColor }]}>
                <Text style={styles.statusText}>{statusText}</Text>
            </View>

            <View style={styles.details}>
                <View style={styles.detailRow}>
                    <Text style={styles.label}>Active App:</Text>
                    <Text style={styles.value}>{currentActivity.activeApp}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.label}>Window:</Text>
                    <Text style={styles.valueSmall} numberOfLines={1}>
                        {currentActivity.windowTitle}
                    </Text>
                </View>
                {currentActivity.distraction && (
                    <>
                        <View style={styles.detailRow}>
                            <Text style={styles.label}>Keyword:</Text>
                            <Text style={[styles.value, { color: "#ff3333" }]}>
                                "{currentActivity.distractionKeyword}"
                            </Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.label}>Severity:</Text>
                            <Text style={[styles.value, { color: "#ff9933" }]}>
                                {currentActivity.severity}/10
                            </Text>
                        </View>
                    </>
                )}
                <View style={styles.detailRow}>
                    <Text style={styles.label}>Duration:</Text>
                    <Text style={styles.value}>{elapsedTime}s</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.label}>Cycle:</Text>
                    <Text style={styles.value}>#{currentActivity.cycleNumber || 0}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#1a1a1a",
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 2,
        borderColor: "#333",
        width: "90%",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    title: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    controls: {
        flexDirection: "row",
        gap: 8,
    },
    toggleButton: {
        backgroundColor: "#00ccff",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    toggleText: {
        color: "#000",
        fontSize: 12,
        fontWeight: "bold",
    },
    skipButton: {
        backgroundColor: "#666",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    skipText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "bold",
    },
    statusBar: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        marginBottom: 12,
        alignItems: "center",
    },
    statusText: {
        color: "#000",
        fontSize: 14,
        fontWeight: "bold",
    },
    details: {
        gap: 8,
    },
    detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    label: {
        color: "#999",
        fontSize: 13,
        flex: 1,
    },
    value: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "600",
        flex: 2,
        textAlign: "right",
    },
    valueSmall: {
        color: "#fff",
        fontSize: 12,
        flex: 2,
        textAlign: "right",
    },
});
