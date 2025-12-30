// components/PointsDisplay.js
// Display user points balance, streak, and recent transactions

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { getPointsSummary } from '../utils/penaltySystem';

export default function PointsDisplay({ compact = false, onPress = null }) {
    const [summary, setSummary] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        loadPoints();
    }, []);

    const loadPoints = async () => {
        const data = await getPointsSummary();
        setSummary(data);
    };

    if (!summary) {
        return null;
    }

    // Compact version for header display
    if (compact) {
        return (
            <TouchableOpacity
                onPress={onPress || (() => setShowDetails(!showDetails))}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#1a1a1a',
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    gap: 8
                }}
            >
                <Text style={{ fontSize: 24 }}>⭐</Text>
                <Text style={{ color: '#ffaa00', fontSize: 18, fontWeight: 'bold' }}>
                    {summary.totalPoints}
                </Text>
                {summary.currentStreak > 0 && (
                    <>
                        <Text style={{ color: '#666' }}>|</Text>
                        <Text style={{ fontSize: 16 }}>🔥</Text>
                        <Text style={{ color: '#ff6600', fontSize: 14, fontWeight: 'bold' }}>
                            {summary.currentStreak}d
                        </Text>
                    </>
                )}
            </TouchableOpacity>
        );
    }

    // Full version
    return (
        <View style={{ backgroundColor: '#000', padding: 16 }}>
            {/* Header Card */}
            <View style={{
                backgroundColor: '#1a1a1a',
                borderRadius: 16,
                padding: 24,
                marginBottom: 16,
                borderLeftWidth: 4,
                borderLeftColor: '#ffaa00'
            }}>
                <Text style={{ color: '#999', fontSize: 14, marginBottom: 8 }}>
                    Total Points
                </Text>
                <Text style={{
                    color: '#ffaa00',
                    fontSize: 48,
                    fontWeight: 'bold',
                    marginBottom: 16
                }}>
                    {summary.totalPoints}
                </Text>

                {/* Streak */}
                {summary.currentStreak > 0 && (
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 12
                    }}>
                        <Text style={{ fontSize: 24 }}>🔥</Text>
                        <Text style={{ color: '#ff6600', fontSize: 18, fontWeight: 'bold' }}>
                            {summary.currentStreak}-day streak!
                        </Text>
                    </View>
                )}

                {summary.longestStreak > 0 && (
                    <Text style={{ color: '#666', fontSize: 12 }}>
                        Longest streak: {summary.longestStreak} days
                    </Text>
                )}
            </View>

            {/* Recent Performance */}
            <View style={{
                flexDirection: 'row',
                gap: 12,
                marginBottom: 16
            }}>
                <View style={{
                    flex: 1,
                    backgroundColor: '#1a1a1a',
                    borderRadius: 12,
                    padding: 16,
                    borderWidth: 2,
                    borderColor: '#00ff99'
                }}>
                    <Text style={{ color: '#00ff99', fontSize: 24, fontWeight: 'bold' }}>
                        +{summary.totalEarned}
                    </Text>
                    <Text style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
                        Earned (recent)
                    </Text>
                </View>

                <View style={{
                    flex: 1,
                    backgroundColor: '#1a1a1a',
                    borderRadius: 12,
                    padding: 16,
                    borderWidth: 2,
                    borderColor: '#ff3333'
                }}>
                    <Text style={{ color: '#ff3333', fontSize: 24, fontWeight: 'bold' }}>
                        -{summary.totalLost}
                    </Text>
                    <Text style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
                        Lost (recent)
                    </Text>
                </View>
            </View>

            {/* Recent Transactions */}
            <View style={{
                backgroundColor: '#1a1a1a',
                borderRadius: 12,
                padding: 16
            }}>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
                    Recent Activity
                </Text>

                <ScrollView style={{ maxHeight: 300 }}>
                    {summary.recentTransactions.length === 0 ? (
                        <Text style={{ color: '#666', textAlign: 'center', paddingVertical: 20 }}>
                            No transactions yet
                        </Text>
                    ) : (
                        summary.recentTransactions.reverse().map((txn) => (
                            <View
                                key={txn.id}
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    paddingVertical: 12,
                                    borderBottomWidth: 1,
                                    borderBottomColor: '#2a2a2a'
                                }}
                            >
                                <View style={{ flex: 1 }}>
                                    <Text style={{
                                        color: '#fff',
                                        fontSize: 14,
                                        marginBottom: 4
                                    }}>
                                        {txn.reason}
                                    </Text>
                                    <Text style={{ color: '#666', fontSize: 11 }}>
                                        {new Date(txn.timestamp).toLocaleString()}
                                    </Text>
                                </View>

                                <Text style={{
                                    color: txn.points > 0 ? '#00ff99' : '#ff3333',
                                    fontSize: 18,
                                    fontWeight: 'bold',
                                    marginLeft: 12
                                }}>
                                    {txn.points > 0 ? '+' : ''}{txn.points}
                                </Text>
                            </View>
                        ))
                    )}
                </ScrollView>
            </View>

            {/* Point Guide */}
            <TouchableOpacity
                onPress={() => setShowDetails(!showDetails)}
                style={{
                    marginTop: 16,
                    padding: 12,
                    backgroundColor: '#2a2a2a',
                    borderRadius: 8,
                    alignItems: 'center'
                }}
            >
                <Text style={{ color: '#00aaff', fontWeight: 'bold' }}>
                    {showDetails ? '▼ Hide' : '▶ Show'} Point Values
                </Text>
            </TouchableOpacity>

            {showDetails && (
                <View style={{
                    marginTop: 12,
                    padding: 16,
                    backgroundColor: '#1a1a1a',
                    borderRadius: 8
                }}>
                    <Text style={{ color: '#00ff99', fontWeight: 'bold', marginBottom: 8 }}>
                        Earn Points:
                    </Text>
                    <Text style={{ color: '#ccc', fontSize: 12, marginBottom: 4 }}>
                        • Complete task: +10 to +50 (based on priority)
                    </Text>
                    <Text style={{ color: '#ccc', fontSize: 12, marginBottom: 4 }}>
                        • Focus session: +25
                    </Text>
                    <Text style={{ color: '#ccc', fontSize: 12, marginBottom: 4 }}>
                        • Complete goal: +100 to +500
                    </Text>
                    <Text style={{ color: '#ccc', fontSize: 12, marginBottom: 12 }}>
                        • Check-in: +5
                    </Text>

                    <Text style={{ color: '#ff6666', fontWeight: 'bold', marginBottom: 8 }}>
                        Lose Points:
                    </Text>
                    <Text style={{ color: '#ccc', fontSize: 12, marginBottom: 4 }}>
                        • Missed deadline: -20
                    </Text>
                    <Text style={{ color: '#ccc', fontSize: 12, marginBottom: 4 }}>
                        • Skipped check-in: -10
                    </Text>
                    <Text style={{ color: '#ccc', fontSize: 12, marginBottom: 4 }}>
                        • Early focus exit: -15
                    </Text>
                    <Text style={{ color: '#ccc', fontSize: 12 }}>
                        • Distraction in strict mode: -5
                    </Text>
                </View>
            )}
        </View>
    );
}
