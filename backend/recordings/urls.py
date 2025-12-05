from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RecordingViewSet, SignupViewSet, UserSettingsViewSet

router = DefaultRouter()
router.register(r'recordings', RecordingViewSet, basename='recording')
router.register(r'signup', SignupViewSet, basename='signup')
router.register(r'settings', UserSettingsViewSet, basename='settings')

urlpatterns = [
    path('', include(router.urls)),
]
