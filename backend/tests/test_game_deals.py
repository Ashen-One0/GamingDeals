"""Backend tests for Game Deals API.

Covers:
- Root endpoint
- Deals & stores (CheapShark proxy)
- Auth (register/login/me)
- Wishlist CRUD (protected)
- Price Alerts CRUD (protected)
"""
import os
import uuid
import time
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://game-deals-35.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"


@pytest.fixture(scope="session")
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def test_user(api_client):
    """Register a unique test user and return credentials + token."""
    email = f"test+{uuid.uuid4().hex[:8]}@gamedeals.app"
    password = "Test1234!"
    r = api_client.post(f"{API}/auth/register", json={"email": email, "password": password, "name": "Tester"})
    assert r.status_code == 200, f"register failed: {r.status_code} {r.text}"
    data = r.json()
    assert "token" in data and "user" in data
    assert data["user"]["email"] == email
    return {"email": email, "password": password, "token": data["token"], "user": data["user"]}


@pytest.fixture(scope="session")
def auth_headers(test_user):
    return {"Authorization": f"Bearer {test_user['token']}", "Content-Type": "application/json"}


# ---------- Root ----------
class TestRoot:
    def test_root(self, api_client):
        r = api_client.get(f"{API}/")
        assert r.status_code == 200
        assert r.json().get("message") == "Game Deals API"


# ---------- Deals / Stores (CheapShark) ----------
class TestDeals:
    def test_get_stores(self, api_client):
        r = api_client.get(f"{API}/stores", timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 30, f"expected 30+ stores, got {len(data)}"
        # validate shape
        assert "storeID" in data[0] and "storeName" in data[0]

    def test_get_deals_default(self, api_client):
        r = api_client.get(f"{API}/deals", timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert isinstance(data, list)
        assert len(data) > 0
        first = data[0]
        for key in ("dealID", "title", "salePrice", "normalPrice"):
            assert key in first, f"missing key {key}"

    def test_get_deals_filters(self, api_client):
        params = {"storeID": "1", "upperPrice": 15, "sortBy": "Savings", "title": "the"}
        r = api_client.get(f"{API}/deals", params=params, timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert isinstance(data, list)
        # All should belong to storeID 1 and price <= 15
        for d in data[:10]:
            assert d.get("storeID") == "1"
            assert float(d.get("salePrice", 0)) <= 15.0


# ---------- Auth ----------
class TestAuth:
    def test_register_already_used(self, api_client, test_user):
        r = api_client.post(f"{API}/auth/register", json={"email": test_user["email"], "password": "x"})
        assert r.status_code == 400

    def test_login_success(self, api_client, test_user):
        r = api_client.post(f"{API}/auth/login", json={"email": test_user["email"], "password": test_user["password"]})
        assert r.status_code == 200, r.text
        data = r.json()
        assert "token" in data
        assert data["user"]["email"] == test_user["email"]

    def test_login_wrong_password(self, api_client, test_user):
        r = api_client.post(f"{API}/auth/login", json={"email": test_user["email"], "password": "wrong-pass"})
        assert r.status_code == 401

    def test_me_with_token(self, api_client, test_user, auth_headers):
        r = api_client.get(f"{API}/auth/me", headers=auth_headers)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["email"] == test_user["email"]
        assert data["user_id"] == test_user["user"]["user_id"]

    def test_me_without_token(self, api_client):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401


# ---------- Protected: ensure auth required ----------
class TestProtectedNoAuth:
    def test_wishlist_no_auth(self):
        assert requests.get(f"{API}/wishlist").status_code == 401
        assert requests.post(f"{API}/wishlist", json={"game_id": "x", "title": "y"}).status_code == 401

    def test_alerts_no_auth(self):
        assert requests.get(f"{API}/alerts").status_code == 401
        assert requests.post(f"{API}/alerts", json={"game_id": "x", "title": "y", "target_price": 1.0}).status_code == 401


# ---------- Wishlist CRUD ----------
class TestWishlist:
    GAME_ID = "TEST_game_001"

    def test_add_wishlist(self, api_client, auth_headers):
        payload = {"game_id": self.GAME_ID, "title": "TEST Game", "thumb": "https://example.com/x.jpg", "cheapest_price": "9.99"}
        r = api_client.post(f"{API}/wishlist", headers=auth_headers, json=payload)
        assert r.status_code == 200, r.text
        assert r.json().get("ok") is True

    def test_get_wishlist_contains(self, api_client, auth_headers):
        r = api_client.get(f"{API}/wishlist", headers=auth_headers)
        assert r.status_code == 200
        items = r.json()
        assert any(i.get("game_id") == self.GAME_ID for i in items)

    def test_delete_wishlist(self, api_client, auth_headers):
        r = api_client.delete(f"{API}/wishlist/{self.GAME_ID}", headers=auth_headers)
        assert r.status_code == 200
        # Verify removed
        r2 = api_client.get(f"{API}/wishlist", headers=auth_headers)
        assert all(i.get("game_id") != self.GAME_ID for i in r2.json())


# ---------- Alerts CRUD ----------
class TestAlerts:
    # CheapShark real game id (Portal 2 = 614 commonly, use a typical one). Use a likely-valid id.
    GAME_ID = "614"

    def test_create_alert(self, api_client, auth_headers):
        payload = {"game_id": self.GAME_ID, "title": "TEST Alert Game", "thumb": None, "target_price": 5.0}
        r = api_client.post(f"{API}/alerts", headers=auth_headers, json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "alert_id" in data
        assert data["target_price"] == 5.0
        assert data["game_id"] == self.GAME_ID
        # save id on class
        TestAlerts.alert_id = data["alert_id"]

    def test_list_alerts_has_current_price_fields(self, api_client, auth_headers):
        r = api_client.get(f"{API}/alerts", headers=auth_headers, timeout=30)
        assert r.status_code == 200
        alerts = r.json()
        assert any(a.get("alert_id") == TestAlerts.alert_id for a in alerts)
        target = next(a for a in alerts if a["alert_id"] == TestAlerts.alert_id)
        # fields must exist (current_price may be None if game has no deals)
        assert "triggered" in target
        assert "current_price" in target or target.get("triggered") is False

    def test_delete_alert(self, api_client, auth_headers):
        r = api_client.delete(f"{API}/alerts/{TestAlerts.alert_id}", headers=auth_headers)
        assert r.status_code == 200
        r2 = api_client.get(f"{API}/alerts", headers=auth_headers)
        assert all(a.get("alert_id") != TestAlerts.alert_id for a in r2.json())
