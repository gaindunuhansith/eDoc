from fastapi import APIRouter, Depends, Request
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
def analyze_patient(
    request: PatientAnalysisRequest,
    http_request: Request,
    _auth: dict = Depends(require_role("PATIENT"))
):
    token = http_request.headers.get("Authorization")
    errors = []

    # --- Step 1: Fetch patient profile, then call LLM ---
    patient_prof, _ = IntegrationService.get_patient_details(request.patient_id, token=token)
    if patient_prof is None:
        errors.append("Could not reach Patient Service for profile data.")

    patient_summary = None
    if patient_prof:
        full_name = patient_prof.get("name")
        if not full_name:
            full_name = f"{patient_prof.get('firstName', '')} {patient_prof.get('lastName', '')}".strip()
        patient_summary = {
            "name": full_name,
            "dateOfBirth": patient_prof.get('dateOfBirth', 'Unknown'),
            "gender": patient_prof.get('gender', 'Unknown'),
            "bloodGroup": patient_prof.get('bloodGroup', 'Unknown'),
        }

    llm_result = ai_service.analyze_for_patient(
        symptoms=request.symptoms,
        description=request.description,
        profile=patient_prof,
    )

    # --- Step 2: Fetch available doctors by specialty (requires JWT — forward token) ---
    available_doctors = IntegrationService.get_doctors_by_specialty(
        specialty=llm_result.recommended_specialty,
        token=token,
    )
    if available_doctors is None:
        errors.append(f"Could not reach Doctor Service for specialty '{llm_result.recommended_specialty}'.")
        available_doctors = []

    return PatientAnalysisResponse(
        patient_summary=patient_summary,
        analysis=llm_result.analysis,
        recommended_actions=llm_result.recommended_actions,
        recommended_specialty=llm_result.recommended_specialty,
        available_doctors=available_doctors,
        service_errors=errors,
    )

@router.post("/doctor/analyze", response_model=DoctorAnalysisResponse)
def analyze_doctor(
    request: DoctorAnalysisRequest,
    http_request: Request,
    _auth: dict = Depends(require_role("DOCTOR"))
):
    token = http_request.headers.get("Authorization")
    patient_id = request.patient_id
    errors = []

    patient_prof, patient_hist = IntegrationService.get_patient_details(patient_id, token=token)
    if patient_prof is None:
        errors.append("Could not reach Patient Service for profile data.")
    if patient_hist is None:
        errors.append("Could not reach Patient Service for medical history.")

    summary_dict = None
    if patient_prof:
        full_name = patient_prof.get("name")
        if not full_name:
            full_name = f"{patient_prof.get('firstName', '')} {patient_prof.get('lastName', '')}".strip()
        summary_dict = {
            "name": full_name,
            "bloodGroup": patient_prof.get('bloodGroup', 'Unknown'),
            "dateOfBirth": patient_prof.get('dateOfBirth', 'Unknown'),
        }

    reports = IntegrationService.get_patient_reports_meta(patient_id, token=token)
    if reports is None:
        errors.append("Could not reach Patient Service for medical reports.")
        reports = []

    # Doctor service prescriptions require JWT — forward token
    prescriptions = IntegrationService.get_patient_prescriptions(patient_id, token=token)
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
def analyze_admin(
    request: AdminAnalysisRequest,
    http_request: Request,
    _auth: dict = Depends(require_role("ADMIN"))
):
    token = http_request.headers.get("Authorization")
    errors = []

    # Appointment service is permitAll — no token needed
    appointments = IntegrationService.get_all_appointments()
    # Payment service requires JWT — forward token
    payments = IntegrationService.get_all_payments(token=token)

    if appointments is None:
        errors.append("Could not reach Appointment Service.")
    if payments is None:
        errors.append("Could not reach Payment Service.")

    analysis_result = ai_service.analyze_for_admin(
        query=request.query,
        appointments=appointments if appointments else [],
        payments=payments if payments else []
    )

    analysis_result.service_errors = errors
    return analysis_result
