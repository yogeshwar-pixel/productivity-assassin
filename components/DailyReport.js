// components/DailyReport.js
// Display daily productivity report

import React from 'react';
import { View, Text, ScrollView } from 'react-native';

export default function DailyReport({ report }) {
    if (!report) {
        return (
            <View style={{ backgroundColor: '#1a1a1a', borderRadius: 12, padding: 20 }}>
                <Text style={{ color: '#666', textAlign: 'center' }}>
                    No report available for this date
                </Text>
            </View>
        );
    }

    const { metrics, comparison, topAccomplishment } = report;
    const reportDate = new Date(report.date);

    return (
        <ScrollView style={{ flex: 1 }}>
            {/* Header */}
            <View style={{
                backgroundColor: '#1a1a1a',
                borderRadius: 12,
                padding: 20,
                marginBottom: 16,
                borderLeftWidth: 4,
                borderLeftColor: '#00ff99'
            }}>
                <Text style={{ color: '#00ff99', fontSize: 24, fontWeight: 'bold', marginBottom: 4 }}>
                    Daily Report
                </Text>
                <Text style={{ color: '#999', fontSize: 14 }}>
                    {reportDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </Text>
            </View>

            {/* Key Metrics */}
            <View style={{
                backgroundColor: '#1a1a1a',
                borderRadius: 12,
                padding: 20,
                marginBottom: 16
            }}>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
                    Overview
                </Text>

                {/* Tasks */}
                <View style={{ marginBottom: 16 }}>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 8
                    }}>
                        <Text style={{ color: '#ccc', fontSize: 16 }}>Tasks Completed</Text>
                        <Text style={{ color: '#00ff99', fontSize: 24, fontWeight: 'bold' }}>
                            {metrics.tasksCompleted}/{metrics.tasksPlanned}
                        </Text>
                    </View>

                    {/* Progress Bar */}
                    <View style={{
                        height: 8,
                        backgroundColor: '#2a2a2a',
                        borderRadius: 4,
                        overflow: 'hidden'
                    }}>
                        <View style={{
                            height: '100%',
                            width: `${metrics.completionRate}%`,
                            backgroundColor: '#00ff99',
                            borderRadius: 4
                        }} />
                    </View>

                    <Text style={{ color: '#666', fontSize: 12, marginTop: 4 }}>
                        {metrics.completionRate}% completion rate
                    </Text>

                    {/* Comparison */}
                    {comparison && (
                        <Text style={{
                            color: comparison.tasksChange >= 0 ? '#00ff99' : '#ff6600',
                            fontSize: 13,
                            marginTop: 8
                        }}>
                            {comparison.tasksChange >= 0 ? '↑' : '↓'} {Math.abs(comparison.tasksChange)} vs yesterday
                        </Text>
                    )}
                </View>

                {/* Points */}
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingVertical: 12,
                    borderTopWidth: 1,
                    borderTopColor: '#2a2a2a'
                }}>
                    <Text style={{ color: '#ccc' }}>Points Earned</Text>
                    <Text style={{ color: '#ffaa00', fontWeight: 'bold', fontSize: 18 }}>
                        +{metrics.pointsEarned}
                    </Text>
                </View>

                {/* Check-ins */}
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingVertical: 12,
                    borderTopWidth: 1,
                    borderTopColor: '#2a2a2a'
                }}>
                    <Text style={{ color: '#ccc' }}>Check-ins</Text>
                    <Text style={{ color: '#00aaff', fontWeight: 'bold' }}>
                        {metrics.checkInsCompleted} completed
                    </Text>
                </View>

                {metrics.checkInsMissed > 0 && (
                    <Text style={{ color: '#ff3333', fontSize: 12, marginTop: 4 }}>
                        {metrics.checkInsMissed} missed
                    </Text>
                )}

                {/* Missed Tasks Warning */}
                {metrics.tasksMissed > 0 && (
                    <View style={{
                        backgroundColor: '#ff330020',
                        borderRadius: 8,
                        padding: 12,
                        marginTop: 12,
                        borderWidth: 1,
                        borderColor: '#ff3333'
                    }}>
                        <Text style={{ color: '#ff3333', fontWeight: 'bold' }}>
                            ⚠️ {metrics.tasksMissed} deadline{metrics.tasksMissed > 1 ? 's' : ''} missed
                        </Text>
                    </View>
                )}
            </View>

            {/* Top Accomplishment */}
            {topAccomplishment && (
                <View style={{
                    backgroundColor: '#00ff9920',
                    borderRadius: 12,
                    padding: 20,
                    marginBottom: 16,
                    borderWidth: 2,
                    borderColor: '#00ff99'
                }}>
                    <Text style={{ color: '#00ff99', fontSize: 14, fontWeight: 'bold', marginBottom: 8 }}>
                        🏆 Top Accomplishment
                    </Text>
                    <Text style={{ color: '#fff', fontSize: 16, marginBottom: 4 }}>
                        {topAccomplishment.title}
                    </Text>
                    <View style={{
                        backgroundColor: topAccomplishment.priority === 'urgent' ? '#ff3333' :
                            topAccomplishment.priority === 'high' ? '#ff9900' :
                                topAccomplishment.priority === 'medium' ? '#ffaa00' : '#00aaff',
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 6,
                        alignSelf: 'flex-start',
                        marginTop: 8
                    }}>
                        <Text style={{
                            color: '#fff',
                            fontSize: 11,
                            fontWeight: 'bold',
                            textTransform: 'uppercase'
                        }}>
                            {topAccomplishment.priority}
                        </Text>
                    </View>
                </View>
            )}

            {/* Summary */}
            <View style={{
                backgroundColor: '#1a1a1a',
                borderRadius: 12,
                padding: 20
            }}>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
                    Summary
                </Text>
                <Text style={{ color: '#ccc', fontSize: 14, lineHeight: 22 }}>
                    {metrics.tasksCompleted > 0
                        ? `Great work! You completed ${metrics.tasksCompleted} task${metrics.tasksCompleted > 1 ? 's' : ''} today` +
                        (metrics.completionRate >= 80 ? ' with excellent focus' : '') +
                        (metrics.pointsEarned > 50 ? ` and earned ${metrics.pointsEarned} points!` : '.')
                        : 'No tasks completed today. Tomorrow is a new opportunity!'}
                </Text>
            </View>
        </ScrollView>
    );
}
