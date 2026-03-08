// Estado de la aplicación
let currentAssessment = {
    age: null,
    pathology: null,
    painLocations: [],
    painCharacteristics: {},
    assessmentScales: {},
    painScores: {},
    painTypes: {},
    currentPainIndex: 0
};

// Datos de escalas de dolor en español
const painScales = {
    flacc: {
        name: "FLACC (Cara, Piernas, Actividad, Llanto, Consolabilidad)",
        description: "Esta escala observa cómo se comporta su hijo cuando podría tener dolor. Por favor observe a su hijo y seleccione la opción que mejor describe lo que ve.",
        maxScore: 10,
        categories: ['face', 'legs', 'activity', 'cry', 'consolability']
    },
    fps_r: {
        name: "FPS-R (Escala de Caras de Dolor Revisada)",
        description: "Desliza la barra para señalar cuánto dolor tienes ahora mismo. No hay respuestas correctas o incorrectas.",
        maxScore: 10
    },
    nrs: {
        name: "Escala Numérica",
        description: "Por favor califica tu dolor del 0 (sin dolor) al 10 (el peor dolor posible). Mueve el deslizador para mostrar cómo te sientes.",
        maxScore: 10
    },
    nccpc_full: {
        name: "NCCPC-R (Lista de Verificación del Dolor para Niños No Comunicativos - Revisada)",
        description: "Escala validada en castellano con 30 ítems. Observe al niño durante 2 horas y marque la frecuencia de cada comportamiento.",
        maxScore: 90
    }
};

// Ítems NCCPC-R completa (30 ítems, 7 categorías)
const nccpcFullDefinition = [
    {
        title: '🗣️ I. Vocalizaciones',
        items: [
            { id: 'nf_vocal1', text: 'Quejidos, lamentos, gemidos (bastante suaves)' },
            { id: 'nf_vocal2', text: 'Llanto (moderadamente fuerte)' },
            { id: 'nf_vocal3', text: 'Gritos, chillidos (muy fuertes)' },
            { id: 'nf_vocal4', text: 'Sonido o expresión específica de dolor' }
        ]
    },
    {
        title: '🤝 II. Relación/Contacto',
        items: [
            { id: 'nf_rel1', text: 'Poco cooperativo, malhumorado, irritable, insatisfecho' },
            { id: 'nf_rel2', text: 'Menos contacto con los demás, retraído' },
            { id: 'nf_rel3', text: 'Busca consuelo o cercanía física' },
            { id: 'nf_rel4', text: 'Difícil de distraer, no se puede satisfacer o distraer' }
        ]
    },
    {
        title: '😐 III. Expresión Facial',
        items: [
            { id: 'nf_face1', text: 'Ceño fruncido' },
            { id: 'nf_face2', text: 'Movimientos oculares (entrecerrar, abrir mucho, moverlos)' },
            { id: 'nf_face3', text: 'Comisuras de la boca hacia abajo, no sonríe' },
            { id: 'nf_face4', text: 'Labios: pucheros, apretados, temblorosos' },
            { id: 'nf_face5', text: 'Castañeteo/rechinar de dientes, masticación, sacar la lengua' }
        ]
    },
    {
        title: '🏃 IV. Actividad',
        items: [
            { id: 'nf_act1', text: 'Inquieto, agitado, se retuerce, se balancea' },
            { id: 'nf_act2', text: 'Movimientos limitados, lento, apático, rígido' }
        ]
    },
    {
        title: '🦴 V. Postura Corporal y Extremidades',
        items: [
            { id: 'nf_pos1', text: 'Flácido, laxo' },
            { id: 'nf_pos2', text: 'Rígido, espástico, tenso, inmovilidad' },
            { id: 'nf_pos3', text: 'Agitar brazos/piernas o tocar zona dolorida' },
            { id: 'nf_pos4', text: 'Protege, favorece o evita usar la zona dolorida' },
            { id: 'nf_pos5', text: 'Retirada refleja, reacciona sensiblemente al tacto' },
            { id: 'nf_pos6', text: 'Mueve el cuerpo para indicar dolor (echa cabeza atrás, encoge rodillas…)' }
        ]
    },
    {
        title: '💓 VI. Signos Fisiológicos',
        items: [
            { id: 'nf_fis1', text: 'Temblores, escalofríos' },
            { id: 'nf_fis2', text: 'Color de piel alterado, palidez' },
            { id: 'nf_fis3', text: 'Sudoración, transpiración' },
            { id: 'nf_fis4', text: 'Lágrimas' },
            { id: 'nf_fis5', text: 'Inhalación brusca, jadeos' },
            { id: 'nf_fis6', text: 'Contener la respiración' }
        ]
    },
    {
        title: '🍽️ VII. Alimentación/Sueño',
        items: [
            { id: 'nf_ali1', text: 'Come menos, sin interés en comer' },
            { id: 'nf_ali2', text: 'Duerme más de lo habitual' },
            { id: 'nf_ali3', text: 'Duerme menos de lo habitual' }
        ]
    }
];

// Obtener todos los IDs de ítems NCCPC-R
function getAllNccpcItemIds() {
    const ids = [];
    nccpcFullDefinition.forEach(cat => {
        cat.items.forEach(item => ids.push(item.id));
    });
    return ids;
}

