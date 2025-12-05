from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Recording, UserSettings


class UserSignupSerializer(serializers.ModelSerializer):
    """
    Serializer pour l'inscription d'un nouvel utilisateur
    """
    password = serializers.CharField(write_only=True, min_length=6, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, min_length=6, style={'input_type': 'password'})
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm', 'first_name', 'last_name')
        extra_kwargs = {
            'email': {'required': False},
            'first_name': {'required': False},
            'last_name': {'required': False},
        }
    
    def validate(self, data):
        """Vérifie que les mots de passe correspondent"""
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Les mots de passe ne correspondent pas.'})
        return data
    
    def create(self, validated_data):
        """Crée un nouvel utilisateur avec le mot de passe hashé"""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class RecordingSerializer(serializers.ModelSerializer):
    """
    Serializer pour les enregistrements audio
    """
    user = serializers.ReadOnlyField(source='user.username')
    file_url = serializers.SerializerMethodField()
    is_expired = serializers.SerializerMethodField()
    vad_summary = serializers.SerializerMethodField()
    
    class Meta:
        model = Recording
        fields = [
            'id', 'title', 'type', 'custom_name', 'file', 'file_url',
            'format', 'sample_rate', 'duration_seconds',
            'created_at', 'retained_until', 'is_expired',
            'vad_report', 'vad_summary',
            'flagged', 'user'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'file_url', 'is_expired', 'vad_summary']
    
    def get_file_url(self, obj):
        """Retourne l'URL complète du fichier"""
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None
    
    def get_is_expired(self, obj):
        """Vérifie si l'enregistrement a expiré"""
        return obj.is_expired()
    
    def get_vad_summary(self, obj):
        """Retourne un résumé du rapport VAD"""
        return obj.get_vad_summary()
    
    def validate_file(self, value):
        """Valide le format du fichier uploadé"""
        if value:
            ext = value.name.split('.')[-1].lower()
            from django.conf import settings
            if ext not in settings.ALLOWED_AUDIO_FORMATS:
                raise serializers.ValidationError(
                    f"Format non autorisé. Formats acceptés: {', '.join(settings.ALLOWED_AUDIO_FORMATS)}"
                )
        return value


class RecordingCreateSerializer(serializers.ModelSerializer):
    """
    Serializer pour la création d'enregistrements (upload)
    """
    class Meta:
        model = Recording
        fields = ['title', 'type', 'custom_name', 'file', 'format', 'retained_until']
    
    def create(self, validated_data):
        """Crée l'enregistrement et associe l'utilisateur"""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class RecordingTrimSerializer(serializers.Serializer):
    """
    Serializer pour le trim (découpage) d'un enregistrement
    """
    start_time = serializers.FloatField(help_text="Temps de début en secondes")
    end_time = serializers.FloatField(help_text="Temps de fin en secondes")
    
    def validate(self, data):
        """Valide que start_time < end_time"""
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError("start_time doit être inférieur à end_time")
        return data


class UserSettingsSerializer(serializers.ModelSerializer):
    """
    Serializer pour les paramètres utilisateur
    """
    class Meta:
        model = UserSettings
        fields = [
            'id', 'storage_path', 'default_format', 'default_quality', 'default_sample_rate',
            'default_channels', 'auto_split_enabled', 'auto_split_duration_minutes',
            'retention_days', 'naming_template', 'vad_sensitivity', 'silence_threshold_seconds',
            'email_alerts_enabled', 'email_host', 'email_port', 'email_user', 'email_password',
            'updated_at'
        ]
        read_only_fields = ['updated_at']
    
    def create(self, validated_data):
        """Crée les settings pour l'utilisateur"""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

