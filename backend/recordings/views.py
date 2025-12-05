from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.http import FileResponse, Http404
from django.utils import timezone
from datetime import timedelta
from .models import Recording, UserSettings
from .serializers import (
    RecordingSerializer, 
    RecordingCreateSerializer, 
    RecordingTrimSerializer,
    UserSignupSerializer,
    UserSettingsSerializer
)
from .tasks import process_recording, trim_recording_task
import os


class SignupViewSet(viewsets.ViewSet):
    """
    ViewSet pour l'inscription d'un nouvel utilisateur
    """
    permission_classes = [AllowAny]
    
    def create(self, request):
        """
        Crée un nouvel utilisateur
        POST /api/signup/
        Body: {
            "username": "user",
            "email": "user@example.com",
            "password": "password123",
            "password_confirm": "password123",
            "first_name": "John",
            "last_name": "Doe"
        }
        """
        serializer = UserSignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Créer les paramètres par défaut pour le nouvel utilisateur
            UserSettings.objects.get_or_create(user=user)
            return Response({
                'message': 'Utilisateur créé avec succès',
                'username': user.username,
                'id': user.id
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RecordingViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les enregistrements audio
    """
    queryset = Recording.objects.all()
    serializer_class = RecordingSerializer
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Retourne uniquement les enregistrements de l'utilisateur connecté"""
        return Recording.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        """Utilise un serializer différent pour la création"""
        if self.action == 'create':
            return RecordingCreateSerializer
        return RecordingSerializer
    
    def perform_create(self, serializer):
        """Crée l'enregistrement et lance le traitement"""
        # Récupérer les settings utilisateur pour le nommage et la rétention
        retained_until = None
        naming_template = None
        try:
            user_settings = self.request.user.user_settings
            # Appliquer la durée de rétention
            if user_settings.retention_days:
                retained_until = timezone.now() + timedelta(days=user_settings.retention_days)
            naming_template = user_settings.naming_template
        except UserSettings.DoesNotExist:
            pass
        
        # Sauvegarder avec la rétention si définie
        recording = serializer.save(user=self.request.user, retained_until=retained_until)
        
        # Générer le nom de fichier selon le template
        if not recording.custom_name and naming_template:
            try:
                filename = recording.generate_filename(naming_template)
                recording.custom_name = filename
                recording.save(update_fields=['custom_name'])
            except Exception as e:
                # Si erreur, on continue sans nom personnalisé
                print(f"Erreur lors de la génération du nom: {e}")
        
        # Lancer le traitement (synchronisé, sans Celery)
        # Note: Le traitement peut prendre du temps, idéalement utiliser un thread en production
        import threading
        threading.Thread(target=process_recording, args=(recording.id,), daemon=True).start()
    
    @action(detail=True, methods=['post'])
    def trim(self, request, pk=None):
        """
        Découpe un enregistrement audio selon les timestamps fournis
        POST /api/recordings/{id}/trim/
        Body: { "start_time": 10.5, "end_time": 120.3 }
        """
        recording = self.get_object()
        serializer = RecordingTrimSerializer(data=request.data)
        
        if serializer.is_valid():
            start_time = serializer.validated_data['start_time']
            end_time = serializer.validated_data['end_time']
            
            # Vérifier que les timestamps sont valides
            if end_time > recording.duration_seconds:
                return Response(
                    {'error': f'end_time ({end_time}) dépasse la durée totale ({recording.duration_seconds}s)'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Lancer le trim (synchronisé, sans Celery)
            # Note: Le trim peut prendre du temps, idéalement utiliser un thread en production
            import threading
            threading.Thread(target=trim_recording_task, args=(recording.id, start_time, end_time), daemon=True).start()
            
            return Response({
                'message': 'Trim en cours de traitement',
                'recording_id': recording.id,
                'start_time': start_time,
                'end_time': end_time
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def process(self, request, pk=None):
        """
        Relance le traitement d'un enregistrement (VAD, détection de silences, alertes)
        POST /api/recordings/{id}/process/
        """
        recording = self.get_object()
        # Lancer le traitement (synchronisé, sans Celery)
        import threading
        threading.Thread(target=process_recording, args=(recording.id,), daemon=True).start()
        
        return Response({
            'message': 'Traitement relancé',
            'recording_id': recording.id
        })
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Retourne les statistiques des enregistrements de l'utilisateur
        GET /api/recordings/stats/
        """
        queryset = self.get_queryset()
        
        stats = {
            'total': queryset.count(),
            'flagged': queryset.filter(flagged=True).count(),
            'by_type': {
                'antenne': queryset.filter(type='antenne').count(),
                'emission': queryset.filter(type='emission').count(),
                'reunion': queryset.filter(type='reunion').count(),
            },
            'total_duration_seconds': sum(r.duration_seconds for r in queryset),
        }
        
        return Response(stats)
    
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """
        Télécharge un enregistrement
        GET /api/recordings/{id}/download/
        """
        recording = self.get_object()
        file_path = recording.file.path
        
        if os.path.exists(file_path):
            response = FileResponse(open(file_path, 'rb'))
            response['Content-Disposition'] = f'attachment; filename="{os.path.basename(file_path)}"'
            return response
        raise Http404("Fichier non trouvé")


class UserSettingsViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les paramètres utilisateur
    """
    queryset = UserSettings.objects.all()
    serializer_class = UserSettingsSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Retourne uniquement les settings de l'utilisateur connecté"""
        return UserSettings.objects.filter(user=self.request.user)
    
    def get_object(self):
        """Récupère ou crée les settings de l'utilisateur"""
        settings, created = UserSettings.objects.get_or_create(user=self.request.user)
        return settings
    
    def list(self, request):
        """Retourne les settings de l'utilisateur"""
        settings = self.get_object()
        serializer = self.get_serializer(settings)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        """Crée les settings pour l'utilisateur (si n'existent pas)"""
        settings, created = UserSettings.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def update(self, request, *args, **kwargs):
        """Met à jour les settings"""
        settings = self.get_object()
        serializer = self.get_serializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

