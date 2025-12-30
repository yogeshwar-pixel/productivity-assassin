// components/PartnerCard.js
// Display partner information and progress

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { getPartnerProgress, sendNudge, shareProgress, togglePartnerStatus } from '../utils/accountabilityPartner';

export default function PartnerCard({ partner, onUpdate }) {
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProgress();
    }, [partner.id]);

    const loadProgress = async () => {
        const data = await getPartnerProgress(partner.id);
        setProgress(data);
        setLoading(false);
    };

    const handleNudge = async () => {
        await sendNudge(partner.id);
        Alert.alert('👋 Nudge Sent!', `Sent a check-in message to ${partner.partnerName}`);
    };

    const handleShare = async () => {
        const shared = await shareProgress(partner.id);
        if (shared) {
            Alert.alert('📤 Progress Shared', `Your progress has been shared with ${partner.partnerName}`);
        }
    };

    const handleToggleStatus = async () => {
        const updated = await togglePartnerStatus(partner.id);
        if (updated) {
            Alert.alert(
                updated.status === 'active' ? '✅ Sharing Resumed' : '⏸️ Sharing Paused',
                `Progress sharing with ${partner.partnerName} is now ${updated.status}`
            );
            onUpdate();
        }
    };

    if (loading) {
        return (
            <View style={{
                backgroundColor: '#1a1a1a',
                borderRadius: 12,
                padding: 16,
                marginBottom: 12
            }}>
                <Text style={{ color: '#666' }}>Loading...</Text>
            </View>
        );
    }

    const isActive = partner.status === 'active';
    const timeSinceUpdate = progress ? Math.floor((Date.now() - new Date(progress.lastUpdated)) / (1000 * 60 * 60)) : 0;

    return (
        <View style={{
            backgroundColor: '#1a1a1a',
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            borderWidth: 2,
            borderColor: isActive ? '#00aaff' : '#666',
            opacity: isActive ? 1 : 0.6
        }}>
            {/* Header */}
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16
            }}>
                <View style={{ flex: 1 }}>
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
                        {partner.partnerName}
                    </Text>
                    {partner.partnerEmail && (
                        <Text style={{ color: '#666', fontSize: 12, marginTop: 2 }}>
                            {partner.partnerEmail}
                        </Text>
                    )}
                </View>

                <View style={{
                    backgroundColor: isActive ? '#00aaff20' : '#66666620',
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 12
                }}>
                    <Text style={{
                        color: isActive ? '#00aaff' : '#666',
                        fontSize: 11,
                        fontWeight: 'bold'
                    }}>
                        {isActive ? 'ACTIVE' : 'PAUSED'}
                    </Text>
                </View>
            </View>

            {/* Progress Stats */}
            {progress && isActive && (
                <View style={{
                    backgroundColor: '#2a2a2a',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 12
                }}>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                        marginBottom: 8
                    }}>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ color: '#00ff99', fontSize: 20, fontWeight: 'bold' }}>
                                {progress.completionRate}%
                            </Text>
                            <Text style={{ color: '#999', fontSize: 11 }}>Complete</Text>
                        </View>

                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ color: '#00aaff', fontSize: 20, fontWeight: 'bold' }}>
                                {progress.tasksCompleted}/{progress.totalTasks}
                            </Text>
                            <Text style={{ color: '#999', fontSize: 11 }}>Tasks</Text>
                        </View>

                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ color: '#ff6600', fontSize: 20, fontWeight: 'bold' }}>
                                {progress.currentStreak}d
                            </Text>
                            <Text style={{ color: '#999', fontSize: 11 }}>Streak</Text>
                        </View>
                    </View>

                    <Text style={{
                        color: '#666',
                        fontSize: 11,
                        textAlign: 'center',
                        marginTop: 4
                    }}>
                        Updated {timeSinceUpdate}h ago
                    </Text>
                </View>
            )}

            {/* Sharing Info */}
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 12,
                gap: 8
            }}>
                <View style={{
                    backgroundColor: partner.shareLevel === 'detailed' ? '#ff990020' : '#00ff9920',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 6
                }}>
                    <Text style={{
                        color: partner.shareLevel === 'detailed' ? '#ff9900' : '#00ff99',
                        fontSize: 10,
                        fontWeight: 'bold'
                    }}>
                        {partner.shareLevel.toUpperCase()}
                    </Text>
                </View>

                {partner.settings.autoNudge && (
                    <View style={{
                        backgroundColor: '#00aaff20',
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 6
                    }}>
                        <Text style={{ color: '#00aaff', fontSize: 10, fontWeight: 'bold' }}>
                            AUTO-NUDGE
                        </Text>
                    </View>
                )}
            </View>

            {/* Actions */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                    onPress={handleNudge}
                    disabled={!isActive}
                    style={{
                        flex: 1,
                        backgroundColor: isActive ? '#00aaff' : '#333',
                        padding: 12,
                        borderRadius: 8,
                        alignItems: 'center'
                    }}
                >
                    <Text style={{
                        color: isActive ? '#fff' : '#666',
                        fontSize: 13,
                        fontWeight: 'bold'
                    }}>
                        👋 Nudge
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleShare}
                    disabled={!isActive}
                    style={{
                        flex: 1,
                        backgroundColor: isActive ? '#00ff99' : '#333',
                        padding: 12,
                        borderRadius: 8,
                        alignItems: 'center'
                    }}
                >
                    <Text style={{
                        color: isActive ? '#000' : '#666',
                        fontSize: 13,
                        fontWeight: 'bold'
                    }}>
                        📤 Share
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleToggleStatus}
                    style={{
                        flex: 1,
                        backgroundColor: '#2a2a2a',
                        padding: 12,
                        borderRadius: 8,
                        alignItems: 'center'
                    }}
                >
                    <Text style={{ color: '#999', fontSize: 13, fontWeight: 'bold' }}>
                        {isActive ? '⏸️ Pause' : '▶️ Resume'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