// Matriz de selección de escalas (rangos fusionados)
const scaleMatrix = {
    '0-3_neurological': ['flacc'],
    '0-3_other': ['flacc'],
    '4-8_neurological': ['nccpc_full'],
    '4-8_other': ['fps_r'],
    '9-12_neurological': ['nccpc_full'],
    '9-12_other': ['nrs'],
    '13-18_neurological': ['nccpc_full'],
    '13-18_other': ['nrs']
};

// Características del dolor
const painCharacteristics = [
    { id: 'pulsatil', name: 'Pulsátil', icon: '🔨', type: 'vascular' },
    { id: 'presion', name: 'Presión', icon: '🗜️', type: 'somatico' },
    { id: 'electrico', name: 'Eléctrico/Calambre', icon: '⚡', type: 'neuropatico' },
    { id: 'hormigueo', name: 'Hormigueo/Parestesias', icon: '🐜', type: 'neuropatico' },
    { id: 'quemazon', name: 'Quemazón', icon: '🔥', type: 'neuropatico' },
    { id: 'punzante', name: 'Punzante', icon: '🗡️', type: 'somatico' },
    { id: 'sordo', name: 'Sordo/Constante', icon: '💊', type: 'visceral' }
];

// Colores para los marcadores de dolor
const painColors = [
    { id: 1, color: '#FF4444', name: 'Rojo' },
    { id: 2, color: '#4444FF', name: 'Azul' },
    { id: 3, color: '#44FF44', name: 'Verde' },
    { id: 4, color: '#FF8844', name: 'Naranja' }
];

// Elementos DOM
let elements = {};

// Inicializar aplicación
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, inicializando aplicación...');
    initializeElements();
    initializeEventListeners();
    renderNccpcFullScale();
    showPage('welcome');
});

function initializeElements() {
    elements = {
        ageButtons: document.querySelectorAll('.age-btn'),
        pathologyButtons: document.querySelectorAll('.pathology-btn'),
        continueToMapping: document.getElementById('continue-to-mapping'),
        backToWelcome: document.getElementById('back-to-welcome'),
        continueToCharacteristics: document.getElementById('continue-to-characteristics'),
        continueToAssessment: document.getElementById('continue-to-assessment'),
        backToMapping: document.getElementById('back-to-mapping'),
        finishCharacteristics: document.getElementById('finish-characteristics'),
        backToCharacteristics: document.getElementById('back-to-characteristics'),
        
        // Elementos de mapeo corporal (ahora son divs sobre la imagen)
        bodyMapImageContainer: document.getElementById('body-map-image-container'),
        bodyRegions: document.querySelectorAll('.body-region-area'),
        regionsList: document.getElementById('regions-list'),
        removeMarkers: document.querySelectorAll('.remove-marker'),
        
        // Elementos de características
        characteristicItems: document.querySelectorAll('.characteristic-item'),
        painSelectorButtons: document.getElementById('pain-selector-buttons'),
        
        // Elementos de evaluación
        assessmentSelectorButtons: document.getElementById('assessment-selector-buttons'),
        nextPainAssessment: document.getElementById('next-pain-assessment'),
        completeAssessment: document.getElementById('complete-assessment'),
        nrsSlider: document.getElementById('nrs-slider'),
        nrsValue: document.getElementById('nrs-value'),
        fpsSlider: document.getElementById('fps-slider'),
        fpsValue: document.getElementById('fps-value'),
        faceIndicator: document.getElementById('face-indicator'),
        
        // Elementos de resultados
        locationsSummary: document.getElementById('locations-summary'),
        painTypesSummary: document.getElementById('pain-types-summary'),
        generateReport: document.getElementById('generate-report'),
        newAssessment: document.getElementById('new-assessment'),
        learnMore: document.getElementById('learn-more'),
        
        // Modales
        medicalReportModal: document.getElementById('medical-report-modal'),
        educationalModal: document.getElementById('educational-modal'),
        closeReportModal: document.getElementById('close-report-modal'),
        closeModal: document.getElementById('close-modal'),
        printReport: document.getElementById('print-report'),
        saveReport: document.getElementById('save-report'),
        
        // Pasos y contenido
        pathologyStep: document.getElementById('pathology-step'),
        scaleName: document.getElementById('scale-name'),
        scaleDescription: document.getElementById('scale-description')
    };
    
    console.log('Elementos inicializados');
}

