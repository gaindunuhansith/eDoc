from fastapi import HTTPException
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from app.schemas.ai import MedicalAnalysis
from app.core.config import settings

class AIService:
    def __init__(self):
        if not settings.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY is missing from environment variables.")
        self.llm = ChatGroq(
            api_key=settings.GROQ_API_KEY,
            model="llama-3.3-70b-versatile", 
            temperature=0.0
        )
        self.system_prompt = """You are an advanced medical diagnostic assistant for eDoc.
Your goal is to carefully analyze the user's symptoms and their medical history to offer a preliminary diagnosis and suggest next steps. 
You must also confidently recommend the appropriate medical specialty the patient should consult.

You MUST format your output as a JSON object adhering to the schema requested.
Do not output markdown code blocks wrapping the JSON, just output the raw JSON."""

    def analyze_symptoms(self, symptoms: str, patient_profile: dict = None, patient_history: list = None, extra_context: str = None) -> MedicalAnalysis:
        human_prompt = f"Symptoms: {symptoms}"
        
        if patient_profile:
            human_prompt += f"\n\nPatient Details:\n{patient_profile}"
        if patient_history:
            human_prompt += f"\n\nMedical History:\n{patient_history}"
        if extra_context:
            human_prompt += f"\n\nAdditional Context:\n{extra_context}"
            
        prompt = ChatPromptTemplate.from_messages([
            ("system", self.system_prompt),
            ("human", human_prompt)
        ])
        
        structured_llm = self.llm.with_structured_output(MedicalAnalysis)
        chain = prompt | structured_llm
        
        try:
            return chain.invoke({"symptoms": symptoms})
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"AI Processing Error: {str(e)}")
