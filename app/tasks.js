// app/tasks.js
// Main tasks management page

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Alert,
    RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import TaskItem from '../components/TaskItem';
import TaskForm from '../components/TaskForm';
import TaskReminderBanner from '../components/TaskReminderBanner';
import Toast from '../components/Toast';
import { createTask, getTasks, updateTask, deleteTask } from '../utils/taskManager';
import { getCategories } from '../utils/taskStorage';
import { getCachedUnfinishedTaskReminder, invalidateReminderCache } from '../utils/taskReminder';

export default function Tasks() {
    const router = useRouter();
    const [tasks, setTasks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [filter, setFilter] = useState('all'); // all, pending, in-progress, completed
    const [reminderData, setReminderData] = useState(null);
    const [showReminder, setShowReminder] = useState(true);
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [loadedTasks, loadedCategories, reminder] = await Promise.all([
                getTasks(),
                getCategories(),
                getCachedUnfinishedTaskReminder()
            ]);
            setTasks(loadedTasks);
            setCategories(loadedCategories);
            setReminderData(reminder);
        } catch (error) {
            console.error('Error loading tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async (taskData) => {
        try {
            const newTask = await createTask(taskData);
            setTasks(prev => [newTask, ...prev]);
            setShowForm(false);

            // Invalidate cache and refresh reminder
            invalidateReminderCache();
            const reminder = await getCachedUnfinishedTaskReminder();
            setReminderData(reminder);
            setShowReminder(true);

            setToast({ visible: true, message: 'Task created!', type: 'success' });
        } catch (error) {
            setToast({ visible: true, message: 'Failed to create task', type: 'error' });
        }
    };

    const handleUpdateTask = async (taskData) => {
        try {
            const updated = await updateTask(editingTask.id, taskData);
            setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
            setShowForm(false);
            setEditingTask(null);
            setToast({ visible: true, message: 'Task updated!', type: 'success' });
        } catch (error) {
            setToast({ visible: true, message: 'Failed to update task', type: 'error' });
        }
    };

    const handleToggleStatus = async (taskId, newStatus) => {
        try {
            const updated = await updateTask(taskId, { status: newStatus });
            setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));

            // Refresh reminder after status change
            invalidateReminderCache();
            const reminder = await getCachedUnfinishedTaskReminder();
            setReminderData(reminder);
            setShowReminder(true);
        } catch (error) {
            setToast({ visible: true, message: 'Failed to update status', type: 'error' });
        }
    };

    const handleDelete = (taskId) => {
        Alert.alert(
            'Delete Task',
            'Are you sure you want to delete this task?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteTask(taskId);
                            setTasks(prev => prev.filter(t => t.id !== taskId));
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete task');
                        }
                    }
                }
            ]
        );
    };

    const handleEdit = (task) => {
        setEditingTask(task);
        setShowForm(true);
    };

    const filteredTasks = filter === 'all'
        ? tasks
        : tasks.filter(t => t.status === filter);

    const stats = {
        total: tasks.length,
        pending: tasks.filter(t => t.status === 'pending').length,
        inProgress: tasks.filter(t => t.status === 'in-progress').length,
        completed: tasks.filter(t => t.status === 'completed').length
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#000', padding: 16 }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                <Text style={{ color: '#00ff99', fontSize: 28, fontWeight: 'bold' }}>
                    📋 Tasks
                </Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={{ color: '#999', fontSize: 16 }}>← Back</Text>
                </TouchableOpacity>
            </View>

            {/* Stats */}
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 16,
                gap: 8
            }}>
                {[
                    { label: 'All', count: stats.total, value: 'all' },
                    { label: 'Pending', count: stats.pending, value: 'pending' },
                    { label: 'Active', count: stats.inProgress, value: 'in-progress' },
                    { label: 'Done', count: stats.completed, value: 'completed' }
                ].map(stat => (
                    <TouchableOpacity
                        key={stat.value}
                        onPress={() => setFilter(stat.value)}
                        style={{
                            flex: 1,
                            backgroundColor: filter === stat.value ? '#00ff99' : '#1a1a1a',
                            padding: 12,
                            borderRadius: 8,
                            alignItems: 'center'
                        }}
                    >
                        <Text style={{
                            color: filter === stat.value ? '#000' : '#fff',
                            fontSize: 20,
                            fontWeight: 'bold'
                        }}>
                            {stat.count}
                        </Text>
                        <Text style={{
                            color: filter === stat.value ? '#000' : '#999',
                            fontSize: 11,
                            marginTop: 2
                        }}>
                            {stat.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Reminder Banner */}
            {showReminder && (
                <TaskReminderBanner
                    reminderData={reminderData}
                    onDismiss={() => setShowReminder(false)}
                    onViewTasks={() => setFilter('pending')}
                />
            )}

            {/* Task List */}
            <FlatList
                data={filteredTasks}
                renderItem={({ item }) => (
                    <TaskItem
                        task={item}
                        onToggleStatus={handleToggleStatus}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                )}
                keyExtractor={item => item.id}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={loadData} tintColor="#00ff99" />
                }
                ListEmptyComponent={
                    <View style={{ alignItems: 'center', marginTop: 40 }}>
                        <Text style={{ color: '#666', fontSize: 16 }}>
                            {filter === 'all' ? 'No tasks yet' : `No ${filter} tasks`}
                        </Text>
                        <Text style={{ color: '#444', fontSize: 14, marginTop: 8 }}>
                            Tap the + button to create one
                        </Text>
                    </View>
                }
            />

            {/* Floating Add Button */}
            <TouchableOpacity
                onPress={() => {
                    setEditingTask(null);
                    setShowForm(true);
                }}
                style={{
                    position: 'absolute',
                    bottom: 20,
                    right: 20,
                    backgroundColor: '#00ff99',
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#00ff99',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8
                }}
            >
                <Text style={{ color: '#000', fontSize: 32, fontWeight: 'bold' }}>+</Text>
            </TouchableOpacity>

            {/* Task Form Modal */}
            <TaskForm
                visible={showForm}
                onClose={() => {
                    setShowForm(false);
                    setEditingTask(null);
                }}
                onSave={editingTask ? handleUpdateTask : handleCreateTask}
                initialTask={editingTask}
                categories={categories}
            />

            {/* Toast Notification */}
            <Toast
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                onHide={() => setToast({ ...toast, visible: false })}
            />
        </View>
    );
}
