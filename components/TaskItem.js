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
                {/* Status Badge */}
                <TouchableOpacity
                    onPress={handleStatusPress}
                    style={{
                        backgroundColor: statusColors[task.status],
                        paddingHorizontal: 12,
                        paddingVertical: 4,
                        borderRadius: 12
                    }}
                >
                    <Text style={{
                        color: task.status === 'completed' ? '#000' : '#fff',
                        fontSize: 12,
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                    }}>
                        {task.status === 'in-progress' ? 'In Progress' : task.status}
                    </Text>
                </TouchableOpacity>

                {/* Priority Badge */}
                <View style={{
                    backgroundColor: priorityColors[task.priority],
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 12
                }}>
                    <Text style={{
                        color: '#fff',
                        fontSize: 11,
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                    }}>
                        {task.priority}
                    </Text>
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
