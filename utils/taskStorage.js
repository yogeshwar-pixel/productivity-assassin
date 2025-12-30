// utils/taskStorage.js
// AsyncStorage wrapper for task and goal management

import AsyncStorage from '@react-native-async-storage/async-storage';

const TASKS_KEY = 'productivity_tasks';
const GOALS_KEY = 'productivity_goals';
const CATEGORIES_KEY = 'productivity_categories';

/**
 * Get all tasks from storage
 */
export async function getAllTasks() {
    try {
        const tasksJson = await AsyncStorage.getItem(TASKS_KEY);
        return tasksJson ? JSON.parse(tasksJson) : [];
    } catch (error) {
        console.error('Error loading tasks:', error);
        return [];
    }
}

/**
 * Save tasks to storage
 */
export async function saveTasks(tasks) {
    try {
        await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
        return true;
    } catch (error) {
        console.error('Error saving tasks:', error);
        return false;
    }
}

/**
 * Get all goals from storage
 */
export async function getAllGoals() {
    try {
        const goalsJson = await AsyncStorage.getItem(GOALS_KEY);
        return goalsJson ? JSON.parse(goalsJson) : [];
    } catch (error) {
        console.error('Error loading goals:', error);
        return [];
    }
}

/**
 * Save goals to storage
 */
export async function saveGoals(goals) {
    try {
        await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(goals));
        return true;
    } catch (error) {
        console.error('Error saving goals:', error);
        return false;
    }
}

/**
 * Get categories from storage
 */
export async function getCategories() {
    try {
        const categoriesJson = await AsyncStorage.getItem(CATEGORIES_KEY);
        return categoriesJson ? JSON.parse(categoriesJson) : ['Work', 'Personal', 'Study', 'Health'];
    } catch (error) {
        console.error('Error loading categories:', error);
        return ['Work', 'Personal', 'Study', 'Health'];
    }
}

/**
 * Add a new category
 */
export async function addCategory(category) {
    try {
        const categories = await getCategories();
        if (!categories.includes(category)) {
            categories.push(category);
            await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
        }
        return categories;
    } catch (error) {
        console.error('Error adding category:', error);
        return null;
    }
}

/**
 * Clear all data (for testing)
 */
export async function clearAllData() {
    try {
        await AsyncStorage.multiRemove([TASKS_KEY, GOALS_KEY, CATEGORIES_KEY]);
        return true;
    } catch (error) {
        console.error('Error clearing data:', error);
        return false;
    }
}
