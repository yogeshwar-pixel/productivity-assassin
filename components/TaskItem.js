// components/TaskItem.js
// Individual task card component

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function TaskItem({ task, onToggleStatus, onEdit, onDelete }) {
    const priorityColors = {
        urgent: '#ff3333',
        high: '#ff6600',
        medium: '#ffaa00',
        low: '#00cc77'
    };

    const statusColors = {
        pending: '#666',
        'in-progress': '#00aaff',
        completed: '#00ff99'
    };

    const xpValues = {
        urgent: 50,
        high: 30,
        medium: 20,
        low: 10
    };

    const handleStatusPress = () => {
        let newStatus;
        if (task.status === 'pending') newStatus = 'in-progress';
        else if (task.status === 'in-progress') newStatus = 'completed';
        else newStatus = 'pending';

        onToggleStatus(task.id, newStatus);
    };

    return (
        <View style={{
            backgroundColor: '#1a1a1a',
            padding: 16,
            borderRadius: 12,
            marginBottom: 12,
            borderLeftWidth: 4,
            borderLeftColor: priorityColors[task.priority]
        }}>
            {/* Header Row */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                {/* Mission Control Badge */}
                <TouchableOpacity
                    onPress={handleStatusPress}
                    style={{
                        backgroundColor: task.status === 'in-progress' ? '#00aaff' : '#333',
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: task.status === 'in-progress' ? '#00aaff' : '#666',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6
                    }}
                >
                    <Text style={{ fontSize: 12 }}>
                        {task.status === 'in-progress' ? '⏹️' : '🚀'}
                    </Text>
                    <Text style={{
                        color: task.status === 'in-progress' ? '#000' : '#fff',
                        fontSize: 12,
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                    }}>
                        {task.status === 'in-progress' ? 'Active Mission' : 'Start Mission'}
                    </Text>
                </TouchableOpacity>

                {/* Priority & XP Badge */}
                <View style={{ flexDirection: 'row', gap: 6 }}>
                    <View style={{
                        backgroundColor: priorityColors[task.priority],
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 8,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4
                    }}>
                        <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>
                            {task.priority}
                        </Text>
                    </View>

                    <View style={{
                        backgroundColor: '#333',
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: '#ffd700'
                    }}>
                        <Text style={{ color: '#ffd700', fontSize: 10, fontWeight: 'bold' }}>
                            +{xpValues[task.priority]} XP
                        </Text>
                    </View>
                </View>
            </View>

            {/* Title */}
            <Text style={{
                color: '#fff',
                fontSize: 18,
                fontWeight: 'bold',
                marginBottom: 6,
                textDecorationLine: task.status === 'completed' ? 'line-through' : 'none',
                opacity: task.status === 'completed' ? 0.6 : 1
            }}>
                {task.title}
            </Text>

            {/* Description */}
            {task.description ? (
                <Text style={{
                    color: '#999',
                    fontSize: 14,
                    marginBottom: 8,
                    lineHeight: 20
                }}>
                    {task.description}
                </Text>
            ) : null}

            {/* Category & Metadata */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <View style={{
                    backgroundColor: '#2a2a2a',
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 8,
                    marginRight: 8
                }}>
                    <Text style={{ color: '#00ff99', fontSize: 12 }}>
                        {task.category}
                    </Text>
                </View>

                <Text style={{ color: '#666', fontSize: 11 }}>
                    {new Date(task.createdAt).toLocaleDateString()}
                </Text>
            </View>

            {/* DEADLINE/URGENCY BADGE */}
            {task.deadline && (
                <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center' }}>
                    {(() => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const deadlineDate = new Date(task.deadline);
                        deadlineDate.setHours(0, 0, 0, 0);

                        const diffTime = deadlineDate - today;
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        let color = '#999';
                        let text = `${diffDays} days left`;
                        let icon = '⏳';

                        if (diffDays < 0) {
                            color = '#ff3333';
                            text = `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`;
                            icon = '⚠️';
                        } else if (diffDays === 0) {
                            color = '#ff3333';
                            text = 'Due Today';
                            icon = '🔥';
                        } else if (diffDays === 1) {
                            color = '#ff9900';
                            text = 'Due Tomorrow';
                            icon = '⏰';
                        }

                        // Don't show if completed
                        if (task.status === 'completed') return null;

                        return (
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                paddingHorizontal: 10,
                                paddingVertical: 4,
                                borderRadius: 6
                            }}>
                                <Text style={{ fontSize: 12, marginRight: 6 }}>{icon}</Text>
                                <Text style={{ color: color, fontSize: 12, fontWeight: 'bold' }}>
                                    {text}
                                </Text>
                            </View>
                        );
                    })()}
                </View>
            )}

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                    onPress={() => onEdit(task)}
                    style={{
                        flex: 1,
                        backgroundColor: '#2a2a2a',
                        padding: 10,
                        borderRadius: 8,
                        alignItems: 'center'
                    }}
                >
                    <Text style={{ color: '#00aaff', fontWeight: 'bold' }}>✏️ Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => onDelete(task.id)}
                    style={{
                        flex: 1,
                        backgroundColor: '#2a2a2a',
                        padding: 10,
                        borderRadius: 8,
                        alignItems: 'center'
                    }}
                >
                    <Text style={{ color: '#ff6666', fontWeight: 'bold' }}>🗑️ Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
