// components/MindfulnessPrompt.js
// Mindfulness exercise prompt

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';

export default function MindfulnessPrompt({
    visible,
    prompt,
    onComplete,
    onSkip
}) {
    const [timer, setTimer] = useState(0);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        if (!visible || !isActive) {
            setTimer(0);
            return;
        }

        const interval = setInterval(() => {
            setTimer(prev => {
                if (prev >= prompt.duration) {
                    setIsActive(false);
                    return prompt.duration;
                }
                return prev + 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [visible, isActive, prompt]);

    const handleStart = () => {
        setIsActive(true);
    };

    const handleComplete = () => {
        setIsActive(false);
        onComplete();
    };

    if (!visible || !prompt) return null;

    const progress = (timer / prompt.duration) * 100;
    const isFinished = timer >= prompt.duration;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onSkip}
        >
            <View style={{
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.9)',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 20
            }}>
                <View style={{
                    backgroundColor: '#1a1a1a',
                    borderRadius: 20,
                    padding: 32,
                    width: '100%',
                    maxWidth: 450,
                    borderWidth: 3,
                    borderColor: '#9333ea'
                }}>
                    {/* Header */}
                    <View style={{ alignItems: 'center', marginBottom: 24 }}>
                        <Text style={{ fontSize: 48, marginBottom: 12 }}>
                            {prompt.icon}
                        </Text>
                        <Text style={{
                            color: '#9333ea',
                            fontSize: 24,
                            fontWeight: 'bold',
                            textAlign: 'center'
                        }}>
                            {prompt.title}
                        </Text>
                        <Text style={{
                            color: '#666',
                            fontSize: 13,
                            marginTop: 4
                        }}>
                            {prompt.duration} seconds
                        </Text>
                    </View>

                    {/* Instruction */}
                    <View style={{
                        backgroundColor: '#9333ea20',
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
                            {prompt.instruction}
                        </Text>
                    </View>

                    {/* Timer Display */}
                    {isActive && (
                        <View style={{ alignItems: 'center', marginBottom: 24 }}>
                            <Text style={{
                                color: '#9333ea',
                                fontSize: 48,
                                fontWeight: 'bold'
                            }}>
                                {timer}s
                            </Text>

                            {/* Progress Bar */}
                            <View style={{
                                width: '100%',
                                height: 8,
                                backgroundColor: '#2a2a2a',
                                borderRadius: 4,
                                marginTop: 16,
                                overflow: 'hidden'
                            }}>
                                <View style={{
                                    height: '100%',
                                    width: `${progress}%`,
                                    backgroundColor: '#9333ea',
                                    borderRadius: 4
                                }} />
                            </View>
                        </View>
                    )}

                    {/* Action Buttons */}
                    <View style={{ gap: 12 }}>
                        {!isActive && !isFinished && (
                            <>
                                <TouchableOpacity
                                    onPress={handleStart}
                                    style={{
                                        backgroundColor: '#9333ea',
                                        padding: 18,
                                        borderRadius: 12,
                                        alignItems: 'center'
                                    }}
                                >
                                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
                                        🧘 Start Exercise
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={onSkip}
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
                                        Not Now
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {isFinished && (
                            <TouchableOpacity
                                onPress={handleComplete}
                                style={{
                                    backgroundColor: '#00ff99',
                                    padding: 18,
                                    borderRadius: 12,
                                    alignItems: 'center'
                                }}
                            >
                                <Text style={{ color: '#000', fontSize: 18, fontWeight: 'bold' }}>
                                    ✓ Complete
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Motivational Footer */}
                    {!isActive && (
                        <Text style={{
                            color: '#666',
                            fontSize: 12,
                            textAlign: 'center',
                            marginTop: 16,
                            lineHeight: 18
                        }}>
                            Taking a moment for yourself improves focus and reduces stress
                        </Text>
                    )}
                </View>
            </View>
        </Modal>
    );
}
