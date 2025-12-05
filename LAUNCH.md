# 🚀 Guide de Lancement Rapide

## Commandes pour lancer le projet

### Terminal 1 - Backend Django
```powershell
cd backend
.\venv\Scripts\activate
python manage.py runserver
```

### Terminal 2 - Frontend React
```powershell
cd frontend
npm run dev
```

## 📝 Ordre de démarrage recommandé

1. **Terminal 1**: Backend Django (`python manage.py runserver`)
2. **Terminal 2**: Frontend React (`npm run dev`)

**Note:** Celery et Redis ont été supprimés. Les tâches de traitement sont maintenant exécutées dans des threads séparés.

## 🌐 URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Admin Django**: http://localhost:8000/admin

## ✅ Vérification

1. Ouvrir http://localhost:5173
2. Créer un compte (Signup)
3. Se connecter
4. Tester l'enregistrement audio

## 🔧 Dépannage

### Redis non démarré
```powershell
# Windows: Installer Redis ou utiliser WSL
# Linux:
sudo systemctl start redis
```

### Erreur "ModuleNotFoundError"
```powershell
cd backend
.\venv\Scripts\activate
pip install -r requirements.txt
```

### Erreur "ffmpeg not found"
Installer ffmpeg (voir README.md)

