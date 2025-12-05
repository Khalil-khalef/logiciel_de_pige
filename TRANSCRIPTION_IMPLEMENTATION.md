# Implémentation de la Transcription Audio

## État Actuel

❌ **La transcription est actuellement un PLACEHOLDER** - pas d'implémentation réelle.

Le code dans `backend/recordings/tasks.py` (fonction `transcribe_audio()`) retourne simplement :
```
"Transcription non disponible. Configurez OPENAI_API_KEY dans .env"
```

## Options Disponibles

### Option 1 : OpenAI Whisper API (Recommandé - Simple)
- ✅ Facile à intégrer
- ✅ Pas besoin d'installer de modèle local
- ✅ Bonne qualité
- ❌ Nécessite une clé API (payant)
- ❌ Dépend d'une connexion internet

### Option 2 : Whisper Local (faster-whisper)
- ✅ Gratuit, pas de limite
- ✅ Fonctionne hors ligne
- ✅ Bonne qualité
- ❌ Nécessite GPU pour de bonnes performances
- ❌ Plus lourd à installer

### Option 3 : Google Speech-to-Text
- ✅ Bonne qualité
- ❌ Nécessite clé API (payant)
- ❌ Plus complexe à configurer

### Option 4 : AssemblyAI
- ✅ API simple
- ✅ Bonne qualité
- ❌ Payant

## Recommandation

**Option hybride** : Implémenter OpenAI Whisper API par défaut, avec possibilité d'utiliser faster-whisper en local si pas de clé API.

