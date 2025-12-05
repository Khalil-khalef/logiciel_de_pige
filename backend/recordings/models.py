from django.db import models
from django.conf import settings
from django.utils import timezone
import json


class UserSettings(models.Model):
    """
    Paramètres utilisateur pour l'enregistrement et le traitement audio
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='user_settings'
    )
    
    # Stockage
    storage_path = models.CharField(max_length=500, default='recordings/', help_text="Chemin de stockage personnalisé")
    
    # Enregistrement
    default_format = models.CharField(max_length=10, default='mp3', choices=[
        ('mp3', 'MP3'),
        ('wav', 'WAV'),
        ('ogg', 'OGG'),
        ('flac', 'FLAC'),
        ('webm', 'WebM'),
    ])
    default_quality = models.CharField(max_length=10, default='high', choices=[
        ('high', 'Haute'),
        ('medium', 'Moyenne'),
        ('low', 'Basse'),
    ])
    default_sample_rate = models.IntegerField(default=44100)
    default_channels = models.IntegerField(default=2, choices=[(1, 'Mono'), (2, 'Stéréo')])
    
    # Découpage automatique
    auto_split_enabled = models.BooleanField(default=False)
    auto_split_duration_minutes = models.IntegerField(default=60, help_text="Durée avant découpage automatique (minutes)")
    
    # Rétention
    retention_days = models.IntegerField(default=30, help_text="Durée de rétention en jours")
    
    # Nommage
    naming_template = models.CharField(
        max_length=255,
        default='{type}-{date}-{time}',
        help_text="Template: {type}, {date}, {time}, {timestamp}, {jour}, {mois}, {heure}, {minutes}"
    )
    
    # Détection silence
    vad_sensitivity = models.IntegerField(default=2, help_text="Sensibilité VAD (0-3)")
    silence_threshold_seconds = models.FloatField(default=5.0, help_text="Seuil minimal pour silence anormal (secondes)")
    email_alerts_enabled = models.BooleanField(default=False)
    
    # Email
    email_host = models.CharField(max_length=255, blank=True)
    email_port = models.IntegerField(default=587)
    email_user = models.CharField(max_length=255, blank=True)
    email_password = models.CharField(max_length=255, blank=True)
    
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Paramètres utilisateur"
        verbose_name_plural = "Paramètres utilisateurs"
    
    def __str__(self):
        return f"Settings for {self.user.username}"


class Recording(models.Model):
    """
    Modèle pour les enregistrements audio (antenne/émissions/réunions)
    """
    
    TYPE_CHOICES = [
        ('antenne', 'Antenne'),
        ('emission', 'Émission'),
        ('reunion', 'Réunion'),
    ]
    
    FORMAT_CHOICES = [
        ('mp3', 'MP3'),
        ('wav', 'WAV'),
        ('ogg', 'OGG'),
        ('m4a', 'M4A'),
        ('flac', 'FLAC'),
        ('webm', 'WebM'),
    ]
    
    # Informations de base
    title = models.CharField(max_length=255, blank=True, help_text="Titre de l'enregistrement")
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='antenne')
    custom_name = models.CharField(max_length=255, blank=True, help_text="Nom personnalisé du fichier")
    
    # Fichier
    file = models.FileField(upload_to='recordings/', help_text="Fichier audio")
    format = models.CharField(max_length=10, choices=FORMAT_CHOICES, default='mp3')
    sample_rate = models.IntegerField(default=44100, help_text="Taux d'échantillonnage (Hz)")
    duration_seconds = models.FloatField(default=0.0, help_text="Durée en secondes")
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    retained_until = models.DateTimeField(null=True, blank=True, help_text="Date d'expiration automatique")
    
    # Traitement IA
    vad_report = models.JSONField(default=dict, blank=True, help_text="Rapport de détection de voix (VAD)")
    flagged = models.BooleanField(default=False, help_text="Marqué pour révision (blancs détectés, etc.)")
    
    # Utilisateur
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='recordings'
    )
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['type']),
            models.Index(fields=['flagged']),
        ]
    
    def __str__(self):
        return f"{self.title or self.custom_name or 'Recording'} ({self.type}) - {self.created_at.strftime('%Y-%m-%d %H:%M')}"
    
    def is_expired(self):
        """Vérifie si l'enregistrement a expiré"""
        if self.retained_until:
            return timezone.now() > self.retained_until
        return False
    
    def get_vad_summary(self):
        """Retourne un résumé du rapport VAD"""
        if not self.vad_report:
            return {}
        return {
            'total_silence_seconds': self.vad_report.get('total_silence_seconds', 0),
            'unnatural_silences': self.vad_report.get('unnatural_silences', []),
            'silence_percentage': self.vad_report.get('silence_percentage', 0),
        }
    
    def generate_filename(self, template=None):
        """
        Génère un nom de fichier selon le template
        Variables: {type}, {date}, {time}, {timestamp}, {jour}, {mois}, {heure}, {minutes}
        """
        if not template:
            try:
                settings = self.user.user_settings
                template = settings.naming_template
            except UserSettings.DoesNotExist:
                template = '{type}-{date}-{time}'
        
        from datetime import datetime
        dt = self.created_at
        
        replacements = {
            '{type}': self.type,
            '{date}': dt.strftime('%Y-%m-%d'),
            '{time}': dt.strftime('%H-%M-%S'),
            '{timestamp}': str(int(dt.timestamp())),
            '{jour}': dt.strftime('%d'),
            '{mois}': dt.strftime('%m'),
            '{heure}': dt.strftime('%H'),
            '{minutes}': dt.strftime('%M'),
        }
        
        filename = template
        for key, value in replacements.items():
            filename = filename.replace(key, value)
        
        return filename
