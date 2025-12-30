// components/CheckInModal.js
// Self-check-in prompt modal

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';

export default function CheckInModal({ visible, onCheckIn, onMissed, autoDismissSeconds = 60 }) {
    const [countdown, setCountdown] = useState(autoDismissSeconds);

    useEffect(() => {
        if (visible && autoDismissSeconds > 0) {
            setCountdown(autoDismissSeconds);

            const timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        onMissed(); // Auto-mark as missed
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [visible]);

    if (!visible) return null;

    const handleStatus = (status) => {
        onCheckIn(status);
    };

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={() => { }} // Cannot dismiss
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
                    borderRadius: 16,
                    padding: 32,
                    width: '100%',
                    maxWidth: 500,
                    borderWidth: 3,
                    borderColor: '#ffaa00'
                }}>
                    {/* Header */}
                    <View style={{ alignItems: 'center', marginBottom: 24 }}>
                        <Text style={{
                            color: '#ffaa00',
                            fontSize: 24,
                            fontWeight: 'bold',
                            marginBottom: 8
                        }}>
                            ⏰ Check-In Time
                        </Text>
                        <Text style={{ color: '#999', fontSize: 14 }}>
                            Auto-dismisses in {countdown}s (counts as missed)
                        </Text>
                    </View>

                    {/* Question */}
                    <Text style={{
                        color: '#fff',
                        fontSize: 18,
                        textAlign: 'center',
                        marginBottom: 24
                    }}>
                        How's your progress right now?
                    </Text>

                    {/* Status Buttons */}
                    <View style={{ gap: 12 }}>
                        <TouchableOpacity
                            onPress={() => handleStatus('on-track')}
                            style={{
                                backgroundColor: '#00ff99',
                                padding: 16,
                                borderRadius: 12,
                                alignItems: 'center'
                            }}
                        >
                            <Text style={{ color: '#000', fontSize: 16, fontWeight: 'bold' }}>
                                ✓ On Track
                            </Text>
                            <Text style={{ color: '#000', fontSize: 12, marginTop: 4 }}>
                                +2 points
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => handleStatus('falling-behind')}
                            style={{
                                backgroundColor: '#ff9900',
                                padding: 16,
                                borderRadius: 12,
                                alignItems: 'center'
                            }}
                        >
                            <Text style={{ color: '#000', fontSize: 16, fontWeight: 'bold' }}>
                                ⚠️ Falling Behind
                            </Text>
                            <Text style={{ color: '#000', fontSize: 12, marginTop: 4 }}>
                                No point change
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => handleStatus('distracted')}
                            style={{
                                backgroundColor: '#ff3333',
                                padding: 16,
                                borderRadius: 12,
                                alignItems: 'center'
                            }}
                        >
                            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                                ✕ Distracted
                            </Text>
                            <Text style={{ color: '#fff', fontSize: 12, marginTop: 4 }}>
                                No point change (honest reporting)
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Warning */}
                    <Text style={{
                        color: '#666',
                        fontSize: 12,
                        textAlign: 'center',
                        marginTop: 16
                    }}>
                        Not responding counts as "Missed" (-5 points)
                    </Text>
                </View>
            </View>
        </Modal>
    );
}
