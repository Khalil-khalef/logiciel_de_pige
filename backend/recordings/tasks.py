"""
Fonctions de traitement des enregistrements audio (synchrones, sans Celery)
Traitement: Normalisation, détection VAD, détection de silences non naturels, alertes email
"""
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from .models import Recording, UserSettings
import os
import json
import webrtcvad
import numpy as np
import ffmpeg
import wave


def process_recording(recording_id):
    """
    Traite un enregistrement audio :
    - Normalisation audio avec ffmpeg
    - Détection de voix (VAD) avec webrtcvad
    - Détection de blancs naturels/non naturels
    - Alertes email pour silences détectés
    """
    try:
        recording = Recording.objects.get(id=recording_id)
        
        if not recording.file:
            print(f"Recording {recording_id} n'a pas de fichier")
            return
        
        # Vérifier que le fichier existe physiquement
        if not os.path.exists(recording.file.path):
            print(f"Fichier physique non trouvé pour l'enregistrement {recording_id}: {recording.file.path}")
            return
        
        file_path = recording.file.path
        
        # 1. Normalisation audio avec ffmpeg
        normalized_path = normalize_audio(file_path, recording.format)
        
        # 2. Extraction des métadonnées audio
        audio_info = extract_audio_info(normalized_path)
        recording.sample_rate = audio_info.get('sample_rate', 44100)
        recording.duration_seconds = audio_info.get('duration', 0.0)
        
        # 3. Détection de voix (VAD) - Utiliser les settings utilisateur
        vad_sensitivity = 2
        silence_threshold = 5.0
        try:
            user_settings = recording.user.user_settings
            vad_sensitivity = user_settings.vad_sensitivity
            silence_threshold = user_settings.silence_threshold_seconds
        except UserSettings.DoesNotExist:
            pass
        
        vad_report = detect_voice_activity(normalized_path, recording.sample_rate, vad_sensitivity)
        recording.vad_report = vad_report
        
        # 4. Détection de blancs non naturels avec seuil personnalisé
        unnatural_silences = detect_unnatural_silences(vad_report, min_silence_duration=silence_threshold)
        if unnatural_silences:
            recording.flagged = True
            recording.vad_report['unnatural_silences'] = unnatural_silences
            # Envoyer une alerte email si configuré
            try:
                user_settings = recording.user.user_settings
                if user_settings.email_alerts_enabled:
                    send_alert_email(recording_id, unnatural_silences)
            except UserSettings.DoesNotExist:
                if settings.EMAIL_HOST:
                    send_alert_email(recording_id, unnatural_silences)
        
        recording.save()
        
        print(f"Traitement terminé pour l'enregistrement {recording_id}")
        
    except Recording.DoesNotExist:
        print(f"Enregistrement {recording_id} introuvable")
    except Exception as e:
        print(f"Erreur lors du traitement de l'enregistrement {recording_id}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise


def normalize_audio(file_path, output_format='wav'):
    """
    Normalise l'audio avec ffmpeg (conversion en WAV 16kHz mono pour VAD)
    """
    output_path = file_path.replace(f'.{output_format}', '_normalized.wav')
    
    try:
        (
            ffmpeg
            .input(file_path)
            .output(
                output_path,
                acodec='pcm_s16le',
                ac=1,  # Mono
                ar=16000,  # 16kHz pour VAD
            )
            .overwrite_output()
            .run(quiet=True)
        )
        return output_path
    except Exception as e:
        print(f"Erreur lors de la normalisation: {e}")
        return file_path


def extract_audio_info(file_path):
    """
    Extrait les métadonnées audio (sample rate, durée)
    """
    try:
        probe = ffmpeg.probe(file_path)
        audio_stream = next((s for s in probe['streams'] if s['codec_type'] == 'audio'), None)
        
        if audio_stream:
            sample_rate = int(audio_stream.get('sample_rate', 44100))
            duration = float(probe.get('format', {}).get('duration', 0))
            return {
                'sample_rate': sample_rate,
                'duration': duration
            }
    except Exception as e:
        print(f"Erreur lors de l'extraction des métadonnées: {e}")
    
    return {'sample_rate': 44100, 'duration': 0.0}


def detect_voice_activity(file_path, sample_rate=16000, sensitivity=2):
    """
    Détecte l'activité vocale avec webrtcvad
    Retourne un rapport avec les périodes de voix et de silence
    
    Args:
        file_path: Chemin vers le fichier audio
        sample_rate: Taux d'échantillonnage
        sensitivity: Niveau d'agressivité VAD (0-3)
    """
    vad = webrtcvad.Vad(sensitivity)  # Niveau d'agressivité (0-3)
    
    try:
        # Lire le fichier WAV avec wave
        with wave.open(file_path, 'rb') as wf:
            frames = wf.readframes(wf.getnframes())
            audio_data = np.frombuffer(frames, dtype=np.int16)
        
        # Convertir en chunks de 10ms, 20ms ou 30ms (requis par VAD)
        frame_duration_ms = 30
        frame_size = int(sample_rate * frame_duration_ms / 1000)
        
        voice_segments = []
        silence_segments = []
        is_speaking = False
        segment_start = 0
        
        total_silence_seconds = 0
        
        for i in range(0, len(audio_data), frame_size):
            chunk = audio_data[i:i + frame_size]
            
            # Convertir en bytes pour VAD
            if len(chunk) < frame_size:
                break
            
            chunk_bytes = chunk.astype(np.int16).tobytes()
            
            # Détecter si c'est de la voix
            is_voice = vad.is_speech(chunk_bytes, sample_rate)
            current_time = i / sample_rate
            
            if is_voice and not is_speaking:
                # Début de parole
                if segment_start > 0:
                    silence_segments.append({
                        'start': segment_start,
                        'end': current_time,
                        'duration': current_time - segment_start
                    })
                    total_silence_seconds += (current_time - segment_start)
                is_speaking = True
                segment_start = current_time
            elif not is_voice and is_speaking:
                # Fin de parole
                voice_segments.append({
                    'start': segment_start,
                    'end': current_time,
                    'duration': current_time - segment_start
                })
                is_speaking = False
                segment_start = current_time
        
        # Fin du fichier
        if is_speaking:
            voice_segments.append({
                'start': segment_start,
                'end': len(audio_data) / sample_rate,
                'duration': len(audio_data) / sample_rate - segment_start
            })
        else:
            if segment_start > 0:
                silence_segments.append({
                    'start': segment_start,
                    'end': len(audio_data) / sample_rate,
                    'duration': len(audio_data) / sample_rate - segment_start
                })
                total_silence_seconds += (len(audio_data) / sample_rate - segment_start)
        
        total_duration = len(audio_data) / sample_rate
        silence_percentage = (total_silence_seconds / total_duration * 100) if total_duration > 0 else 0
        
        return {
            'voice_segments': voice_segments,
            'silence_segments': silence_segments,
            'total_silence_seconds': total_silence_seconds,
            'total_duration': total_duration,
            'silence_percentage': round(silence_percentage, 2),
            'voice_segments_count': len(voice_segments),
            'silence_segments_count': len(silence_segments),
        }
    
    except Exception as e:
        print(f"Erreur lors de la détection VAD: {e}")
        import traceback
        traceback.print_exc()
        return {}


def detect_unnatural_silences(vad_report, min_silence_duration=5.0):
    """
    Détecte les silences non naturels (trop longs)
    """
    unnatural_silences = []
    
    if not vad_report or 'silence_segments' not in vad_report:
        return unnatural_silences
    
    for silence in vad_report['silence_segments']:
        if silence['duration'] >= min_silence_duration:
            unnatural_silences.append({
                'start': silence['start'],
                'end': silence['end'],
                'duration': silence['duration'],
                'reason': 'Silence trop long'
            })
    
    return unnatural_silences


def trim_recording_task(recording_id, start_time, end_time):
    """
    Découpe un enregistrement audio selon les timestamps
    """
    try:
        recording = Recording.objects.get(id=recording_id)
        
        if not recording.file:
            print(f"Recording {recording_id} n'a pas de fichier")
            return
        
        file_path = recording.file.path
        output_path = file_path.replace(f'.{recording.format}', f'_trimmed.{recording.format}')
        
        # Utiliser ffmpeg pour découper
        (
            ffmpeg
            .input(file_path, ss=start_time, t=end_time - start_time)
            .output(output_path)
            .overwrite_output()
            .run(quiet=True)
        )
        
        # Remplacer le fichier original par le fichier découpé
        if os.path.exists(output_path):
            os.replace(output_path, file_path)
            recording.duration_seconds = end_time - start_time
            recording.save()
            
            # Relancer le traitement
            process_recording(recording_id)
        
        print(f"Trim terminé pour l'enregistrement {recording_id}")
        
    except Recording.DoesNotExist:
        print(f"Enregistrement {recording_id} introuvable")
    except Exception as e:
        print(f"Erreur lors du trim de l'enregistrement {recording_id}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise


def purge_expired():
    """
    Supprime les enregistrements expirés (retained_until dépassé)
    """
    from django.utils import timezone
    
    expired_recordings = Recording.objects.filter(
        retained_until__lt=timezone.now()
    )
    
    count = 0
    for recording in expired_recordings:
        if recording.file:
            try:
                os.remove(recording.file.path)
            except:
                pass
        recording.delete()
        count += 1
    
    print(f"{count} enregistrements expirés supprimés")
    return count


def send_alert_email(recording_id, unnatural_silences):
    """
    Envoie un email d'alerte si des blancs non naturels sont détectés
    """
    try:
        recording = Recording.objects.get(id=recording_id)
        
        # Vérifier si les alertes email sont activées pour cet utilisateur
        email_enabled = False
        email_config = {}
        try:
            user_settings = recording.user.user_settings
            email_enabled = user_settings.email_alerts_enabled
            if email_enabled:
                email_config = {
                    'host': user_settings.email_host or settings.EMAIL_HOST,
                    'port': user_settings.email_port or settings.EMAIL_PORT,
                    'user': user_settings.email_user or settings.EMAIL_HOST_USER,
                    'password': user_settings.email_password or settings.EMAIL_HOST_PASSWORD,
                }
        except UserSettings.DoesNotExist:
            # Fallback sur les settings globaux
            email_enabled = bool(settings.EMAIL_HOST)
            email_config = {
                'host': settings.EMAIL_HOST,
                'port': settings.EMAIL_PORT,
                'user': settings.EMAIL_HOST_USER,
                'password': settings.EMAIL_HOST_PASSWORD,
            }
        
        if not email_enabled or not email_config.get('host'):
            print(f"Alertes email désactivées pour l'enregistrement {recording_id}")
            return
        
        if not recording.user.email:
            print(f"Pas d'email pour l'utilisateur {recording.user.username}")
            return
        
        subject = f'Alerte: Blancs détectés dans {recording.title or "enregistrement"}'
        message = f"""
Des blancs non naturels ont été détectés dans l'enregistrement:

Titre: {recording.title or "Sans titre"}
Type: {recording.type}
Date: {recording.created_at}

Blancs détectés:
{json.dumps(unnatural_silences, indent=2)}
"""
        
        # Utiliser la configuration email de l'utilisateur ou globale
        try:
            send_mail(
                subject,
                message,
                email_config.get('user', settings.DEFAULT_FROM_EMAIL),
                [recording.user.email],
                fail_silently=False,
            )
            print(f"Email d'alerte envoyé pour l'enregistrement {recording_id}")
        except Exception as e:
            print(f"Erreur lors de l'envoi de l'email: {str(e)}")
        
    except Recording.DoesNotExist:
        print(f"Enregistrement {recording_id} introuvable")
    except Exception as e:
        print(f"Erreur lors de l'envoi de l'email: {str(e)}")
        import traceback
        traceback.print_exc()
