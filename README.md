# Application d'Enregistrement Audio avec IA

Application complète d'enregistrement audio avec détection de silence, transcription et synthèse IA.

## 🚀 Fonctionnalités

### Backend (Django + DRF)
- ✅ Authentification JWT (signup/login)
- ✅ Gestion des enregistrements audio (upload, liste, téléchargement, suppression)
- ✅ Détection de voix (VAD) avec webrtcvad
- ✅ Détection de silences anormaux
- ✅ Transcription automatique (OpenAI Whisper API ou faster-whisper local)
- ✅ Résumé automatique avec OpenAI GPT
- ✅ Alertes email pour silences anormaux
- ✅ Découpage audio (trim)
- ✅ Paramètres utilisateur personnalisables
- ✅ Historique des transcriptions

### Frontend (React + Vite + Tailwind)
- ✅ Interface moderne et responsive
- ✅ Enregistrement audio en temps réel avec niveau audio
- ✅ Upload de fichiers audio
- ✅ Liste et lecture des enregistrements
- ✅ Dashboard avec statistiques
- ✅ Page de détection de silence
- ✅ Page de synthèse IA (transcription/résumé)
- ✅ Paramètres utilisateur complets
- ✅ Téléchargement des enregistrements

## 📋 Prérequis

- Python 3.9+
- Node.js 18+
- ffmpeg (pour le traitement audio)

### Installation de ffmpeg

**Windows:**
```powershell
# Via Chocolatey
choco install ffmpeg

# Ou télécharger depuis https://ffmpeg.org/download.html
```

**Linux:**
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

## 🔧 Installation

### Backend

1. **Créer un environnement virtuel:**
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
```

2. **Installer les dépendances:**
```powershell
pip install -r requirements.txt
```

3. **Configurer les variables d'environnement:**
```powershell
# Copier le fichier .env.example
Copy-Item .env.example .env

# Éditer .env avec vos valeurs
# SECRET_KEY=...
# DEBUG=1
# OPENAI_API_KEY=sk-... (optionnel, pour transcription/résumé)
# EMAIL_HOST=smtp.gmail.com (optionnel, pour alertes)
# EMAIL_PORT=587
# EMAIL_USER=votre-email@gmail.com
# EMAIL_PASS=votre-mot-de-passe
# WHISPER_MODEL_SIZE=base
# TRANSCRIPTION_LANGUAGE=fr
```

4. **Appliquer les migrations:**
```powershell
python manage.py migrate
```

5. **Créer un superutilisateur (optionnel):**
```powershell
python manage.py createsuperuser
```

### Frontend

1. **Installer les dépendances:**
```powershell
cd frontend
npm install
```

2. **Configurer l'URL de l'API:**
```powershell
# Créer .env
echo "VITE_API_URL=http://localhost:8000" > .env
```

## 🏃 Lancement

### 1. Démarrer le backend

```powershell
cd backend
.\venv\Scripts\activate
python manage.py runserver
```

Le serveur Django sera accessible sur `http://localhost:8000`

**Note:** Les tâches de traitement audio sont exécutées dans des threads séparés pour ne pas bloquer les requêtes HTTP.

### 2. Démarrer le frontend

```powershell
cd frontend
npm run dev
```

Le frontend sera accessible sur `http://localhost:5173`

## 📚 Utilisation

### 1. Créer un compte
- Aller sur `http://localhost:5173/signup`
- Créer un compte utilisateur

### 2. Enregistrer un audio
- Cliquer sur "Enregistrer"
- Choisir le type (Antenne/Émission/Réunion)
- Choisir le format et la qualité
- Cliquer sur "Démarrer l'enregistrement"
- Arrêter quand terminé

### 3. Uploader un fichier
- Cliquer sur "Uploader"
- Sélectionner un fichier audio (mp3, wav, ogg, m4a, flac, webm)
- Remplir les métadonnées
- Uploader

### 4. Configurer les paramètres
- Aller dans "Paramètres"
- Configurer:
  - Format et qualité par défaut
  - Durée de rétention
  - Template de nommage
  - Sensibilité VAD
  - Transcription et résumé IA
  - Alertes email

