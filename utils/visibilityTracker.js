// utils/visibilityTracker.js
// Tracks when user switches away from the productivity app

class VisibilityTracker {
    constructor(onVisibilityChange) {
        this.onVisibilityChange = onVisibilityChange;
        this.isActive = false;
        this.awayStartTime = null;
        this.totalAwayTime = 0;
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    }

    start() {
        if (this.isActive) return;

        this.isActive = true;
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        window.addEventListener('blur', () => this.handleBlur());
        window.addEventListener('focus', () => this.handleFocus());

        console.log('👁️ Visibility tracking started');
    }

    stop() {
        this.isActive = false;
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        window.removeEventListener('blur', this.handleBlur);
        window.removeEventListener('focus', this.handleFocus);

        console.log('👁️ Visibility tracking stopped');
    }

    handleVisibilityChange() {
        if (document.hidden) {
            this.handleAway('tab_switch');
        } else {
            this.handleReturn('tab_switch');
        }
    }

    handleBlur() {
        this.handleAway('window_switch');
    }

    handleFocus() {
        this.handleReturn('window_switch');
    }

    handleAway(reason) {
        if (!this.awayStartTime) {
            this.awayStartTime = Date.now();
            console.log(`⚠️ User left app (${reason})`);

            if (this.onVisibilityChange) {
                this.onVisibilityChange({
                    type: 'away',
                    reason,
                    timestamp: new Date().toISOString(),
                });
            }
        }
    }

    handleReturn(reason) {
        if (this.awayStartTime) {
            const awayDuration = Date.now() - this.awayStartTime;
            this.totalAwayTime += awayDuration;

            console.log(`✅ User returned (${reason}) - was away for ${Math.round(awayDuration / 1000)}s`);

            if (this.onVisibilityChange) {
                this.onVisibilityChange({
                    type: 'return',
                    reason,
                    awayDuration,
                    totalAwayTime: this.totalAwayTime,
                    timestamp: new Date().toISOString(),
                });
            }

            this.awayStartTime = null;
        }
    }

    getStats() {
        const currentAwayTime = this.awayStartTime ? Date.now() - this.awayStartTime : 0;
        return {
            totalAwayTime: this.totalAwayTime + currentAwayTime,
            isCurrentlyAway: !!this.awayStartTime,
            currentAwayDuration: currentAwayTime,
        };
    }

    reset() {
        this.awayStartTime = null;
        this.totalAwayTime = 0;
    }
}

export default VisibilityTracker;
