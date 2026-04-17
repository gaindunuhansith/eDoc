from app.core.config import settings
from app.utils.http_client import HTTPClient
from typing import Tuple, Dict, List, Optional

class IntegrationService:
    @staticmethod
    def get_patient_details(patient_id: str) -> Tuple[Optional[Dict], Optional[List]]:
        url_profile = f"{settings.PATIENT_SERVICE_URL}/internal/patients/{patient_id}"
        url_history = f"{settings.PATIENT_SERVICE_URL}/internal/patients/{patient_id}/history"
        
        profile = HTTPClient.get(url_profile)
        history = HTTPClient.get(url_history)
        
        return profile, history

    @staticmethod
    def get_patient_reports_meta(patient_id: str) -> Optional[List[Dict]]:
        url = f"{settings.PATIENT_SERVICE_URL}/internal/patients/{patient_id}/reports"
        return HTTPClient.get(url)
        
    @staticmethod
    def get_patient_prescriptions(patient_id: str) -> Optional[List[Dict]]:
        url = f"{settings.DOCTOR_SERVICE_URL}/api/v1/prescriptions/patient/{patient_id}"
        return HTTPClient.get(url)

    @staticmethod
    def get_doctors_by_specialty(specialty: str) -> Optional[List[Dict]]:
        url = f"{settings.DOCTOR_SERVICE_URL}/api/v1/doctors/specialty/{specialty}"
        return HTTPClient.get(url)

    @staticmethod
    def get_all_appointments() -> Optional[List[Dict]]:
        url = f"{settings.APPOINTMENT_SERVICE_URL}/api/v1/appointments"
        return HTTPClient.get(url)
        
    @staticmethod
    def get_all_payments() -> Optional[List[Dict]]:
        url = f"{settings.PAYMENT_SERVICE_URL}/api/v1/payments"
        return HTTPClient.get(url)
