# Guide de Migration Frontend - Suppression Transcription

## Vue d'ensemble

La fonctionnalité de transcription et résumé a été supprimée du backend. Le frontend React doit être mis à jour pour refléter ces changements.

---

## Changements d'API

### EndPoints Supprimés

```javascript
// ❌ CES ENDPOINTS N'EXISTENT PLUS

// Récupérer l'historique de transcription
GET /api/recordings/{id}/transcription_history/

// Accéder au transcript
GET /api/recordings/{id}/ 
  // Le champ 'transcript' n'existe plus
  // Le champ 'summary' n'existe plus
```

### EndPoints Conservés

```javascript
// ✓ CES ENDPOINTS RESTENT VALIDES

// Enregistrements
GET    /api/recordings/
POST   /api/recordings/
GET    /api/recordings/{id}/
PUT    /api/recordings/{id}/
PATCH  /api/recordings/{id}/
DELETE /api/recordings/{id}/

// Actions sur enregistrements
GET    /api/recordings/{id}/download/
POST   /api/recordings/{id}/trim/
POST   /api/recordings/{id}/process/  // Traitement VAD seulement
GET    /api/recordings/stats/

// Paramètres utilisateur
GET    /api/settings/
POST   /api/settings/
PATCH  /api/settings/
```

---

## Réponses API - Avant/Après

### Recording Object

#### ❌ AVANT
```json
{
  "id": 123,
  "title": "Interview",
  "type": "reunion",
  "file": "...",
  "duration_seconds": 3600,
  "transcript": "Bonjour, comment...",
  "summary": "L'utilisateur a discuté de...",
  "vad_report": { ... },
  "flagged": false,
  "created_at": "2025-12-05T10:30:00Z"
}
```

#### ✓ APRÈS
```json
{
  "id": 123,
  "title": "Interview",
  "type": "reunion",
  "file": "...",
  "duration_seconds": 3600,
  "vad_report": { ... },
  "vad_summary": {
    "total_silence_seconds": 120,
    "silence_percentage": 15.5,
    "unnatural_silences": [ ... ]
  },
  "flagged": false,
  "created_at": "2025-12-05T10:30:00Z"
}
```

### UserSettings Object

#### ❌ AVANT
```json
{
  "id": 1,
  "retention_days": 30,
  "vad_sensitivity": 2,
  "silence_threshold_seconds": 5.0,
  "email_alerts_enabled": true,
  "transcription_enabled": true,
  "summary_enabled": true,
  "summary_detail_level": "medium",
  "updated_at": "2025-12-05T10:30:00Z"
}
```

#### ✓ APRÈS
```json
{
  "id": 1,
  "retention_days": 30,
  "vad_sensitivity": 2,
  "silence_threshold_seconds": 5.0,
  "email_alerts_enabled": true,
  "updated_at": "2025-12-05T10:30:00Z"
}
```

---

## Mises à Jour Frontend Requises

### 1. Composants à Supprimer

```javascript
// ❌ À SUPPRIMER

// Pages
- pages/TranscriptionHistory.jsx
- pages/TranscriptViewer.jsx
- pages/SummaryViewer.jsx

// Composants
- components/TranscriptionLoading.jsx
- components/TranscriptDisplay.jsx
- components/SummaryDisplay.jsx

// Modales
- modals/TranscriptionModal.jsx
- modals/SummaryModal.jsx

// Hooks
- hooks/useTranscription.js
- hooks/useSummary.js
```

### 2. Formulaires à Mettre à Jour

#### Paramètres Utilisateur
```javascript
// ❌ À SUPPRIMER du formulaire Settings

const formFields = {
  retention_days: 30,
  vad_sensitivity: 2,
  silence_threshold_seconds: 5.0,
  email_alerts_enabled: true,
  // ❌ SUPPRIMER CES CHAMPS:
  // transcription_enabled: true,
  // summary_enabled: true,
  // summary_detail_level: 'medium',
};
```

### 3. Dashboard à Mettre à Jour

```javascript
// ❌ À SUPPRIMER

// Colonne tableau
- transcript
- summary
- transcription_status

// Détails enregistrement
- Modal "Voir la transcription"
- Button "Afficher le résumé"
- Stats transcription

// ✓ À GARDER

- Title
- Type
- Duration
- Created date
- VAD report
- Silence detection
- Flagged status
- Download button
- Trim button
```

### 4. Types TypeScript/PropTypes

```typescript
// ❌ À SUPPRIMER

interface RecordingResponse {
  id: number;
  title: string;
  type: 'antenne' | 'emission' | 'reunion';
  file: string;
  duration_seconds: number;
  transcript?: string;        // ❌ SUPPRIMER
  summary?: string;            // ❌ SUPPRIMER
  vad_report: VadReport;
  vad_summary: VadSummary;
  flagged: boolean;
  created_at: string;
}

interface UserSettings {
  id: number;
  retention_days: number;
  vad_sensitivity: number;
  silence_threshold_seconds: number;
  email_alerts_enabled: boolean;
  transcription_enabled?: boolean;    // ❌ SUPPRIMER
  summary_enabled?: boolean;           // ❌ SUPPRIMER
  summary_detail_level?: 'brief' | 'medium' | 'detailed'; // ❌ SUPPRIMER
}

// ✓ VERSION CORRIGÉE

interface RecordingResponse {
  id: number;
  title: string;
  type: 'antenne' | 'emission' | 'reunion';
  file: string;
  duration_seconds: number;
  vad_report: VadReport;
  vad_summary: VadSummary;
  flagged: boolean;
  created_at: string;
}

interface UserSettings {
  id: number;
  retention_days: number;
  vad_sensitivity: number;
  silence_threshold_seconds: number;
  email_alerts_enabled: boolean;
}
```

