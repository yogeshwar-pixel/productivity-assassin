// app/accountability.js
// Accountability features demo and testing page

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import CheckInModal from '../components/CheckInModal';
import PointsDisplay from '../components/PointsDisplay';
import {
    recordCheckIn,
    recordMissedCheckIn,
    getTodayCheckIns,
    calculateConsistency,
    getCheckInStreak,
    getCheckInSettings,
    updateCheckInSettings
} from '../utils/checkInManager';
import {
    awardPoints,
    deductPoints,
    awardTaskCompletionPoints,
    penaltyMissedCheckIn,
    updateStreak
} from '../utils/penaltySystem';

export default function Accountability() {
    const router = useRouter();
    const [showCheckIn, setShowCheckIn] = useState(false);
    const [todayCheckIns, setTodayCheckIns] = useState([]);
    const [consistency, setConsistency] = useState(null);
    const [streak, setStreak] = useState(0);
    const [settings, setSettings] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        loadData();
    }, [refreshKey]);

    const loadData = async () => {
        const [checkIns, metrics, streakDays, checkInSettings] = await Promise.all([
            getTodayCheckIns(),
            calculateConsistency(7),
            getCheckInStreak(),
            getCheckInSettings()
        ]);

        setTodayCheckIns(checkIns);
        setConsistency(metrics);
        setStreak(streakDays);
        setSettings(checkInSettings);
    };

    const handleCheckIn = async (status) => {
        await recordCheckIn({
            status,
            taskIds: [],
            goalIds: [],
            notes: '',
            mood: null
        });

        // Award points for check-in
        if (status === 'on-track') {
            await awardPoints(5, 'On-track check-in', 'checkin');
        }

        setShowCheckIn(false);
        setRefreshKey(prev => prev + 1);

        Alert.alert('✅ Check-In Recorded', `Status: ${status}`);
    };

    const handleMissed = async () => {
        await recordMissedCheckIn();
        await penaltyMissedCheckIn();
        setShowCheckIn(false);
        setRefreshKey(prev => prev + 1);

        Alert.alert('⚠️ Check-In Missed', '-10 points penalty applied');
    };

    const testTaskCompletion = async () => {
        const mockTask = {
            id: 'test_task',
            title: 'Test High Priority Task',
            priority: 'high'
        };

        const result = await awardTaskCompletionPoints(mockTask);
        setRefreshKey(prev => prev + 1);

        Alert.alert('✅ Task Complete', `+${result.points} points awarded!`);
    };

    const testMissedDeadline = async () => {
        await deductPoints(20, 'Missed deadline: Test task', 'deadline_missed');
        setRefreshKey(prev => prev + 1);

        Alert.alert('⚠️ Deadline Missed', '-20 points penalty');
    };

    const testStreakUpdate = async () => {
        const newStreak = streak + 1;
        await updateStreak(newStreak);
        setRefreshKey(prev => prev + 1);

        Alert.alert('🔥 Streak Updated', `Now at ${newStreak} days!`);
    };

    const toggleCheckInSystem = async () => {
        if (!settings) return;

        const newSettings = {
            ...settings,
            enabled: !settings.enabled
        };

        await updateCheckInSettings(newSettings);
        setSettings(newSettings);

        Alert.alert(
            newSettings.enabled ? 'Check-Ins Enabled' : 'Check-Ins Disabled',
            newSettings.enabled
                ? `You'll be prompted every ${settings.intervalMinutes} minutes`
                : 'Check-in prompts paused'
        );
    };

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#000' }}>
            {/* Header */}
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 16
            }}>
                <Text style={{ color: '#00ff99', fontSize: 28, fontWeight: 'bold' }}>
                    📊 Accountability
                </Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={{ color: '#999', fontSize: 16 }}>← Back</Text>
                </TouchableOpacity>
            </View>

            {/* Points Display */}
            <PointsDisplay key={refreshKey} />

            {/* Check-In Stats */}
            <View style={{ padding: 16 }}>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
                    Check-In Stats
                </Text>

                <View style={{
                    backgroundColor: '#1a1a1a',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 16
                }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                        <Text style={{ color: '#999' }}>Today's Check-Ins:</Text>
                        <Text style={{ color: '#00ff99', fontWeight: 'bold' }}>
                            {todayCheckIns.length}
                        </Text>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                        <Text style={{ color: '#999' }}>Current Streak:</Text>
                        <Text style={{ color: '#ff6600', fontWeight: 'bold' }}>
                            🔥 {streak} days
                        </Text>
                    </View>

                    {consistency && (
                        <>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                                <Text style={{ color: '#999' }}>7-Day Consistency:</Text>
                                <Text style={{ color: '#00aaff', fontWeight: 'bold' }}>
                                    {consistency.consistencyRate}%
                                </Text>
                            </View>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ color: '#999' }}>On-Track Rate:</Text>
                                <Text style={{ color: '#00ff99', fontWeight: 'bold' }}>
                                    {consistency.onTrackRate}%
                                </Text>
                            </View>
                        </>
                    )}
                </View>

                {/* Today's Check-Ins List */}
                {todayCheckIns.length > 0 && (
                    <View style={{
                        backgroundColor: '#1a1a1a',
                        borderRadius: 12,
                        padding: 16,
                        marginBottom: 16
                    }}>
                        <Text style={{ color: '#fff', fontWeight: 'bold', marginBottom: 12 }}>
                            Today's Check-Ins
                        </Text>
                        {todayCheckIns.map((checkIn) => (
                            <View
                                key={checkIn.id}
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    paddingVertical: 8,
                                    borderBottomWidth: 1,
                                    borderBottomColor: '#2a2a2a'
                                }}
                            >
                                <Text style={{ color: '#999', fontSize: 12 }}>
                                    {new Date(checkIn.timestamp).toLocaleTimeString()}
                                </Text>
                                <View style={{
                                    backgroundColor: checkIn.status === 'on-track' ? '#00ff99' :
                                        checkIn.status === 'falling-behind' ? '#ff9900' :
                                            checkIn.status === 'distracted' ? '#ff3333' : '#666',
                                    paddingHorizontal: 8,
                                    paddingVertical: 4,
                                    borderRadius: 8
                                }}>
                                    <Text style={{
                                        color: checkIn.status === 'on-track' ? '#000' : '#fff',
                                        fontSize: 11,
                                        fontWeight: 'bold'
                                    }}>
                                        {checkIn.status.toUpperCase()}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Test Controls */}
                <View style={{ marginBottom: 16 }}>
                    <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>
                        Test Controls
                    </Text>

                    <TouchableOpacity
                        onPress={() => setShowCheckIn(true)}
                        style={{
                            backgroundColor: '#ffaa00',
                            padding: 16,
                            borderRadius: 12,
                            alignItems: 'center',
                            marginBottom: 8
                        }}
                    >
                        <Text style={{ color: '#000', fontSize: 16, fontWeight: 'bold' }}>
                            ⏰ Trigger Check-In
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={testTaskCompletion}
                        style={{
                            backgroundColor: '#00ff99',
                            padding: 16,
                            borderRadius: 12,
                            alignItems: 'center',
                            marginBottom: 8
                        }}
                    >
                        <Text style={{ color: '#000', fontSize: 16, fontWeight: 'bold' }}>
                            ✓ Complete Task (High Priority)
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={testMissedDeadline}
                        style={{
                            backgroundColor: '#ff3333',
                            padding: 16,
                            borderRadius: 12,
                            alignItems: 'center',
                            marginBottom: 8
                        }}
                    >
                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                            ✕ Miss Deadline
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={testStreakUpdate}
                        style={{
                            backgroundColor: '#ff6600',
                            padding: 16,
                            borderRadius: 12,
                            alignItems: 'center',
                            marginBottom: 8
                        }}
                    >
                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                            🔥 Increment Streak
                        </Text>
                    </TouchableOpacity>

                    {settings && (
                        <TouchableOpacity
                            onPress={toggleCheckInSystem}
                            style={{
                                backgroundColor: settings.enabled ? '#666' : '#00aaff',
                                padding: 16,
                                borderRadius: 12,
                                alignItems: 'center'
                            }}
                        >
                            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                                {settings.enabled ? 'Disable' : 'Enable'} Check-In System
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Check-In Modal */}
            <CheckInModal
                visible={showCheckIn}
                onCheckIn={handleCheckIn}
                onMissed={handleMissed}
                autoDismissSeconds={120}
            />
        </ScrollView>
    );
}
