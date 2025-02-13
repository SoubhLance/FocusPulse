class PomodoroTimer {
    constructor() {
        this.timeLeft = 25 * 60; // 25 minutes in seconds
        this.isRunning = false;
        this.timerInterval = null;
        this.currentMode = 'pomodoro';
        this.settings = {
            pomodoro: 25,
            shortBreak: 5,
            longBreak: 15,
            theme: 'default'
        };
        
        // Theme colors
        this.themes = {
            default: {
                primary: '#4c49ed',
                gradient: 'linear-gradient(180deg, rgba(77, 77, 255, 0.2) 0%, rgba(0, 0, 0, 0.2) 100%)'
            },
            forest: {
                primary: '#2ecc71',
                gradient: 'linear-gradient(180deg, rgba(46, 204, 113, 0.2) 0%, rgba(0, 0, 0, 0.2) 100%)'
            },
            ocean: {
                primary: '#3498db',
                gradient: 'linear-gradient(180deg, rgba(52, 152, 219, 0.2) 0%, rgba(0, 0, 0, 0.2) 100%)'
            }
        };
    }

    init() {
        this.loadSettings();
        this.attachEventListeners();
        this.updateDisplay();
        this.hideLoader();
    }

    hideLoader() {
        setTimeout(() => {
            const loader = document.getElementById('loader');
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.remove();
            }, 500);
        }, 1500); // Show loader for 1.5 seconds
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('pomodoroSettings');
        if (savedSettings) {
            this.settings = JSON.parse(savedSettings);
            this.applyTheme(this.settings.theme);
            this.updateInputValues();
        }
    }

    saveSettings() {
        localStorage.setItem('pomodoroSettings', JSON.stringify(this.settings));
    }

    updateInputValues() {
        document.getElementById('work-time').value = this.settings.pomodoro;
        document.getElementById('short-break-time').value = this.settings.shortBreak;
        document.getElementById('long-break-time').value = this.settings.longBreak;
    }

    attachEventListeners() {
        // Mode buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchMode(btn.id));
        });

        // Start/Pause button
        document.getElementById('start').addEventListener('click', () => this.toggleTimer());

        // Settings button
        document.getElementById('customize').addEventListener('click', () => this.toggleSettings());

        // Theme buttons
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => this.changeTheme(btn.dataset.theme));
        });

        // Save settings button
        document.querySelector('.save-btn').addEventListener('click', () => this.saveAndCloseSettings());

        // Close settings when clicking outside
        document.getElementById('settings-modal').addEventListener('click', (e) => {
            if (e.target.id === 'settings-modal') {
                this.toggleSettings();
            }
        });
    }

    switchMode(mode) {
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(mode).classList.add('active');
        this.currentMode = mode;
        
        switch(mode) {
            case 'pomodoro':
                this.timeLeft = this.settings.pomodoro * 60;
                break;
            case 'short-break':
                this.timeLeft = this.settings.shortBreak * 60;
                break;
            case 'long-break':
                this.timeLeft = this.settings.longBreak * 60;
                break;
        }
        
        this.stopTimer();
        this.updateDisplay();
    }

    toggleTimer() {
        const startBtn = document.getElementById('start');
        if (this.isRunning) {
            this.stopTimer();
            startBtn.textContent = 'start';
        } else {
            this.startTimer();
            startBtn.textContent = 'pause';
        }
    }

    startTimer() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.timerInterval = setInterval(() => {
                this.timeLeft--;
                this.updateDisplay();
                
                if (this.timeLeft <= 0) {
                    this.stopTimer();
                    this.playAlarm();
                }
            }, 1000);
        }
    }

    stopTimer() {
        this.isRunning = false;
        clearInterval(this.timerInterval);
        document.getElementById('start').textContent = 'start';
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.querySelector('.timer').textContent = display;
    }

    toggleSettings() {
        const modal = document.getElementById('settings-modal');
        modal.classList.toggle('show');
    }

    changeTheme(theme) {
        document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-theme="${theme}"]`).classList.add('active');
        this.applyTheme(theme);
    }

    applyTheme(theme) {
        const root = document.documentElement;
        const themeColors = this.themes[theme];
        root.style.setProperty('--primary-color', themeColors.primary);
        root.style.setProperty('--bg-gradient', themeColors.gradient);
    }

    saveAndCloseSettings() {
        this.settings = {
            pomodoro: parseInt(document.getElementById('work-time').value),
            shortBreak: parseInt(document.getElementById('short-break-time').value),
            longBreak: parseInt(document.getElementById('long-break-time').value),
            theme: document.querySelector('.theme-btn.active').dataset.theme
        };
        
        this.saveSettings();
        this.switchMode(this.currentMode);
        this.toggleSettings();
    }

    playAlarm() {
        // Create and play a simple beep sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.5;
        
        oscillator.start();
        
        setTimeout(() => {
            oscillator.stop();
        }, 200);
    }
}

// Initialize the timer when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    const timer = new PomodoroTimer();
    timer.init();
});