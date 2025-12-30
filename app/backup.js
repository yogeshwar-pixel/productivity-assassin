// app/backup.js
// Backup and restore management page

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import {
    exportBackup,
    importBackup,
    restoreFromBackup,
    getBackupSummary,
    validateBackup,
    compareWithCurrent
} from '../utils/localBackup';

export default function Backup() {
    const router = useRouter();
    const [lastBackup, setLastBackup] = useState(null);

    const handleExportBackup = async () => {
        try {
            const backup = await exportBackup();
            const summary = await getBackupSummary(backup);

            setLastBackup({
                timestamp: backup.timestamp,
                summary
            });

            Alert.alert(
                '📥 Backup Downloaded!',
                `Successfully exported:\n\n` +
                `• ${summary.items.tasks} tasks\n` +
                `• ${summary.items.goals} goals\n` +
                `• ${summary.items.checkIns} check-ins\n` +
                `• ${summary.items.focusProfiles} focus profiles\n` +
                `• ${summary.items.totalPoints} points\n\n` +
                `File size: ${(summary.size / 1024).toFixed(2)} KB`
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to export backup: ' + error.message);
        }
    };

    const handleImportBackup = () => {
        // Create file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const backup = await importBackup(event.target.result);
                    const validation = await validateBackup(backup);

                    if (!validation.isValid) {
                        Alert.alert(
                            'Invalid Backup',
                            'The backup file is invalid:\n\n' + validation.errors.join('\n')
                        );
                        return;
                    }

                    const summary = await getBackupSummary(backup);
                    const comparison = await compareWithCurrent(backup);

                    // Show comparison
                    const message =
                        `Backup from: ${new Date(backup.timestamp).toLocaleString()}\n\n` +
                        `📊 Current → Backup:\n` +
                        `Tasks: ${comparison.current.tasks} → ${comparison.backup.tasks}\n` +
                        `Goals: ${comparison.current.goals} → ${comparison.backup.goals}\n` +
                        `Points: ${comparison.current.points} → ${comparison.backup.points}\n\n` +
                        `⚠️ This will replace ALL current data!`;

                    Alert.alert(
                        'Restore Backup?',
                        message,
                        [
                            { text: 'Cancel', style: 'cancel' },
                            {
                                text: 'Restore',
                                style: 'destructive',
                                onPress: async () => {
                                    try {
                                        const result = await restoreFromBackup(backup);
                                        Alert.alert(
                                            '✅ Restore Complete!',
                                            `Successfully restored:\n\n` +
                                            `• ${result.restoredItems.tasks} tasks\n` +
                                            `• ${result.restoredItems.goals} goals\n` +
                                            `• ${result.restoredItems.checkIns} check-ins\n` +
                                            `• ${result.restoredItems.profiles} profiles\n\n` +
                                            `Please reload the app to see changes.`
                                        );
                                    } catch (error) {
                                        Alert.alert('Error', 'Failed to restore: ' + error.message);
                                    }
                                }
                            }
                        ]
                    );
                } catch (error) {
                    Alert.alert('Error', 'Invalid backup file: ' + error.message);
                }
            };
            reader.readAsText(file);
        };

        input.click();
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
                    💾 Backup & Restore
                </Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={{ color: '#999', fontSize: 16 }}>← Back</Text>
                </TouchableOpacity>
            </View>

            {/* Info Card */}
            <View style={{
                backgroundColor: '#1a1a1a',
                borderRadius: 12,
                padding: 20,
                marginBottom: 24,
                borderLeftWidth: 4,
                borderLeftColor: '#00aaff'
            }}>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
                    Protect Your Data
                </Text>
                <Text style={{ color: '#ccc', fontSize: 14, lineHeight: 22 }}>
                    Export your data as a JSON file that you can save anywhere.
                    Import it anytime to restore all your tasks, goals, habits, and settings.
                </Text>
            </View>

            {/* Last Backup Info */}
            {lastBackup && (
                <View style={{
                    backgroundColor: '#00ff9920',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 20,
                    borderWidth: 2,
                    borderColor: '#00ff99'
                }}>
                    <Text style={{ color: '#00ff99', fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
                        ✅ Last Backup Created
                    </Text>
                    <Text style={{ color: '#ccc', fontSize: 13 }}>
                        {new Date(lastBackup.timestamp).toLocaleString()}
                    </Text>
                    <Text style={{ color: '#999', fontSize: 12, marginTop: 8 }}>
                        {lastBackup.summary.items.tasks} tasks • {lastBackup.summary.items.goals} goals •
                        {(lastBackup.summary.size / 1024).toFixed(2)} KB
                    </Text>
                </View>
            )}

            {/* Export Section */}
            <View style={{ marginBottom: 24 }}>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>
                    Export Backup
                </Text>

                <View style={{
                    backgroundColor: '#1a1a1a',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12
                }}>
                    <Text style={{ color: '#ccc', fontSize: 14, marginBottom: 12, lineHeight: 20 }}>
                        Download a complete backup of all your data:
                    </Text>
                    <View style={{ paddingLeft: 12 }}>
                        <Text style={{ color: '#00ff99', fontSize: 13, marginBottom: 4 }}>✓ All tasks and subtasks</Text>
                        <Text style={{ color: '#00ff99', fontSize: 13, marginBottom: 4 }}>✓ Goals and progress</Text>
                        <Text style={{ color: '#00ff99', fontSize: 13, marginBottom: 4 }}>✓ Check-in history</Text>
                        <Text style={{ color: '#00ff99', fontSize: 13, marginBottom: 4 }}>✓ Points and streaks</Text>
                        <Text style={{ color: '#00ff99', fontSize: 13, marginBottom: 4 }}>✓ Focus profiles</Text>
                        <Text style={{ color: '#00ff99', fontSize: 13 }}>✓ All settings</Text>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={handleExportBackup}
                    style={{
                        backgroundColor: '#00ff99',
                        padding: 20,
                        borderRadius: 12,
                        alignItems: 'center',
                        shadowColor: '#00ff99',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8
                    }}
                >
                    <Text style={{ color: '#000', fontSize: 18, fontWeight: 'bold' }}>
                        📥 Download Backup File
                    </Text>
                    <Text style={{ color: '#000', fontSize: 13, marginTop: 4 }}>
                        Save your data as JSON
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Import Section */}
            <View style={{ marginBottom: 40 }}>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>
                    Restore Backup
                </Text>

                <View style={{
                    backgroundColor: '#ff330020',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 2,
                    borderColor: '#ff3333'
                }}>
                    <Text style={{ color: '#ff3333', fontSize: 14, fontWeight: 'bold', marginBottom: 8 }}>
                        ⚠️ Warning
                    </Text>
                    <Text style={{ color: '#ffaa00', fontSize: 13, lineHeight: 20 }}>
                        Restoring a backup will replace ALL current data. Make sure you've exported your current data first if you want to keep it!
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={handleImportBackup}
                    style={{
                        backgroundColor: '#2a2a2a',
                        padding: 20,
                        borderRadius: 12,
                        alignItems: 'center',
                        borderWidth: 2,
                        borderColor: '#ff9900'
                    }}
                >
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
                        📤 Select Backup File
                    </Text>
                    <Text style={{ color: '#999', fontSize: 13, marginTop: 4 }}>
                        Import from JSON file
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Tips */}
            <View style={{
                backgroundColor: '#1a1a1a',
                borderRadius: 12,
                padding: 16,
                marginBottom: 40
            }}>
                <Text style={{ color: '#00aaff', fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
                    💡 Backup Tips
                </Text>
                <Text style={{ color: '#ccc', fontSize: 13, lineHeight: 20, marginBottom: 8 }}>
                    • Export backups regularly (weekly recommended)
                </Text>
                <Text style={{ color: '#ccc', fontSize: 13, lineHeight: 20, marginBottom: 8 }}>
                    • Store backup files in cloud storage (Google Drive, Dropbox)
                </Text>
                <Text style={{ color: '#ccc', fontSize: 13, lineHeight: 20, marginBottom: 8 }}>
                    • Keep multiple backup versions
                </Text>
                <Text style={{ color: '#ccc', fontSize: 13, lineHeight: 20 }}>
                    • Verify backups by checking file size and timestamp
                </Text>
            </View>
        </ScrollView>
    );
}
