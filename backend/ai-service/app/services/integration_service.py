from app.core.config import settings
from app.utils.http_client import HTTPClient
from typing import Tuple, Dict, List, Optional

class IntegrationService:
    @staticmethod
    def get_patient_details(patient_id: str, token: Optional[str] = None) -> Tuple[Optional[Dict], Optional[List]]:
        # Patient service /api/v1/internal/** is permitAll — no token needed
        url_profile = f"{settings.PATIENT_SERVICE_URL}/api/v1/internal/patients/{patient_id}"
        url_history = f"{settings.PATIENT_SERVICE_URL}/api/v1/internal/patients/{patient_id}/history"

        profile = HTTPClient.get(url_profile, token=token)
        history = HTTPClient.get(url_history, token=token)

        return profile, history

    @staticmethod
    def get_patient_reports_meta(patient_id: str, token: Optional[str] = None) -> Optional[List[Dict]]:
        # Patient service /api/v1/internal/** is permitAll — no token needed
        url = f"{settings.PATIENT_SERVICE_URL}/api/v1/internal/patients/{patient_id}/reports"
        return HTTPClient.get(url, token=token)

    @staticmethod
    def get_patient_prescriptions(patient_id: str, token: Optional[str] = None) -> Optional[List[Dict]]:
        # Doctor service requires JWT
        url = f"{settings.DOCTOR_SERVICE_URL}/api/v1/prescriptions/patient/{patient_id}"
        return HTTPClient.get(url, token=token)

    @staticmethod
    def get_doctors_by_specialty(specialty: str, token: Optional[str] = None) -> Optional[List[Dict]]:
        # Doctor service requires JWT
        url = f"{settings.DOCTOR_SERVICE_URL}/api/v1/doctors/specialty/{specialty}"
        return HTTPClient.get(url, token=token)

    @staticmethod
    def get_all_appointments() -> Optional[List[Dict]]:
        # Appointment service is permitAll
        url = f"{settings.APPOINTMENT_SERVICE_URL}/api/v1/appointments"
        return HTTPClient.get(url)

    @staticmethod
    def get_all_payments(token: Optional[str] = None) -> Optional[List[Dict]]:
        # Payment service requires JWT
        url = f"{settings.PAYMENT_SERVICE_URL}/api/v1/payments"
        return HTTPClient.get(url, token=token)
