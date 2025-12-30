// components/PenaltyWarning.js
// Performance warning banner

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function PenaltyWarning({
    stats,
    visible = true,
    onDismiss,
    onViewDetails
}) {
    if (!visible || !stats || !stats.shouldWarn) return null;

    const { currentPoints, maxPoints, performancePercent, warningMessage } = stats;

    // Color based on severity
    const getSeverityColor = () => {
        if (performancePercent < 20) return '#ff0000'; // Critical
        if (performancePercent < 40) return '#ff6600'; // Severe
        return '#ffaa00'; // Warning
    };

    const color = getSeverityColor();

    return (
        <View style={{
            backgroundColor: '#1a1a1a',
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            borderLeftWidth: 5,
            borderLeftColor: color
        }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text style={{
                    color,
                    fontSize: 16,
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                }}>
                    {performancePercent < 20 ? '🚨 CRITICAL FAILURE' :
                        performancePercent < 40 ? '⚠️ PENALTY WARNING' :
                            '⚡ PERFORMANCE ALERT'}
                </Text>
                {onDismiss && (
                    <TouchableOpacity onPress={onDismiss}>
                        <Text style={{ color: '#666', fontSize: 18 }}>✕</Text>
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
                {warningMessage}
            </Text>

            {/* Points Display */}
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 12
            }}>
                <View style={{ flex: 1 }}>
                    <Text style={{ color: '#999', fontSize: 12, marginBottom: 4 }}>
                        Weekly Points
                    </Text>
                    <View style={{
                        height: 8,
                        backgroundColor: '#2a2a2a',
                        borderRadius: 4,
                        overflow: 'hidden'
                    }}>
                        <View style={{
                            height: '100%',
                            width: `${performancePercent}%`,
                            backgroundColor: color,
                            borderRadius: 4
                        }} />
                    </View>
                </View>
                <Text style={{
                    color: '#fff',
                    fontSize: 20,
                    fontWeight: 'bold',
                    marginLeft: 16
                }}>
                    {currentPoints}/{maxPoints}
                </Text>
            </View>

            {/* Action Button */}
            {onViewDetails && (
                <TouchableOpacity
                    onPress={onViewDetails}
                    style={{
                        backgroundColor: color,
                        padding: 12,
                        borderRadius: 8,
                        alignItems: 'center'
                    }}
                >
                    <Text style={{
                        color: performancePercent < 20 ? '#fff' : '#000',
                        fontWeight: 'bold',
                        fontSize: 14
                    }}>
                        View Details & Recover
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
}
