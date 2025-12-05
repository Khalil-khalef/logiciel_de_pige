# 🚀 Guide de Déploiement - Application d'Enregistrement Audio

## ✅ Vérification Pré-Déploiement

### Backend
- ✅ Django + DRF configuré
- ✅ JWT Authentication fonctionnel
- ✅ CORS configuré pour frontend
- ✅ Celery + Redis configurés
- ✅ Modèles: Recording, UserSettings, TranscriptionHistory
- ✅ API endpoints complets
- ✅ Tâches Celery: process_recording, trim_recording_task, purge_expired, send_alert_email
- ✅ VAD (Voice Activity Detection) avec webrtcvad
- ✅ Transcription (OpenAI Whisper API ou faster-whisper local)
- ✅ Résumé IA (OpenAI GPT)
- ✅ Alertes email configurables

### Frontend
- ✅ React + Vite + Tailwind CSS
- ✅ Toutes les pages créées et fonctionnelles
- ✅ Authentification JWT
- ✅ Enregistrement audio en temps réel avec niveau audio
- ✅ Upload de fichiers
- ✅ Liste et lecture des enregistrements
- ✅ Dashboard avec statistiques
- ✅ Détection de silence
- ✅ Synthèse IA (transcription/résumé)
- ✅ Paramètres utilisateur complets
- ✅ Téléchargement des enregistrements

## 📋 Checklist de Déploiement

### 1. Prérequis
- [ ] Python 3.9+ installé
- [ ] Node.js 18+ installé
- [ ] Redis installé et démarré
- [ ] ffmpeg installé
- [ ] (Optionnel) OpenAI API Key pour transcription/résumé
- [ ] (Optionnel) Configuration SMTP pour alertes email

### 2. Backend
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser  # Optionnel
```

### 3. Configuration Backend (.env)
```env
SECRET_KEY=votre-secret-key
DEBUG=1
REDIS_URL=redis://localhost:6379/0
OPENAI_API_KEY=sk-...  # Optionnel
EMAIL_HOST=smtp.gmail.com  # Optionnel
EMAIL_PORT=587
EMAIL_USER=votre-email@gmail.com  # Optionnel
EMAIL_PASS=votre-mot-de-passe  # Optionnel
WHISPER_MODEL_SIZE=base
TRANSCRIPTION_LANGUAGE=fr
```

### 4. Frontend
```powershell
cd frontend
npm install
```

### 5. Configuration Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

## 🏃 Lancement

### Terminal 1 - Backend Django
```powershell
cd backend
.\venv\Scripts\activate
python manage.py runserver
```

### Terminal 2 - Celery Worker
```powershell
cd backend
.\venv\Scripts\activate
celery -A backend_project worker --loglevel=info
```

### Terminal 3 - Celery Beat (optionnel)
```powershell
cd backend
.\venv\Scripts\activate
celery -A backend_project beat --loglevel=info
```

### Terminal 4 - Frontend
```powershell
cd frontend
npm run dev
```

## 🔍 Tests de Fonctionnalités

### 1. Authentification
- [ ] Créer un compte (Signup)
- [ ] Se connecter (Login)
- [ ] Token JWT stocké dans localStorage

### 2. Enregistrement Audio
- [ ] Démarrer l'enregistrement
- [ ] Voir le niveau audio en temps réel
- [ ] Arrêter l'enregistrement
- [ ] Upload automatique réussi

### 3. Upload de Fichier
- [ ] Uploader un fichier audio
- [ ] Fichier visible dans la liste

### 4. Traitement Automatique
- [ ] VAD détecté (vérifier dans RecordingDetail)
- [ ] Transcription générée (si activée)
- [ ] Résumé généré (si activé)
- [ ] Silences anormaux détectés (si présents)

### 5. Paramètres
- [ ] Charger les paramètres utilisateur
- [ ] Modifier les paramètres
- [ ] Sauvegarder les paramètres
- [ ] Paramètres appliqués aux nouveaux enregistrements

### 6. Détection de Silence
- [ ] Voir les enregistrements avec silences
- [ ] Configurer la sensibilité VAD
- [ ] Configurer le seuil de silence

### 7. Synthèse IA
- [ ] Voir les transcriptions
- [ ] Voir les résumés
- [ ] Voir l'historique des transcriptions

### 8. Autres Fonctionnalités
- [ ] Télécharger un enregistrement
- [ ] Découper un enregistrement (trim)
- [ ] Supprimer un enregistrement
- [ ] Voir les statistiques dans le Dashboard

## 🐛 Dépannage

### Erreur "ModuleNotFoundError"
```powershell
cd backend
.\venv\Scripts\activate
pip install -r requirements.txt
```

### Erreur "ffmpeg not found"
Installer ffmpeg (voir README.md)

### Erreur "Redis connection refused"
Démarrer Redis:
```powershell
# Windows: Installer Redis ou utiliser WSL
# Linux:
sudo systemctl start redis
```

### Les transcriptions ne fonctionnent pas
- Vérifier que `OPENAI_API_KEY` est configuré dans `.env`
- Ou installer faster-whisper: `pip install faster-whisper`

### Les emails ne sont pas envoyés
- Vérifier la configuration SMTP dans `.env` ou dans les paramètres utilisateur
- Pour Gmail, utiliser un "Mot de passe d'application"

### Erreur CORS
- Vérifier que `CORS_ALLOWED_ORIGINS` dans `settings.py` inclut l'URL du frontend
- Vérifier que le frontend utilise la bonne `VITE_API_URL`

## 📝 Notes Importantes

1. **Environnement de développement**: `DEBUG=1` dans `.env`
2. **Environnement de production**: `DEBUG=0` et configurer `ALLOWED_HOSTS`
3. **Sécurité**: Ne jamais commiter le fichier `.env`
4. **Redis**: Nécessaire pour Celery (worker et beat)
5. **ffmpeg**: Nécessaire pour le traitement audio
6. **OpenAI**: Optionnel mais recommandé pour transcription/résumé de qualité

## 🎯 Prochaines Étapes (Optionnel)

- [ ] Ajouter des tests unitaires
- [ ] Configurer CI/CD
- [ ] Déployer sur serveur de production
- [ ] Configurer HTTPS
- [ ] Ajouter monitoring/logging
- [ ] Optimiser les performances

