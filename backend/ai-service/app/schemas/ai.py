from pydantic import BaseModel, Field
from typing import List, Optional, Any

# --- PATIENT ---
class PatientAnalysisRequest(BaseModel):
    patient_id: str
    symptoms: str
    description: Optional[str] = None

# Internal schema: what the LLM produces (no service data)
class PatientLLMOutput(BaseModel):
    analysis: str = Field(description="Patient-friendly medical analysis of the symptoms.")
    recommended_actions: List[str] = Field(description="Actions the patient should take.")
    recommended_specialty: str = Field(description="The single medical specialty most relevant to these symptoms (e.g. 'Cardiologist', 'Neurologist', 'Dermatologist').")

# API response schema: LLM output + data fetched from other services
class PatientAnalysisResponse(BaseModel):
    patient_summary: Optional[dict] = None
    analysis: str
    recommended_actions: List[str]
    recommended_specialty: str
    available_doctors: List[dict] = []
    service_errors: List[str] = []

# --- DOCTOR ---
class DoctorAnalysisRequest(BaseModel):
    patient_id: str
    professional_notes: str

class DoctorAnalysisResponse(BaseModel):
    patient_summary: Optional[dict] = None
    clinical_analysis: str = Field(description="Technical and clinical analysis of the patient's condition for the doctor.")
    differential_diagnosis: List[str] = Field(description="Potential alternative technical diagnoses.")
    investigation_recommendations: List[str] = Field(description="Recommended laboratory or imaging tests.")
    service_errors: List[str] = []

# --- ADMIN ---
class AdminAnalysisRequest(BaseModel):
    query: str = Field(description="What the admin wants to analyze (e.g. 'Trend of specialities booked this month').")

class AdminAnalysisResponse(BaseModel):
    operational_insight: str = Field(description="Business and operational analysis derived from appointments and payments.")
    actionable_metrics: List[str] = Field(description="Key bullet points for admin to address.")
    service_errors: List[str] = []
