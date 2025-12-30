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
    const [description, setDescription] = useState(initialTask?.description || '');
    const [priority, setPriority] = useState(initialTask?.priority || 'medium');
    const [category, setCategory] = useState(initialTask?.category || 'Personal');
    const [notes, setNotes] = useState(initialTask?.notes || '');

    const isEdit = !!initialTask;

    const handleSave = () => {
        if (!title.trim()) {
            alert('Please enter a task title');
            return;
        }

        const taskData = {
            title: title.trim(),
            description: description.trim(),
            priority,
            category,
            notes: notes.trim()
        };

        onSave(taskData);
        resetForm();
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setPriority('medium');
        setCategory('Personal');
        setNotes('');
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

                        {/* Description */}
                        <Text style={{ color: '#fff', marginBottom: 8, fontWeight: '600' }}>Description</Text>
                        <TextInput
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Add more details..."
                            placeholderTextColor="#666"
                            multiline
                            numberOfLines={3}
                            style={{
                                backgroundColor: '#2a2a2a',
                                color: '#fff',
                                padding: 12,
                                borderRadius: 8,
                                marginBottom: 16,
                                minHeight: 80,
                                textAlignVertical: 'top'
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

                        {/* Notes */}
                        <Text style={{ color: '#fff', marginBottom: 8, fontWeight: '600' }}>Notes</Text>
                        <TextInput
                            value={notes}
                            onChangeText={setNotes}
                            placeholder="Additional notes..."
                            placeholderTextColor="#666"
                            multiline
                            numberOfLines={2}
                            style={{
                                backgroundColor: '#2a2a2a',
                                color: '#fff',
                                padding: 12,
                                borderRadius: 8,
                                marginBottom: 20,
                                minHeight: 60,
                                textAlignVertical: 'top'
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
