from fastapi import APIRouter, Depends
from app.schemas.ai import (
    PatientAnalysisRequest, PatientAnalysisResponse,
    DoctorAnalysisRequest, DoctorAnalysisResponse,
    AdminAnalysisRequest, AdminAnalysisResponse
)
from app.services.integration_service import IntegrationService
from app.services.ai_service import AIService
from app.core.security import require_role

router = APIRouter(prefix="/api/v1/ai", tags=["AI Analytics"])
ai_service = AIService()

@router.post("/patient/analyze", response_model=PatientAnalysisResponse)
def analyze_patient(request: PatientAnalysisRequest):
    patient_id = request.patient_id
    errors = []
    
    patient_prof, patient_hist = IntegrationService.get_patient_details(patient_id)
    if patient_prof is None:
        errors.append("Could not reach Patient Service for profile data.")
    if patient_hist is None:
        errors.append("Could not reach Patient Service for medical history.")
        
    summary_dict = None
    if patient_prof:
        summary_dict = {
            "name": f"{patient_prof.get('firstName', '')} {patient_prof.get('lastName', '')}",
            "age": patient_prof.get('dateOfBirth', 'Unknown')
        }
            
    analysis_result = ai_service.analyze_for_patient(
        symptoms=request.symptoms,
        description=request.description,
        profile=patient_prof,
        history=patient_hist
    )
    
    recommended_doctors = IntegrationService.get_doctors_by_specialty(
        specialty=analysis_result.recommended_specialty
    )
    if recommended_doctors is None and analysis_result.recommended_specialty:
        errors.append("Could not reach Doctor Service for recommended doctors.")
        recommended_doctors = []

    analysis_result.available_doctors = recommended_doctors
    analysis_result.patient_summary = summary_dict
    analysis_result.service_errors = errors
    
    return analysis_result

@router.post("/doctor/analyze", response_model=DoctorAnalysisResponse)
def analyze_doctor(request: DoctorAnalysisRequest):
    patient_id = request.patient_id
    errors = []
    
    patient_prof, patient_hist = IntegrationService.get_patient_details(patient_id)
    if patient_prof is None:
        errors.append("Could not reach Patient Service for profile data.")
    if patient_hist is None:
        errors.append("Could not reach Patient Service for medical history.")
        
    summary_dict = None
    if patient_prof:
        summary_dict = {
            "name": f"{patient_prof.get('firstName', '')} {patient_prof.get('lastName', '')}",
            "bloodGroup": patient_prof.get('bloodGroup', 'Unknown'),
            "age": patient_prof.get('dateOfBirth', 'Unknown')
        }
        
    reports = IntegrationService.get_patient_reports_meta(patient_id)
    if reports is None: # Assuming we update IntegrationService to return None on fail
        errors.append("Could not reach Patient Service for medical reports.")
        reports = []
        
    prescriptions = IntegrationService.get_patient_prescriptions(patient_id)
    if prescriptions is None:
        errors.append("Could not reach Doctor Service for prescriptions.")
        prescriptions = []
    
    analysis_result = ai_service.analyze_for_doctor(
        notes=request.professional_notes,
        profile=patient_prof,
        history=patient_hist,
        reports=reports,
        prescriptions=prescriptions
    )
    
    analysis_result.patient_summary = summary_dict
    analysis_result.service_errors = errors
    return analysis_result

@router.post("/admin/analyze", response_model=AdminAnalysisResponse)
def analyze_admin(request: AdminAnalysisRequest):
    errors = []
    appointments = IntegrationService.get_all_appointments()
    payments = IntegrationService.get_all_payments()
    
    # Simple check for demo purposes
    if appointments is None: errors.append("Could not reach Appointment Service.")
    if payments is None: errors.append("Could not reach Payment Service.")

    analysis_result = ai_service.analyze_for_admin(
        query=request.query,
        appointments=appointments if appointments else [],
        payments=payments if payments else []
    )
    
    analysis_result.service_errors = errors
    return analysis_result
