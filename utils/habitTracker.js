// utils/habitTracker.js
// Habit tracking system with streaks and consistency

import AsyncStorage from '@react-native-async-storage/async-storage';

const HABITS_KEY = 'productivity_habits';

/**
 * Generate unique ID
 */
function generateId() {
    return `habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get all habits
 */
export async function getAllHabits() {
    try {
        const habits = await AsyncStorage.getItem(HABITS_KEY);
        return habits ? JSON.parse(habits) : [];
    } catch (error) {
        console.error('Error loading habits:', error);
        return [];
    }
}

/**
 * Save habits
 */
async function saveHabits(habits) {
    try {
        await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
        return true;
    } catch (error) {
        console.error('Error saving habits:', error);
        return false;
    }
}

/**
 * Create new habit
 */
export async function createHabit(habitData) {
    const habits = await getAllHabits();

    const newHabit = {
        id: generateId(),
        userId: 'default_user',
        name: habitData.name,
        description: habitData.description || '',
        frequency: habitData.frequency || 'daily', // 'daily' or 'weekly'
        targetDays: habitData.targetDays || [], // [0-6] for weekly
        startDate: habitData.startDate || new Date().toISOString(),
        isActive: true,
        completions: [],
        currentStreak: 0,
        longestStreak: 0,
        breakpoints: [],
        createdAt: new Date().toISOString()
    };

    habits.push(newHabit);
    await saveHabits(habits);

    console.log('✅ Habit created:', newHabit.name);
    return newHabit;
}

/**
 * Mark habit complete for a specific date
 */
export async function markHabitComplete(habitId, date = new Date(), notes = '') {
    const habits = await getAllHabits();
    const habit = habits.find(h => h.id === habitId);

    if (!habit) return null;

    const dateStr = new Date(date).toISOString().split('T')[0];

    // Check if already completed
    const existing = habit.completions.find(c => c.date.startsWith(dateStr));
    if (existing) {
        existing.completed = true;
        existing.notes = notes;
    } else {
        habit.completions.push({
            date: new Date(date).toISOString(),
            completed: true,
            notes
        });
    }

    // Recalculate streak
    await calculateStreak(habitId);

    await saveHabits(habits);
    console.log('✅ Habit marked complete:', habit.name);
    return habit;
}

/**
 * Mark habit incomplete (uncomplete)
 */
export async function unmarkHabitComplete(habitId, date = new Date()) {
    const habits = await getAllHabits();
    const habit = habits.find(h => h.id === habitId);

    if (!habit) return null;

    const dateStr = new Date(date).toISOString().split('T')[0];
    const existing = habit.completions.find(c => c.date.startsWith(dateStr));

    if (existing) {
        existing.completed = false;
    }

    await calculateStreak(habitId);
    await saveHabits(habits);

    return habit;
}

/**
 * Calculate current streak
 */
export async function calculateStreak(habitId) {
    const habits = await getAllHabits();
    const habit = habits.find(h => h.id === habitId);

    if (!habit) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Go backwards from today
    for (let i = 0; i < 365; i++) { // Max 365 days lookback
        const dateStr = currentDate.toISOString().split('T')[0];

        // Check if this day is a target day for weekly habits
        if (habit.frequency === 'weekly' && habit.targetDays.length > 0) {
            const dayOfWeek = currentDate.getDay();
            if (!habit.targetDays.includes(dayOfWeek)) {
                // Skip non-target days
                currentDate.setDate(currentDate.getDate() - 1);
                continue;
            }
        }

        const completion = habit.completions.find(c => c.date.startsWith(dateStr));

        if (completion && completion.completed) {
            streak++;
        } else {
            // Streak broken - record breakpoint
            if (streak > 0 && !habit.breakpoints.includes(currentDate.toISOString())) {
                habit.breakpoints.push(currentDate.toISOString());
            }
            break;
        }

        currentDate.setDate(currentDate.getDate() - 1);
    }

    habit.currentStreak = streak;

    if (streak > habit.longestStreak) {
        habit.longestStreak = streak;
    }

    await saveHabits(habits);
    return streak;
}

/**
 * Get habit statistics
 */
export async function getHabitStats(habitId) {
    const habits = await getAllHabits();
    const habit = habits.find(h => h.id === habitId);

    if (!habit) return null;

    const totalDays = Math.floor((Date.now() - new Date(habit.startDate)) / (1000 * 60 * 60 * 24));
    const completedDays = habit.completions.filter(c => c.completed).length;
    const consistencyRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

    return {
        habitId: habit.id,
        name: habit.name,
        currentStreak: habit.currentStreak,
        longestStreak: habit.longestStreak,
        totalCompletions: completedDays,
        totalDays,
        consistencyRate,
        breakpoints: habit.breakpoints.length,
        lastCompleted: completedDays > 0
            ? habit.completions.filter(c => c.completed).sort((a, b) => new Date(b.date) - new Date(a.date))[0].date
            : null
    };
}

/**
 * Get today's habits (due today)
 */
export async function getTodayHabits() {
    const habits = await getAllHabits();
    const today = new Date();
    const todayDay = today.getDay();

    return habits.filter(habit => {
        if (!habit.isActive) return false;

        if (habit.frequency === 'daily') return true;

        if (habit.frequency === 'weekly') {
            return habit.targetDays.includes(todayDay);
        }

        return false;
    });
}

/**
 * Check if habit is completed today
 */
export function isCompletedToday(habit) {
    const todayStr = new Date().toISOString().split('T')[0];
    const completion = habit.completions.find(c => c.date.startsWith(todayStr));
    return completion && completion.completed;
}

/**
 * Delete habit
 */
export async function deleteHabit(habitId) {
    const habits = await getAllHabits();
    const filtered = habits.filter(h => h.id !== habitId);

    await saveHabits(filtered);
    console.log('🗑️ Habit deleted:', habitId);
    return true;
}

/**
 * Toggle habit active status
 */
export async function toggleHabitActive(habitId) {
    const habits = await getAllHabits();
    const habit = habits.find(h => h.id === habitId);

    if (!habit) return null;

    habit.isActive = !habit.isActive;
    await saveHabits(habits);

    return habit;
}
