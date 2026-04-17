from fastapi import HTTPException
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
import json
import re
from app.schemas.ai import PatientLLMOutput, DoctorAnalysisResponse, AdminAnalysisResponse
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

    def analyze_for_patient(self, symptoms: str, description: str = None, profile: dict = None) -> PatientLLMOutput:
        """
        Step 1: Call LLM with patient symptoms + profile.
        Returns recommended specialty and analysis. No service data here.
        """
        system = (
            "You are a friendly, empathetic medical AI assistant. "
            "A patient has described their symptoms. Using the symptoms and their profile, "
            "provide a clear patient-friendly analysis, recommended actions, and identify the single "
            "most appropriate medical specialty they should consult."
        )
        patient_context = ""
        if profile:
            patient_context = (
                f"\nPatient Profile:\n"
                f"  Name: {profile.get('firstName', '')} {profile.get('lastName', '')}\n"
                f"  Date of Birth: {profile.get('dateOfBirth', 'Unknown')}\n"
                f"  Gender: {profile.get('gender', 'Unknown')}\n"
                f"  Blood Group: {profile.get('bloodGroup', 'Unknown')}\n"
            )

        human = (
            f"Symptoms: {symptoms}\n"
            f"Additional description: {description or 'None'}"
            f"{patient_context}"
        )

        prompt = ChatPromptTemplate.from_messages([
            ("system", system),
            ("human", "{input_text}")
        ])
        chain = prompt | self.llm_versatile.with_structured_output(PatientLLMOutput)

        try:
            return chain.invoke({"input_text": human})
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Patient AI Error: {str(e)}")

    def analyze_for_doctor(self, notes: str, profile: dict = None, history: list = None, reports: list = None, prescriptions: list = None) -> DoctorAnalysisResponse:
        system = "You are an advanced clinical diagnostic AI assisting a doctor. Provide a highly technical differential diagnosis, clinical analysis, and recommend medical investigations based on the data provided."
        human = (
            f"Doctor's Notes: {notes}\n\n"
            f"Profile: {json.dumps(profile or {}, default=str)}\n"
            f"History: {json.dumps(history or [], default=str)}\n"
            f"Reports Metadata: {json.dumps(reports or [], default=str)}\n"
            f"Past Prescriptions: {json.dumps(prescriptions or [], default=str)}"
        )
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", system),
            ("human", "{input_text}")
        ])
        chain = prompt | self.llm_versatile.with_structured_output(DoctorAnalysisResponse)
        
        try:
            return chain.invoke({"input_text": human})
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Doctor AI Error: {str(e)}")

    def analyze_for_admin(self, query: str, appointments: list = None, payments: list = None) -> AdminAnalysisResponse:
        cleaned_query = (query or "").strip()

        # Return a conversational response for greetings/small-talk so the admin assistant
        # doesn't force irrelevant analytics when the user is not asking for metrics.
        if self._is_small_talk_query(cleaned_query):
            return AdminAnalysisResponse(
                operational_insight=(
                    "Hello. I can help with eDoc operations insights such as appointment trends, "
                    "payment status patterns, cancellation rates, doctor load, and revenue summaries. "
                    "Ask a specific analytics question to get actionable metrics."
                ),
                actionable_metrics=[],
                service_errors=[]
            )

        system = (
            "You are a healthcare business intelligence AI for eDoc admins. "
            "If the query is operational/analytics-related, analyze the provided appointments and payments data. "
            "If the query is not analytics-related, do not invent metrics: provide a brief helpful redirection in "
            "operational_insight and keep actionable_metrics empty."
        )
        # Keep payload compact to avoid provider token-limit errors.
        def normalize_records(payload):
            if payload is None:
                return []
            if isinstance(payload, list):
                return payload
            if isinstance(payload, dict):
                for key in ["content", "items", "data", "results"]:
                    value = payload.get(key)
                    if isinstance(value, list):
                        return value
                return [payload]
            return [payload]

        all_appointments = normalize_records(appointments)
        all_payments = normalize_records(payments)

        appointments_sample = all_appointments[:25]
        payments_sample = all_payments[:25]

        def compact_record(record: dict) -> dict:
            if not isinstance(record, dict):
                return {"value": str(record)[:120]}

            compact = {}
            for key in list(record.keys())[:8]:
                value = record.get(key)
                if isinstance(value, (dict, list)):
                    compact[key] = str(value)[:120]
                elif isinstance(value, str):
                    compact[key] = value[:120]
                else:
                    compact[key] = value
            return compact

        compact_appointments = [compact_record(item) for item in appointments_sample]
        compact_payments = [compact_record(item) for item in payments_sample]

        human = (
            f"Query: {query}\n\n"
            f"Appointments Count: {len(all_appointments)}, Sample Included: {len(compact_appointments)}\n"
            f"Appointments Data Sample: {json.dumps(compact_appointments, default=str)}\n"
            f"Payments Count: {len(all_payments)}, Sample Included: {len(compact_payments)}\n"
            f"Payments Data Sample: {json.dumps(compact_payments, default=str)}"
        )
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", system),
            ("human", "{input_text}")
        ])
        chain = prompt | self.llm_versatile.with_structured_output(AdminAnalysisResponse)
        
        try:
            return chain.invoke({"input_text": human})
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Admin AI Error: {str(e)}")

    @staticmethod
    def _is_small_talk_query(query: str) -> bool:
        if not query:
            return True

        normalized = query.strip().lower()
        simple_phrases = {
            "hi", "hello", "hey", "yo", "hola", "sup",
            "how are you", "how r u", "thanks", "thank you", "ok", "okay"
        }

        if normalized in simple_phrases:
            return True

        # Very short non-analytic prompts are likely small-talk.
        if len(normalized.split()) <= 2 and not re.search(
            r"(trend|analytics|metric|kpi|revenue|payment|appointment|cancel|no show|doctor|patient|dashboard)",
            normalized
        ):
            return True

        return False
