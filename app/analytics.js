// app/analytics.js
// Main analytics and reports page

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import DailyReport from '../components/DailyReport';
import GoalStatisticsCard from '../components/GoalStatisticsCard';
import {
    generateDailyReport,
    generateWeeklyReport,
    getDailyReport,
    getWeeklyReport
} from '../utils/reportGenerator';
import {
    getAllGoalsStatistics,
    getGoalAchievementSummary,
    getGoalsNeedingAttention
} from '../utils/goalStatistics';

export default function Analytics() {
    const router = useRouter();
    const [reportType, setReportType] = useState('daily');
    const [dailyReport, setDailyReport] = useState(null);
    const [weeklyReport, setWeeklyReport] = useState(null);
    const [goalsStats, setGoalsStats] = useState([]);
    const [goalsSummary, setGoalsSummary] = useState(null);
    const [needsAttention, setNeedsAttention] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Get or generate reports
            let daily = await getDailyReport();
            if (!daily) {
                daily = await generateDailyReport();
            }

            let weekly = await getWeeklyReport();
            if (!weekly) {
                weekly = await generateWeeklyReport();
            }

            // Get goal statistics
            const [stats, summary, attention] = await Promise.all([
                getAllGoalsStatistics(),
                getGoalAchievementSummary(),
                getGoalsNeedingAttention()
            ]);

            setDailyReport(daily);
            setWeeklyReport(weekly);
            setGoalsStats(stats);
            setGoalsSummary(summary);
            setNeedsAttention(attention);
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateReport = async () => {
        Alert.alert(
            'Generate New Report',
            'Generate fresh reports with current data?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Generate',
                    onPress: async () => {
                        await Promise.all([
                            generateDailyReport(),
                            generateWeeklyReport()
                        ]);
                        loadData();
                        Alert.alert('✅ Reports Updated', 'Fresh reports generated!');
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#999' }}>Loading analytics...</Text>
            </View>
        );
    }

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
                    📊 Analytics
                </Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={{ color: '#999', fontSize: 16 }}>← Back</Text>
                </TouchableOpacity>
            </View>

            {/* Report Type Selector */}
            <View style={{
                flexDirection: 'row',
                gap: 12,
                marginBottom: 20
            }}>
                <TouchableOpacity
                    onPress={() => setReportType('daily')}
                    style={{
                        flex: 1,
                        padding: 14,
                        borderRadius: 12,
                        backgroundColor: reportType === 'daily' ? '#00ff99' : '#1a1a1a',
                        alignItems: 'center'
                    }}
                >
                    <Text style={{
                        color: reportType === 'daily' ? '#000' : '#999',
                        fontSize: 16,
                        fontWeight: 'bold'
                    }}>
                        Daily
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setReportType('weekly')}
                    style={{
                        flex: 1,
                        padding: 14,
                        borderRadius: 12,
                        backgroundColor: reportType === 'weekly' ? '#00ff99' : '#1a1a1a',
                        alignItems: 'center'
                    }}
                >
                    <Text style={{
                        color: reportType === 'weekly' ? '#000' : '#999',
                        fontSize: 16,
                        fontWeight: 'bold'
                    }}>
                        Weekly
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setReportType('goals')}
                    style={{
                        flex: 1,
                        padding: 14,
                        borderRadius: 12,
                        backgroundColor: reportType === 'goals' ? '#00ff99' : '#1a1a1a',
                        alignItems: 'center'
                    }}
                >
                    <Text style={{
                        color: reportType === 'goals' ? '#000' : '#999',
                        fontSize: 16,
                        fontWeight: 'bold'
                    }}>
                        Goals
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Daily Report */}
            {reportType === 'daily' && dailyReport && (
                <DailyReport report={dailyReport} />
            )}

            {/* Weekly Report */}
            {reportType === 'weekly' && weeklyReport && (
                <View>
                    <View style={{
                        backgroundColor: '#1a1a1a',
                        borderRadius: 12,
                        padding: 20,
                        marginBottom: 16,
                        borderLeftWidth: 4,
                        borderLeftColor: '#00aaff'
                    }}>
                        <Text style={{ color: '#00aaff', fontSize: 24, fontWeight: 'bold', marginBottom: 4 }}>
                            Weekly Report
                        </Text>
                        <Text style={{ color: '#999', fontSize: 14 }}>
                            Week {weeklyReport.weekNumber} • {new Date(weeklyReport.startDate).toLocaleDateString()} - {new Date(weeklyReport.endDate).toLocaleDateString()}
                        </Text>
                    </View>

                    {/* Week Stats */}
                    <View style={{
                        backgroundColor: '#1a1a1a',
                        borderRadius: 12,
                        padding: 20,
                        marginBottom: 16
                    }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 }}>
                            <View style={{ alignItems: 'center' }}>
                                <Text style={{ color: '#00ff99', fontSize: 28, fontWeight: 'bold' }}>
                                    {weeklyReport.metrics.tasksCompleted}
                                </Text>
                                <Text style={{ color: '#999', fontSize: 12 }}>Tasks Done</Text>
                            </View>

                            <View style={{ alignItems: 'center' }}>
                                <Text style={{ color: '#00aaff', fontSize: 28, fontWeight: 'bold' }}>
                                    {weeklyReport.metrics.completionRate}%
                                </Text>
                                <Text style={{ color: '#999', fontSize: 12 }}>Completion</Text>
                            </View>

                            <View style={{ alignItems: 'center' }}>
                                <Text style={{ color: '#ffaa00', fontSize: 28, fontWeight: 'bold' }}>
                                    {weeklyReport.metrics.pointsEarned}
                                </Text>
                                <Text style={{ color: '#999', fontSize: 12 }}>Points</Text>
                            </View>
                        </View>

                        {weeklyReport.bestDay && (
                            <View style={{
                                backgroundColor: '#00ff9920',
                                borderRadius: 8,
                                padding: 12,
                                borderWidth: 1,
                                borderColor: '#00ff99'
                            }}>
                                <Text style={{ color: '#00ff99', fontSize: 14, fontWeight: 'bold' }}>
                                    🏆 Best Day: {new Date(weeklyReport.bestDay.date).toLocaleDateString('en-US', { weekday: 'long' })}
                                </Text>
                                <Text style={{ color: '#ccc', fontSize: 12, marginTop: 4 }}>
                                    {weeklyReport.bestDay.tasksCompleted} tasks completed
                                </Text>
                            </View>
                        )}

                        {weeklyReport.comparison && (
                            <View style={{ marginTop: 12 }}>
                                <Text style={{ color: '#666', fontSize: 12, marginBottom: 6 }}>
                                    vs Last Week:
                                </Text>
                                <Text style={{
                                    color: weeklyReport.comparison.tasksChange >= 0 ? '#00ff99' : '#ff6600',
                                    fontSize: 14
                                }}>
                                    {weeklyReport.comparison.tasksChange >= 0 ? '↑' : '↓'} {Math.abs(weeklyReport.comparison.tasksChange)} tasks
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            )}

            {/* Goals Statistics */}
            {reportType === 'goals' && (
                <View>
                    {/* Goals Summary */}
                    {goalsSummary && (
                        <View style={{
                            backgroundColor: '#1a1a1a',
                            borderRadius: 12,
                            padding: 20,
                            marginBottom: 16
                        }}>
                            <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
                                Goals Overview
                            </Text>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 }}>
                                <View style={{ alignItems: 'center' }}>
                                    <Text style={{ color: '#00ff99', fontSize: 24, fontWeight: 'bold' }}>
                                        {goalsSummary.completedGoals}
                                    </Text>
                                    <Text style={{ color: '#999', fontSize: 12 }}>Completed</Text>
                                </View>

                                <View style={{ alignItems: 'center' }}>
                                    <Text style={{ color: '#00aaff', fontSize: 24, fontWeight: 'bold' }}>
                                        {goalsSummary.activeGoals}
                                    </Text>
                                    <Text style={{ color: '#999', fontSize: 12 }}>Active</Text>
                                </View>

                                <View style={{ alignItems: 'center' }}>
                                    <Text style={{ color: '#ffaa00', fontSize: 24, fontWeight: 'bold' }}>
                                        {goalsSummary.averageCompletion}%
                                    </Text>
                                    <Text style={{ color: '#999', fontSize: 12 }}>Avg Progress</Text>
                                </View>
                            </View>

                            {goalsSummary.atRiskCount > 0 && (
                                <View style={{
                                    backgroundColor: '#ff330020',
                                    borderRadius: 8,
                                    padding: 12,
                                    borderWidth: 1,
                                    borderColor: '#ff3333'
                                }}>
                                    <Text style={{ color: '#ff3333', fontWeight: 'bold' }}>
                                        ⚠️ {goalsSummary.atRiskCount} goal{goalsSummary.atRiskCount > 1 ? 's' : ''} need attention
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Goals Needing Attention */}
                    {needsAttention.length > 0 && (
                        <View style={{ marginBottom: 16 }}>
                            <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
                                ⚠️ Needs Attention
                            </Text>
                            {needsAttention.map(stat => (
                                <GoalStatisticsCard key={stat.goalId} stats={stat} />
                            ))}
                        </View>
                    )}

                    {/* All Goals */}
                    <View>
                        <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
                            All Goals ({goalsStats.length})
                        </Text>
                        {goalsStats.length === 0 ? (
                            <View style={{
                                backgroundColor: '#1a1a1a',
                                borderRadius: 12,
                                padding: 20,
                                alignItems: 'center'
                            }}>
                                <Text style={{ color: '#666', textAlign: 'center' }}>
                                    No goals yet. Create some to see statistics!
                                </Text>
                            </View>
                        ) : (
                            goalsStats.map(stat => (
                                <GoalStatisticsCard key={stat.goalId} stats={stat} />
                            ))
                        )}
                    </View>
                </View>
            )}

            {/* Refresh Button */}
            <TouchableOpacity
                onPress={handleGenerateReport}
                style={{
                    backgroundColor: '#00aaff',
                    padding: 18,
                    borderRadius: 12,
                    alignItems: 'center',
                    marginTop: 20,
                    marginBottom: 40
                }}
            >
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                    🔄 Refresh Reports
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}
