# Frontend - Application d'Enregistrement Audio

Frontend React avec Vite, Tailwind CSS, et interface complète pour l'enregistrement audio.

## Installation

```bash
cd frontend
npm install
```

## Configuration

Créer un fichier `.env`:

```
VITE_API_URL=http://localhost:8000
```

## Lancement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## Pages

- **Login** (`/login`): Connexion avec JWT
- **Dashboard** (`/`): Statistiques et enregistrements récents
- **Record** (`/record`): Enregistrement audio via navigateur
- **Upload** (`/upload`): Upload de fichier audio
- **RecordingsList** (`/recordings`): Liste de tous les enregistrements
- **RecordingDetail** (`/recordings/:id`): Détails, transcript, résumé, VAD
- **Settings** (`/settings`): Paramètres de l'application

## Composants

- **Sidebar**: Navigation principale
- **TrimModal**: Modal pour découper un enregistrement
- **Player**: Lecteur audio HTML5

## Fonctionnalités

- Enregistrement audio via MediaRecorder API
- Upload de fichiers audio
- Lecture audio intégrée
- Découpage (trim) d'enregistrements
- Affichage du transcript et résumé
- Visualisation du rapport VAD
- Statistiques (dashboard)
- Paramètres configurables

## Structure

```
frontend/
├── src/
│   ├── pages/          # Pages principales
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Record.jsx
│   │   ├── Upload.jsx
│   │   ├── RecordingsList.jsx
│   │   ├── RecordingDetail.jsx
│   │   └── Settings.jsx
│   ├── components/     # Composants réutilisables
│   │   ├── Sidebar.jsx
│   │   └── TrimModal.jsx
│   ├── api.js          # Service API
│   ├── App.jsx         # Router principal
│   └── main.jsx        # Point d'entrée
└── .env                # Configuration
```

## Technologies

- React 18
- Vite
- Tailwind CSS
- React Router
- Axios

