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
window.openPartitionModal = async (url, voix) => {
    const modal = document.getElementById('partitionModal');
    const iframe = document.getElementById('pdfViewer');
    const pdfPagesContainer = document.getElementById('pdfPagesContainer');
    const title = document.getElementById('partitionModalTitle');
    const playBtn = document.getElementById('modalPlayBtn');
    const overlay = document.getElementById('pdfLoadingOverlay');

    if (!modal || !iframe || !title) return;

    title.innerText = `Partition - ${voix}`;

    // Show loading overlay
    if (overlay) overlay.style.display = 'flex';

    // Mobile detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;

    if (isMobile && typeof pdfjsLib !== 'undefined') {
        // Mobile: Use PDF.js to render pages as images
        try {
            iframe.style.display = 'none';
            pdfPagesContainer.style.display = 'block';
            pdfPagesContainer.innerHTML = ''; // Clear previous pages

            // Load PDF
            const loadingTask = pdfjsLib.getDocument(url);
            const pdf = await loadingTask.promise;

            // Hide loading overlay
            if (overlay) overlay.style.display = 'none';

            // Render all pages
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);

                // Create canvas for this page
                const canvas = document.createElement('canvas');
                canvas.className = 'pdf-page-canvas';
                const context = canvas.getContext('2d');

                // Calculate scale to fit mobile screen
                const viewport = page.getViewport({ scale: 1 });
                const scale = (window.innerWidth - 32) / viewport.width; // 32px for padding
                const scaledViewport = page.getViewport({ scale: scale });

                canvas.width = scaledViewport.width;
                canvas.height = scaledViewport.height;

                // Render page
                await page.render({
                    canvasContext: context,
                    viewport: scaledViewport
                }).promise;

                // Add page number
                const pageWrapper = document.createElement('div');
                pageWrapper.className = 'pdf-page-wrapper';
                pageWrapper.appendChild(canvas);

                if (pdf.numPages > 1) {
                    const pageLabel = document.createElement('div');
                    pageLabel.className = 'pdf-page-label';
                    pageLabel.textContent = `Page ${pageNum} / ${pdf.numPages}`;
                    pageWrapper.appendChild(pageLabel);
                }

                pdfPagesContainer.appendChild(pageWrapper);
            }

        } catch (error) {
            console.error('Error loading PDF with PDF.js:', error);
            // Fallback to iframe
            iframe.style.display = 'block';
            pdfPagesContainer.style.display = 'none';
            iframe.src = url;
            if (overlay) overlay.style.display = 'none';
        }
    } else {
        // Desktop: Use iframe
        pdfPagesContainer.style.display = 'none';
        iframe.style.display = 'block';
        iframe.src = url;

        // Hide overlay when iframe loads
        iframe.onload = () => {
            if (overlay) overlay.style.display = 'none';
        };
    }

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
    const pdfPagesContainer = document.getElementById('pdfPagesContainer');

    if (modal) modal.style.display = 'none';
    if (iframe) iframe.src = '';
    if (pdfPagesContainer) pdfPagesContainer.innerHTML = '';
    document.body.style.overflow = '';
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