### 5. Services API

```javascript
// ❌ À SUPPRIMER

export const getTranscriptionHistory = (recordingId) => {
  return fetch(`/api/recordings/${recordingId}/transcription_history/`)
    .then(res => res.json());
}

// ✓ À GARDER

export const getRecording = (id) => {
  return fetch(`/api/recordings/${id}/`)
    .then(res => res.json());
}

export const downloadRecording = (id) => {
  return fetch(`/api/recordings/${id}/download/`)
    .then(res => res.blob());
}

export const trimRecording = (id, startTime, endTime) => {
  return fetch(`/api/recordings/${id}/trim/`, {
    method: 'POST',
    body: JSON.stringify({ start_time: startTime, end_time: endTime })
  }).then(res => res.json());
}
```

### 6. State Management (Redux/Context)

```javascript
// ❌ À SUPPRIMER

const recordingSlice = createSlice({
  name: 'recordings',
  initialState: {
    items: [],
    loading: false,
    transcript: null,           // ❌ SUPPRIMER
    summary: null,              // ❌ SUPPRIMER
    transcriptionLoading: false // ❌ SUPPRIMER
  },
  // ... reducers
});

// ✓ VERSION SIMPLIFIÉE

const recordingSlice = createSlice({
  name: 'recordings',
  initialState: {
    items: [],
    loading: false,
    // Les autres états de transcription sont supprimés
  },
  // ... reducers
});
```

---

## Plan de Migration Par Étapes

### Phase 1: Préparation (1 jour)
- [ ] Audit du codebase React pour identifier toutes les références
- [ ] Créer une branche feature/remove-transcription
- [ ] Sauvegarder les composants supprimés (archive)

### Phase 2: Suppression Composants (1 jour)
- [ ] Supprimer les composants inutiles
- [ ] Supprimer les pages de transcription
- [ ] Supprimer les services API de transcription
- [ ] Mettre à jour les routes si nécessaire

### Phase 3: Mise à Jour Types (0.5 jour)
- [ ] Mettre à jour les interfaces TypeScript
- [ ] Mettre à jour les PropTypes
- [ ] Vérifier les erreurs de type

### Phase 4: Mise à Jour Formulaires (1 jour)
- [ ] Formulaire Settings: supprimer les champs de transcription
- [ ] Dashboard: retirer les colonnes de transcription
- [ ] Modal détails: adapter l'affichage

### Phase 5: Tests (1 jour)
- [ ] Tester les appels API
- [ ] Vérifier le rendu des pages
- [ ] Tester les paramètres utilisateur
- [ ] Tester le dashboard

### Phase 6: Déploiement (0.5 jour)
- [ ] Merge de la branche
- [ ] Build de production
- [ ] Déploiement

---

## Script de Recherche et Remplacement

Utiliser pour trouver les références à supprimer:

```bash
# Trouver les imports de transcription
grep -r "transcribe\|Transcription\|transcript\|summary" src/

# Trouver les appels API
grep -r "transcription_history\|transcript\|summary" src/

# Compter les références
grep -r "transcript\|Transcription" src/ | wc -l
```

---

## Points de Vigilance

### ⚠️ Attention

1. **VAD Report est conservé**
   - Les données VAD sont toujours disponibles dans `vad_report`
   - Les alertes de silence restent fonctionnelles
   - Ne pas supprimer l'affichage du rapport VAD

2. **Appels API parallèles**
   - Vérifier les appels qui attendaient transcript/summary
   - Adapter les dépendances entre composants

3. **Stockage Local (localStorage)**
   - Nettoyer les données de transcription stockées
   - Vérifier le localStorage pour les restes

4. **Tests**
   - Exécuter les tests unitaires après chaque phase
   - Vérifier les tests d'intégration

---

## Exemple: Migration d'une Page

### ❌ AVANT
```jsx
function RecordingDetail({ id }) {
  const [recording, setRecording] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    getRecording(id).then(setRecording);
    getTranscriptionHistory(id).then(data => {
      if (data[0]) {
        setTranscript(data[0].transcript_text);
        setSummary(data[0].summary_text);
      }
    });
  }, [id]);

  return (
    <div>
      <h1>{recording?.title}</h1>
      <TranscriptDisplay text={transcript} />
      <SummaryDisplay text={summary} />
      <VadReport report={recording?.vad_report} />
    </div>
  );
}
```

### ✓ APRÈS
```jsx
function RecordingDetail({ id }) {
  const [recording, setRecording] = useState(null);

  useEffect(() => {
    getRecording(id).then(setRecording);
  }, [id]);

  return (
    <div>
      <h1>{recording?.title}</h1>
      <VadReport report={recording?.vad_report} />
      <VadSummary summary={recording?.vad_summary} />
    </div>
  );
}
```

---

## Ressources

- Documentation API: `/api/` ou `REFACTORING_COMPLETED.md`
- Endpoints: Voir `backend/recordings/urls.py`
- Modèles: Voir `backend/recordings/models.py`

---

**Date de Migration** : Décembre 2025
**Temps Estimé** : 3-4 jours
**Priorité** : Moyen (pas d'impact utilisateur critique)
**Status** : ✓ Prêt pour démarrer
