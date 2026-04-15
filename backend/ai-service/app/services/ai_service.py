from fastapi import HTTPException
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from app.schemas.ai import PatientAnalysisResponse, DoctorAnalysisResponse, AdminAnalysisResponse
from app.core.config import settings

class AIService:
    def __init__(self):
        if not settings.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY is missing from environment variables.")
        self.llm_versatile = ChatGroq(
            api_key=settings.GROQ_API_KEY,
            model="llama-3.3-70b-versatile", 
            temperature=0.0
        )

    def analyze_for_patient(self, symptoms: str, description: str = None, profile: dict = None, history: list = None) -> PatientAnalysisResponse:
        system = "You are a friendly, empathetic medical AI assistant for patients. Analyze their symptoms and history to provide a clear, non-jargon preliminary diagnosis and recommend the medical specialty they need."
        human = f"Symptoms: {symptoms}\nDescription: {description}\n\nProfile: {profile}\nHistory: {history}"
        
        prompt = ChatPromptTemplate.from_messages([("system", system), ("human", human)])
        chain = prompt | self.llm_versatile.with_structured_output(PatientAnalysisResponse)
        
        try:
            return chain.invoke({})
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Patient AI Error: {str(e)}")

    def analyze_for_doctor(self, notes: str, profile: dict = None, history: list = None, reports: list = None, prescriptions: list = None) -> DoctorAnalysisResponse:
        system = "You are an advanced clinical diagnostic AI assisting a doctor. Provide a highly technical differential diagnosis, clinical analysis, and recommend medical investigations based on the data provided."
        human = f"Doctor's Notes: {notes}\n\nProfile: {profile}\nHistory: {history}\nReports Metadata: {reports}\nPast Prescriptions: {prescriptions}"
        
        prompt = ChatPromptTemplate.from_messages([("system", system), ("human", human)])
        chain = prompt | self.llm_versatile.with_structured_output(DoctorAnalysisResponse)
        
        try:
            return chain.invoke({})
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Doctor AI Error: {str(e)}")

    def analyze_for_admin(self, query: str, appointments: list = None, payments: list = None) -> AdminAnalysisResponse:
        system = "You are a healthcare business intelligence AI. Analyze the provided operational data (appointments and payments) based on the query to extract actionable business insights."
        # Truncate lists if too massive in a real scenario, but pass them for now
        human = f"Query: {query}\n\nAppointments Data: {appointments}\nPayments Data: {payments}"
        
        prompt = ChatPromptTemplate.from_messages([("system", system), ("human", human)])
        chain = prompt | self.llm_versatile.with_structured_output(AdminAnalysisResponse)
        
        try:
            return chain.invoke({})
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Admin AI Error: {str(e)}")
