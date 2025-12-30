// app/profiles.js
// Focus Profiles management page

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import {
    getAllFocusProfiles,
    createFocusProfile,
    setActiveFocusProfile,
    getActiveFocusProfile,
    deleteFocusProfile
} from '../utils/focusProfileManager';

export default function Profiles() {
    const router = useRouter();
    const [focusProfiles, setFocusProfiles] = useState([]);
    const [activeProfile, setActiveProfile] = useState(null);
    const [showProfileEditor, setShowProfileEditor] = useState(false);
    const [newProfile, setNewProfile] = useState({
        name: '',
        sessionDuration: 25,
        breakDuration: 5,
        strictMode: false
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [profiles, active] = await Promise.all([
            getAllFocusProfiles(),
            getActiveFocusProfile()
        ]);
        setFocusProfiles(profiles);
        setActiveProfile(active);
    };

    const handleSelectProfile = async (profileId) => {
        const profile = await setActiveFocusProfile(profileId);
        setActiveProfile(profile);
        Alert.alert('✅ Profile Activated', `Now using: ${profile.name}\n\nRules applied to Chrome extension!`);
    };

    const handleCreateProfile = async () => {
        if (!newProfile.name.trim()) {
            Alert.alert('Error', 'Please enter a profile name');
            return;
        }

        await createFocusProfile(newProfile);
        setShowProfileEditor(false);
        setNewProfile({ name: '', sessionDuration: 25, breakDuration: 5, strictMode: false });
        loadData();
        Alert.alert('✅ Profile Created!');
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
                    🎯 Focus Profiles
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
                    Customize Your Focus
                </Text>
                <Text style={{ color: '#999', fontSize: 14, lineHeight: 20 }}>
                    Create different profiles for different work modes. Each profile has custom blocking rules, session durations, and penalties.
                </Text>
            </View>

            {/* Active Profile */}
            {activeProfile && (
                <View style={{
                    backgroundColor: `${activeProfile.color}20`,
                    borderRadius: 12,
                    padding: 20,
                    marginBottom: 20,
                    borderWidth: 3,
                    borderColor: activeProfile.color
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                        <Text style={{ fontSize: 32, marginRight: 12 }}>{activeProfile.icon}</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>
                                {activeProfile.name}
                            </Text>
                            <Text style={{ color: activeProfile.color, fontSize: 13, fontWeight: 'bold' }}>
                                ACTIVE PROFILE
                            </Text>
                        </View>
                    </View>

                    <Text style={{ color: '#ccc', fontSize: 14, marginBottom: 16 }}>
                        {activeProfile.description}
                    </Text>

                    {/* REDIRECT WEBSITE DISPLAY */}
                    <View style={{
                        backgroundColor: activeProfile.rules.redirectWebsite ? '#1a3a1a' : '#3a1a1a',
                        borderRadius: 8,
                        padding: 12,
                        marginBottom: 16,
                        borderWidth: 2,
                        borderColor: activeProfile.rules.redirectWebsite ? '#00ff99' : '#ff3333'
                    }}>
                        <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold', marginBottom: 4 }}>
                            🏢 Redirect Website:
                        </Text>
                        {activeProfile.rules.redirectWebsite ? (
                            <Text style={{ color: '#00ff99', fontSize: 14 }}>
                                {activeProfile.rules.redirectWebsite}
                            </Text>
                        ) : (
                            <Text style={{ color: '#ff3333', fontSize: 13, fontStyle: 'italic' }}>
                                ⚠️ Not configured - Click "Create Custom Profile" below to set your organization website
                            </Text>
                        )}
                    </View>

                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        <View style={{ backgroundColor: '#2a2a2a', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
                            <Text style={{ color: '#00aaff', fontSize: 13 }}>
                                ⏱️ {activeProfile.rules.sessionDuration}min sessions
                            </Text>
                        </View>
                        <View style={{ backgroundColor: '#2a2a2a', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
                            <Text style={{ color: '#00ff99', fontSize: 13 }}>
                                ☕ {activeProfile.rules.breakDuration}min breaks
                            </Text>
                        </View>
                        {activeProfile.rules.strictMode && (
                            <View style={{ backgroundColor: '#ff330020', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#ff3333' }}>
                                <Text style={{ color: '#ff3333', fontSize: 13, fontWeight: 'bold' }}>
                                    🔒 STRICT MODE
                                </Text>
                            </View>
                        )}
                        <View style={{ backgroundColor: '#2a2a2a', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
                            <Text style={{ color: '#ffaa00', fontSize: 13 }}>
                                📊 {activeProfile.rules.minProgressPercent}% min progress
                            </Text>
                        </View>
                    </View>
                </View>
            )}

            {/* All Profiles */}
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
                All Profiles
            </Text>

            {focusProfiles.map(profile => (
                <TouchableOpacity
                    key={profile.id}
                    onPress={() => handleSelectProfile(profile.id)}
                    style={{
                        backgroundColor: '#1a1a1a',
                        borderRadius: 12,
                        padding: 16,
                        marginBottom: 12,
                        borderWidth: 2,
                        borderColor: activeProfile?.id === profile.id ? profile.color : 'transparent'
                    }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <Text style={{ fontSize: 24, marginRight: 12 }}>{profile.icon}</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: '#fff', fontSize: 17, fontWeight: 'bold' }}>
                                {profile.name}
                            </Text>
                            <Text style={{ color: '#666', fontSize: 13, marginTop: 2 }}>
                                {profile.rules.sessionDuration}min • {profile.rules.strictMode ? 'Strict' : 'Flexible'}
                            </Text>
                        </View>
                        {activeProfile?.id === profile.id && (
                            <View style={{
                                backgroundColor: profile.color,
                                width: 28,
                                height: 28,
                                borderRadius: 14,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>✓</Text>
                            </View>
                        )}
                    </View>

                    <Text style={{ color: '#999', fontSize: 13, lineHeight: 18 }}>
                        {profile.description}
                    </Text>

                    {profile.isDefault && (
                        <View style={{
                            backgroundColor: '#00aaff20',
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 6,
                            alignSelf: 'flex-start',
                            marginTop: 8
                        }}>
                            <Text style={{ color: '#00aaff', fontSize: 11, fontWeight: 'bold' }}>
                                DEFAULT PROFILE
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            ))}

            {/* Create Profile Button - PROMINENT */}
            <View style={{
                width: '100%',
                alignItems: 'center',
                marginVertical: 20
            }}>
                <Text style={{ color: '#fff', fontSize: 16, marginBottom: 12, textAlign: 'center' }}>
                    👇 Create a custom profile to set your redirect website 👇
                </Text>
                <TouchableOpacity
                    onPress={() => setShowProfileEditor(true)}
                    style={{
                        backgroundColor: '#ff3333',
                        paddingVertical: 24,
                        paddingHorizontal: 40,
                        borderRadius: 12,
                        alignItems: 'center',
                        width: '90%',
                        borderWidth: 3,
                        borderColor: '#fff'
                    }}
                >
                    <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 4 }}>
                        + Create Custom Profile
                    </Text>
                    <Text style={{ color: '#ffcccc', fontSize: 13 }}>
                        Enter your organization/study website here
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Create Profile Modal */}
            <Modal
                visible={showProfileEditor}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowProfileEditor(false)}
            >
                <View style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    justifyContent: 'flex-end'
                }}>
                    <View style={{
                        backgroundColor: '#1a1a1a',
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        padding: 24
                    }}>
                        <Text style={{ color: '#00aaff', fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
                            Create Focus Profile
                        </Text>

                        <Text style={{ color: '#fff', marginBottom: 8, fontWeight: '600' }}>Profile Name *</Text>
                        <TextInput
                            value={newProfile.name}
                            onChangeText={(text) => setNewProfile(prev => ({ ...prev, name: text }))}
                            placeholder="e.g., Morning Deep Work"
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

                        <Text style={{ color: '#fff', marginBottom: 8, fontWeight: '600' }}>Session Duration (minutes)</Text>
                        <TextInput
                            value={String(newProfile.sessionDuration)}
                            onChangeText={(text) => setNewProfile(prev => ({ ...prev, sessionDuration: parseInt(text) || 25 }))}
                            keyboardType="number-pad"
                            placeholder="25"
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

                        <Text style={{ color: '#fff', marginBottom: 8, fontWeight: '600' }}>Break Duration (minutes)</Text>
                        <TextInput
                            value={String(newProfile.breakDuration)}
                            onChangeText={(text) => setNewProfile(prev => ({ ...prev, breakDuration: parseInt(text) || 5 }))}
                            keyboardType="number-pad"
                            placeholder="5"
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

                        <Text style={{ color: '#fff', marginBottom: 8, fontWeight: '600' }}>🏢 Organization/Study Website *</Text>
                        <Text style={{ color: '#999', fontSize: 12, marginBottom: 4 }}>
                            You'll be redirected here when distracted
                        </Text>
                        <TextInput
                            value={newProfile.redirectWebsite || ''}
                            onChangeText={(text) => setNewProfile(prev => ({ ...prev, redirectWebsite: text }))}
                            placeholder="e.g., nptel.ac.in or myorganization.edu"
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

                        <TouchableOpacity
                            onPress={() => setNewProfile(prev => ({ ...prev, strictMode: !prev.strictMode }))}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: '#2a2a2a',
                                padding: 16,
                                borderRadius: 8,
                                marginBottom: 24
                            }}
                        >
                            <View style={{
                                width: 24,
                                height: 24,
                                borderRadius: 4,
                                borderWidth: 2,
                                borderColor: newProfile.strictMode ? '#ff3333' : '#666',
                                backgroundColor: newProfile.strictMode ? '#ff3333' : 'transparent',
                                marginRight: 12,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {newProfile.strictMode && <Text style={{ color: '#fff', fontWeight: 'bold' }}>✓</Text>}
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: '#fff', fontSize: 15, fontWeight: 'bold' }}>Strict Mode</Text>
                                <Text style={{ color: '#999', fontSize: 12, marginTop: 2 }}>Block early exit, enforce progress</Text>
                            </View>
                        </TouchableOpacity>

                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity
                                onPress={() => setShowProfileEditor(false)}
                                style={{
                                    flex: 1,
                                    backgroundColor: '#333',
                                    padding: 16,
                                    borderRadius: 8,
                                    alignItems: 'center'
                                }}
                            >
                                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleCreateProfile}
                                style={{
                                    flex: 1,
                                    backgroundColor: '#00aaff',
                                    padding: 16,
                                    borderRadius: 8,
                                    alignItems: 'center'
                                }}
                            >
                                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Create</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}