function initializeEventListeners() {
    // Selección de edad
    if (elements.ageButtons) {
        elements.ageButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                selectAge(btn.dataset.age);
            });
        });
    }

    // Selección de patología
    if (elements.pathologyButtons) {
        elements.pathologyButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                selectPathology(btn.dataset.pathology);
            });
        });
    }

    // Navegación entre páginas
    if (elements.continueToMapping) {
        elements.continueToMapping.addEventListener('click', (e) => {
            e.preventDefault();
            showPage('body-mapping');
        });
    }

    if (elements.backToWelcome) {
        elements.backToWelcome.addEventListener('click', (e) => {
            e.preventDefault();
            showPage('welcome');
        });
    }

    if (elements.continueToCharacteristics) {
        elements.continueToCharacteristics.addEventListener('click', (e) => {
            e.preventDefault();
            showPage('pain-characteristics');
        });
    }

    if (elements.continueToAssessment) {
        elements.continueToAssessment.addEventListener('click', (e) => {
            e.preventDefault();
            setupAssessmentPage();
            showPage('assessment');
        });
    }

    if (elements.backToMapping) {
        elements.backToMapping.addEventListener('click', (e) => {
            e.preventDefault();
            showPage('body-mapping');
        });
    }

    if (elements.finishCharacteristics) {
        elements.finishCharacteristics.addEventListener('click', (e) => {
            e.preventDefault();
            setupAssessmentPage();
            showPage('assessment');
        });
    }

    if (elements.backToCharacteristics) {
        elements.backToCharacteristics.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentAssessment.pathology === 'other') {
                showPage('pain-characteristics');
            } else {
                showPage('body-mapping');
            }
        });
    }

    // Regiones del cuerpo (divs sobre imagen)
    if (elements.bodyRegions) {
        elements.bodyRegions.forEach(region => {
            region.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleBodyRegion(region);
            });
        });
    }

    // Características del dolor
    if (elements.characteristicItems) {
        elements.characteristicItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                toggleCharacteristic(item);
            });
        });
    }

    // Remover marcadores
    if (elements.removeMarkers) {
        elements.removeMarkers.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                removePainLocation(parseInt(btn.dataset.pain));
            });
        });
    }

    // Evaluación
    if (elements.nextPainAssessment) {
        elements.nextPainAssessment.addEventListener('click', (e) => {
            e.preventDefault();
            nextPainAssessment();
        });
    }

    if (elements.completeAssessment) {
        elements.completeAssessment.addEventListener('click', (e) => {
            e.preventDefault();
            completeAllAssessments();
        });
    }

    // Slider NRS
    if (elements.nrsSlider && elements.nrsValue) {
        elements.nrsSlider.addEventListener('input', updateNRSValue);
    }

    // Slider FPS-R (caras)
    if (elements.fpsSlider) {
        elements.fpsSlider.addEventListener('input', updateFPSValue);
    }

    // Cambios en radio buttons
    document.addEventListener('change', handleScoreChange);

    // Resultados y reportes
    if (elements.generateReport) {
        elements.generateReport.addEventListener('click', (e) => {
            e.preventDefault();
            generateMedicalReport();
        });
    }

    if (elements.newAssessment) {
        elements.newAssessment.addEventListener('click', (e) => {
            e.preventDefault();
            resetAssessment();
        });
    }

    if (elements.learnMore) {
        elements.learnMore.addEventListener('click', (e) => {
            e.preventDefault();
            showEducationalModal();
        });
    }

    // Modales
    if (elements.closeReportModal) {
        elements.closeReportModal.addEventListener('click', (e) => {
            e.preventDefault();
            hideModal('medical-report');
        });
    }

    if (elements.closeModal) {
        elements.closeModal.addEventListener('click', (e) => {
            e.preventDefault();
            hideModal('educational');
        });
    }

    if (elements.printReport) {
        elements.printReport.addEventListener('click', (e) => {
            e.preventDefault();
            printReport();
        });
    }

    if (elements.saveReport) {
        elements.saveReport.addEventListener('click', (e) => {
            e.preventDefault();
            saveReport();
        });
    }

    // Cerrar modales al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.add('hidden');
        }
    });

    console.log('Event listeners inicializados');
}

// Renderizar la escala NCCPC-R completa dinámicamente
function renderNccpcFullScale() {
    const container = document.getElementById('nccpc-full-items');
    if (!container) return;

    container.innerHTML = '';

    nccpcFullDefinition.forEach(category => {
        const catDiv = document.createElement('div');
        catDiv.className = 'nccpc-category';

        let catHTML = `<h4>${category.title}</h4><div class="nccpc-items">`;

        category.items.forEach(item => {
            catHTML += `
                <div class="nccpc-item">
                    <span class="nccpc-item-text">${item.text}</span>
                    <div class="nccpc-rating">
                        <label><input type="radio" name="${item.id}" value="0"> 0</label>
                        <label><input type="radio" name="${item.id}" value="1"> 1</label>
                        <label><input type="radio" name="${item.id}" value="2"> 2</label>
                        <label><input type="radio" name="${item.id}" value="3"> 3</label>
                        <label><input type="radio" name="${item.id}" value="NA"> NA</label>
                    </div>
                </div>
            `;
        });

        catHTML += '</div>';
        catDiv.innerHTML = catHTML;
        container.appendChild(catDiv);
    });
}

