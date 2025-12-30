// components/ProgressLockWarning.js
// Warning modal when trying to exit focus session early

import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';

export default function ProgressLockWarning({
    visible,
    exitStatus = {},
    remainingTasks = [],
    onKeepGoing,
    onForceExit
}) {
    if (!visible || !exitStatus) return null;

    const {
        progress = 0,
        requiredProgress = 70,
        completedTasks = 0,
        totalTasks = 0,
        overridePenalty = 25
    } = exitStatus;

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onKeepGoing}
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
                    borderRadius: 16,
                    padding: 32,
                    width: '100%',
                    maxWidth: 600,
                    maxHeight: '90%',
                    borderWidth: 4,
                    borderColor: '#ff6600'
                }}>
                    {/* Header */}
                    <View style={{ alignItems: 'center', marginBottom: 24 }}>
                        <Text style={{ fontSize: 48, marginBottom: 12 }}>⚠️</Text>
                        <Text style={{
                            color: '#ff6600',
                            fontSize: 24,
                            fontWeight: 'bold',
                            textAlign: 'center'
                        }}>
                            Session Incomplete
                        </Text>
                    </View>

                    {/* Progress Bar */}
                    <View style={{ marginBottom: 24 }}>
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            marginBottom: 8
                        }}>
                            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                                Current Progress
                            </Text>
                            <Text style={{
                                color: progress >= requiredProgress ? '#00ff99' : '#ff6600',
                                fontSize: 16,
                                fontWeight: 'bold'
                            }}>
                                {progress}%
                            </Text>
                        </View>

                        {/* Progress Bar Visual */}
                        <View style={{
                            height: 24,
                            backgroundColor: '#2a2a2a',
                            borderRadius: 12,
                            overflow: 'hidden'
                        }}>
                            <View style={{
                                height: '100%',
                                width: `${progress}%`,
                                backgroundColor: progress >= requiredProgress ? '#00ff99' : '#ff6600',
                                borderRadius: 12
                            }} />
                        </View>

                        <Text style={{
                            color: '#999',
                            fontSize: 12,
                            textAlign: 'center',
                            marginTop: 8
                        }}>
                            Minimum required: {requiredProgress}%
                        </Text>
                    </View>

                    {/* Stats */}
                    <View style={{
                        backgroundColor: '#2a2a2a',
                        borderRadius: 12,
                        padding: 16,
                        marginBottom: 20
                    }}>
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-around',
                            marginBottom: 12
                        }}>
                            <View style={{ alignItems: 'center' }}>
                                <Text style={{ color: '#00ff99', fontSize: 24, fontWeight: 'bold' }}>
                                    {completedTasks}
                                </Text>
                                <Text style={{ color: '#999', fontSize: 12 }}>Completed</Text>
                            </View>

                            <View style={{ alignItems: 'center' }}>
                                <Text style={{ color: '#ff6600', fontSize: 24, fontWeight: 'bold' }}>
                                    {totalTasks - completedTasks}
                                </Text>
                                <Text style={{ color: '#999', fontSize: 12 }}>Remaining</Text>
                            </View>

                            <View style={{ alignItems: 'center' }}>
                                <Text style={{ color: '#666', fontSize: 24, fontWeight: 'bold' }}>
                                    {totalTasks}
                                </Text>
                                <Text style={{ color: '#999', fontSize: 12 }}>Total</Text>
                            </View>
                        </View>
                    </View>

                    {/* Remaining Tasks */}
                    {remainingTasks.length > 0 && (
                        <View style={{
                            backgroundColor: '#2a2a2a',
                            borderRadius: 12,
                            padding: 16,
                            marginBottom: 20,
                            maxHeight: 200
                        }}>
                            <Text style={{
                                color: '#fff',
                                fontSize: 14,
                                fontWeight: 'bold',
                                marginBottom: 12
                            }}>
                                Remaining Tasks:
                            </Text>
                            <ScrollView>
                                {remainingTasks.map((task, index) => (
                                    <View
                                        key={task.id}
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'flex-start',
                                            marginBottom: 8
                                        }}
                                    >
                                        <Text style={{ color: '#ff6600', marginRight: 8 }}>•</Text>
                                        <Text style={{ color: '#ccc', fontSize: 14, flex: 1 }}>
                                            {task.title}
                                        </Text>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {/* Warning Message */}
                    <View style={{
                        backgroundColor: '#ff3333',
                        borderRadius: 8,
                        padding: 16,
                        marginBottom: 20
                    }}>
                        <Text style={{
                            color: '#fff',
                            fontSize: 14,
                            textAlign: 'center',
                            lineHeight: 20
                        }}>
                            Exiting now will cost <Text style={{ fontWeight: 'bold' }}>-{overridePenalty} points</Text>
                            {'\n'}
                            Stay focused and complete your tasks!
                        </Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={{ gap: 12 }}>
                        <TouchableOpacity
                            onPress={onKeepGoing}
                            style={{
                                backgroundColor: '#00ff99',
                                padding: 18,
                                borderRadius: 12,
                                alignItems: 'center'
                            }}
                        >
                            <Text style={{ color: '#000', fontSize: 18, fontWeight: 'bold' }}>
                                💪 Keep Going
                            </Text>
                            <Text style={{ color: '#000', fontSize: 12, marginTop: 4 }}>
                                Return to session
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={onForceExit}
                            style={{
                                backgroundColor: '#2a2a2a',
                                padding: 18,
                                borderRadius: 12,
                                alignItems: 'center',
                                borderWidth: 2,
                                borderColor: '#ff3333'
                            }}
                        >
                            <Text style={{ color: '#ff3333', fontSize: 16, fontWeight: 'bold' }}>
                                Exit Anyway (-{overridePenalty} points)
                            </Text>
                            <Text style={{ color: '#999', fontSize: 11, marginTop: 4 }}>
                                Penalty will be applied
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Footer Tip */}
                    <Text style={{
                        color: '#666',
                        fontSize: 11,
                        textAlign: 'center',
                        marginTop: 16,
                        lineHeight: 16
                    }}>
                        Complete {requiredProgress}% of tasks to exit without penalty
                    </Text>
                </View>
            </View>
        </Modal>
    );
}
