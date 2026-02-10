// Audio Player Component
class AudioPlayer {
    constructor() {
        this.audio = new Audio();
        this.currentChant = null;
        this.isPlaying = false;

        // Create player UI elements
        this.createUI();
        this.setupListeners();
    }

    createUI() {
        const playerEl = document.createElement('div');
        playerEl.id = 'persistent-player';
        playerEl.className = 'audio-player-container hidden';
        playerEl.innerHTML = `
            <div class="container d-flex align-center justify-between">
                <div class="player-info">
                    <h4 id="player-title">Aucun chant</h4>
                    <p id="player-composer">-</p>
                </div>
                <div class="player-controls">
                    <button class="btn-player" id="player-prev"><i class="fas fa-step-backward"></i></button>
                    <button class="btn-player btn-player-main" id="player-toggle">
                        <i class="fas fa-play" id="player-icon"></i>
                    </button>
                    <button class="btn-player" id="player-next"><i class="fas fa-step-forward"></i></button>
                </div>
                <div class="player-progress-container">
                    <span id="player-current-time">0:00</span>
                    <div class="progress-bar" id="player-progress-bar">
                        <div class="progress-fill" id="player-progress-fill"></div>
                    </div>
                    <span id="player-duration">0:00</span>
                </div>
                <div class="player-actions">
                    <button class="btn-player" id="player-close"><i class="fas fa-times"></i></button>
                </div>
            </div>
        `;
        document.body.appendChild(playerEl);

        this.ui = {
            container: playerEl,
            title: document.getElementById('player-title'),
            composer: document.getElementById('player-composer'),
            toggleBtn: document.getElementById('player-toggle'),
            icon: document.getElementById('player-icon'),
            progressFill: document.getElementById('player-progress-fill'),
            progressBar: document.getElementById('player-progress-bar'),
            currentTime: document.getElementById('player-current-time'),
            duration: document.getElementById('player-duration'),
            closeBtn: document.getElementById('player-close')
        };
    }

    setupListeners() {
        this.ui.toggleBtn.addEventListener('click', () => this.togglePlayback());
        this.ui.closeBtn.addEventListener('click', () => this.hide());

        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('loadedmetadata', () => {
            this.ui.duration.textContent = this.formatTime(this.audio.duration);
        });
        this.audio.addEventListener('ended', () => {
            this.isPlaying = false;
            this.ui.icon.className = 'fas fa-play';
        });

        // Seek on progress bar click
        this.ui.progressBar.addEventListener('click', (e) => {
            const rect = this.ui.progressBar.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            this.audio.currentTime = pos * this.audio.duration;
        });
    }

    play(chant) {
        if (!chant.audio || chant.audio.length === 0) {
            alert('Ce chant n\'a pas de fichier audio disponible.');
            return;
        }

        // Use the first audio file (complet by default)
        const audioFile = chant.audio[0];

        if (this.currentChant && this.currentChant.id === chant.id) {
            this.togglePlayback();
            return;
        }

        this.currentChant = chant;
        this.audio.src = audioFile.fichier_url;
        this.ui.title.textContent = chant.titre;
        this.ui.composer.textContent = chant.compositeur || 'Anonyme';

        this.show();
        this.audio.play();
        this.isPlaying = true;
        this.ui.icon.className = 'fas fa-pause';
    }

    togglePlayback() {
        if (!this.currentChant) return;

        if (this.isPlaying) {
            this.audio.pause();
            this.ui.icon.className = 'fas fa-play';
        } else {
            this.audio.play();
            this.ui.icon.className = 'fas fa-pause';
        }
        this.isPlaying = !this.isPlaying;
    }

    updateProgress() {
        const percent = (this.audio.currentTime / this.audio.duration) * 100;
        this.ui.progressFill.style.width = `${percent}%`;
        this.ui.currentTime.textContent = this.formatTime(this.audio.currentTime);
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    show() {
        this.ui.container.classList.remove('hidden');
    }

    hide() {
        this.audio.pause();
        this.isPlaying = false;
        this.ui.container.classList.add('hidden');
    }
}

// Create global audio player instance
window.audioPlayer = new AudioPlayer();
