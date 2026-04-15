import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "eDoc AI Service"
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    PATIENT_SERVICE_URL: str = os.getenv("PATIENT_SERVICE_URL", "http://localhost:8084")
    DOCTOR_SERVICE_URL: str = os.getenv("DOCTOR_SERVICE_URL", "http://localhost:8082")
    APPOINTMENT_SERVICE_URL: str = os.getenv("APPOINTMENT_SERVICE_URL", "http://localhost:8081")
    PAYMENT_SERVICE_URL: str = os.getenv("PAYMENT_SERVICE_URL", "http://localhost:8085")
    
    PUBLIC_KEY_PATH: str = os.getenv("PUBLIC_KEY_PATH", "secrets/public.pem")

    @property
    def RS256_PUBLIC_KEY(self) -> str:
        try:
            with open(self.PUBLIC_KEY_PATH, "r") as f:
                return f.read()
        except Exception:
            return ""

settings = Settings()