function selectAge(age) {
    console.log('Seleccionando edad:', age);
    currentAssessment.age = age;
    
    elements.ageButtons.forEach(btn => btn.classList.remove('selected'));
    const selectedBtn = document.querySelector(`[data-age="${age}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('selected');
    }
    
    if (elements.pathologyStep) {
        elements.pathologyStep.classList.remove('hidden');
    }
    
    updateContinueButton();
}

function selectPathology(pathology) {
    console.log('Seleccionando patología:', pathology);
    currentAssessment.pathology = pathology;
    
    elements.pathologyButtons.forEach(btn => btn.classList.remove('selected'));
    const selectedBtn = document.querySelector(`[data-pathology="${pathology}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('selected');
    }
    
    updateContinueButton();
}

function updateContinueButton() {
    if (currentAssessment.age && currentAssessment.pathology && elements.continueToMapping) {
        elements.continueToMapping.classList.remove('hidden');
    }
}

function toggleBodyRegion(region) {
    const regionId = region.dataset.region;
    const regionName = region.dataset.name;
    
    if (region.classList.contains('marked')) {
        const painIndex = getPainIndexForRegion(regionId);
        if (painIndex !== -1) {
            removePainLocation(painIndex + 1);
        }
    } else {
        if (currentAssessment.painLocations.length < 4) {
            addPainLocation(regionId, regionName);
        } else {
            alert('Máximo 4 localizaciones de dolor permitidas.');
        }
    }
}

function addPainLocation(regionId, regionName) {
    const painIndex = currentAssessment.painLocations.length;
    const painColor = painColors[painIndex];
    
    currentAssessment.painLocations.push({
        id: regionId,
        name: regionName,
        colorId: painColor.id,
        color: painColor.color
    });
    
    // Marcar región en el mapa
    const region = document.querySelector(`.body-region-area[data-region="${regionId}"]`);
    if (region) {
        region.classList.add('marked', `pain-${painColor.id}`);
    }
    
    // Activar marcador en la UI
    const markerInfo = document.querySelector(`.marker-info[data-pain="${painColor.id}"]`);
    if (markerInfo) {
        markerInfo.classList.add('active');
    }
    
    updateRegionsList();
    updateNavigationButtons();
}

function removePainLocation(painId) {
    const painIndex = currentAssessment.painLocations.findIndex(p => p.colorId === painId);
    if (painIndex !== -1) {
        const location = currentAssessment.painLocations[painIndex];
        
        // Remover marcador del mapa
        const region = document.querySelector(`.body-region-area[data-region="${location.id}"]`);
        if (region) {
            region.classList.remove('marked', `pain-${painId}`);
        }
        
        // Desactivar marcador en la UI
        const markerInfo = document.querySelector(`.marker-info[data-pain="${painId}"]`);
        if (markerInfo) {
            markerInfo.classList.remove('active');
        }
        
        // Remover de los datos
        currentAssessment.painLocations.splice(painIndex, 1);
        delete currentAssessment.painCharacteristics[painId];
        delete currentAssessment.painScores[painId];
        delete currentAssessment.painTypes[painId];
        
        // Reorganizar colores
        reorganizePainLocations();
        updateRegionsList();
        updateNavigationButtons();
    }
}

function reorganizePainLocations() {
    currentAssessment.painLocations.forEach((location, index) => {
        const newColorId = index + 1;
        const newColor = painColors[index];
        
        if (location.colorId !== newColorId) {
            const region = document.querySelector(`.body-region-area[data-region="${location.id}"]`);
            if (region) {
                region.classList.remove(`pain-${location.colorId}`);
                region.classList.add(`pain-${newColorId}`);
            }
            
            if (currentAssessment.painCharacteristics[location.colorId]) {
                currentAssessment.painCharacteristics[newColorId] = currentAssessment.painCharacteristics[location.colorId];
                delete currentAssessment.painCharacteristics[location.colorId];
            }
            
            if (currentAssessment.painScores[location.colorId]) {
                currentAssessment.painScores[newColorId] = currentAssessment.painScores[location.colorId];
                delete currentAssessment.painScores[location.colorId];
            }
            
            if (currentAssessment.painTypes[location.colorId]) {
                currentAssessment.painTypes[newColorId] = currentAssessment.painTypes[location.colorId];
                delete currentAssessment.painTypes[location.colorId];
            }
            
            location.colorId = newColorId;
            location.color = newColor.color;
        }
    });
    
    document.querySelectorAll('.marker-info').forEach((marker, index) => {
        if (index < currentAssessment.painLocations.length) {
            marker.classList.add('active');
        } else {
            marker.classList.remove('active');
        }
    });
}

function getPainIndexForRegion(regionId) {
    return currentAssessment.painLocations.findIndex(p => p.id === regionId);
}

function updateRegionsList() {
    if (!elements.regionsList) return;
    
    elements.regionsList.innerHTML = '';
    
    currentAssessment.painLocations.forEach(location => {
        const item = document.createElement('div');
        item.className = 'region-item';
        item.innerHTML = `
            <div class="marker-color" style="background-color: ${location.color};"></div>
            <span>${location.name}</span>
        `;
        elements.regionsList.appendChild(item);
    });
}

function updateNavigationButtons() {
    const hasLocations = currentAssessment.painLocations.length > 0;
    
    if (currentAssessment.pathology === 'other') {
        if (elements.continueToCharacteristics) {
            elements.continueToCharacteristics.classList.toggle('hidden', !hasLocations);
        }
        if (elements.continueToAssessment) {
            elements.continueToAssessment.classList.add('hidden');
        }
    } else {
        if (elements.continueToAssessment) {
            elements.continueToAssessment.classList.toggle('hidden', !hasLocations);
        }
        if (elements.continueToCharacteristics) {
            elements.continueToCharacteristics.classList.add('hidden');
        }
    }
}

function setupPainCharacteristics() {
    if (!elements.painSelectorButtons) return;
    
    elements.painSelectorButtons.innerHTML = '';
    
    currentAssessment.painLocations.forEach((location, index) => {
        const btn = document.createElement('button');
        btn.className = 'pain-selector-btn';
        btn.dataset.painId = location.colorId;
        btn.innerHTML = `
            <div class="marker-color" style="background-color: ${location.color};"></div>
            <span>${location.name}</span>
        `;
        
        if (index === currentAssessment.currentPainIndex) {
            btn.classList.add('active');
        }
        
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            selectPainForCharacteristics(index);
        });
        
        elements.painSelectorButtons.appendChild(btn);
    });
}

