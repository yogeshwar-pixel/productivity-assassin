// components/BreakReminderModal.js
// Break reminder notification

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';

export default function BreakReminderModal({
    visible,
    breakType = 'short',
    duration = 5,
    onTakeBreak,
    onSkip,
    onSnooze,
    allowSnooze = true,
    maxSnoozes = 2,
    currentSnoozes = 0
}) {
    const [countdown, setCountdown] = useState(10); // Auto-dismiss countdown

    useEffect(() => {
        if (!visible) {
            setCountdown(10);
            return;
        }

        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    onSkip('auto-dismissed');
                    return 10;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [visible]);

    if (!visible) return null;

    const isLongBreak = breakType === 'long';
    const canSnooze = allowSnooze && currentSnoozes < maxSnoozes;

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={() => onSkip('dismissed')}
        >
            <View style={{
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.85)',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 20
            }}>
                <View style={{
                    backgroundColor: '#1a1a1a',
                    borderRadius: 20,
                    padding: 32,
                    width: '100%',
                    maxWidth: 500,
                    borderWidth: 4,
                    borderColor: isLongBreak ? '#00aaff' : '#00ff99'
                }}>
                    {/* Icon & Title */}
                    <View style={{ alignItems: 'center', marginBottom: 24 }}>
                        <Text style={{ fontSize: 64, marginBottom: 12 }}>
                            {isLongBreak ? '☕' : '⏸️'}
                        </Text>
                        <Text style={{
                            color: isLongBreak ? '#00aaff' : '#00ff99',
                            fontSize: 28,
                            fontWeight: 'bold',
                            textAlign: 'center'
                        }}>
                            {isLongBreak ? 'Time for a Longer Break!' : 'Quick Break Time!'}
                        </Text>
                    </View>

                    {/* Message */}
                    <View style={{
                        backgroundColor: isLongBreak ? '#00aaff20' : '#00ff9920',
                        borderRadius: 12,
                        padding: 20,
                        marginBottom: 24
                    }}>
                        <Text style={{
                            color: '#fff',
                            fontSize: 16,
                            textAlign: 'center',
                            lineHeight: 24
                        }}>
                            {isLongBreak
                                ? `You've been working hard! Take ${duration} minutes to step away, stretch, and recharge.`
                                : `Take ${duration} minutes to rest your eyes and stretch. You'll come back sharper!`}
                        </Text>
                    </View>

                    {/* Suggestions */}
                    <View style={{
                        backgroundColor: '#2a2a2a',
                        borderRadius: 12,
                        padding: 16,
                        marginBottom: 24
                    }}>
                        <Text style={{ color: '#00aaff', fontSize: 14, fontWeight: 'bold', marginBottom: 8 }}>
                            Break Suggestions:
                        </Text>
                        <Text style={{ color: '#ccc', fontSize: 13, marginBottom: 4 }}>
                            • Stand up and walk around
                        </Text>
                        <Text style={{ color: '#ccc', fontSize: 13, marginBottom: 4 }}>
                            • Look at something 20+ feet away
                        </Text>
                        <Text style={{ color: '#ccc', fontSize: 13, marginBottom: 4 }}>
                            • Stretch your neck and shoulders
                        </Text>
                        <Text style={{ color: '#ccc', fontSize: 13 }}>
                            • Drink some water
                        </Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={{ gap: 12 }}>
                        <TouchableOpacity
                            onPress={onTakeBreak}
                            style={{
                                backgroundColor: isLongBreak ? '#00aaff' : '#00ff99',
                                padding: 18,
                                borderRadius: 12,
                                alignItems: 'center'
                            }}
                        >
                            <Text style={{ color: '#000', fontSize: 18, fontWeight: 'bold' }}>
                                ✓ Take Break ({duration} min)
                            </Text>
                        </TouchableOpacity>

                        {canSnooze && (
                            <TouchableOpacity
                                onPress={onSnooze}
                                style={{
                                    backgroundColor: '#333',
                                    padding: 16,
                                    borderRadius: 12,
                                    alignItems: 'center'
                                }}
                            >
                                <Text style={{ color: '#ffaa00', fontSize: 16, fontWeight: 'bold' }}>
                                    ⏰ Snooze 5 min ({maxSnoozes - currentSnoozes} left)
                                </Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            onPress={() => onSkip('user-declined')}
                            style={{
                                backgroundColor: 'transparent',
                                padding: 16,
                                borderRadius: 12,
                                alignItems: 'center',
                                borderWidth: 2,
                                borderColor: '#666'
                            }}
                        >
                            <Text style={{ color: '#999', fontSize: 14 }}>
                                Skip (auto-dismiss in {countdown}s)
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
