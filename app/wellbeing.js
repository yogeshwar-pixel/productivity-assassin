// app/wellbeing.js
// Wellbeing & Balance Dashboard

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import BreakReminderModal from '../components/BreakReminderModal';
import MindfulnessPrompt from '../components/MindfulnessPrompt';
import {
    getBreakStatistics,
    recordBreakTaken,
    recordBreakSkipped,
    recordBreakSnoozed,
    shouldWarnAboutBreaks
} from '../utils/breakReminder';
import {
    getMindfulnessStats,
    getContextualPrompt,
    logPromptShown
} from '../utils/mindfulnessPrompts';
import {
    getWeeklyBalance,
    getBalanceScore
} from '../utils/balanceAnalytics';

export default function Wellbeing() {
    const router = useRouter();
    const [breakStats, setBreakStats] = useState(null);
    const [mindfulnessStats, setMindfulnessStats] = useState(null);
    const [weeklyBalance, setWeeklyBalance] = useState(null);
    const [balanceScore, setBalanceScore] = useState(0);
    const [showBreakModal, setShowBreakModal] = useState(false);
    const [showMindfulness, setShowMindfulness] = useState(false);
    const [currentPrompt, setCurrentPrompt] = useState(null);
    const [snoozeCount, setSnoozeCount] = useState(0);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [breaks, mindfulness, balance, score] = await Promise.all([
            getBreakStatistics(7),
            getMindfulnessStats(7),
            getWeeklyBalance(),
            getBalanceScore()
        ]);

        setBreakStats(breaks);
        setMindfulnessStats(mindfulness);
        setWeeklyBalance(balance);
        setBalanceScore(score);
    };

    const handleTriggerBreak = () => {
        setShowBreakModal(true);
    };

    const handleTakeBreak = async () => {
        await recordBreakTaken('short', 5);
        setShowBreakModal(false);
        setSnoozeCount(0);
        loadData();
    };

    const handleSkipBreak = async (reason) => {
        await recordBreakSkipped('short', reason);
        setShowBreakModal(false);
        setSnoozeCount(0);
        loadData();
    };

    const handleSnoozeBreak = async () => {
        await recordBreakSnoozed('short', 5);
        setSnoozeCount(prev => prev + 1);
        setShowBreakModal(false);
        loadData();
    };

    const handleTriggerMindfulness = async () => {
        const prompt = await getContextualPrompt({
            isDuringBreak: false,
            stressLevel: 'medium'
        });

        if (prompt) {
            setCurrentPrompt(prompt);
            setShowMindfulness(true);
        }
    };

    const handleCompleteMindfulness = async () => {
        if (currentPrompt) {
            await logPromptShown(currentPrompt, true);
        }
        setShowMindfulness(false);
        loadData();
    };

    const handleSkipMindfulness = async () => {
        if (currentPrompt) {
            await logPromptShown(currentPrompt, false);
        }
        setShowMindfulness(false);
    };

    const getScoreColor = (score) => {
        if (score >= 80) return '#00ff99';
        if (score >= 60) return '#ffaa00';
        return '#ff3333';
    };

    const getScoreLabel = (score) => {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Fair';
        return 'Needs Attention';
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
                    💚 Wellbeing
                </Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={{ color: '#999', fontSize: 16 }}>← Back</Text>
                </TouchableOpacity>
            </View>

            {/* Balance Score */}
            <View style={{
                backgroundColor: '#1a1a1a',
                borderRadius: 16,
                padding: 24,
                marginBottom: 20,
                alignItems: 'center',
                borderWidth: 3,
                borderColor: getScoreColor(balanceScore)
            }}>
                <Text style={{ color: '#999', fontSize: 14, marginBottom: 8 }}>
                    Work-Life Balance Score
                </Text>
                <Text style={{
                    color: getScoreColor(balanceScore),
                    fontSize: 64,
                    fontWeight: 'bold'
                }}>
                    {balanceScore}
                </Text>
                <Text style={{
                    color: getScoreColor(balanceScore),
                    fontSize: 18,
                    fontWeight: 'bold'
                }}>
                    {getScoreLabel(balanceScore)}
                </Text>
            </View>

            {/* Quick Actions */}
            <View style={{
                flexDirection: 'row',
                gap: 12,
                marginBottom: 20
            }}>
                <TouchableOpacity
                    onPress={handleTriggerBreak}
                    style={{
                        flex: 1,
                        backgroundColor: '#00aaff',
                        padding: 16,
                        borderRadius: 12,
                        alignItems: 'center'
                    }}
                >
                    <Text style={{ fontSize: 24, marginBottom: 4 }}>⏸️</Text>
                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>
                        Take Break
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleTriggerMindfulness}
                    style={{
                        flex: 1,
                        backgroundColor: '#9333ea',
                        padding: 16,
                        borderRadius: 12,
                        alignItems: 'center'
                    }}
                >
                    <Text style={{ fontSize: 24, marginBottom: 4 }}>🧘</Text>
                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>
                        Mindfulness
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Break Statistics */}
            {breakStats && (
                <View style={{
                    backgroundColor: '#1a1a1a',
                    borderRadius: 12,
                    padding: 20,
                    marginBottom: 20
                }}>
                    <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
                        Break Habits (Last 7 Days)
                    </Text>

                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                        marginBottom: 16
                    }}>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ color: '#00ff99', fontSize: 28, fontWeight: 'bold' }}>
                                {breakStats.breaksTaken}
                            </Text>
                            <Text style={{ color: '#999', fontSize: 12 }}>Taken</Text>
                        </View>

                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ color: '#ff6600', fontSize: 28, fontWeight: 'bold' }}>
                                {breakStats.breaksSkipped}
                            </Text>
                            <Text style={{ color: '#999', fontSize: 12 }}>Skipped</Text>
                        </View>

                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ color: '#00aaff', fontSize: 28, fontWeight: 'bold' }}>
                                {breakStats.complianceRate}%
                            </Text>
                            <Text style={{ color: '#999', fontSize: 12 }}>Compliance</Text>
                        </View>
                    </View>

                    {breakStats.skipStreak > 2 && (
                        <View style={{
                            backgroundColor: '#ff330020',
                            borderRadius: 8,
                            padding: 12,
                            borderWidth: 1,
                            borderColor: '#ff3333'
                        }}>
                            <Text style={{ color: '#ff3333', fontSize: 13, textAlign: 'center' }}>
                                ⚠️ You've skipped {breakStats.skipStreak} breaks in a row. Remember to rest!
                            </Text>
                        </View>
                    )}
                </View>
            )}

            {/* Mindfulness Stats */}
            {mindfulnessStats && (
                <View style={{
                    backgroundColor: '#1a1a1a',
                    borderRadius: 12,
                    padding: 20,
                    marginBottom: 20
                }}>
                    <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
                        Mindfulness Practice
                    </Text>

                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-around'
                    }}>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ color: '#9333ea', fontSize: 28, fontWeight: 'bold' }}>
                                {mindfulnessStats.completed}
                            </Text>
                            <Text style={{ color: '#999', fontSize: 12 }}>Exercises</Text>
                        </View>

                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ color: '#00ff99', fontSize: 28, fontWeight: 'bold' }}>
                                {mindfulnessStats.totalMinutes}
                            </Text>
                            <Text style={{ color: '#999', fontSize: 12 }}>Minutes</Text>
                        </View>

                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ color: '#ffaa00', fontSize: 28, fontWeight: 'bold' }}>
                                {mindfulnessStats.completionRate}%
                            </Text>
                            <Text style={{ color: '#999', fontSize: 12 }}>Rate</Text>
                        </View>
                    </View>
                </View>
            )}

            {/* Weekly Balance */}
            {weeklyBalance && (
                <View style={{
                    backgroundColor: '#1a1a1a',
                    borderRadius: 12,
                    padding: 20,
                    marginBottom: 20
                }}>
                    <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
                        This Week's Balance
                    </Text>

                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                        marginBottom: 16
                    }}>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ color: '#00aaff', fontSize: 24, fontWeight: 'bold' }}>
                                {weeklyBalance.totalWorkHours}h
                            </Text>
                            <Text style={{ color: '#999', fontSize: 12 }}>Work</Text>
                        </View>

                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ color: '#00ff99', fontSize: 24, fontWeight: 'bold' }}>
                                {weeklyBalance.totalBreakHours}h
                            </Text>
                            <Text style={{ color: '#999', fontSize: 12 }}>Breaks</Text>
                        </View>

                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ color: '#ffaa00', fontSize: 24, fontWeight: 'bold' }}>
                                {weeklyBalance.averageDailyWork}h
                            </Text>
                            <Text style={{ color: '#999', fontSize: 12 }}>Avg/Day</Text>
                        </View>
                    </View>

                    {weeklyBalance.mostProductiveDay && (
                        <View style={{
                            backgroundColor: '#00ff9920',
                            borderRadius: 8,
                            padding: 12,
                            marginBottom: 12
                        }}>
                            <Text style={{ color: '#00ff99', fontSize: 13, textAlign: 'center' }}>
                                🏆 Most Productive: {weeklyBalance.mostProductiveDay.dayName}
                                ({Math.round(weeklyBalance.mostProductiveDay.workMinutes / 60)}h)
                            </Text>
                        </View>
                    )}

                    {/* Warnings */}
                    {weeklyBalance.warningIndicators.length > 0 && (
                        <View>
                            <Text style={{ color: '#ff6600', fontSize: 14, fontWeight: 'bold', marginBottom: 8 }}>
                                ⚠️ Wellbeing Alerts:
                            </Text>
                            {weeklyBalance.warningIndicators.map((warning, index) => (
                                <View
                                    key={index}
                                    style={{
                                        backgroundColor: warning.severity === 'high' ? '#ff330020' : '#ffaa0020',
                                        borderRadius: 8,
                                        padding: 12,
                                        marginBottom: 8,
                                        borderLeftWidth: 4,
                                        borderLeftColor: warning.severity === 'high' ? '#ff3333' : '#ffaa00'
                                    }}
                                >
                                    <Text style={{
                                        color: warning.severity === 'high' ? '#ff3333' : '#ffaa00',
                                        fontSize: 12,
                                        lineHeight: 18
                                    }}>
                                        {warning.message}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            )}

            {/* Tips */}
            <View style={{
                backgroundColor: '#1a1a1a',
                borderRadius: 12,
                padding: 20,
                marginBottom: 40
            }}>
                <Text style={{ color: '#00aaff', fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
                    💡 Wellbeing Tips
                </Text>
                <Text style={{ color: '#ccc', fontSize: 13, lineHeight: 20, marginBottom: 8 }}>
                    • Take regular breaks every 25-50 minutes
                </Text>
                <Text style={{ color: '#ccc', fontSize: 13, lineHeight: 20, marginBottom: 8 }}>
                    • Practice mindfulness to reduce stress
                </Text>
                <Text style={{ color: '#ccc', fontSize: 13, lineHeight: 20, marginBottom: 8 }}>
                    • Avoid working late nights
                </Text>
                <Text style={{ color: '#ccc', fontSize: 13, lineHeight: 20 }}>
                    • Balance work time with adequate rest
                </Text>
            </View>

            {/* Modals */}
            <BreakReminderModal
                visible={showBreakModal}
                breakType="short"
                duration={5}
                onTakeBreak={handleTakeBreak}
                onSkip={handleSkipBreak}
                onSnooze={handleSnoozeBreak}
                currentSnoozes={snoozeCount}
            />

            <MindfulnessPrompt
                visible={showMindfulness}
                prompt={currentPrompt}
                onComplete={handleCompleteMindfulness}
                onSkip={handleSkipMindfulness}
            />
        </ScrollView>
    );
}
