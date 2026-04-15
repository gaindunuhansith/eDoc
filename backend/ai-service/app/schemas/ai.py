from pydantic import BaseModel, Field
from typing import List, Optional, Any

# --- PATIENT ---
class PatientAnalysisRequest(BaseModel):
    patient_id: str
    symptoms: str
    description: Optional[str] = None

class PatientAnalysisResponse(BaseModel):
    patient_summary: Optional[dict] = None
    analysis: str = Field(description="Patient-friendly medical analysis.")
    recommended_actions: List[str] = Field(description="Actions patient should take.")
    recommended_specialty: str = Field(description="The precise recommended specialist type (e.g. Neurologist).")
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
