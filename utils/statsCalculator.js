import AsyncStorage from '@react-native-async-storage/async-storage';

export const StatsCalculator = {
    // Main entry point to get all stats
    async getAllStats() {
        try {
            const [violationsJson, sessionsJson, profileJson] = await Promise.all([
                AsyncStorage.getItem('violationHistory'),
                AsyncStorage.getItem('focusSessions'),
                AsyncStorage.getItem('assassinProfile')
            ]);

            const violations = violationsJson ? JSON.parse(violationsJson) : [];
            const sessions = sessionsJson ? JSON.parse(sessionsJson) : [];
            const profile = profileJson ? JSON.parse(profileJson) : null;

            return {
                daily: this.calculateDailyMetrics(violations, sessions),
                weekly: this.calculateWeeklyTrend(violations, sessions),
                distractions: this.analyzeDistractions(violations),
                timeSlots: this.analyzeTimeSlots(violations),
                profile: profile
            };
        } catch (error) {
            console.error('Error calculating stats:', error);
            return null;
        }
    },

    // 1. Daily Metrics (Today vs Yesterday)
    calculateDailyMetrics(violations, sessions) {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        const todayViolations = violations.filter(v =>
            new Date(v.timestamp).toISOString().split('T')[0] === today
        ).length;

        const yesterdayViolations = violations.filter(v =>
            new Date(v.timestamp).toISOString().split('T')[0] === yesterday
        ).length;

        const todayFocus = sessions
            .filter(s => s.timestamp.startsWith(today))
            .reduce((sum, s) => sum + s.duration, 0);

        // Productivity Score (0-100)
        // Base 50 + (Focus Minutes / 2) - (Violations * 5)
        let score = 50 + (todayFocus / 2) - (todayViolations * 5);
        score = Math.max(0, Math.min(100, score)); // Clamp 0-100

        let scoreGrade = 'F';
        if (score >= 90) scoreGrade = 'A+';
        else if (score >= 80) scoreGrade = 'A';
        else if (score >= 70) scoreGrade = 'B';
        else if (score >= 60) scoreGrade = 'C';
        else if (score >= 50) scoreGrade = 'D';

        return {
            violations: todayViolations,
            violationChange: todayViolations - yesterdayViolations,
            focusMinutes: todayFocus,
            productivityScore: Math.round(score),
            grade: scoreGrade
        };
    },

    // 2. Weekly Trend (Last 7 Days)
    calculateWeeklyTrend(violations, sessions) {
        const labels = [];
        const violationData = [];
        const focusData = [];

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dayStr = d.toISOString().split('T')[0];
            const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });

            labels.push(dayLabel);

            // Count violations for this day
            const daysViolations = violations.filter(v =>
                new Date(v.timestamp).toISOString().startsWith(dayStr)
            ).length;
            violationData.push(daysViolations);

            // Sum focus minutes for this day
            const daysFocus = sessions
                .filter(s => s.timestamp.startsWith(dayStr))
                .reduce((sum, s) => sum + s.duration, 0);
            focusData.push(daysFocus);
        }

        // Best/Worst Day Analysis
        const maxFocus = Math.max(...focusData);
        const bestDayIndex = focusData.indexOf(maxFocus);
        const bestDay = labels[bestDayIndex];

        return {
            labels,
            violationData,
            focusData,
            bestDay,
            maxFocus
        };
    },

    // 3. Top Distraction Analysis
    analyzeDistractions(violations) {
        const siteCounts = {};

        violations.forEach(v => {
            // Normalize domain/keyword
            const key = (v.keyword || v.domain || 'Unknown').toLowerCase()
                .replace('https://', '')
                .replace('http://', '')
                .replace('www.', '')
                .split('/')[0]; // Get base domain

            siteCounts[key] = (siteCounts[key] || 0) + 1;
        });

        // Convert to array and sort
        const sorted = Object.keys(siteCounts)
            .map(key => ({ name: key, count: siteCounts[key] }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5); // Top 5

        const total = violations.length || 1;

        return sorted.map(item => ({
            ...item,
            percentage: Math.round((item.count / total) * 100)
        }));
    },

    // 4. Time Slot Analysis (Weak Times)
    analyzeTimeSlots(violations) {
        const slots = {
            morning: 0,   // 5AM - 12PM
            afternoon: 0, // 12PM - 6PM
            evening: 0,   // 6PM - 10PM
            night: 0      // 10PM - 5AM
        };

        violations.forEach(v => {
            const hour = new Date(v.timestamp).getHours();

            if (hour >= 5 && hour < 12) slots.morning++;
            else if (hour >= 12 && hour < 18) slots.afternoon++;
            else if (hour >= 18 && hour < 22) slots.evening++;
            else slots.night++;
        });

        // Find weakest slot
        let weakestSlot = 'None';
        let maxCount = -1;

        Object.entries(slots).forEach(([slot, count]) => {
            if (count > maxCount) {
                maxCount = count;
                weakestSlot = slot;
            }
        });

        return {
            slots,
            weakestSlot,
            total: violations.length
        };
        return {
            slots,
            weakestSlot,
            total: violations.length
        };
    },

    // 5. Sync with Extension (Offline Data)
    async syncWithExtension() {
        return new Promise((resolve) => {
            // 1. Send Request
            window.postMessage({
                source: 'productivity-assassin-app',
                type: 'REQUEST_SYNC'
            }, '*');

            // 2. Listen for Response
            const handler = async (event) => {
                if (event.source !== window) return;
                if (event.data && event.data.type === 'SYNC_DATA_RESPONSE') {

                    window.removeEventListener('message', handler);

                    const extHistory = event.data.history || [];
                    const extCount = event.data.count || 0;

                    if (extHistory.length === 0) {
                        resolve({ success: true, added: 0 });
                        return;
                    }

                    try {
                        // 3. Merge with Local Data
                        const localJson = await AsyncStorage.getItem('violationHistory');
                        const localHistory = localJson ? JSON.parse(localJson) : [];

                        // Filter duplicates by timestamp
                        const localTimestamps = new Set(localHistory.map(v => v.timestamp));
                        const newViolations = extHistory.filter(v => !localTimestamps.has(v.timestamp));

                        if (newViolations.length > 0) {
                            const merged = [...localHistory, ...newViolations];
                            await AsyncStorage.setItem('violationHistory', JSON.stringify(merged));
                            console.log(`✅ Synced ${newViolations.length} offline violations.`);
                        }

                        resolve({ success: true, added: newViolations.length });
                    } catch (e) {
                        console.error('Sync Error:', e);
                        resolve({ success: false, error: e });
                    }
                }
            };

            // Set listener with timeout
            window.addEventListener('message', handler);
            setTimeout(() => {
                window.removeEventListener('message', handler);
                resolve({ success: false, error: 'Timeout' });
            }, 3000);
        });
    }
};
