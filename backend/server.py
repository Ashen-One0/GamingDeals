from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response, Header, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import httpx
import bcrypt
import jwt
from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout,
    CheckoutSessionRequest,
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ.get('JWT_SECRET', 'change-me-in-production-secret-key')
JWT_ALG = 'HS256'

# ---------- Pro subscription packages (server-defined, NEVER trust frontend amount) ----------
PRO_PACKAGES = {
    "monthly": {"amount": 4.99, "currency": "usd", "label": "GameDeals Pro — Monthly", "days": 31},
    "yearly":  {"amount": 39.99, "currency": "usd", "label": "GameDeals Pro — Yearly", "days": 366},
}

STRIPE_API_KEY = os.environ.get("STRIPE_API_KEY", "")

CHEAPSHARK_BASE = "https://www.cheapshark.com/api/1.0"
CHEAPSHARK_HEADERS = {"User-Agent": "GameDealsApp/1.0 (contact@gamedeals.app)"}

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ---------- Models ----------

class RegisterIn(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    user_id: str
    email: str
    name: Optional[str] = None
    picture: Optional[str] = None
    is_pro: bool = False
    pro_until: Optional[str] = None

class AuthResponse(BaseModel):
    token: str
    user: UserOut

class WishlistItem(BaseModel):
    game_id: str
    title: str
    thumb: Optional[str] = None
    cheapest_price: Optional[str] = None
    added_at: Optional[str] = None

class AlertIn(BaseModel):
    game_id: str
    title: str
    thumb: Optional[str] = None
    target_price: float

class AlertOut(BaseModel):
    alert_id: str
    game_id: str
    title: str
    thumb: Optional[str] = None
    target_price: float
    created_at: str
    triggered: bool = False
    current_price: Optional[float] = None

# ---------- Auth helpers ----------

def hash_pw(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def verify_pw(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False

def make_jwt(user_id: str) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def user_to_out(user: dict) -> "UserOut":
    """Build UserOut, computing is_pro from pro_until timestamp."""
    is_pro = False
    pro_until_iso = user.get("pro_until")
    if pro_until_iso:
        try:
            dt = datetime.fromisoformat(pro_until_iso)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            if dt > datetime.now(timezone.utc):
                is_pro = True
        except Exception:
            pass
    return UserOut(
        user_id=user["user_id"],
        email=user["email"],
        name=user.get("name"),
        picture=user.get("picture"),
        is_pro=is_pro,
        pro_until=pro_until_iso,
    )


async def get_current_user(request: Request, authorization: Optional[str] = Header(None)) -> dict:
    """Resolve user from either JWT (Authorization Bearer) or Emergent session cookie."""
    # 1) Try cookie session token first (Emergent Google Auth)
    session_token = request.cookies.get("session_token")
    if not session_token and authorization and authorization.lower().startswith("bearer "):
        # Could be JWT or session token via header
        token = authorization.split(" ", 1)[1].strip()
        # Try Emergent session first
        sess = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
        if sess:
            session_token = token
        else:
            # Try JWT
            try:
                payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
                user = await db.users.find_one({"user_id": payload["user_id"]}, {"_id": 0, "password_hash": 0})
                if user:
                    return user
            except Exception:
                pass

    if session_token:
        sess = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
        if not sess:
            raise HTTPException(status_code=401, detail="Invalid session")
        expires_at = sess.get("expires_at")
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at)
        if expires_at and expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at and expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=401, detail="Session expired")
        user = await db.users.find_one({"user_id": sess["user_id"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user

    raise HTTPException(status_code=401, detail="Not authenticated")


# ---------- Routes ----------

@api_router.get("/")
async def root():
    return {"message": "Game Deals API"}


# ----- Simple JWT Auth -----

@api_router.post("/auth/register", response_model=AuthResponse)
async def register(body: RegisterIn):
    existing = await db.users.find_one({"email": body.email.lower()}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    doc = {
        "user_id": user_id,
        "email": body.email.lower(),
        "name": body.name or body.email.split("@")[0],
        "password_hash": hash_pw(body.password),
        "auth_provider": "local",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(doc)
    token = make_jwt(user_id)
    return AuthResponse(token=token, user=user_to_out(doc))


@api_router.post("/auth/login", response_model=AuthResponse)
async def login(body: LoginIn):
    user = await db.users.find_one({"email": body.email.lower()}, {"_id": 0})
    if not user or not user.get("password_hash") or not verify_pw(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = make_jwt(user["user_id"])
    return AuthResponse(token=token, user=user_to_out(user))


# ----- Emergent Google Auth -----

@api_router.post("/auth/session-process")
async def session_process(request: Request, response: Response, x_session_id: Optional[str] = Header(None)):
    """Exchange session_id for session_token with Emergent backend, set httpOnly cookie."""
    if not x_session_id:
        raise HTTPException(status_code=400, detail="Missing X-Session-ID header")

    try:
        async with httpx.AsyncClient(timeout=10) as c:
            r = await c.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": x_session_id},
            )
        if r.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session_id")
        data = r.json()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Auth provider error: {e}")

    email = data.get("email", "").lower()
    name = data.get("name")
    picture = data.get("picture")
    session_token = data.get("session_token")
    if not email or not session_token:
        raise HTTPException(status_code=502, detail="Incomplete auth data")

    # Find or create user
    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        user_id = existing["user_id"]
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": name or existing.get("name"), "picture": picture or existing.get("picture")}},
        )
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "auth_provider": "google",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc),
    })

    response.set_cookie(
        key="session_token",
        value=session_token,
        max_age=7 * 24 * 3600,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
    )
    return {
        "user": {"user_id": user_id, "email": email, "name": name, "picture": picture}
    }


@api_router.get("/auth/me", response_model=UserOut)
async def auth_me(user=Depends(get_current_user)):
    return user_to_out(user)


@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    response.delete_cookie("session_token", path="/", samesite="none", secure=True)
    return {"ok": True}


# ----- Deals (CheapShark proxy) -----

@api_router.get("/stores")
async def get_stores():
    async with httpx.AsyncClient(timeout=15, headers=CHEAPSHARK_HEADERS) as c:
        r = await c.get(f"{CHEAPSHARK_BASE}/stores")
    if r.status_code != 200:
        raise HTTPException(status_code=502, detail="Failed to fetch stores")
    return r.json()


@api_router.get("/deals")
async def get_deals(
    storeID: Optional[str] = Query(None, description="Comma-separated store IDs"),
    pageSize: int = 24,
    pageNumber: int = 0,
    sortBy: str = "Deal Rating",
    desc: int = 0,
    lowerPrice: Optional[float] = None,
    upperPrice: Optional[float] = None,
    metacritic: Optional[int] = None,
    steamRating: Optional[int] = None,
    title: Optional[str] = None,
    onSale: int = 1,
):
    params = {
        "pageSize": pageSize,
        "pageNumber": pageNumber,
        "sortBy": sortBy,
        "desc": desc,
        "onSale": onSale,
    }
    if storeID: params["storeID"] = storeID
    if lowerPrice is not None: params["lowerPrice"] = lowerPrice
    if upperPrice is not None: params["upperPrice"] = upperPrice
    if metacritic is not None: params["metacritic"] = metacritic
    if steamRating is not None: params["steamRating"] = steamRating
    if title: params["title"] = title

    async with httpx.AsyncClient(timeout=20, headers=CHEAPSHARK_HEADERS) as c:
        r = await c.get(f"{CHEAPSHARK_BASE}/deals", params=params)
    if r.status_code != 200:
        raise HTTPException(status_code=502, detail="Failed to fetch deals")
    return r.json()


@api_router.get("/games/{game_id}")
async def get_game(game_id: str):
    async with httpx.AsyncClient(timeout=15, headers=CHEAPSHARK_HEADERS) as c:
        r = await c.get(f"{CHEAPSHARK_BASE}/games", params={"id": game_id})
    if r.status_code != 200:
        raise HTTPException(status_code=502, detail="Failed to fetch game")
    return r.json()


@api_router.get("/games/search")
async def search_games(title: str, limit: int = 20):
    async with httpx.AsyncClient(timeout=15, headers=CHEAPSHARK_HEADERS) as c:
        r = await c.get(f"{CHEAPSHARK_BASE}/games", params={"title": title, "limit": limit})
    if r.status_code != 200:
        raise HTTPException(status_code=502, detail="Failed to search games")
    return r.json()


# ----- Wishlist -----

@api_router.get("/wishlist")
async def get_wishlist(user=Depends(get_current_user)):
    items = await db.wishlist.find({"user_id": user["user_id"]}, {"_id": 0, "user_id": 0}).to_list(500)
    return items


@api_router.post("/wishlist")
async def add_wishlist(item: WishlistItem, user=Depends(get_current_user)):
    doc = item.model_dump()
    doc["user_id"] = user["user_id"]
    doc["added_at"] = datetime.now(timezone.utc).isoformat()
    await db.wishlist.update_one(
        {"user_id": user["user_id"], "game_id": item.game_id},
        {"$set": doc},
        upsert=True,
    )
    return {"ok": True}


@api_router.delete("/wishlist/{game_id}")
async def remove_wishlist(game_id: str, user=Depends(get_current_user)):
    await db.wishlist.delete_one({"user_id": user["user_id"], "game_id": game_id})
    return {"ok": True}


# ----- Price Alerts -----

@api_router.get("/alerts")
async def get_alerts(user=Depends(get_current_user)):
    alerts = await db.alerts.find({"user_id": user["user_id"]}, {"_id": 0, "user_id": 0}).to_list(500)
    # Check current prices for each
    async with httpx.AsyncClient(timeout=15, headers=CHEAPSHARK_HEADERS) as c:
        for a in alerts:
            try:
                r = await c.get(f"{CHEAPSHARK_BASE}/games", params={"id": a["game_id"]})
                if r.status_code == 200:
                    data = r.json()
                    cheapest = data.get("cheapestPriceEver", {}).get("price")
                    deals = data.get("deals", [])
                    current = None
                    if deals:
                        current = min(float(d["price"]) for d in deals)
                    a["current_price"] = current
                    a["triggered"] = bool(current is not None and current <= a["target_price"])
            except Exception:
                a["triggered"] = False
    return alerts


@api_router.post("/alerts", response_model=AlertOut)
async def add_alert(body: AlertIn, user=Depends(get_current_user)):
    alert_id = f"alert_{uuid.uuid4().hex[:10]}"
    doc = {
        "alert_id": alert_id,
        "user_id": user["user_id"],
        "game_id": body.game_id,
        "title": body.title,
        "thumb": body.thumb,
        "target_price": body.target_price,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "triggered": False,
    }
    await db.alerts.insert_one(doc)
    doc.pop("user_id", None)
    return AlertOut(**doc)


@api_router.delete("/alerts/{alert_id}")
async def remove_alert(alert_id: str, user=Depends(get_current_user)):
    await db.alerts.delete_one({"alert_id": alert_id, "user_id": user["user_id"]})
    return {"ok": True}


# ----- Pro Subscription (Stripe) -----

class CheckoutCreateIn(BaseModel):
    package_id: str
    origin_url: str


@api_router.get("/pro/packages")
async def get_pro_packages():
    return [
        {"id": k, "amount": v["amount"], "currency": v["currency"], "label": v["label"]}
        for k, v in PRO_PACKAGES.items()
    ]


@api_router.post("/pro/checkout")
async def create_pro_checkout(body: CheckoutCreateIn, request: Request, user=Depends(get_current_user)):
    if body.package_id not in PRO_PACKAGES:
        raise HTTPException(status_code=400, detail="Invalid package")
    if not STRIPE_API_KEY:
        raise HTTPException(status_code=500, detail="Stripe not configured")

    pkg = PRO_PACKAGES[body.package_id]
    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)

    origin = body.origin_url.rstrip("/")
    success_url = f"{origin}/pro/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin}/pro"

    req = CheckoutSessionRequest(
        amount=float(pkg["amount"]),
        currency=pkg["currency"],
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "user_id": user["user_id"],
            "email": user["email"],
            "package_id": body.package_id,
            "source": "gamedeals_pro",
        },
    )
    session = await stripe_checkout.create_checkout_session(req)

    await db.payment_transactions.insert_one({
        "session_id": session.session_id,
        "user_id": user["user_id"],
        "email": user["email"],
        "package_id": body.package_id,
        "amount": float(pkg["amount"]),
        "currency": pkg["currency"],
        "metadata": {"source": "gamedeals_pro", "package_id": body.package_id},
        "payment_status": "initiated",
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    return {"url": session.url, "session_id": session.session_id}


@api_router.get("/pro/status/{session_id}")
async def get_pro_status(session_id: str, request: Request):
    if not STRIPE_API_KEY:
        raise HTTPException(status_code=500, detail="Stripe not configured")

    txn = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # If already finalized, return cached
    if txn.get("payment_status") == "paid":
        return {
            "status": txn.get("status"),
            "payment_status": txn.get("payment_status"),
            "amount_total": int(txn.get("amount", 0) * 100),
            "currency": txn.get("currency"),
        }

    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    checkout_status = await stripe_checkout.get_checkout_status(session_id)

    # Update transaction
    new_status = checkout_status.status
    new_payment_status = checkout_status.payment_status
    await db.payment_transactions.update_one(
        {"session_id": session_id},
        {"$set": {
            "status": new_status,
            "payment_status": new_payment_status,
            "amount_total": checkout_status.amount_total,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }},
    )

    # If paid AND not yet processed -> mark user as Pro (idempotent)
    if new_payment_status == "paid" and txn.get("payment_status") != "paid":
        package_id = txn.get("package_id")
        pkg = PRO_PACKAGES.get(package_id, PRO_PACKAGES["monthly"])
        user_doc = await db.users.find_one({"user_id": txn["user_id"]}, {"_id": 0})
        if user_doc:
            # Extend from current pro_until or now
            base = datetime.now(timezone.utc)
            if user_doc.get("pro_until"):
                try:
                    existing = datetime.fromisoformat(user_doc["pro_until"])
                    if existing.tzinfo is None:
                        existing = existing.replace(tzinfo=timezone.utc)
                    if existing > base:
                        base = existing
                except Exception:
                    pass
            new_until = base + timedelta(days=pkg["days"])
            await db.users.update_one(
                {"user_id": txn["user_id"]},
                {"$set": {"pro_until": new_until.isoformat(), "is_pro": True}},
            )

    return {
        "status": checkout_status.status,
        "payment_status": checkout_status.payment_status,
        "amount_total": checkout_status.amount_total,
        "currency": checkout_status.currency,
    }


@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    if not STRIPE_API_KEY:
        return {"ok": False, "error": "Stripe not configured"}
    body = await request.body()
    sig = request.headers.get("Stripe-Signature", "")
    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    try:
        response = await stripe_checkout.handle_webhook(body, sig)
    except Exception as e:
        logger.exception("Stripe webhook error: %s", e)
        return {"ok": False}

    # On successful payment, mark user as Pro (idempotent — re-runs are safe)
    if response.payment_status == "paid" and response.session_id:
        txn = await db.payment_transactions.find_one({"session_id": response.session_id}, {"_id": 0})
        if txn and txn.get("payment_status") != "paid":
            package_id = (response.metadata or {}).get("package_id") or txn.get("package_id")
            pkg = PRO_PACKAGES.get(package_id, PRO_PACKAGES["monthly"])
            user_id = (response.metadata or {}).get("user_id") or txn.get("user_id")
            user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
            if user_doc:
                base = datetime.now(timezone.utc)
                if user_doc.get("pro_until"):
                    try:
                        existing = datetime.fromisoformat(user_doc["pro_until"])
                        if existing.tzinfo is None:
                            existing = existing.replace(tzinfo=timezone.utc)
                        if existing > base:
                            base = existing
                    except Exception:
                        pass
                new_until = base + timedelta(days=pkg["days"])
                await db.users.update_one(
                    {"user_id": user_id},
                    {"$set": {"pro_until": new_until.isoformat(), "is_pro": True}},
                )
            await db.payment_transactions.update_one(
                {"session_id": response.session_id},
                {"$set": {"payment_status": "paid", "status": "complete",
                          "updated_at": datetime.now(timezone.utc).isoformat()}},
            )
    return {"ok": True}


# ----- Affiliate config (read-only, exposes safely to frontend) -----

AFFILIATE_CONFIG = {
    # Set env vars to enable affiliate tracking per store
    "1":  {"name": "Steam",        "partner": os.environ.get("AFF_STEAM", "")},
    "3":  {"name": "GreenManGaming","partner": os.environ.get("AFF_GMG", "")},
    "7":  {"name": "GOG",          "partner": os.environ.get("AFF_GOG", "")},
    "11": {"name": "Humble Store", "partner": os.environ.get("AFF_HUMBLE", "")},
    "15": {"name": "Fanatical",    "partner": os.environ.get("AFF_FANATICAL", "")},
    "25": {"name": "Epic Games",   "partner": os.environ.get("AFF_EPIC", "")},
}


@api_router.get("/affiliate/config")
async def get_affiliate_config():
    """Expose only which stores have affiliate enabled. Partner IDs themselves are exposed
    because they're embedded in outbound URLs anyway — there is no secret to leak."""
    return AFFILIATE_CONFIG


# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
