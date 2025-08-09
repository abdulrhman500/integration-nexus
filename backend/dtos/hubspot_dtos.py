from typing import Optional
from pydantic import BaseModel, Field, model_validator

class AuthorizeDTO(BaseModel):
    code: Optional[str] = Field(None, description="On success: The temporary authorization code")
    state: str = Field(..., description="The state value sent by the user browser at the beginning to prevent CSRF attacks")
    error: Optional[str] = Field(None, description="On failure: error code.")
    error_description: Optional[str] = Field(None, description="On failure: error description")
    
    @model_validator(mode='before')
    def check_code_error(_, values):
        code = values['code']
        error = values['error']
        
        if code and error:
            raise ValueError("Only one of 'code' or 'error' should be set, not both")
        if not code and not error:
            raise ValueError("Either 'code' or 'error' must be provided")
        return values



class HubSpotTokenResponseDTO(BaseModel):
    token_type: str = Field(..., description="Type of the token, e.g. bearer")
    refresh_token: str = Field(..., description="Refresh token for obtaining new access tokens")
    access_token: str = Field(..., description="Access token used for API authorization")
    expires_in: int = Field(..., description="Number of seconds until the access token expires")    