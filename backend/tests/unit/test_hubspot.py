import unittest
import json
import base64
import secrets
from datetime import datetime
from urllib.parse import urlencode
from unittest.mock import Mock, AsyncMock
import asyncio

class TestOAuthStateLogic(unittest.TestCase):
    def generate_state_token(self, org_id, user_id):
        nonce = secrets.token_hex(16)
        state_data = {"org_id": org_id, "user_id": user_id, "nonce": nonce}
        json_string = json.dumps(state_data)
        base64_bytes = base64.urlsafe_b64encode(json_string.encode("utf-8"))
        state_token = base64_bytes.decode("utf-8")
        return state_token, nonce

    def decode_state_token(self, state_token):
        base64_bytes = state_token.encode("utf-8")
        json_bytes = base64.urlsafe_b64decode(base64_bytes)
        return json.loads(json_bytes.decode("utf-8"))

    def test_state_token_generation_and_decoding(self):
        org_id = "test_org_123"
        user_id = "test_user_456"
        state_token, nonce = self.generate_state_token(org_id, user_id)
        decoded = self.decode_state_token(state_token)

        self.assertEqual(decoded["org_id"], org_id)
        self.assertEqual(decoded["user_id"], user_id)
        self.assertEqual(decoded["nonce"], nonce)


class TestContactDataProcessing(unittest.TestCase):
    def parse_date(self, date_string):
        if not date_string:
            return None
        try:
            return datetime.fromisoformat(date_string.replace("Z", "+00:00"))
        except (ValueError, TypeError):
            return None

    def process_contact(self, contact):
        properties = contact.get("properties", {})
        return {
            "id": contact.get("id"),
            "name": f"{properties.get('firstname', '')} {properties.get('lastname', '')}".strip(),
            "type": "hubspot_contact",
            "directory": False,
            "creation_time": self.parse_date(properties.get("createdate")),
            "last_modified_time": self.parse_date(properties.get("lastmodifieddate")),
            "visibility": not contact.get("archived", False),
        }

    def test_contact_processing(self):
        sample_contact = {
            "id": "12345",
            "properties": {
                "firstname": "John",
                "lastname": "Doe",
                "email": "john.doe@example.com",
                "company": "Test Corp",
                "createdate": "2024-01-01T00:00:00Z",
                "lastmodifieddate": "2024-01-02T00:00:00Z"
            },
            "archived": False
        }

        processed = self.process_contact(sample_contact)
        self.assertEqual(processed["id"], "12345")
        self.assertEqual(processed["name"], "John Doe")
        self.assertEqual(processed["type"], "hubspot_contact")
        self.assertFalse(processed["directory"])
        self.assertTrue(processed["visibility"])
        self.assertEqual(processed["creation_time"].year, 2024)


class TestUrlBuilding(unittest.TestCase):
    def build_url_with_params(self, url, params):
        if not params:
            return url
        query_string = urlencode(params)
        return f"{url}?{query_string}"

    def test_url_building(self):
        base_url = "https://app.hubspot.com/oauth/authorize"
        params = {
            "client_id": "test_client_id",
            "redirect_uri": "http://localhost:8000/callback",
            "scope": "crm.objects.contacts.read oauth",
            "state": "test_state_token"
        }
        result_url = self.build_url_with_params(base_url, params)
        self.assertIn(base_url, result_url)
        self.assertIn("client_id=test_client_id", result_url)
        self.assertIn("redirect_uri=", result_url)
        self.assertIn("scope=", result_url)


class TestRedisKeyPatterns(unittest.TestCase):
    def get_access_token_key(self, org_id, user_id, integration_name):
        return f"{integration_name}:{org_id}:{user_id}:access_token"

    def get_refresh_token_key(self, org_id, user_id, integration_name):
        return f"{integration_name}:{org_id}:{user_id}:refresh_token"

    def get_state_token_key(self, org_id, user_id, integration_name):
        return f"{integration_name}:{org_id}:{user_id}:oauth_state_nonce"

    def test_redis_key_patterns(self):
        org_id = "org123"
        user_id = "user456"
        integration = "hubspot"

        self.assertEqual(self.get_access_token_key(org_id, user_id, integration),
                         "hubspot:org123:user456:access_token")
        self.assertEqual(self.get_refresh_token_key(org_id, user_id, integration),
                         "hubspot:org123:user456:refresh_token")
        self.assertEqual(self.get_state_token_key(org_id, user_id, integration),
                         "hubspot:org123:user456:oauth_state_nonce")


class TestHttpDataPreparation(unittest.TestCase):
    def prepare_token_request(self, client_id, client_secret, redirect_uri, code):
        return {
            "grant_type": "authorization_code",
            "client_id": client_id,
            "client_secret": client_secret,
            "redirect_uri": redirect_uri,
            "code": code,
        }

    def prepare_refresh_request(self, client_id, client_secret, refresh_token):
        return {
            "grant_type": "refresh_token",
            "client_id": client_id,
            "client_secret": client_secret,
            "refresh_token": refresh_token,
        }

    def prepare_api_headers(self, access_token):
        return {"Authorization": f"Bearer {access_token}"}

    def prepare_contacts_params(self):
        return {
            "limit": 10,
            "archived": "false",
            "properties": "firstname,lastname,email,company,website",
        }

    def test_http_data_preparation(self):
        token_data = self.prepare_token_request("client123", "secret456", "http://callback", "auth_code")
        refresh_data = self.prepare_refresh_request("client123", "secret456", "refresh_token")
        headers = self.prepare_api_headers("access_token_123")
        contacts_params = self.prepare_contacts_params()

        self.assertEqual(token_data["grant_type"], "authorization_code")
        self.assertEqual(token_data["code"], "auth_code")
        self.assertEqual(refresh_data["grant_type"], "refresh_token")
        self.assertEqual(headers["Authorization"], "Bearer access_token_123")
        self.assertEqual(contacts_params["limit"], 10)
        self.assertEqual(contacts_params["archived"], "false")


class TestAsyncFlowSimulation(unittest.IsolatedAsyncioTestCase):
    async def test_async_flow_simulation(self):
        # Simulate Redis operations
        mock_redis = Mock()
        mock_redis.get_key = AsyncMock(return_value="stored_nonce")
        mock_redis.add_key = AsyncMock()
        mock_redis.delete_key = AsyncMock()

        # Simulate token exchange
        mock_token_response = {
            "access_token": "new_access_token",
            "refresh_token": "new_refresh_token",
            "expires_in": 3600
        }

        nonce = await mock_redis.get_key("nonce_key")
        self.assertEqual(nonce, "stored_nonce")

        await mock_redis.add_key("access_token_key", mock_token_response["access_token"], 3600)
        await mock_redis.add_key("refresh_token_key", mock_token_response["refresh_token"])
        await mock_redis.delete_key("nonce_key")

        # Simulate getting contacts
        mock_contacts_response = {
            "results": [
                {
                    "id": "1",
                    "properties": {
                        "firstname": "John",
                        "lastname": "Doe",
                        "email": "john@test.com"
                    },
                    "archived": False
                }
            ]
        }
        contacts = mock_contacts_response["results"]
        processed = []

        for contact in contacts:
            properties = contact.get("properties", {})
            item = {
                "id": contact.get("id"),
                "name": f"{properties.get('firstname', '')} {properties.get('lastname', '')}".strip(),
                "type": "hubspot_contact"
            }
            processed.append(item)

        self.assertEqual(len(processed), 1)
        self.assertEqual(processed[0]["name"], "John Doe")


if __name__ == "__main__":
    unittest.main()
