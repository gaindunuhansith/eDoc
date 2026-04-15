from fastapi import APIRouter
from app.schemas.ai import AIRequest, AIResponse
from app.services.integration_service import IntegrationService
from app.services.ai_service import AIService

router = APIRouter(prefix="/api/v1/ai", tags=["AI Diagnostics"])

ai_service = AIService()

@router.post("/analyze", response_model=AIResponse)
def analyze(request: AIRequest):
    patient_prof, patient_hist = None, None
    summary_dict = None
    
    if request.patient_id:
        patient_prof, patient_hist = IntegrationService.get_patient_details(request.patient_id)
        if patient_prof:
            summary_dict = {
                "name": f"{patient_prof.get('firstName', '')} {patient_prof.get('lastName', '')}",
                "age": patient_prof.get('dateOfBirth', 'Unknown')
            }
            
    analysis_result = ai_service.analyze_symptoms(
        symptoms=request.symptoms,
        patient_profile=patient_prof,
        patient_history=patient_hist,
        extra_context=request.context
    )
    
    recommended_doctors = IntegrationService.get_doctors_by_specialty(
        specialty=analysis_result.recommended_specialty
    )
    
    return AIResponse(
        patient_summary=summary_dict,
        analysis=analysis_result,
        recommended_doctors=recommended_doctors
    )
