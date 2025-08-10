from typing import Optional
from pydantic import BaseModel, Field, model_validator


class OAuthCallbackRequestDTO(BaseModel):
    code: Optional[str] = Field(
        None, description="On success: The temporary authorization code"
    )
    state: str = Field(
        ...,
        description="The state value sent by the user browser at the beginning to prevent CSRF attacks",
    )
    error: Optional[str] = Field(None, description="On failure: error code.")
    error_description: Optional[str] = Field(
        None, description="On failure: error description"
    )

    @model_validator(mode="after")
    def check_code_and_error_exist(self):
        if not self.code and not self.error:
            raise ValueError("OAuth callback is missing 'code' or 'error'")
        return self


class HubSpotTokenResponseDTO(BaseModel):
    token_type: str = Field(..., description="Type of the token, e.g. bearer")
    refresh_token: str = Field(
        ..., description="Refresh token for obtaining new access tokens"
    )
    access_token: str = Field(
        ..., description="Access token used for API authorization"
    )
    expires_in: int = Field(
        ..., description="Number of seconds until the access token expires"
    )


class HubSpotAuthorizeRequestDTO(BaseModel):
    user_id: str
    org_id: str
