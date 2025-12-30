// app/focuslock.js
// Focus Mode with Progress Lock-In demo

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import ProgressLockWarning from '../components/ProgressLockWarning';
import {
    initializeSessionLock,
    calculateSessionProgress,
    canExitSession,
    getExitStatus,
    forceExitSession,
    releaseSessionLock,
    updateTaskCompletion,
    getProgressSummary
} from '../utils/progressLockEngine';
import { getTasks } from '../utils/taskManager';

export default function FocusLock() {
    const router = useRouter();
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [sessionTasks, setSessionTasks] = useState([]);
    const [completedIds, setCompletedIds] = useState([]);
    const [showExitWarning, setShowExitWarning] = useState(false);
    const [exitStatus, setExitStatus] = useState(null);
    const [progressSummary, setSummary] = useState(null);

    useEffect(() => {
        loadProgress();
    }, [completedIds]);

    const loadProgress = async () => {
        const summary = await getProgressSummary(sessionTasks);
        setSummary(summary);
    };

    const startSession = async () => {
        // Get some pending tasks
        const allTasks = await getTasks({ status: 'pending' });
        const tasksForSession = allTasks.slice(0, 5); // Take first 5 tasks

        if (tasksForSession.length === 0) {
            Alert.alert('No Tasks', 'Create some tasks first to start a focus session');
            return;
        }

        // Initialize lock
        const sessionId = `session_${Date.now()}`;
        await initializeSessionLock(sessionId, tasksForSession);

        setSessionTasks(tasksForSession);
        setCompletedIds([]);
        setIsSessionActive(true);

        Alert.alert(
            '🔒 Focus Session Started',
            `Working on ${tasksForSession.length} tasks.\nComplete 70% to exit without penalty.`
        );
    };

    const toggleTaskCompletion = async (taskId) => {
        let newCompletedIds;

        if (completedIds.includes(taskId)) {
            // Uncomplete
            newCompletedIds = completedIds.filter(id => id !== taskId);
            await updateTaskCompletion(taskId, false);
        } else {
            // Complete
            newCompletedIds = [...completedIds, taskId];
            await updateTaskCompletion(taskId, true);
        }

        setCompletedIds(newCompletedIds);

        // Recalculate progress
        await calculateSessionProgress(newCompletedIds);
    };

    const attemptExit = async () => {
        const canExit = await canExitSession();
        const status = await getExitStatus();

        if (canExit) {
            // Can exit normally
            await releaseSessionLock();
            setIsSessionActive(false);
            setSessionTasks([]);
            setCompletedIds([]);

            Alert.alert(
                '✅ Session Complete!',
                `Great work! You completed ${status.completedTasks}/${status.totalTasks} tasks.`
            );
        } else {
            // Show warning
            setExitStatus(status);
            setShowExitWarning(true);
        }
    };

    const handleKeepGoing = () => {
        setShowExitWarning(false);
        Alert.alert('💪 Good Decision!', 'Finish strong!');
    };

    const handleForceExit = async () => {
        const result = await forceExitSession();
        await releaseSessionLock();

        setShowExitWarning(false);
        setIsSessionActive(false);
        setSessionTasks([]);
        setCompletedIds([]);

        if (result.penaltyApplied) {
            Alert.alert(
                '⚠️ Session Ended Early',
                `Penalty applied: -${result.penaltyPoints} points\nFinish your tasks next time!`
            );
        } else {
            Alert.alert('Session Ended', 'No penalty (already applied)');
        }
    };

    const getRemainingTasks = () => {
        return sessionTasks.filter(task => !completedIds.includes(task.id));
    };

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#000', padding: 16 }}>
            {/* Header */}
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20
            }}>
                <Text style={{ color: '#00ff99', fontSize: 28, fontWeight: 'bold' }}>
                    🔒 Progress Lock-In
                </Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={{ color: '#999', fontSize: 16 }}>← Back</Text>
                </TouchableOpacity>
            </View>

            {/* Description */}
            <View style={{
                backgroundColor: '#1a1a1a',
                borderRadius: 12,
                padding: 16,
                marginBottom: 20,
                borderLeftWidth: 4,
                borderLeftColor: '#00aaff'
            }}>
                <Text style={{ color: '#fff', fontSize: 16, marginBottom: 8 }}>
                    How it works:
                </Text>
                <Text style={{ color: '#999', fontSize: 14, lineHeight: 20 }}>
                    • Start a focus session with tasks{'\n'}
                    • Complete at least 70% to exit cleanly{'\n'}
                    • Try to exit early → Warning modal{'\n'}
                    • Force exit → -25 points penalty
                </Text>
            </View>

            {!isSessionActive ? (
                /* Not Active - Show Start Button */
                <TouchableOpacity
                    onPress={startSession}
                    style={{
                        backgroundColor: '#00ff99',
                        padding: 24,
                        borderRadius: 12,
                        alignItems: 'center',
                        marginBottom: 20
                    }}
                >
                    <Text style={{ color: '#000', fontSize: 20, fontWeight: 'bold' }}>
                        🚀 Start Focus Session
                    </Text>
                    <Text style={{ color: '#000', fontSize: 14, marginTop: 4 }}>
                        Lock-in mode with your pending tasks
                    </Text>
                </TouchableOpacity>
            ) : (
                /* Active Session */
                <>
                    {/* Progress Display */}
                    {progressSummary && (
                        <View style={{
                            backgroundColor: '#1a1a1a',
                            borderRadius: 12,
                            padding: 20,
                            marginBottom: 20
                        }}>
                            <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
                                Session Progress
                            </Text>

                            {/* Progress Bar */}
                            <View style={{ marginBottom: 16 }}>
                                <View style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    marginBottom: 8
                                }}>
                                    <Text style={{ color: '#999' }}>Completion</Text>
                                    <Text style={{
                                        color: progressSummary.canExit ? '#00ff99' : '#ffaa00',
                                        fontWeight: 'bold',
                                        fontSize: 16
                                    }}>
                                        {progressSummary.progress}%
                                    </Text>
                                </View>

                                <View style={{
                                    height: 20,
                                    backgroundColor: '#2a2a2a',
                                    borderRadius: 10,
                                    overflow: 'hidden'
                                }}>
                                    <View style={{
                                        height: '100%',
                                        width: `${progressSummary.progress}%`,
                                        backgroundColor: progressSummary.canExit ? '#00ff99' : '#ffaa00',
                                        borderRadius: 10
                                    }} />
                                </View>

                                <Text style={{ color: '#666', fontSize: 11, marginTop: 4 }}>
                                    Need 70% to exit without penalty
                                </Text>
                            </View>

                            {/* Stats */}
                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'space-around'
                            }}>
                                <View style={{ alignItems: 'center' }}>
                                    <Text style={{ color: '#00ff99', fontSize: 28, fontWeight: 'bold' }}>
                                        {progressSummary.completedTasks}
                                    </Text>
                                    <Text style={{ color: '#999', fontSize: 12 }}>Done</Text>
                                </View>

                                <View style={{ alignItems: 'center' }}>
                                    <Text style={{ color: '#ffaa00', fontSize: 28, fontWeight: 'bold' }}>
                                        {progressSummary.totalTasks - progressSummary.completedTasks}
                                    </Text>
                                    <Text style={{ color: '#999', fontSize: 12 }}>Left</Text>
                                </View>

                                <View style={{ alignItems: 'center' }}>
                                    <Text style={{ color: '#666', fontSize: 28, fontWeight: 'bold' }}>
                                        {progressSummary.totalTasks}
                                    </Text>
                                    <Text style={{ color: '#999', fontSize: 12 }}>Total</Text>
                                </View>
                            </View>

                            {/* Lock Status */}
                            <View style={{
                                marginTop: 16,
                                padding: 12,
                                backgroundColor: progressSummary.canExit ? '#00ff9920' : '#ff660020',
                                borderRadius: 8,
                                borderWidth: 2,
                                borderColor: progressSummary.canExit ? '#00ff99' : '#ff6600'
                            }}>
                                <Text style={{
                                    color: progressSummary.canExit ? '#00ff99' : '#ff6600',
                                    textAlign: 'center',
                                    fontWeight: 'bold'
                                }}>
                                    {progressSummary.canExit ? '🔓 Can Exit Cleanly' : '🔒 Locked - Complete More Tasks'}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Task List */}
                    <View style={{
                        backgroundColor: '#1a1a1a',
                        borderRadius: 12,
                        padding: 16,
                        marginBottom: 20
                    }}>
                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
                            Session Tasks
                        </Text>

                        {sessionTasks.map((task) => {
                            const isCompleted = completedIds.includes(task.id);
                            return (
                                <TouchableOpacity
                                    key={task.id}
                                    onPress={() => toggleTaskCompletion(task.id)}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        padding: 12,
                                        backgroundColor: isCompleted ? '#00ff9920' : '#2a2a2a',
                                        borderRadius: 8,
                                        marginBottom: 8,
                                        borderWidth: 2,
                                        borderColor: isCompleted ? '#00ff99' : 'transparent'
                                    }}
                                >
                                    <View style={{
                                        width: 24,
                                        height: 24,
                                        borderRadius: 12,
                                        borderWidth: 2,
                                        borderColor: isCompleted ? '#00ff99' : '#666',
                                        backgroundColor: isCompleted ? '#00ff99' : 'transparent',
                                        marginRight: 12,
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {isCompleted && <Text style={{ color: '#000', fontWeight: 'bold' }}>✓</Text>}
                                    </View>

                                    <Text style={{
                                        color: isCompleted ? '#00ff99' : '#fff',
                                        fontSize: 14,
                                        flex: 1,
                                        textDecorationLine: isCompleted ? 'line-through' : 'none'
                                    }}>
                                        {task.title}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Exit Button */}
                    <TouchableOpacity
                        onPress={attemptExit}
                        style={{
                            backgroundColor: progressSummary?.canExit ? '#00ff99' : '#ff3333',
                            padding: 20,
                            borderRadius: 12,
                            alignItems: 'center'
                        }}
                    >
                        <Text style={{
                            color: progressSummary?.canExit ? '#000' : '#fff',
                            fontSize: 18,
                            fontWeight: 'bold'
                        }}>
                            {progressSummary?.canExit ? '✓ End Session' : '⚠️ Try to Exit'}
                        </Text>
                        <Text style={{
                            color: progressSummary?.canExit ? '#000' : '#fff',
                            fontSize: 12,
                            marginTop: 4
                        }}>
                            {progressSummary?.canExit ? 'No penalty' : 'Warning will appear'}
                        </Text>
                    </TouchableOpacity>
                </>
            )}

            {/* Progress Lock Warning Modal */}
            <ProgressLockWarning
                visible={showExitWarning}
                exitStatus={exitStatus}
                remainingTasks={getRemainingTasks()}
                onKeepGoing={handleKeepGoing}
                onForceExit={handleForceExit}
            />
        </ScrollView>
    );
}
