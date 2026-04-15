from pydantic import BaseModel, Field
from typing import List, Optional, Any

class AIRequest(BaseModel):
    patient_id: Optional[int] = None
    symptoms: str
    context: Optional[str] = None

class MedicalAnalysis(BaseModel):
    analysis: str = Field(description="A detailed medical analysis based on symptoms and patient history.")
    recommended_actions: List[str] = Field(description="3-5 recommended actions for the patient to take.")
    recommended_specialty: str = Field(description="The exact medical specialty required to treat these symptoms. For example: 'Cardiologist', 'Neurologist', 'General Practitioner', 'Dermatologist', 'Pediatrician', 'Orthopedist'. Use precisely one word if possible, or standard titles.")

class AIResponse(BaseModel):
    patient_summary: Optional[dict] = None
    analysis: MedicalAnalysis
    recommended_doctors: List[dict] = []
