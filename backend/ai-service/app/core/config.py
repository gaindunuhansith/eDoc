import os
import base64
import textwrap
from pathlib import Path
from dotenv import load_dotenv

# Load .env from the ai-service root regardless of where the process is launched from
_env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(_env_path, override=True)

class Settings:
    PROJECT_NAME: str = "eDoc AI Service"
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    PATIENT_SERVICE_URL: str = os.getenv("PATIENT_SERVICE_URL", "http://localhost:8084")
    DOCTOR_SERVICE_URL: str = os.getenv("DOCTOR_SERVICE_URL", "http://localhost:8082")
    APPOINTMENT_SERVICE_URL: str = os.getenv("APPOINTMENT_SERVICE_URL", "http://localhost:8081")
    PAYMENT_SERVICE_URL: str = os.getenv("PAYMENT_SERVICE_URL", "http://localhost:8085")

    JWT_PUBLIC_KEY_BASE64: str = os.getenv("JWT_PUBLIC_KEY_BASE64", "")
    PUBLIC_KEY_PATH: str = os.getenv("PUBLIC_KEY_PATH", "secrets/public.pem")

    @property
    def RS256_PUBLIC_KEY(self) -> str:
        jwt_key_b64 = os.getenv("JWT_PUBLIC_KEY_BASE64", "") or self.JWT_PUBLIC_KEY_BASE64
        if jwt_key_b64:
            normalized = (
                jwt_key_b64
                .replace("-----BEGIN PUBLIC KEY-----", "")
                .replace("-----END PUBLIC KEY-----", "")
                .replace("\n", "")
                .replace("\r", "")
                .replace(" ", "")
            )
            try:
                der_bytes = base64.b64decode(normalized, validate=True)
                pem_body = base64.b64encode(der_bytes).decode("ascii")
                wrapped = "\n".join(textwrap.wrap(pem_body, 64))
                return f"-----BEGIN PUBLIC KEY-----\n{wrapped}\n-----END PUBLIC KEY-----\n"
            except Exception:
                return ""

        try:
            with open(self.PUBLIC_KEY_PATH, "r") as f:
                return f.read()
        except Exception:
            return ""

settings = Settings()
