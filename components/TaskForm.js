// components/TaskForm.js
// Modal form for creating/editing tasks

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    ScrollView,
    Platform
} from 'react-native';

export default function TaskForm({ visible, onClose, onSave, initialTask = null, categories = [] }) {
    const [title, setTitle] = useState(initialTask?.title || '');
    const [motivation, setMotivation] = useState(initialTask?.motivation || '');
    const [priority, setPriority] = useState(initialTask?.priority || 'medium');
    const [category, setCategory] = useState(initialTask?.category || 'Personal');
    const [deadline, setDeadline] = useState(initialTask?.deadline || new Date().toISOString().split('T')[0]);

    const isEdit = !!initialTask;

    const handleSave = () => {
        if (!title.trim()) {
            alert('Please enter a task title');
            return;
        }

        if (!motivation.trim()) {
            alert('Define the stakes: Why does this matter?');
            return;
        }

        if (!deadline) {
            alert('A deadline is required for accountability.');
            return;
        }

        const taskData = {
            title: title.trim(),
            motivation: motivation.trim(),
            priority,
            category,
            deadline
        };

        onSave(taskData);
        resetForm();
    };

    const resetForm = () => {
        setTitle('');
        setMotivation('');
        setPriority('medium');
        setCategory('Personal');
        setDeadline(new Date().toISOString().split('T')[0]);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const priorityOptions = ['low', 'medium', 'high', 'urgent'];

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <View style={{
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.5)',
                justifyContent: 'flex-end'
            }}>
                <View style={{
                    backgroundColor: '#1a1a1a',
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    padding: 20,
                    maxHeight: '90%'
                }}>
                    {/* Header */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                        <Text style={{ color: '#00ff99', fontSize: 22, fontWeight: 'bold' }}>
                            {isEdit ? 'Edit Task' : 'New Task'}
                        </Text>
                        <TouchableOpacity onPress={handleClose}>
                            <Text style={{ color: '#999', fontSize: 18 }}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Title */}
                        <Text style={{ color: '#fff', marginBottom: 8, fontWeight: '600' }}>Title *</Text>
                        <TextInput
                            value={title}
                            onChangeText={setTitle}
                            placeholder="What needs to be done?"
                            placeholderTextColor="#666"
                            style={{
                                backgroundColor: '#2a2a2a',
                                color: '#fff',
                                padding: 12,
                                borderRadius: 8,
                                marginBottom: 16,
                                fontSize: 16
                            }}
                        />

                        {/* Tough Love / Motivation */}
                        <Text style={{ color: '#fff', marginBottom: 8, fontWeight: '600' }}>Why must this be done? (Tough Love) *</Text>
                        <TextInput
                            value={motivation}
                            onChangeText={setMotivation}
                            placeholder="e.g., 'If I don't do this, I fail the course.'"
                            placeholderTextColor="#666"
                            multiline
                            numberOfLines={2}
                            style={{
                                backgroundColor: '#2a2a2a',
                                color: '#fff',
                                padding: 12,
                                borderRadius: 8,
                                marginBottom: 16,
                                minHeight: 60,
                                textAlignVertical: 'top',
                                borderLeftWidth: 3,
                                borderLeftColor: '#ff3333'
                            }}
                        />

                        {/* Priority */}
                        <Text style={{ color: '#fff', marginBottom: 8, fontWeight: '600' }}>Priority</Text>
                        <View style={{ flexDirection: 'row', marginBottom: 16, gap: 8 }}>
                            {priorityOptions.map(p => (
                                <TouchableOpacity
                                    key={p}
                                    onPress={() => setPriority(p)}
                                    style={{
                                        flex: 1,
                                        padding: 10,
                                        borderRadius: 8,
                                        backgroundColor: priority === p ? '#00ff99' : '#2a2a2a',
                                        alignItems: 'center'
                                    }}
                                >
                                    <Text style={{
                                        color: priority === p ? '#000' : '#fff',
                                        fontWeight: priority === p ? 'bold' : 'normal',
                                        textTransform: 'capitalize'
                                    }}>
                                        {p}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Category */}
                        <Text style={{ color: '#fff', marginBottom: 8, fontWeight: '600' }}>Category</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16, gap: 8 }}>
                            {categories.map(cat => (
                                <TouchableOpacity
                                    key={cat}
                                    onPress={() => setCategory(cat)}
                                    style={{
                                        padding: 10,
                                        paddingHorizontal: 16,
                                        borderRadius: 20,
                                        backgroundColor: category === cat ? '#00ff99' : '#2a2a2a'
                                    }}
                                >
                                    <Text style={{
                                        color: category === cat ? '#000' : '#fff',
                                        fontWeight: category === cat ? 'bold' : 'normal'
                                    }}>
                                        {cat}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Deadline */}
                        <Text style={{ color: '#fff', marginBottom: 8, fontWeight: '600' }}>Deadline *</Text>

                        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                            {['Today', 'Tomorrow', 'Next Week'].map(label => (
                                <TouchableOpacity
                                    key={label}
                                    onPress={() => {
                                        const date = new Date();
                                        if (label === 'Tomorrow') date.setDate(date.getDate() + 1);
                                        if (label === 'Next Week') date.setDate(date.getDate() + 7);
                                        setDeadline(date.toISOString().split('T')[0]);
                                    }}
                                    style={{
                                        backgroundColor: '#333',
                                        paddingHorizontal: 12,
                                        paddingVertical: 6,
                                        borderRadius: 6
                                    }}
                                >
                                    <Text style={{ color: '#00ff99', fontSize: 12 }}>{label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TextInput
                            value={deadline}
                            onChangeText={setDeadline}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor="#666"
                            style={{
                                backgroundColor: '#2a2a2a',
                                color: '#fff',
                                padding: 12,
                                borderRadius: 8,
                                marginBottom: 20,
                                fontSize: 16
                            }}
                        />

                        {/* Action Buttons */}
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity
                                onPress={handleClose}
                                style={{
                                    flex: 1,
                                    padding: 16,
                                    borderRadius: 8,
                                    backgroundColor: '#333',
                                    alignItems: 'center'
                                }}
                            >
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleSave}
                                style={{
                                    flex: 1,
                                    padding: 16,
                                    borderRadius: 8,
                                    backgroundColor: '#00ff99',
                                    alignItems: 'center'
                                }}
                            >
                                <Text style={{ color: '#000', fontWeight: 'bold' }}>
                                    {isEdit ? 'Update' : 'Create'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}
