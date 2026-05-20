"""Backend tests for Pro subscription (Stripe) and Affiliate config (iteration 2).

Covers:
- GET /api/pro/packages
- GET /api/affiliate/config
- POST /api/pro/checkout (auth + invalid package + happy path)
- GET /api/pro/status/{session_id} (incl. idempotency for already-paid txn)
- POST /api/webhook/stripe (endpoint exists)
- /api/auth/me reflects is_pro / pro_until after manual DB mutation
"""
import os
import uuid
from datetime import datetime, timezone, timedelta
import pytest
import requests
from pymongo import MongoClient

BASE_URL = os.environ['REACT_APP_BACKEND_URL'].rstrip('/')
API = f"{BASE_URL}/api"

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'test_database')


@pytest.fixture(scope="module")
def db():
    c = MongoClient(MONGO_URL)
    yield c[DB_NAME]
    c.close()


@pytest.fixture(scope="module")
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def test_user(api_client):
    email = f"test+pro_{uuid.uuid4().hex[:8]}@gamedeals.app"
    password = "Test1234!"
    r = api_client.post(f"{API}/auth/register", json={"email": email, "password": password, "name": "ProTester"})
    assert r.status_code == 200, r.text
    data = r.json()
    return {"email": email, "password": password, "token": data["token"], "user": data["user"]}


@pytest.fixture(scope="module")
def auth_headers(test_user):
    return {"Authorization": f"Bearer {test_user['token']}", "Content-Type": "application/json"}


# ---------- Pro Packages ----------
class TestProPackages:
    def test_list_packages(self, api_client):
        r = api_client.get(f"{API}/pro/packages")
        assert r.status_code == 200, r.text
        data = r.json()
        assert isinstance(data, list)
        ids = {p["id"]: p for p in data}
        assert "monthly" in ids and "yearly" in ids
        assert ids["monthly"]["amount"] == 4.99
        assert ids["yearly"]["amount"] == 39.99
        assert ids["monthly"]["currency"] == "usd"
        assert ids["yearly"]["currency"] == "usd"
        assert "Monthly" in ids["monthly"]["label"]
        assert "Yearly" in ids["yearly"]["label"]


# ---------- Affiliate Config ----------
class TestAffiliateConfig:
    def test_get_affiliate_config(self, api_client):
        r = api_client.get(f"{API}/affiliate/config")
        assert r.status_code == 200, r.text
        data = r.json()
        # Should have 6 stores
        expected_ids = {"1", "3", "7", "11", "15", "25"}
        assert set(data.keys()) == expected_ids, f"got keys: {set(data.keys())}"
        # Each entry has name + partner
        for k, v in data.items():
            assert "name" in v
            assert "partner" in v  # may be empty string


