// utils/taskManager.js
// CRUD operations for task management

import { getAllTasks, saveTasks } from './taskStorage';

/**
 * Generate unique ID for tasks
 */
function generateId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new task
 * @param {Object} taskData - Task properties
 * @returns {Promise<Object>} - Created task
 */
export async function createTask(taskData) {
    const tasks = await getAllTasks();

    const newTask = {
        id: generateId(),
        title: taskData.title || 'Untitled Task',
        description: taskData.description || '',
        status: 'pending',
        priority: taskData.priority || 'medium',
        category: taskData.category || 'Personal',
        tags: taskData.tags || [],
        notes: taskData.notes || '',
        deadline: taskData.deadline || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: null,
        goalId: taskData.goalId || null,
        estimatedMinutes: taskData.estimatedMinutes || null
    };

    tasks.push(newTask);
    await saveTasks(tasks);

    console.log('✅ Task created:', newTask.title);
    return newTask;
}

/**
 * Get task by ID
 * @param {string} taskId 
 * @returns {Promise<Object|null>}
 */
export async function getTaskById(taskId) {
    const tasks = await getAllTasks();
    return tasks.find(task => task.id === taskId) || null;
}

/**
 * Update a task
 * @param {string} taskId 
 * @param {Object} updates 
 * @returns {Promise<Object|null>} - Updated task
 */
export async function updateTask(taskId, updates) {
    const tasks = await getAllTasks();
    const index = tasks.findIndex(task => task.id === taskId);

    if (index === -1) {
        console.error('Task not found:', taskId);
        return null;
    }

    const updatedTask = {
        ...tasks[index],
        ...updates,
        updatedAt: new Date().toISOString()
    };

    // Auto-set completedAt when status changes to completed
    if (updates.status === 'completed' && tasks[index].status !== 'completed') {
        updatedTask.completedAt = new Date().toISOString();
    }

    // Clear completedAt if status changes from completed
    if (updates.status !== 'completed' && tasks[index].status === 'completed') {
        updatedTask.completedAt = null;
    }

    tasks[index] = updatedTask;
    await saveTasks(tasks);

    console.log('✅ Task updated:', updatedTask.title);
    return updatedTask;
}

/**
 * Delete a task
 * @param {string} taskId 
 * @returns {Promise<boolean>}
 */
export async function deleteTask(taskId) {
    const tasks = await getAllTasks();
    const filteredTasks = tasks.filter(task => task.id !== taskId);

    if (filteredTasks.length === tasks.length) {
        console.error('Task not found:', taskId);
        return false;
    }

    await saveTasks(filteredTasks);
    console.log('🗑️ Task deleted:', taskId);
    return true;
}

/**
 * Get tasks with optional filters
 * @param {Object} filters - { status, category, priority, goalId }
 * @returns {Promise<Array>}
 */
export async function getTasks(filters = {}) {
    let tasks = await getAllTasks();

    // Apply filters
    if (filters.status) {
        tasks = tasks.filter(task => task.status === filters.status);
    }

    if (filters.category) {
        tasks = tasks.filter(task => task.category === filters.category);
    }

    if (filters.priority) {
        tasks = tasks.filter(task => task.priority === filters.priority);
    }

    if (filters.goalId) {
        tasks = tasks.filter(task => task.goalId === filters.goalId);
    }

    // Apply sorting
    if (filters.sortBy === 'deadline') {
        tasks.sort((a, b) => {
            if (!a.deadline) return 1;
            if (!b.deadline) return -1;
            return new Date(a.deadline) - new Date(b.deadline);
        });
    } else if (filters.sortBy === 'priority') {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    } else {
        // Default: sort by created date (newest first)
        tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return tasks;
}

/**
 * Get tasks by goal ID
 * @param {string} goalId 
 * @returns {Promise<Array>}
 */
export async function getTasksByGoal(goalId) {
    return getTasks({ goalId });
}

/**
 * Mark task as complete
 * @param {string} taskId 
 * @returns {Promise<Object|null>}
 */
export async function completeTask(taskId) {
    const task = await getTaskById(taskId);
    if (!task) return null;

    const updatedTask = await updateTask(taskId, {
        status: 'completed',
        completedAt: new Date().toISOString()
    });

    // Award points for completion
    try {
        const { awardTaskCompletionPoints } = require('./penaltySystem');
        await awardTaskCompletionPoints(task);
    } catch (error) {
        console.warn('Could not award points:', error);
    }

    return updatedTask;
}

/**
 * Get overdue tasks
 * @returns {Promise<Array>}
 */
export async function getOverdueTasks() {
    const tasks = await getTasks({ status: 'pending' });
    const now = new Date();

    return tasks.filter(task => {
        if (!task.deadline) return false;
        return new Date(task.deadline) < now;
    });
}

/**
 * Start a mission (Active Task)
 * Only one task can be active at a time
 */
export async function startMission(taskId) {
    const tasks = await getAllTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);

    if (taskIndex === -1) return null;

    // 1. Pause any currently active tasks
    tasks.forEach(t => {
        if (t.status === 'in-progress' && t.id !== taskId) {
            t.status = 'pending';
        }
    });

    // 2. Set this task to active
    tasks[taskIndex].status = 'in-progress';
    tasks[taskIndex].updatedAt = new Date().toISOString();

    await saveTasks(tasks);
    console.log(`🚀 Mission Started: ${tasks[taskIndex].title}`);

    return tasks[taskIndex];
}

/**
 * Complete a mission
 */
export async function completeMission(taskId) {
    return completeTask(taskId);
}
