# Guide d'Installation et Configuration de la Transcription

## ✅ Implémentation Complétée

La transcription est maintenant **entièrement implémentée** avec deux options :

1. **OpenAI Whisper API** (recommandé)
2. **Whisper Local** (faster-whisper)

## Installation

### Option 1 : OpenAI Whisper API (Simple)

```bash
cd backend
pip install openai>=1.0.0
```

Puis dans votre fichier `.env` :
```env
OPENAI_API_KEY=sk-votre-cle-api-ici
```

**Avantages :**
- ✅ Installation simple
- ✅ Pas besoin de GPU
- ✅ Bonne qualité
- ✅ Rapide

**Inconvénients :**
- ❌ Nécessite une clé API (payant selon usage)
- ❌ Nécessite internet

### Option 2 : Whisper Local (Gratuit)

```bash
cd backend
pip install faster-whisper>=1.0.0
```

**Avantages :**
- ✅ Gratuit, pas de limite
- ✅ Fonctionne hors ligne
- ✅ Pas besoin de clé API

**Inconvénients :**
- ❌ Plus lent (surtout sans GPU)
- ❌ Nécessite plus de RAM/CPU
- ❌ Premier téléchargement du modèle peut être long

**Configuration dans `.env` :**
```env
WHISPER_MODEL_SIZE=base  # tiny, base, small, medium, large
TRANSCRIPTION_LANGUAGE=fr
```

**Modèles disponibles :**
- `tiny` : Plus rapide, moins précis (~39MB)
- `base` : Équilibre vitesse/précision (~74MB) - **Recommandé**
- `small` : Meilleure précision (~244MB)
- `medium` : Très bonne précision (~769MB)
- `large` : Meilleure précision (~1550MB)

## Utilisation

### Automatique

La transcription se lance automatiquement lors du traitement d'un enregistrement si :
- La transcription est activée dans les paramètres utilisateur
- Une clé OpenAI est configurée OU faster-whisper est installé

### Configuration Utilisateur

Dans l'interface (page Settings), l'utilisateur peut :
- Activer/désactiver la transcription
- Activer/désactiver le résumé
- Choisir le niveau de détail du résumé (brief, medium, detailed)

### API

La transcription est accessible via :
- `GET /api/recordings/{id}/` - Le champ `transcript` contient la transcription
- `GET /api/recordings/{id}/transcription_history/` - Historique des transcriptions

## Test

Pour tester manuellement :

```python
from recordings.tasks import transcribe_audio

# Avec OpenAI
transcript = transcribe_audio("path/to/audio.wav", use_local=False)

# Avec Whisper local
transcript = transcribe_audio("path/to/audio.wav", use_local=True, language='fr')
```

## Dépannage

### Erreur "openai library not installed"
```bash
pip install openai
```

### Erreur "faster-whisper not installed"
```bash
pip install faster-whisper
```

### Whisper local très lent
- Utilisez un modèle plus petit (`tiny` ou `base`)
- Installez CUDA pour utiliser le GPU (si disponible)
- Réduisez la qualité audio avant transcription

### OpenAI API erreur
- Vérifiez que votre clé API est valide
- Vérifiez votre quota/credits OpenAI
- Vérifiez votre connexion internet

## Coûts

### OpenAI Whisper API
- ~$0.006 par minute d'audio
- Exemple : 1h d'audio = ~$0.36

### Whisper Local
- Gratuit
- Utilise vos ressources CPU/GPU

## Recommandation

Pour la production :
- **Développement/Test** : Utilisez faster-whisper local (gratuit)
- **Production** : Utilisez OpenAI Whisper API (plus rapide, meilleure qualité)

Pour combiner les deux :
- Le système utilise automatiquement OpenAI si la clé est configurée
- Sinon, il bascule sur faster-whisper local

