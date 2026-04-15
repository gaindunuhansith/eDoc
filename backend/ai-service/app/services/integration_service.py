from app.core.config import settings
from app.utils.http_client import HTTPClient
from typing import Tuple, Dict, List, Optional, Any

class IntegrationService:
    @staticmethod
    def get_patient_details(patient_id: int) -> Tuple[Optional[Dict], Optional[List]]:
        url_profile = f"{settings.PATIENT_SERVICE_URL}/internal/patients/{patient_id}"
        url_history = f"{settings.PATIENT_SERVICE_URL}/internal/patients/{patient_id}/history"
        
        profile = HTTPClient.get(url_profile)
        history = HTTPClient.get(url_history)
        
        return profile, history

    @staticmethod
    def get_doctors_by_specialty(specialty: str) -> List[Dict]:
        url = f"{settings.DOCTOR_SERVICE_URL}/api/doctors/specialty/{specialty}"
        doctors = HTTPClient.get(url)
        return doctors if doctors else []
