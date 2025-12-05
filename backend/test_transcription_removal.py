"""
Test script pour vérifier que la suppression de la transcription est complète
"""
from recordings.models import Recording, UserSettings
from recordings.serializers import RecordingSerializer, UserSettingsSerializer
from django.contrib.auth.models import User

def test_models():
    """Test que les modèles sont correctement configurés"""
    print("\n=== Test des modèles ===")
    
    # Test 1: Créer un utilisateur test
    user = User.objects.create_user(
        username='test_transcription_removal',
        email='test@example.com',
        password='testpass123'
    )
    print("✓ Utilisateur créé:", user.username)
    
    # Test 2: Créer les settings utilisateur
    settings, created = UserSettings.objects.get_or_create(user=user)
    print("✓ Settings créés" if created else "✓ Settings existaient déjà")
    
    # Test 3: Vérifier les champs VAD
    print(f"✓ VAD Sensitivity: {settings.vad_sensitivity}")
    print(f"✓ Silence Threshold: {settings.silence_threshold_seconds}s")
    
    # Test 4: Vérifier que les champs de transcription n'existent pas
    try:
        settings.transcription_enabled
        print("✗ ERREUR: transcription_enabled existe encore!")
        return False
    except AttributeError:
        print("✓ transcription_enabled supprimé correctement")
    
    try:
        settings.summary_enabled
        print("✗ ERREUR: summary_enabled existe encore!")
        return False
    except AttributeError:
        print("✓ summary_enabled supprimé correctement")
    
    return True

def test_serializers():
    """Test que les sérializers ne contiennent pas de champs de transcription"""
    print("\n=== Test des sérializers ===")
    
    user = User.objects.get(username='test_transcription_removal')
    settings = user.user_settings
    
    # Test 1: Vérifier UserSettingsSerializer
    serializer = UserSettingsSerializer(settings)
    data = serializer.data
    print(f"✓ Serializer fields: {len(data)} champs")
    
    if 'transcription_enabled' in data:
        print("✗ ERREUR: transcription_enabled dans serializer!")
        return False
    else:
        print("✓ transcription_enabled retiré du serializer")
    
    if 'summary_enabled' in data:
        print("✗ ERREUR: summary_enabled dans serializer!")
        return False
    else:
        print("✓ summary_enabled retiré du serializer")
    
    if 'summary_detail_level' in data:
        print("✗ ERREUR: summary_detail_level dans serializer!")
        return False
    else:
        print("✓ summary_detail_level retiré du serializer")
    
    # Test 2: Vérifier RecordingSerializer
    recording_serializer = RecordingSerializer()
    recording_fields = recording_serializer.fields.keys()
    
    if 'transcript' in recording_fields:
        print("✗ ERREUR: transcript dans RecordingSerializer!")
        return False
    else:
        print("✓ transcript retiré de RecordingSerializer")
    
    if 'summary' in recording_fields:
        print("✗ ERREUR: summary dans RecordingSerializer!")
        return False
    else:
        print("✓ summary retiré de RecordingSerializer")
    
    return True

def test_imports():
    """Test que les imports ne causent pas d'erreurs"""
    print("\n=== Test des imports ===")
    
    try:
        from recordings.models import Recording, UserSettings
        print("✓ Imports de models.py OK")
    except ImportError as e:
        print(f"✗ ERREUR d'import models: {e}")
        return False
    
    try:
        from recordings.views import RecordingViewSet, UserSettingsViewSet
        print("✓ Imports de views.py OK")
    except ImportError as e:
        print(f"✗ ERREUR d'import views: {e}")
        return False
    
    try:
        from recordings.serializers import RecordingSerializer, UserSettingsSerializer
        print("✓ Imports de serializers.py OK")
    except ImportError as e:
        print(f"✗ ERREUR d'import serializers: {e}")
        return False
    
    try:
        from recordings.tasks import process_recording, trim_recording_task
        print("✓ Imports de tasks.py OK")
    except ImportError as e:
        print(f"✗ ERREUR d'import tasks: {e}")
        return False
    
    # Test que TranscriptionHistory n'existe plus
    try:
        from recordings.models import TranscriptionHistory
        print("✗ ERREUR: TranscriptionHistory peut toujours être importé!")
        return False
    except ImportError:
        print("✓ TranscriptionHistory n'existe plus")
    
    # Test que TranscriptionHistorySerializer n'existe plus
    try:
        from recordings.serializers import TranscriptionHistorySerializer
        print("✗ ERREUR: TranscriptionHistorySerializer peut toujours être importé!")
        return False
    except ImportError:
        print("✓ TranscriptionHistorySerializer n'existe plus")
    
    return True

if __name__ == '__main__':
    print("\n" + "="*50)
    print("TESTS DE VÉRIFICATION - SUPPRESSION TRANSCRIPTION")
    print("="*50)
    
    results = []
    
    # Exécuter les tests
    results.append(("Imports", test_imports()))
    results.append(("Modèles", test_models()))
    results.append(("Sérializers", test_serializers()))
    
    # Résumé
    print("\n" + "="*50)
    print("RÉSUMÉ DES TESTS")
    print("="*50)
    
    for test_name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{test_name}: {status}")
    
    all_pass = all(result for _, result in results)
    
    if all_pass:
        print("\n✓✓✓ TOUS LES TESTS PASSENT ✓✓✓")
        print("\nLa suppression de la transcription est complète et correcte!")
    else:
        print("\n✗✗✗ CERTAINS TESTS ONT ÉCHOUÉ ✗✗✗")
    
    print("="*50 + "\n")