function selectPainForCharacteristics(painIndex) {
    currentAssessment.currentPainIndex = painIndex;
    
    document.querySelectorAll('.pain-selector-btn').forEach((btn, index) => {
        btn.classList.toggle('active', index === painIndex);
    });
    
    showCharacteristicsForCurrentPain();
}

function showCharacteristicsForCurrentPain() {
    const currentLocation = currentAssessment.painLocations[currentAssessment.currentPainIndex];
    const painId = currentLocation.colorId;
    const selectedChars = currentAssessment.painCharacteristics[painId] || [];
    
    elements.characteristicItems.forEach(item => {
        const charId = item.dataset.char;
        item.classList.toggle('selected', selectedChars.includes(charId));
    });
}

function toggleCharacteristic(item) {
    const charId = item.dataset.char;
    const currentLocation = currentAssessment.painLocations[currentAssessment.currentPainIndex];
    const painId = currentLocation.colorId;
    
    if (!currentAssessment.painCharacteristics[painId]) {
        currentAssessment.painCharacteristics[painId] = [];
    }
    
    const characteristics = currentAssessment.painCharacteristics[painId];
    const index = characteristics.indexOf(charId);
    
    if (index > -1) {
        characteristics.splice(index, 1);
        item.classList.remove('selected');
    } else {
        characteristics.push(charId);
        item.classList.add('selected');
    }
    
    classifyPainType(painId);
}

function classifyPainType(painId) {
    const characteristics = currentAssessment.painCharacteristics[painId] || [];
    let painType = 'mixto';
    
    const neuropaticChars = characteristics.filter(c => 
        ['electrico', 'hormigueo', 'quemazon'].includes(c)
    ).length;
    
    const somaticoChars = characteristics.filter(c => 
        ['pulsatil', 'presion', 'punzante'].includes(c)
    ).length;
    
    const visceralChars = characteristics.filter(c => 
        ['sordo'].includes(c)
    ).length;
    
    if (neuropaticChars > 0 && somaticoChars === 0 && visceralChars === 0) {
        painType = 'neuropatico';
    } else if (somaticoChars > 0 && neuropaticChars === 0 && visceralChars === 0) {
        painType = 'somatico';
    } else if (visceralChars > 0 && neuropaticChars === 0 && somaticoChars === 0) {
        painType = 'visceral';
    }
    
    currentAssessment.painTypes[painId] = painType;
}

function setupAssessmentPage() {
    const scaleKey = `${currentAssessment.age}_${currentAssessment.pathology}`;
    const scales = scaleMatrix[scaleKey];
    currentAssessment.assessmentScales = scales;
    
    setupAssessmentSelectors();
    showAssessmentForCurrentPain();
}

function setupAssessmentSelectors() {
    if (!elements.assessmentSelectorButtons) return;
    
    elements.assessmentSelectorButtons.innerHTML = '';
    
    currentAssessment.painLocations.forEach((location, index) => {
        const btn = document.createElement('button');
        btn.className = 'assessment-selector-btn';
        btn.dataset.painId = location.colorId;
        btn.innerHTML = `
            <div class="marker-color" style="background-color: ${location.color};"></div>
            <span>${location.name}</span>
        `;
        
        if (index === currentAssessment.currentPainIndex) {
            btn.classList.add('active');
        }
        
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            selectPainForAssessment(index);
        });
        
        elements.assessmentSelectorButtons.appendChild(btn);
    });
}

function selectPainForAssessment(painIndex) {
    saveCurrentAssessment();
    
    currentAssessment.currentPainIndex = painIndex;
    
    document.querySelectorAll('.assessment-selector-btn').forEach((btn, index) => {
        btn.classList.toggle('active', index === painIndex);
    });
    
    showAssessmentForCurrentPain();
}

function showAssessmentForCurrentPain() {
    const scales = currentAssessment.assessmentScales;
    const primaryScale = scales[0];
    
    if (elements.scaleName) {
        elements.scaleName.textContent = painScales[primaryScale].name;
    }
    if (elements.scaleDescription) {
        elements.scaleDescription.textContent = painScales[primaryScale].description;
    }
    
    // Ocultar todas las escalas
    document.querySelectorAll('.assessment-scale').forEach(el => el.classList.add('hidden'));
    
    // Mostrar escala apropiada
    let scaleElementId;
    if (primaryScale === 'nccpc_full') {
        scaleElementId = 'nccpc-full-scale';
    } else {
        scaleElementId = `${primaryScale.replace('_', '-')}-scale`;
    }
    
    const scaleElement = document.getElementById(scaleElementId);
    if (scaleElement) {
        scaleElement.classList.remove('hidden');
    }
    
    // Restaurar valores previos si existen
    restoreAssessmentValues();
    
    updateAssessmentButtons();
}

