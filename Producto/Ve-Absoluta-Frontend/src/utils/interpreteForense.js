export const generarNarrativaPericial = (datosCrudos) => {
    const { 
        vit_prediccion = "REAL", 
        vit_confianza = 0, 
        vit_sector = "indeterminado", 
        ela_max_diff = 0, 
        sensor_variance = 0 
    } = datosCrudos || {};
    
    // Inicialización de estados
    let estadoGlobal = "INTEGRIDAD VERIFICADA";
    let colorBadge = "green";
    let dictamenNeural = "";
    let dictamenEstructural = "";
    let conclusionForense = "";

    // --- 1. BLOQUE NEURAL ---
    if (vit_prediccion === "FAKE") {
        if (vit_confianza >= 95) {
            dictamenNeural = `El modelo neuronal identifica patrones sintéticos críticos con certeza absoluta (${vit_confianza.toFixed(1)}%). Las texturas en la zona ${vit_sector} son matemáticamente incompatibles con una captura física.`;
        } else if (vit_confianza > 65) {
            dictamenNeural = `El escaneo detecta indicios moderados de alteración (${vit_confianza.toFixed(1)}%) en el sector ${vit_sector}, sugiriendo una posible manipulación superficial.`;
        } else {
            dictamenNeural = `Anomalías leves detectadas (${vit_confianza.toFixed(1)}%), pero no alcanzan el umbral forense para determinar síntesis total.`;
        }
    } else {
        dictamenNeural = `El modelo clasifica la estructura visual como natural (${vit_confianza.toFixed(1)}%), sin detectar artefactos propios de IA generativa.`;
    }

    // --- 2. BLOQUE ESTRUCTURAL ---
    const tieneHuellaFisica = sensor_variance > 60;
    const careceHuellaFisica = sensor_variance < 40;
    const tieneDegradacionSevera = ela_max_diff > 65;

    if (tieneHuellaFisica) {
        dictamenEstructural = `Análisis de hardware positivo: Se confirma presencia de ruido estático (Varianza: ${sensor_variance.toFixed(1)}).`;
    } else if (careceHuellaFisica) {
        dictamenEstructural = `Análisis de hardware negativo: Ausencia de ruido térmico (Varianza: ${sensor_variance.toFixed(1)}). Imagen plana, típica de renders.`;
    } else {
        dictamenEstructural = `Análisis de hardware moderado: Varianza: ${sensor_variance.toFixed(1)}. Compatible con cámaras modernas.`;
    }

    // --- 3. RESOLUCIÓN DE CONFLICTOS ---
    if (vit_prediccion === "FAKE") {
        if (vit_confianza >= 95) {
            conclusionForense = tieneHuellaFisica 
                ? "SÍNTESIS CON RUIDO ARTIFICIAL: La IA inyectó 'grano' para simular realismo, pero la red neuronal detecta generación total con certeza absoluta."
                : "ORIGEN SINTÉTICO: La alerta crítica de la red neuronal y la ausencia de huella óptica confirman generación algorítmica.";
            estadoGlobal = "ORIGEN SINTÉTICO";
            colorBadge = "red";
        } else if (tieneHuellaFisica) {
            conclusionForense = "ANOMALÍA LOCALIZADA: La matriz base posee huella de cámara, pero la red neuronal detecta síntesis localizada (injerto digital o Face-Swap).";
            estadoGlobal = "ANOMALÍA LOCALIZADA";
            colorBadge = "orange";
        } else {
            conclusionForense = "ORIGEN SINTÉTICO: La falta de huella óptica y la alerta de la IA confirman generación algorítmica.";
            estadoGlobal = "ORIGEN SINTÉTICO";
            colorBadge = "red";
        }
    } else if (tieneDegradacionSevera) {
        conclusionForense = `EVIDENCIA COMPRIMIDA: La imagen no presenta IA, pero tiene anomalías en su compresión (Delta ELA: ${ela_max_diff}). Esto indica transmisión repetida por redes sociales.`;
        estadoGlobal = "EVIDENCIA COMPRIMIDA";
        colorBadge = "yellow";
    } else {
        conclusionForense = "INTEGRIDAD VERIFICADA: La IA y la matemática estructural coinciden. La evidencia mantiene su pureza óptica original.";
        estadoGlobal = "INTEGRIDAD VERIFICADA";
        colorBadge = "green";
    }

    return {
        badge: { texto: estadoGlobal, color: colorBadge },
        textos: [
            { titulo: "Análisis Neuronal (ViT)", contenido: dictamenNeural },
            { titulo: "Análisis Estructural (Laplaciano/ELA)", contenido: dictamenEstructural },
            { titulo: "Conclusión Forense", contenido: conclusionForense }
        ]
    };
};