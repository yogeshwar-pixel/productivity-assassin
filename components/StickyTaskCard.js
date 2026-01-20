import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function StickyTaskCard({ task, onPress }) {
    // Calculate urgency
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(task.deadline);
    deadlineDate.setHours(0, 0, 0, 0);

    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Determine Style State
    let cardColor = '#00cc77'; // Green (Safe)
    let textColor = '#000';
    let urgencyLabel = `${diffDays} days left`;
    let urgencyIcon = '🟢';

    if (diffDays < 0) {
        cardColor = '#3a0000'; // Dark Red (Overdue)
        textColor = '#ff6666';
        urgencyLabel = `OVERDUE BY ${Math.abs(diffDays)} DAYS`;
        urgencyIcon = '⚠️';
    } else if (diffDays === 0) {
        cardColor = '#ff3333'; // Red (Critical)
        textColor = '#fff';
        urgencyLabel = 'DUE TODAY';
        urgencyIcon = '🔥';
    } else if (diffDays <= 3) {
        cardColor = '#ffcc00'; // Yellow (Warning)
        textColor = '#000';
        urgencyLabel = `Due in ${diffDays} days`;
        urgencyIcon = '🟡';
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.card, { backgroundColor: cardColor, borderColor: diffDays < 0 ? '#ff0000' : 'transparent', borderWidth: diffDays < 0 ? 2 : 0 }]}
        >
            <View style={styles.header}>
                <Text style={[styles.urgency, { color: diffDays < 0 ? '#ff0000' : textColor, opacity: 0.8 }]}>
                    {urgencyIcon} {urgencyLabel}
                </Text>
                {task.priority === 'urgent' && (
                    <Text style={{ fontSize: 16 }}>🚨</Text>
                )}
            </View>

            <Text style={[styles.title, { color: textColor }]} numberOfLines={2}>
                {task.title}
            </Text>

            <View style={styles.divider} />

            <Text style={[styles.motivationLabel, { color: textColor, opacity: 0.7 }]}>
                WHY IT MATTERS:
            </Text>
            <Text style={[styles.motivation, { color: textColor }]} numberOfLines={3}>
                "{task.motivation || "No stakes defined. Add some tough love."}"
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        width: '48%', // Grid Layout
        aspectRatio: 1, // Square sticky note
        padding: 15,
        borderRadius: 4, // Sharp corners like sticky notes
        marginBottom: 15,
        justifyContent: 'space-between',
        shadowColor: "#000",
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        transform: [{ rotate: '-1deg' }] // Slight tilt for sticky note effect
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5
    },
    urgency: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase'
    },
    title: {
        fontSize: 18,
        fontWeight: '900',
        marginBottom: 10,
        lineHeight: 22
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.1)',
        marginVertical: 5
    },
    motivationLabel: {
        fontSize: 8,
        fontWeight: 'bold',
        marginBottom: 2
    },
    motivation: {
        fontSize: 12,
        fontStyle: 'italic',
        fontWeight: '600'
    }
});
