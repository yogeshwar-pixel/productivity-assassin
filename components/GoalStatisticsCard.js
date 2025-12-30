// components/GoalStatisticsCard.js
// Display goal statistics and classification

import React from 'react';
import { View, Text } from 'react-native';

export default function GoalStatisticsCard({ stats }) {
    if (!stats) return null;

    const getClassificationColor = (classification) => {
        switch (classification) {
            case 'completed': return '#00ff99';
            case 'on-track': return '#00aaff';
            case 'behind-schedule': return '#ffaa00';
            case 'at-risk': return '#ff9900';
            case 'overdue': return '#ff3333';
            case 'in-progress': return '#00aaff';
            case 'just-started': return '#666';
            default: return '#666';
        }
    };

    const getClassificationLabel = (classification) => {
        switch (classification) {
            case 'completed': return '✓ Completed';
            case 'on-track': return '✓ On Track';
            case 'behind-schedule': return '⚠ Behind Schedule';
            case 'at-risk': return '⚠ At Risk';
            case 'overdue': return '✕ Overdue';
            case 'in-progress': return '→ In Progress';
            case 'just-started': return '→ Just Started';
            default: return classification;
        }
    };

    const color = getClassificationColor(stats.classification);
    const label = getClassificationLabel(stats.classification);

    return (
        <View style={{
            backgroundColor: '#1a1a1a',
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            borderLeftWidth: 4,
            borderLeftColor: color
        }}>
            {/* Header */}
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 12
            }}>
                <View style={{ flex: 1 }}>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>
                        {stats.goalTitle}
                    </Text>
                    <View style={{
                        backgroundColor: `${color}20`,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 6,
                        alignSelf: 'flex-start'
                    }}>
                        <Text style={{
                            color,
                            fontSize: 11,
                            fontWeight: 'bold'
                        }}>
                            {label}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Progress Bar */}
            <View style={{ marginBottom: 12 }}>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 6
                }}>
                    <Text style={{ color: '#999', fontSize: 13 }}>Progress</Text>
                    <Text style={{ color, fontSize: 14, fontWeight: 'bold' }}>
                        {stats.completionPercent}%
                    </Text>
                </View>

                <View style={{
                    height: 8,
                    backgroundColor: '#2a2a2a',
                    borderRadius: 4,
                    overflow: 'hidden'
                }}>
                    <View style={{
                        height: '100%',
                        width: `${stats.completionPercent}%`,
                        backgroundColor: color,
                        borderRadius: 4
                    }} />
                </View>
            </View>

            {/* Metrics Grid */}
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 8
            }}>
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{ color: '#00ff99', fontSize: 18, fontWeight: 'bold' }}>
                        {stats.completedTasksCount}
                    </Text>
                    <Text style={{ color: '#999', fontSize: 11 }}>Done</Text>
                </View>

                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{ color: '#666', fontSize: 18, fontWeight: 'bold' }}>
                        {stats.linkedTasksCount}
                    </Text>
                    <Text style={{ color: '#999', fontSize: 11 }}>Total</Text>
                </View>

                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{ color: '#00aaff', fontSize: 18, fontWeight: 'bold' }}>
                        {Math.round(stats.timeSpentMinutes / 60)}h
                    </Text>
                    <Text style={{ color: '#999', fontSize: 11 }}>Time</Text>
                </View>
            </View>

            {/* Progress Rate */}
            {stats.progressRate !== null && (
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingTop: 12,
                    borderTopWidth: 1,
                    borderTopColor: '#2a2a2a',
                    marginTop: 4
                }}>
                    <Text style={{ color: '#999', fontSize: 12 }}>Progress Rate</Text>
                    <Text style={{ color: '#ccc', fontSize: 12 }}>
                        {stats.progressRate}% per day
                    </Text>
                </View>
            )}

            {/* Timeline */}
            {stats.daysUntilDeadline !== null && (
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingTop: 8
                }}>
                    <Text style={{ color: '#999', fontSize: 12 }}>
                        {stats.daysUntilDeadline > 0 ? 'Days Remaining' : 'Days Overdue'}
                    </Text>
                    <Text style={{
                        color: stats.daysUntilDeadline > 0 ? '#00aaff' : '#ff3333',
                        fontSize: 12,
                        fontWeight: 'bold'
                    }}>
                        {Math.abs(stats.daysUntilDeadline)} days
                    </Text>
                </View>
            )}

            {/* On Schedule Indicator */}
            {stats.isOnSchedule !== null && stats.classification !== 'completed' && (
                <View style={{
                    marginTop: 12,
                    padding: 8,
                    backgroundColor: stats.isOnSchedule ? '#00ff9910' : '#ff330010',
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: stats.isOnSchedule ? '#00ff99' : '#ff3333'
                }}>
                    <Text style={{
                        color: stats.isOnSchedule ? '#00ff99' : '#ff3333',
                        fontSize: 11,
                        textAlign: 'center'
                    }}>
                        {stats.isOnSchedule
                            ? '✓ Meeting required pace'
                            : '⚠ Need to pick up pace'}
                    </Text>
                </View>
            )}
        </View>
    );
}
