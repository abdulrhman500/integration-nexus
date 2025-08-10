from typing import Optional
from pydantic import BaseModel, Field, model_validator
import re


def strip_string(value: Optional[str]) -> Optional[str]:
    if value is not None and isinstance(value, str):
        return value.strip()
    return value


def validate_id_field(name: str, value: str) -> str:
    if len(value) < 3:
        raise ValueError(f"{name} must be at least 3 characters long")
    if not re.match(r'^[a-zA-Z0-9-_]+$', value):
        raise ValueError(f"{name} can only contain alphanumeric characters, dashes, and underscores")
    return value


class OAuthCallbackRequestDTO(BaseModel):
    code: Optional[str] = Field(None, description="On success: The temporary authorization code")
    state: str = Field(..., description="state value to prevent CSRF attacks")
    error: Optional[str] = Field(None, description="On failure: error code.")
    error_description: Optional[str] = Field(None, description="On failure: error description")

    @model_validator(mode="before")
    @classmethod
    def strip_strings(cls, values):
        for key in ['code', 'state', 'error', 'error_description']:
            if key in values:
                values[key] = strip_string(values[key])
        return values

    @model_validator(mode="after")
    def check_code_or_error(self): # CORRECTED: Changed signature to accept self
        if not self.code and not self.error:
            raise ValueError("OAuth callback is missing 'code' or 'error'")
        return self # CORRECTED: Must return self


class UserOrgParamsDTO(BaseModel):
    user_id: str = Field(..., description="User ID")
    org_id: str = Field(..., description="Organization ID")

    @model_validator(mode="before")
    @classmethod
    def strip_strings(cls, values):
        for key in ['user_id', 'org_id']:
            if key in values:
                values[key] = strip_string(values[key])
        return values

    @model_validator(mode="after")
    def validate_fields(self): 
        self.user_id = validate_id_field('user_id', self.user_id)
        self.org_id = validate_id_field('org_id', self.org_id)
        return self 


class HubSpotTokenResponseDTO(BaseModel):
    token_type: str = Field(..., description="Type of the token, e.g. bearer")
    refresh_token: str = Field(..., description="Refresh token for obtaining new access tokens")
    access_token: str = Field(..., description="Access token used for API authorization")
    expires_in: int = Field(..., description="Number of seconds until the access token expires")