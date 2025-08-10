import requests
import time
from urllib.parse import parse_qs, urlparse

BASE_URL = "http://localhost:8000/v1"
HUBSPOT_PREFIX = "/hubspot"

def test_server_health():
    try:
        response = requests.get(f"{BASE_URL}/docs", timeout=5)
        assert response.status_code in [200, 404]
    except requests.exceptions.ConnectionError:
        pytest.skip("Server is not running; start with: uvicorn main:app --reload")

def test_authorize_endpoint():
    url = f"{BASE_URL}{HUBSPOT_PREFIX}/oauth2/authorize"
    data = {
        "org_id": "test_org_123",
        "user_id": "test_user_456"
    }
    response = requests.post(url, data=data, allow_redirects=False, timeout=10)
    assert response.status_code in [302, 307, 308], f"Expected redirect, got {response.status_code}"
    
    redirect_url = response.headers.get('location', '')
    assert 'hubspot.com' in redirect_url or 'app.hubspot.com' in redirect_url
    
    parsed = urlparse(redirect_url)
    params = parse_qs(parsed.query)
    assert 'client_id' in params and 'state' in params

def test_credentials_endpoint_no_auth():
    url = f"{BASE_URL}{HUBSPOT_PREFIX}/credentials"
    params = {
        "user_id": "test_user_456",
        "org_id": "test_org_123"
    }
    response = requests.get(url, params=params, timeout=10)
    assert response.status_code == 404
    
    response_data = response.json()
    assert "not found" in response_data.get("detail", "").lower()

def test_items_endpoint_no_auth():
    url = f"{BASE_URL}{HUBSPOT_PREFIX}/items"
    params = {
        "user_id": "test_user_456",
        "org_id": "test_org_123"
    }
    response = requests.get(url, params=params, timeout=10)
    assert response.status_code in [401, 404]

def test_oauth_callback_endpoint_invalid():
    url = f"{BASE_URL}{HUBSPOT_PREFIX}/oauth2/callback"
    params = {
        "code": "invalid_test_code",
        "state": "invalid_test_state"
    }
    response = requests.get(url, params=params, timeout=10)
    assert response.status_code in [400, 403, 500, 302, 307, 308]


def test_openapi_spec_contains_hubspot():
    openapi_url = f"{BASE_URL}/openapi.json"
    response = requests.get(openapi_url, timeout=10)
    assert response.status_code == 200
    
    json_data = response.json()
    paths = json_data.get("paths", {})
    assert any(path.startswith("/v1/hubspot") for path in paths.keys()), "No hubspot endpoints found in OpenAPI spec"

# Optional: add a small delay between tests if needed
import pytest

@pytest.fixture(autouse=True)
def delay_between_tests():
    yield
    time.sleep(0.5)
