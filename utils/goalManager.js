// utils/goalManager.js
// CRUD operations for goal management

import { getAllGoals, saveGoals } from './taskStorage';
import { getTasksByGoal } from './taskManager';

/**
 * Generate unique ID for goals
 */
function generateId() {
    return `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new goal
 * @param {Object} goalData 
 * @returns {Promise<Object>}
 */
export async function createGoal(goalData) {
    const goals = await getAllGoals();

    const newGoal = {
        id: generateId(),
        title: goalData.title || 'Untitled Goal',
        description: goalData.description || '',
        type: goalData.type || 'weekly', // daily, weekly, long-term
        status: 'active',
        targetDate: goalData.targetDate || null,
        createdAt: new Date().toISOString(),
        completedAt: null,
        taskIds: [],
        subtasks: goalData.subtasks || [],
        progress: 0
    };

    goals.push(newGoal);
    await saveGoals(goals);

    console.log('✅ Goal created:', newGoal.title);
    return newGoal;
}

/**
 * Update a goal
 * @param {string} goalId 
 * @param {Object} updates 
 * @returns {Promise<Object|null>}
 */
export async function updateGoal(goalId, updates) {
    const goals = await getAllGoals();
    const index = goals.findIndex(goal => goal.id === goalId);

    if (index === -1) {
        console.error('Goal not found:', goalId);
        return null;
    }

    const updatedGoal = {
        ...goals[index],
        ...updates
    };

    // Auto-set completedAt when status changes to completed
    if (updates.status === 'completed' && goals[index].status !== 'completed') {
        updatedGoal.completedAt = new Date().toISOString();
    }

    goals[index] = updatedGoal;
    await saveGoals(goals);

    console.log('✅ Goal updated:', updatedGoal.title);
    return updatedGoal;
}

/**
 * Link task to goal
 * @param {string} taskId 
 * @param {string} goalId 
 * @returns {Promise<Object|null>}
 */
export async function linkTaskToGoal(taskId, goalId) {
    const goals = await getAllGoals();
    const goal = goals.find(g => g.id === goalId);

    if (!goal) {
        console.error('Goal not found:', goalId);
        return null;
    }

    if (!goal.taskIds.includes(taskId)) {
        goal.taskIds.push(taskId);
        await saveGoals(goals);

        // Update progress
        await calculateGoalProgress(goalId);
    }

    return goal;
}

/**
 * Calculate goal progress based on completed tasks and subtasks
 * @param {string} goalId 
 * @returns {Promise<number>} - Progress percentage (0-100)
 */
export async function calculateGoalProgress(goalId) {
    const goals = await getAllGoals();
    const goal = goals.find(g => g.id === goalId);

    if (!goal) return 0;

    let totalItems = 0;
    let completedItems = 0;

    // Count subtasks
    if (goal.subtasks && goal.subtasks.length > 0) {
        totalItems += goal.subtasks.length;
        completedItems += goal.subtasks.filter(st => st.completed).length;
    }

    // Count linked tasks
    if (goal.taskIds && goal.taskIds.length > 0) {
        const tasks = await getTasksByGoal(goalId);
        totalItems += tasks.length;
        completedItems += tasks.filter(t => t.status === 'completed').length;
    }

    const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    // Update goal progress
    await updateGoal(goalId, { progress });

    return progress;
}

/**
 * Add subtask to goal
 * @param {string} goalId 
 * @param {string} title 
 * @returns {Promise<Object|null>}
 */
export async function addSubtask(goalId, title) {
    const goals = await getAllGoals();
    const goal = goals.find(g => g.id === goalId);

    if (!goal) return null;

    const subtask = {
        id: `subtask_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title,
        completed: false,
        completedAt: null
    };

    goal.subtasks.push(subtask);
    await saveGoals(goals);
    await calculateGoalProgress(goalId);

    return goal;
}

/**
 * Toggle subtask completion
 * @param {string} goalId 
 * @param {string} subtaskId 
 * @returns {Promise<Object|null>}
 */
export async function toggleSubtask(goalId, subtaskId) {
    const goals = await getAllGoals();
    const goal = goals.find(g => g.id === goalId);

    if (!goal) return null;

    const subtask = goal.subtasks.find(st => st.id === subtaskId);
    if (!subtask) return null;

    subtask.completed = !subtask.completed;
    subtask.completedAt = subtask.completed ? new Date().toISOString() : null;

    await saveGoals(goals);
    await calculateGoalProgress(goalId);

    return goal;
}

/**
 * Get goals by type
 * @param {string} type - 'daily', 'weekly', 'long-term'
 * @returns {Promise<Array>}
 */
export async function getGoalsByType(type) {
    const goals = await getAllGoals();
    return goals.filter(goal => goal.type === type && goal.status === 'active');
}