function saveCurrentAssessment() {
    const currentLocation = currentAssessment.painLocations[currentAssessment.currentPainIndex];
    if (!currentLocation) return;
    
    const painId = currentLocation.colorId;
    const scales = currentAssessment.assessmentScales;
    const primaryScale = scales[0];
    
    let score = 0;
    
    if (primaryScale === 'flacc') {
        const categories = ['face', 'legs', 'activity', 'cry', 'consolability'];
        score = categories.reduce((sum, cat) => {
            const input = document.querySelector(`input[name="${cat}"]:checked`);
            return sum + (input ? parseInt(input.value) : 0);
        }, 0);
    } else if (primaryScale === 'fps_r') {
        score = elements.fpsSlider ? parseInt(elements.fpsSlider.value) : 0;
    } else if (primaryScale === 'nrs') {
        score = elements.nrsSlider ? parseInt(elements.nrsSlider.value) : 0;
    } else if (primaryScale === 'nccpc_full') {
        const allIds = getAllNccpcItemIds();
        score = allIds.reduce((sum, itemId) => {
            const input = document.querySelector(`input[name="${itemId}"]:checked`);
            if (input && input.value !== 'NA') {
                return sum + parseInt(input.value);
            }
            return sum;
        }, 0);
    }
    
    currentAssessment.painScores[painId] = {
        scale: primaryScale,
        score: score,
        maxScore: painScales[primaryScale].maxScore
    };
}

function restoreAssessmentValues() {
    const currentLocation = currentAssessment.painLocations[currentAssessment.currentPainIndex];
    if (!currentLocation) return;
    
    const painId = currentLocation.colorId;
    const savedScore = currentAssessment.painScores[painId];
    
    if (!savedScore) return;
    
    if (savedScore.scale === 'nrs' && elements.nrsSlider && elements.nrsValue) {
        elements.nrsSlider.value = savedScore.score;
        elements.nrsValue.textContent = savedScore.score;
    }
    if (savedScore.scale === 'fps_r' && elements.fpsSlider && elements.fpsValue) {
        elements.fpsSlider.value = savedScore.score;
        elements.fpsValue.textContent = savedScore.score;
        updateFaceIndicator(savedScore.score);
    }
}

function updateAssessmentButtons() {
    const isLastPain = currentAssessment.currentPainIndex === currentAssessment.painLocations.length - 1;
    
    if (elements.nextPainAssessment) {
        elements.nextPainAssessment.classList.toggle('hidden', isLastPain);
    }
    
    if (elements.completeAssessment) {
        elements.completeAssessment.classList.toggle('hidden', !isLastPain);
    }
}

function nextPainAssessment() {
    saveCurrentAssessment();
    
    if (currentAssessment.currentPainIndex < currentAssessment.painLocations.length - 1) {
        selectPainForAssessment(currentAssessment.currentPainIndex + 1);
    }
}

function completeAllAssessments() {
    saveCurrentAssessment();
    showResults();
    showPage('results');
}

function updateNRSValue() {
    const value = elements.nrsSlider.value;
    if (elements.nrsValue) {
        elements.nrsValue.textContent = value;
    }
}

function updateFPSValue() {
    const value = elements.fpsSlider.value;
    if (elements.fpsValue) {
        elements.fpsValue.textContent = value;
    }
    updateFaceIndicator(parseInt(value));
}

function updateFaceIndicator(score) {
    if (!elements.faceIndicator) return;
    // Las 6 caras están distribuidas uniformemente en la imagen
    // score: 0, 2, 4, 6, 8, 10 -> posiciones: 0, 1, 2, 3, 4, 5
    const faceIndex = score / 2;
    const percentage = (faceIndex / 5) * 100;
    // Ajustar para centrar el indicador sobre cada cara
    const faceWidth = 100 / 6; // Cada cara ocupa ~16.67% del ancho
    const offset = faceWidth / 2;
    const position = (faceIndex * faceWidth) + offset;
    elements.faceIndicator.style.left = `${position}%`;
    elements.faceIndicator.style.display = 'block';
}

function handleScoreChange(event) {
    if (event.target.type === 'radio') {
        const categoryElement = event.target.closest('.flacc-category') || 
                              event.target.closest('.nccpc-item') || 
                              event.target.closest('.nccpc-category');
        if (categoryElement) {
            categoryElement.style.animation = 'none';
            setTimeout(() => {
                categoryElement.style.animation = 'sparkle 0.5s ease-in-out';
            }, 10);
        }
    }
}

function showResults() {
    updateLocationsSummary();
    updatePainTypesSummary();
}