### 5. Voir les détections de silence
- Aller dans "Détection Silence"
- Voir les enregistrements avec silences détectés
- Configurer la sensibilité VAD

### 6. Voir les transcriptions
- Aller dans "Synthèse IA"
- Voir les enregistrements transcrits
- Voir l'historique des transcriptions

## 🔑 Configuration OpenAI (Optionnel)

Pour utiliser la transcription et le résumé IA:

1. Obtenir une clé API OpenAI: https://platform.openai.com/api-keys
2. Ajouter dans `.env`:
```
OPENAI_API_KEY=sk-...
```

Sans clé OpenAI, l'application utilisera faster-whisper (local) si installé.

## 📧 Configuration Email (Optionnel)

Pour recevoir des alertes par email:

1. Configurer dans `.env`:
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre-email@gmail.com
EMAIL_PASS=votre-mot-de-passe-app
```

Ou configurer dans les paramètres utilisateur de l'interface.

## 🛠️ API Endpoints

### Authentification
- `POST /api/signup/` - Inscription
- `POST /api/token/` - Connexion (obtenir JWT)
- `POST /api/token/refresh/` - Rafraîchir le token

### Enregistrements
- `GET /api/recordings/` - Liste des enregistrements
- `POST /api/recordings/` - Créer un enregistrement (upload)
- `GET /api/recordings/{id}/` - Détails d'un enregistrement
- `DELETE /api/recordings/{id}/` - Supprimer un enregistrement
- `GET /api/recordings/{id}/download/` - Télécharger un enregistrement
- `POST /api/recordings/{id}/trim/` - Découper un enregistrement
- `POST /api/recordings/{id}/process/` - Relancer le traitement
- `GET /api/recordings/stats/` - Statistiques
- `GET /api/recordings/{id}/transcription_history/` - Historique des transcriptions

### Paramètres
- `GET /api/settings/` - Récupérer les paramètres utilisateur
- `PUT /api/settings/` - Mettre à jour les paramètres

## 📁 Structure du Projet

```
Record/
├── backend/
│   ├── backend_project/      # Configuration Django
│   ├── recordings/           # App Django
│   │   ├── models.py         # Modèles (Recording, UserSettings, TranscriptionHistory)
│   │   ├── views.py          # Viewsets API
│   │   ├── serializers.py   # Serializers DRF
│   │   ├── tasks.py          # Fonctions de traitement audio (synchrones)
│   │   └── urls.py           # URLs
│   ├── media/                # Fichiers uploadés
│   ├── requirements.txt      # Dépendances Python
│   └── .env                  # Variables d'environnement
│
└── frontend/
    ├── src/
    │   ├── pages/            # Pages React
    │   ├── components/       # Composants React
    │   ├── api.js            # Service API
    │   └── App.jsx           # App principale
    ├── package.json          # Dépendances Node
    └── .env                  # Variables d'environnement
```

## 🐛 Dépannage

### Erreur "ModuleNotFoundError: No module named 'webrtcvad'"
```powershell
pip install webrtcvad
```

### Erreur "ffmpeg not found"
Installer ffmpeg (voir section Prérequis)

### Les transcriptions ne fonctionnent pas
- Vérifier que `OPENAI_API_KEY` est configuré dans `.env`
- Ou installer faster-whisper: `pip install faster-whisper`

### Les emails ne sont pas envoyés
- Vérifier la configuration SMTP dans `.env`
- Pour Gmail, utiliser un "Mot de passe d'application"

## 📝 Notes

- Les enregistrements sont traités dans des threads séparés pour ne pas bloquer les requêtes HTTP
- La détection VAD nécessite des fichiers audio en WAV 16kHz mono
- Les transcriptions peuvent prendre du temps selon la longueur de l'audio
- Les enregistrements expirés peuvent être supprimés manuellement via la fonction `purge_expired()` dans le shell Django

## 📄 Licence

Ce projet est fourni tel quel, sans garantie.

