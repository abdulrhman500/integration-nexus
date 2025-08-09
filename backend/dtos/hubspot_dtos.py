from pydantic import BaseModel

class AuthorzeDTO(BaseModel):
    user_id: str
    org_id: str
    
    