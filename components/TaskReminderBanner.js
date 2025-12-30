// components/TaskReminderBanner.js
// UI component for displaying unfinished task reminders

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function TaskReminderBanner({
    reminderData,
    onDismiss,
    onViewTasks
}) {
    if (!reminderData || !reminderData.shouldShow) {
        return null;
    }

    const { progressPercent, message, unfinishedCount } = reminderData;

    // Severity-based colors
    const getSeverityColor = () => {
        if (progressPercent < 30) return '#ff3333'; // High - red
        if (progressPercent < 70) return '#ff9900'; // Medium - orange
        return '#ffcc00'; // Low - yellow
    };

    const severityColor = getSeverityColor();

    return (
        <View style={{
            backgroundColor: '#1a1a1a',
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            borderLeftWidth: 4,
            borderLeftColor: severityColor,
            shadowColor: severityColor,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 4
        }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text style={{
                    color: severityColor,
                    fontSize: 14,
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                }}>
                    ⚠️ Unfinished Tasks
                </Text>

                {onDismiss && (
                    <TouchableOpacity onPress={onDismiss}>
                        <Text style={{ color: '#666', fontSize: 16 }}>✕</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Message */}
            <Text style={{
                color: '#fff',
                fontSize: 15,
                lineHeight: 22,
                marginBottom: 12
            }}>
                {message}
            </Text>

            {/* Progress Bar */}
            <View style={{
                height: 8,
                backgroundColor: '#2a2a2a',
                borderRadius: 4,
                overflow: 'hidden',
                marginBottom: 12
            }}>
                <View style={{
                    height: '100%',
                    width: `${progressPercent}%`,
                    backgroundColor: severityColor,
                    borderRadius: 4
                }} />
            </View>

            {/* Stats */}
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12
            }}>
                <Text style={{ color: '#999', fontSize: 13 }}>
                    {progressPercent}% Complete ({unfinishedCount} remaining)
                </Text>
            </View>

            {/* CTA Button */}
            {onViewTasks && (
                <TouchableOpacity
                    onPress={onViewTasks}
                    style={{
                        backgroundColor: severityColor,
                        padding: 12,
                        borderRadius: 8,
                        alignItems: 'center'
                    }}
                >
                    <Text style={{
                        color: '#000',
                        fontWeight: 'bold',
                        fontSize: 14
                    }}>
                        View Tasks →
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
}
