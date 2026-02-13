// DetailChant Page
async function renderDetailChant(chantId) {
    const app = document.getElementById('app');

    if (!chantId) {
        router.navigate('#catalogue');
        return;
    }

    app.innerHTML = '<div class="container"><div class="loading"><i class="fas fa-spinner fa-spin"></i> Chargement du chant...</div></div>';

    try {
        const chant = await api.chants.getById(chantId);

        const categoryLabels = {
            'entree': 'Entrée',
            'kyrie': 'Kyrie',
            'gloria': 'Gloria',
            'psaume': 'Psaume',
            'alleluia': 'Alléluia',
            'priere_universelle': 'Prière Universelle',
            'offertoire': 'Offertoire',
            'sanctus': 'Sanctus',
            'agnus': 'Agnus Dei',
            'communion': 'Communion',
            'envoi': 'Envoi',
            'autre': 'Autre'
        };

        app.innerHTML = `
            <div class="detail-page">
                <div class="container">
                    <div class="detail-header">
                        <button class="btn btn-sm btn-outline mb-3" onclick="router.navigate('#catalogue')">
                            <i class="fas fa-arrow-left"></i> Retour au catalogue
                        </button>
                        <div class="d-flex justify-between align-center">
                            <h1>${chant.titre}</h1>
                            <div class="detail-actions">
                                <button class="btn btn-primary" onclick="playChantFromDetail(${chant.id})">
                                    <i class="fas fa-play"></i> Écouter
                                </button>
                                <button class="btn btn-outline" onclick="addToPlaylist(${chant.id})">
                                    <i class="fas fa-plus"></i> Playlist
                                </button>
                            </div>
                        </div>
                        <div class="chant-meta mt-2">
                            <span><i class="fas fa-user"></i> ${chant.compositeur || 'Anonyme'}</span>
                            <span class="badge ml-2">${categoryLabels[chant.categorie] || chant.categorie}</span>
                            <span class="badge badge-info ml-2">${chant.temps_liturgique || 'Ordinaire'}</span>
                        </div>
                    </div>

                    <div class="detail-content-grid mt-4">
                        <div class="detail-main">
                            <section class="lyrics-section">
                                <h3><i class="fas fa-align-left"></i> Paroles</h3>
                                <div class="lyrics-content">
                                    ${chant.paroles ? chant.paroles.replace(/\n/g, '<br>') : '<em>Pas de paroles disponibles</em>'}
                                </div>
                            </section>

                            ${chant.description ? `
                                <section class="description-section mt-4">
                                    <h3><i class="fas fa-info-circle"></i> Description</h3>
                                    <p>${chant.description}</p>
                                </section>
                            ` : ''}
                        </div>

                        <div class="detail-sidebar">
                            <section class="partitions-section card">
                                <h3><i class="fas fa-file-pdf"></i> Partitions</h3>
                                <div class="partitions-list">
                                    ${chant.partitions && chant.partitions.length > 0 ?
                chant.partitions.map(p => `
                                            <div class="partition-item">
                                                <span><i class="far fa-file-pdf"></i> ${p.voix}</span>
                                                <button class="btn btn-sm btn-outline" onclick="openPartitionModal('${p.fichier_url}', '${p.voix}')" title="Voir la partition">
                                                    <i class="fas fa-eye"></i> Voir
                                                </button>
                                            </div>
                                        `).join('') :
                '<p class="text-muted">Aucune partition disponible.</p>'
            }
                                </div>
                            </section>

                            <section class="audio-list-section card mt-4">
                                <h3><i class="fas fa-music"></i> Enregistrements par voix</h3>
                                <div class="audio-list">
                                    ${chant.audio && chant.audio.length > 0 ?
                chant.audio.map(a => `
                                            <div class="audio-list-item">
                                                <div class="voice-info">
                                                    <span class="voice-name">${a.voix === 'toutes' ? 'Complet' : a.voix.charAt(0).toUpperCase() + a.voix.slice(1)}</span>
                                                </div>
                                                <button class="btn btn-sm btn-icon" onclick="playSpecificAudio('${a.fichier_url}', '${chant.titre.replace(/'/g, "\\'")}')">
                                                    <i class="fas fa-play"></i>
                                                </button>
                                            </div>
                                        `).join('') :
                '<p>Aucun enregistrement disponible</p>'
            }
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading chant details:', error);
        app.innerHTML = '<div class="container"><div class="error">Erreur lors du chargement du chant.</div></div>';
    }
}

// Global scope for onclicks
async function playChantFromDetail(chantId) {
    try {
        const chant = await api.chants.getById(chantId);
        if (window.audioPlayer) {
            window.audioPlayer.play(chant);
        }
    } catch (error) {
        alert('Erreur: ' + error.message);
    }
}

function playSpecificAudio(url, title) {
    if (window.audioPlayer) {
        // Mock a chant object for the player
        window.audioPlayer.play({
            titre: title,
            audio: [{ fichier_url: url }]
        });
    }
}

window.playChantFromDetail = playChantFromDetail;
window.playSpecificAudio = playSpecificAudio;

// Register route
router.register('chant', renderDetailChant);

// Partition Modal Functions
window.openPartitionModal = (url, voix) => {
    const modal = document.getElementById('partitionModal');
    const iframe = document.getElementById('pdfViewer');
    const title = document.getElementById('partitionModalTitle');
    const playBtn = document.getElementById('modalPlayBtn');

    if (!modal || !iframe || !title) return;

    title.innerText = `Partition - ${voix}`;

    // Show loading overlay
    const overlay = document.getElementById('pdfLoadingOverlay');
    if (overlay) overlay.style.display = 'flex';

    // Direct embed for speed
    iframe.src = url;

    // Hide overlay when iframe loads
    iframe.onload = () => {
        if (overlay) overlay.style.display = 'none';
    };

    if (playBtn) {
        playBtn.style.display = 'inline-block';
        playBtn.onclick = () => {
            const detailPlayBtn = document.querySelector('.detail-actions .btn-primary');
            if (detailPlayBtn) detailPlayBtn.click();
        };
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
};

window.closePartitionModal = () => {
    const modal = document.getElementById('partitionModal');
    const iframe = document.getElementById('pdfViewer');

    if (!modal || !iframe) return;

    modal.style.display = 'none';
    iframe.src = ''; // Clear iframe to stop loading
    document.body.style.overflow = 'auto';
};

// Global Close modal handler (Close on click outside)
window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
        const modalId = event.target.id;
        if (modalId === 'partitionModal') {
            window.closePartitionModal();
        } else {
            event.target.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
});