function updateLocationsSummary() {
    if (!elements.locationsSummary) return;
    
    elements.locationsSummary.innerHTML = '';
    
    currentAssessment.painLocations.forEach(location => {
        const scoreData = currentAssessment.painScores[location.colorId];
        const painType = currentAssessment.painTypes[location.colorId] || 'no clasificado';
        
        const item = document.createElement('div');
        item.className = 'location-result';
        item.innerHTML = `
            <div class="location-info">
                <div class="marker-color" style="background-color: ${location.color};"></div>
                <span><strong>${location.name}</strong></span>
            </div>
            <div class="location-scores">
                <span class="pain-score">${scoreData ? scoreData.score : 0}/${scoreData ? scoreData.maxScore : 10}</span>
                <span class="pain-type ${painType}">${getPainTypeLabel(painType)}</span>
            </div>
        `;
        elements.locationsSummary.appendChild(item);
    });
}

function updatePainTypesSummary() {
    if (!elements.painTypesSummary) return;
    
    const typeCounts = {
        somatico: 0,
        visceral: 0,
        neuropatico: 0,
        mixto: 0,
        'no clasificado': 0
    };
    
    Object.values(currentAssessment.painTypes).forEach(type => {
        typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    
    elements.painTypesSummary.innerHTML = '';
    
    Object.entries(typeCounts).forEach(([type, count]) => {
        if (count > 0) {
            const item = document.createElement('div');
            item.className = `pain-type-summary ${type}`;
            item.innerHTML = `
                <span class="pain-type ${type}">${getPainTypeLabel(type)}</span>
                <span class="count">${count} localización${count > 1 ? 'es' : ''}</span>
            `;
            elements.painTypesSummary.appendChild(item);
        }
    });
}

function getPainTypeLabel(type) {
    const labels = {
        'somatico': 'Somático',
        'visceral': 'Visceral',
        'neuropatico': 'Neuropático',
        'mixto': 'Mixto',
        'no clasificado': 'No Clasificado'
    };
    return labels[type] || type;
}

function generateMedicalReport() {
    const reportContent = document.getElementById('medical-report-content');
    if (!reportContent) return;
    
    const currentDate = new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const scaleKey = `${currentAssessment.age}_${currentAssessment.pathology}`;
    const scales = scaleMatrix[scaleKey];
    
    let reportHTML = `
        <div class="report-section">
            <h4>Información del Paciente</h4>
            <table class="report-table">
                <tr><td><strong>Fecha de Evaluación:</strong></td><td>${currentDate}</td></tr>
                <tr><td><strong>Rango de Edad:</strong></td><td>${currentAssessment.age} años</td></tr>
                <tr><td><strong>Tipo de Patología:</strong></td><td>${currentAssessment.pathology === 'neurological' ? 'Trastorno neurológico con dificultades de comunicación' : 'Otras patologías sin dificultades de comunicación'}</td></tr>
                <tr><td><strong>Escalas Utilizadas:</strong></td><td>${scales.map(s => painScales[s].name).join(', ')}</td></tr>
            </table>
        </div>

        <div class="report-section">
            <h4>Localizaciones del Dolor</h4>
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Localización</th>
                        <th>Puntuación</th>
                        <th>Interpretación</th>
                        <th>Tipo de Dolor</th>
                        <th>Características</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    currentAssessment.painLocations.forEach(location => {
        const scoreData = currentAssessment.painScores[location.colorId];
        const painType = currentAssessment.painTypes[location.colorId] || 'No clasificado';
        const characteristics = currentAssessment.painCharacteristics[location.colorId] || [];
        const interpretation = getPainInterpretation(scoreData ? scoreData.score : 0, scoreData ? scoreData.scale : 'nrs');
        
        reportHTML += `
            <tr>
                <td>${location.name}</td>
                <td>${scoreData ? scoreData.score : 0}/${scoreData ? scoreData.maxScore : 10}</td>
                <td>${interpretation}</td>
                <td>${getPainTypeLabel(painType)}</td>
                <td>${characteristics.map(c => painCharacteristics.find(pc => pc.id === c)?.name || c).join(', ') || 'No especificadas'}</td>
            </tr>
        `;
    });
    
    reportHTML += `
                </tbody>
            </table>
        </div>

        <div class="report-section">
            <h4>Interpretación Clínica</h4>
            <p>Se ha realizado una evaluación integral del dolor utilizando herramientas validadas apropiadas para la edad y capacidad de comunicación del paciente.</p>
            
            <h5>Resumen de Hallazgos:</h5>
            <ul>
                <li><strong>Número total de localizaciones evaluadas:</strong> ${currentAssessment.painLocations.length}</li>
                <li><strong>Escalas aplicadas:</strong> ${scales.map(s => painScales[s].name).join(', ')}</li>
                <li><strong>Tipos de dolor identificados:</strong> ${[...new Set(Object.values(currentAssessment.painTypes))].map(t => getPainTypeLabel(t)).join(', ')}</li>
            </ul>
        </div>

        <div class="report-section">
            <h4>Recomendaciones</h4>
            <ul>
                <li>Continuar monitoreo regular del dolor utilizando las escalas apropiadas</li>
                <li>Considerar evaluación multidisciplinaria si el dolor persiste o empeora</li>
                <li>Implementar estrategias de manejo del dolor basadas en la evidencia</li>
                <li>Reevaluar en intervalos regulares para ajustar el plan de tratamiento</li>
                <li>Documentar respuesta a intervenciones terapéuticas</li>
            </ul>
        </div>

        <div class="report-section">
            <h4>Observaciones</h4>
            <p>Esta evaluación debe ser interpretada por personal médico calificado en el contexto clínico completo del paciente. Se recomienda correlacionar con otros hallazgos clínicos y considerar factores adicionales que puedan influir en la experiencia del dolor.</p>
        </div>
    `;
    
    reportContent.innerHTML = reportHTML;
    showModal('medical-report');
}

function getPainInterpretation(score, scale) {
    if (scale === 'flacc') {
        if (score === 0) return "Sin dolor detectado";
        if (score <= 3) return "Dolor leve";
        if (score <= 6) return "Dolor moderado";
        return "Dolor severo";
    } else if (scale === 'fps_r' || scale === 'nrs') {
        if (score === 0) return "Sin dolor";
        if (score <= 3) return "Dolor leve";
        if (score <= 6) return "Dolor moderado";
        return "Dolor severo";
    } else if (scale === 'nccpc_full') {
        if (score < 7) return "Sin dolor significativo";
        if (score < 11) return "Dolor leve";
        if (score < 20) return "Dolor moderado";
        return "Dolor severo";
    }
    
    return "Evaluación completada";
}

function showEducationalModal() {
    const scaleExplanation = document.getElementById('scale-explanation');
    if (scaleExplanation && currentAssessment.assessmentScales) {
        const scales = currentAssessment.assessmentScales;
        const explanations = scales.map(scale => {
            const scaleInfo = painScales[scale];
            return `<p><strong>${scaleInfo.name}:</strong> ${scaleInfo.description}</p>`;
        }).join('');
        
        scaleExplanation.innerHTML = explanations;
    }
    
    showModal('educational');
}

function showModal(type) {
    const modalId = type === 'medical-report' ? 'medical-report-modal' : 'educational-modal';
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function hideModal(type) {
    const modalId = type === 'medical-report' ? 'medical-report-modal' : 'educational-modal';
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
}

function printReport() {
    window.print();
}

function saveReport() {
    const reportContent = document.getElementById('medical-report-content');
    if (!reportContent) return;
    
    const reportText = reportContent.innerText;
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `informe_dolor_pediatrico_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function resetAssessment() {
    currentAssessment = {
        age: null,
        pathology: null,
        painLocations: [],
        painCharacteristics: {},
        assessmentScales: {},
        painScores: {},
        painTypes: {},
        currentPainIndex: 0
    };
    
    // Resetear UI - solo resetear las clases específicas de selección
    document.querySelectorAll('.age-btn.selected, .pathology-btn.selected').forEach(el => el.classList.remove('selected'));
    document.querySelectorAll('.characteristic-item.selected').forEach(el => el.classList.remove('selected'));
    document.querySelectorAll('.body-region-area.marked').forEach(el => {
        el.classList.remove('marked');
        painColors.forEach(color => el.classList.remove(`pain-${color.id}`));
    });
    document.querySelectorAll('.marker-info.active').forEach(el => el.classList.remove('active'));
    
    // Ocultar elementos
    if (elements.pathologyStep) elements.pathologyStep.classList.add('hidden');
    if (elements.continueToMapping) elements.continueToMapping.classList.add('hidden');
    if (elements.continueToCharacteristics) elements.continueToCharacteristics.classList.add('hidden');
    if (elements.continueToAssessment) elements.continueToAssessment.classList.add('hidden');
    
    // Resetear formularios
    document.querySelectorAll('input[type="radio"]').forEach(input => input.checked = false);
    if (elements.nrsSlider) elements.nrsSlider.value = 0;
    if (elements.nrsValue) elements.nrsValue.textContent = '0';
    if (elements.fpsSlider) elements.fpsSlider.value = 0;
    if (elements.fpsValue) elements.fpsValue.textContent = '0';
    if (elements.faceIndicator) elements.faceIndicator.style.display = 'none';
    
    // Limpiar listas
    if (elements.regionsList) elements.regionsList.innerHTML = '';
    if (elements.painSelectorButtons) elements.painSelectorButtons.innerHTML = '';
    if (elements.assessmentSelectorButtons) elements.assessmentSelectorButtons.innerHTML = '';
    
    showPage('welcome');
}

function showPage(pageName) {
    console.log('Mostrando página:', pageName);
    
    const pages = {
        'welcome': document.getElementById('welcome-page'),
        'body-mapping': document.getElementById('body-mapping-page'),
        'pain-characteristics': document.getElementById('pain-characteristics-page'),
        'assessment': document.getElementById('assessment-page'),
        'results': document.getElementById('results-page')
    };
    
    Object.values(pages).forEach(page => {
        if (page) page.classList.remove('active');
    });
    
    if (pages[pageName]) {
        pages[pageName].classList.add('active');
        
        // Configurar página específica
        if (pageName === 'pain-characteristics') {
            setupPainCharacteristics();
        } else if (pageName === 'assessment') {
            setupAssessmentPage();
        }
    }
    
    window.scrollTo(0, 0);
}

// Soporte de teclado
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        document.querySelectorAll('.modal:not(.hidden)').forEach(modal => {
            modal.classList.add('hidden');
        });
    }
});

console.log('Aplicación de evaluación del dolor pediátrico cargada');