# ---------- Pro Checkout ----------
class TestProCheckout:
    def test_checkout_no_auth(self, api_client):
        r = requests.post(f"{API}/pro/checkout", json={"package_id": "monthly", "origin_url": BASE_URL})
        assert r.status_code == 401, r.text

    def test_checkout_invalid_package(self, api_client, auth_headers):
        r = api_client.post(
            f"{API}/pro/checkout",
            headers=auth_headers,
            json={"package_id": "lifetime_bogus", "origin_url": BASE_URL},
        )
        assert r.status_code == 400, r.text

    def test_checkout_happy_path(self, api_client, auth_headers, db, test_user):
        r = api_client.post(
            f"{API}/pro/checkout",
            headers=auth_headers,
            json={"package_id": "monthly", "origin_url": BASE_URL},
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert "url" in data and data["url"].startswith("https://")
        assert "session_id" in data
        TestProCheckout.session_id = data["session_id"]

        # Verify payment_transactions doc was created
        txn = db.payment_transactions.find_one({"session_id": data["session_id"]})
        assert txn is not None, "payment_transactions doc not created"
        assert txn["user_id"] == test_user["user"]["user_id"]
        assert txn["package_id"] == "monthly"
        assert txn["amount"] == 4.99
        assert txn["currency"] == "usd"
        assert txn["status"] == "pending"
        assert txn["payment_status"] in ("initiated", "pending")

    def test_checkout_yearly(self, api_client, auth_headers, db):
        r = api_client.post(
            f"{API}/pro/checkout",
            headers=auth_headers,
            json={"package_id": "yearly", "origin_url": BASE_URL},
        )
        assert r.status_code == 200, r.text
        data = r.json()
        txn = db.payment_transactions.find_one({"session_id": data["session_id"]})
        assert txn["amount"] == 39.99
        assert txn["package_id"] == "yearly"


# ---------- Pro Status ----------
class TestProStatus:
    def test_status_unknown_session(self, api_client):
        r = api_client.get(f"{API}/pro/status/cs_test_unknown_999999")
        assert r.status_code == 404

    def test_status_pending_session(self, api_client):
        # Use session_id from checkout test
        sid = getattr(TestProCheckout, "session_id", None)
        assert sid, "checkout test must run first"
        r = api_client.get(f"{API}/pro/status/{sid}")
        # status endpoint hits Stripe; for a fresh session_id status is typically 'open'/'unpaid'
        assert r.status_code == 200, r.text
        data = r.json()
        # Verify shape — may be open / unpaid
        assert "payment_status" in data
        assert "status" in data

    def test_idempotency_paid_does_not_double_extend(self, api_client, db, test_user):
        """Insert a synthetic 'paid' txn, hit /pro/status twice, verify pro_until is set
        exactly once (not double-extended)."""
        user_id = test_user["user"]["user_id"]
        synthetic_sid = f"cs_test_synthetic_{uuid.uuid4().hex[:12]}"

        # Reset user pro fields
        db.users.update_one({"user_id": user_id}, {"$unset": {"pro_until": "", "is_pro": ""}})

        # Insert a transaction that's already paid (simulating webhook completed)
        # The status endpoint should see payment_status='paid' and return cached
        # WITHOUT double-extending pro_until.
        db.payment_transactions.insert_one({
            "session_id": synthetic_sid,
            "user_id": user_id,
            "email": test_user["email"],
            "package_id": "monthly",
            "amount": 4.99,
            "currency": "usd",
            "payment_status": "paid",  # already paid → returns cached
            "status": "complete",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

        # First call — txn is already 'paid' so server returns cached (no user update path)
        r1 = api_client.get(f"{API}/pro/status/{synthetic_sid}")
        assert r1.status_code == 200, r1.text
        d1 = r1.json()
        assert d1["payment_status"] == "paid"

        # Since the user_doc update only happens when transitioning from non-paid->paid,
        # this idempotent path won't extend. To prove idempotency on the transition,
        # set the txn back to 'initiated' but with a marker, then explicitly hit
        # the transition once via direct DB simulation:
        # NOTE: We cannot trigger real Stripe paid flow, so we simulate the user-extend logic
        # via direct DB writes mirroring the server code.

        # Simulate first paid-transition (manually like the server would)
        from datetime import timedelta as _td
        now = datetime.now(timezone.utc)
        pro_until_1 = (now + _td(days=31)).isoformat()
        db.users.update_one({"user_id": user_id}, {"$set": {"pro_until": pro_until_1, "is_pro": True}})

        # Now call /pro/status again — txn is already 'paid', server should NOT extend further
        r2 = api_client.get(f"{API}/pro/status/{synthetic_sid}")
        assert r2.status_code == 200
        u = db.users.find_one({"user_id": user_id})
        assert u["pro_until"] == pro_until_1, "pro_until was modified on cached/paid call (idempotency broken)"

        # cleanup
        db.payment_transactions.delete_one({"session_id": synthetic_sid})


# ---------- /auth/me reflects is_pro & pro_until ----------
class TestAuthMeProFields:
    def test_me_returns_is_pro_and_pro_until(self, api_client, auth_headers, db, test_user):
        user_id = test_user["user"]["user_id"]
        future = (datetime.now(timezone.utc) + timedelta(days=10)).isoformat()
        db.users.update_one({"user_id": user_id}, {"$set": {"pro_until": future, "is_pro": True}})

        r = api_client.get(f"{API}/auth/me", headers=auth_headers)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "is_pro" in data and "pro_until" in data
        assert data["is_pro"] is True
        assert data["pro_until"] == future

    def test_me_is_pro_false_when_expired(self, api_client, auth_headers, db, test_user):
        user_id = test_user["user"]["user_id"]
        past = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
        db.users.update_one({"user_id": user_id}, {"$set": {"pro_until": past, "is_pro": True}})

        r = api_client.get(f"{API}/auth/me", headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        # Server computes is_pro from pro_until; expired => False
        assert data["is_pro"] is False


# ---------- Stripe Webhook endpoint exists ----------
class TestStripeWebhook:
    def test_webhook_endpoint_exists(self, api_client):
        # Send empty/garbage body — endpoint should respond (returning ok:false on parse fail),
        # NOT 404. We only verify the endpoint is mounted.
        r = api_client.post(f"{API}/webhook/stripe", data=b"{}", headers={"Stripe-Signature": "t=0,v1=invalid"})
        assert r.status_code in (200, 400, 422), f"unexpected status {r.status_code}: {r.text}"
