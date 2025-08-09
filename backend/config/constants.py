from enum import Enum

class HTTP_METHODS(Enum):
    GET = "GET"
    POST = "POST"
    PUT = "PUT"
    DELETE = "DELETE"
    PATCH = "PATCH"
    HEAD = "HEAD"
    OPTIONS = "OPTIONS"
    TRACE = "TRACE"
    CONNECT = "CONNECT"


class HTTP_CONTENT_TYPE(Enum):
    JSON = "application/json"
    FORM = "application/x-www-form-urlencoded"
    MULTIPART = "multipart/form-data"
    TEXT = "text/plain"

class HUBSPOT_CONSTS():
    API_BASE_URL = "https://api.hubapi.com"
    
    SCOPES = "crm.objects.contacts.read oauth"
    
    OPTIONAL_SCOPES=""
    
    # The server-to-server endpoint for exchanging a code for a token
    TOKEN_URL="https://api.hubapi.com/oauth/v1/token"
    
    # The user-facing page for starting the OAuth flow
    USER_AUTHORIZATION_REDIRECT_URL=""
    
    CONTACTS_API_URL = f"{API_BASE_URL}/crm/v3/objects/contacts"
    
    INTEGRATION_NAME= "hubspot"
    
    
    
        
