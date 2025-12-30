// app/partners.js
// Accountability partners and groups page

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import PartnerCard from '../components/PartnerCard';
import {
    getAllPartners,
    addAccountabilityPartner,
    removePartner,
    getPartnerStats,
    getReceivedNudges,
    markNudgeRead
} from '../utils/accountabilityPartner';

export default function Partners() {
    const router = useRouter();
    const [partners, setPartners] = useState([]);
    const [stats, setStats] = useState(null);
    const [nudges, setNudges] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newPartner, setNewPartner] = useState({
        name: '',
        email: '',
        shareLevel: 'basic',
        autoNudge: true
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [loadedPartners, loadedStats, loadedNudges] = await Promise.all([
            getAllPartners(),
            getPartnerStats(),
            getReceivedNudges()
        ]);

        setPartners(loadedPartners);
        setStats(loadedStats);
        setNudges(loadedNudges);
    };

    const handleAddPartner = async () => {
        if (!newPartner.name.trim()) {
            Alert.alert('Error', 'Please enter a partner name');
            return;
        }

        await addAccountabilityPartner({
            name: newPartner.name,
            email: newPartner.email,
            shareLevel: newPartner.shareLevel,
            autoNudge: newPartner.autoNudge,
            shareTaskContent: false
        });

        setShowAddModal(false);
        setNewPartner({ name: '', email: '', shareLevel: 'basic', autoNudge: true });
        loadData();

        Alert.alert('✅ Partner Added!', `You can now share progress with ${newPartner.name}`);
    };

    const handleRemovePartner = (partnerId, partnerName) => {
        Alert.alert(
            'Remove Partner',
            `Remove ${partnerName} from accountability partners?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        await removePartner(partnerId);
                        loadData();
                    }
                }
            ]
        );
    };

    const handleMarkNudgeRead = async (nudgeId) => {
        await markNudgeRead(nudgeId);
        loadData();
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
                    👥 Partners
                </Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={{ color: '#999', fontSize: 16 }}>← Back</Text>
                </TouchableOpacity>
            </View>

            {/* Stats */}
            {stats && (
                <View style={{
                    flexDirection: 'row',
                    gap: 12,
                    marginBottom: 20
                }}>
                    <View style={{
                        flex: 1,
                        backgroundColor: '#1a1a1a',
                        borderRadius: 12,
                        padding: 16,
                        alignItems: 'center'
                    }}>
                        <Text style={{ color: '#00aaff', fontSize: 24, fontWeight: 'bold' }}>
                            {stats.activePartners}
                        </Text>
                        <Text style={{ color: '#999', fontSize: 12 }}>Active</Text>
                    </View>

                    <View style={{
                        flex: 1,
                        backgroundColor: '#1a1a1a',
                        borderRadius: 12,
                        padding: 16,
                        alignItems: 'center'
                    }}>
                        <Text style={{ color: '#ff6600', fontSize: 24, fontWeight: 'bold' }}>
                            {stats.unreadNudges}
                        </Text>
                        <Text style={{ color: '#999', fontSize: 12 }}>Nudges</Text>
                    </View>
                </View>
            )}

            {/* Nudges */}
            {nudges.length > 0 && (
                <View style={{ marginBottom: 20 }}>
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
                        📨 Recent Nudges
                    </Text>
                    {nudges.slice(0, 3).map(nudge => (
                        <TouchableOpacity
                            key={nudge.id}
                            onPress={() => handleMarkNudgeRead(nudge.id)}
                            style={{
                                backgroundColor: nudge.read ? '#1a1a1a' : '#00aaff20',
                                borderRadius: 12,
                                padding: 16,
                                marginBottom: 8,
                                borderLeftWidth: 4,
                                borderLeftColor: nudge.read ? '#666' : '#00aaff'
                            }}
                        >
                            <Text style={{ color: '#fff', fontSize: 14, marginBottom: 4 }}>
                                {nudge.message}
                            </Text>
                            <Text style={{ color: '#666', fontSize: 11 }}>
                                {new Date(nudge.sentAt).toLocaleString()}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

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
                    • Add accountability partners{'\n'}
                    • Share progress (basic or detailed){'\n'}
                    • Send/receive nudges{'\n'}
                    • Auto-nudge when progress stalls
                </Text>
            </View>

            {/* Partners List */}
            <View style={{ marginBottom: 20 }}>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
                    Your Partners ({partners.length})
                </Text>

                {partners.length === 0 ? (
                    <View style={{
                        backgroundColor: '#1a1a1a',
                        borderRadius: 12,
                        padding: 32,
                        alignItems: 'center'
                    }}>
                        <Text style={{ color: '#666', fontSize: 16, textAlign: 'center' }}>
                            No partners yet
                        </Text>
                        <Text style={{ color: '#444', fontSize: 14, marginTop: 8, textAlign: 'center' }}>
                            Add an accountability partner to share progress and stay motivated
                        </Text>
                    </View>
                ) : (
                    partners.map(partner => (
                        <View key={partner.id}>
                            <PartnerCard partner={partner} onUpdate={loadData} />
                            <TouchableOpacity
                                onPress={() => handleRemovePartner(partner.id, partner.partnerName)}
                                style={{
                                    backgroundColor: '#2a2a2a',
                                    padding: 10,
                                    borderRadius: 8,
                                    alignItems: 'center',
                                    marginBottom: 16
                                }}
                            >
                                <Text style={{ color: '#ff3333', fontSize: 13, fontWeight: 'bold' }}>
                                    🗑️ Remove Partner
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ))
                )}
            </View>

            {/* Add Partner Button */}
            <TouchableOpacity
                onPress={() => setShowAddModal(true)}
                style={{
                    backgroundColor: '#00aaff',
                    padding: 20,
                    borderRadius: 12,
                    alignItems: 'center',
                    marginBottom: 40
                }}
            >
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
                    + Add Partner
                </Text>
            </TouchableOpacity>

            {/* Add Partner Modal */}
            <Modal
                visible={showAddModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowAddModal(false)}
            >
                <View style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    justifyContent: 'flex-end'
                }}>
                    <View style={{
                        backgroundColor: '#1a1a1a',
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        padding: 24
                    }}>
                        <Text style={{ color: '#00aaff', fontSize: 22, fontWeight: 'bold', marginBottom: 20 }}>
                            Add Accountability Partner
                        </Text>

                        {/* Name */}
                        <Text style={{ color: '#fff', marginBottom: 8, fontWeight: '600' }}>
                            Partner Name *
                        </Text>
                        <TextInput
                            value={newPartner.name}
                            onChangeText={(text) => setNewPartner(prev => ({ ...prev, name: text }))}
                            placeholder="e.g., Alex Smith"
                            placeholderTextColor="#666"
                            style={{
                                backgroundColor: '#2a2a2a',
                                color: '#fff',
                                padding: 14,
                                borderRadius: 8,
                                marginBottom: 16,
                                fontSize: 16
                            }}
                        />

                        {/* Email (optional) */}
                        <Text style={{ color: '#fff', marginBottom: 8, fontWeight: '600' }}>
                            Email (optional)
                        </Text>
                        <TextInput
                            value={newPartner.email}
                            onChangeText={(text) => setNewPartner(prev => ({ ...prev, email: text }))}
                            placeholder="alex@example.com"
                            placeholderTextColor="#666"
                            keyboardType="email-address"
                            style={{
                                backgroundColor: '#2a2a2a',
                                color: '#fff',
                                padding: 14,
                                borderRadius: 8,
                                marginBottom: 16,
                                fontSize: 16
                            }}
                        />

                        {/* Share Level */}
                        <Text style={{ color: '#fff', marginBottom: 8, fontWeight: '600' }}>
                            Sharing Level
                        </Text>
                        <View style={{ flexDirection: 'row', marginBottom: 16, gap: 12 }}>
                            {['basic', 'detailed'].map(level => (
                                <TouchableOpacity
                                    key={level}
                                    onPress={() => setNewPartner(prev => ({ ...prev, shareLevel: level }))}
                                    style={{
                                        flex: 1,
                                        padding: 14,
                                        borderRadius: 8,
                                        backgroundColor: newPartner.shareLevel === level ? '#00aaff' : '#2a2a2a',
                                        alignItems: 'center'
                                    }}
                                >
                                    <Text style={{
                                        color: newPartner.shareLevel === level ? '#fff' : '#999',
                                        fontWeight: 'bold',
                                        textTransform: 'capitalize'
                                    }}>
                                        {level}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Auto-nudge */}
                        <TouchableOpacity
                            onPress={() => setNewPartner(prev => ({ ...prev, autoNudge: !prev.autoNudge }))}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: '#2a2a2a',
                                padding: 14,
                                borderRadius: 8,
                                marginBottom: 20
                            }}
                        >
                            <View style={{
                                width: 24,
                                height: 24,
                                borderRadius: 4,
                                borderWidth: 2,
                                borderColor: newPartner.autoNudge ? '#00aaff' : '#666',
                                backgroundColor: newPartner.autoNudge ? '#00aaff' : 'transparent',
                                marginRight: 12,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {newPartner.autoNudge && <Text style={{ color: '#fff', fontWeight: 'bold' }}>✓</Text>}
                            </View>
                            <Text style={{ color: '#fff', flex: 1 }}>
                                Enable auto-nudge when progress stalls
                            </Text>
                        </TouchableOpacity>

                        {/* Buttons */}
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity
                                onPress={() => setShowAddModal(false)}
                                style={{
                                    flex: 1,
                                    backgroundColor: '#333',
                                    padding: 16,
                                    borderRadius: 8,
                                    alignItems: 'center'
                                }}
                            >
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleAddPartner}
                                style={{
                                    flex: 1,
                                    backgroundColor: '#00aaff',
                                    padding: 16,
                                    borderRadius: 8,
                                    alignItems: 'center'
                                }}
                            >
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Add Partner</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}
