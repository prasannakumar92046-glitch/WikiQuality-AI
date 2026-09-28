import base64
import hashlib
import hmac
import json
import secrets
import sqlite3
import time
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
DB_FILE = BASE_DIR / "wikiquality_users.db"

TOKEN_SECRET = secrets.token_hex(32)

TOKEN_EXPIRY_SECONDS = 60 * 60 * 8  # 8 hours


def get_connection():
    connection = sqlite3.connect(DB_FILE)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_auth_database():
    connection = get_connection()

    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('user', 'admin')),
            status TEXT NOT NULL DEFAULT 'active',
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    connection.execute(
        """
        INSERT OR IGNORE INTO users
        (name, email, password_hash, role, status)
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            "WikiQuality Administrator",
            "admin@wikiquality.ai",
            hash_password("Admin@12345"),
            "admin",
            "active",
        ),
    )

    connection.commit()
    connection.close()


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)

    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        200_000,
    )

    return (
        "pbkdf2_sha256$200000$"
        + base64.urlsafe_b64encode(salt).decode("utf-8")
        + "$"
        + base64.urlsafe_b64encode(password_hash).decode("utf-8")
    )


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        algorithm, iterations, salt_text, hash_text = stored_hash.split("$")

        if algorithm != "pbkdf2_sha256":
            return False

        salt = base64.urlsafe_b64decode(salt_text.encode("utf-8"))
        expected_hash = base64.urlsafe_b64decode(hash_text.encode("utf-8"))

        actual_hash = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt,
            int(iterations),
        )

        return hmac.compare_digest(actual_hash, expected_hash)

    except (ValueError, TypeError):
        return False


def create_token(user_id: int, role: str) -> str:
    payload = {
        "user_id": user_id,
        "role": role,
        "expires_at": int(time.time()) + TOKEN_EXPIRY_SECONDS,
    }

    payload_json = json.dumps(
        payload,
        separators=(",", ":"),
    ).encode("utf-8")

    payload_encoded = base64.urlsafe_b64encode(
        payload_json
    ).decode("utf-8").rstrip("=")

    signature = hmac.new(
        TOKEN_SECRET.encode("utf-8"),
        payload_encoded.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    return f"{payload_encoded}.{signature}"


def verify_token(token: str):
    try:
        payload_encoded, signature = token.split(".")

        expected_signature = hmac.new(
            TOKEN_SECRET.encode("utf-8"),
            payload_encoded.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()

        if not hmac.compare_digest(signature, expected_signature):
            return None

        padding = "=" * (-len(payload_encoded) % 4)

        payload_json = base64.urlsafe_b64decode(
            payload_encoded + padding
        )

        payload = json.loads(payload_json.decode("utf-8"))

        if int(payload["expires_at"]) < int(time.time()):
            return None

        return payload

    except (ValueError, KeyError, TypeError, json.JSONDecodeError):
        return None


def create_user(name: str, email: str, password: str):
    email = email.strip().lower()

    connection = get_connection()

    existing = connection.execute(
        "SELECT id FROM users WHERE email = ?",
        (email,),
    ).fetchone()

    if existing:
        connection.close()
        return None, "Email already registered."

    cursor = connection.execute(
        """
        INSERT INTO users
        (name, email, password_hash, role, status)
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            name.strip(),
            email,
            hash_password(password),
            "user",
            "active",
        ),
    )

    connection.commit()

    user_id = cursor.lastrowid

    connection.close()

    return user_id, None


def authenticate_user(email: str, password: str, requested_role: str):
    email = email.strip().lower()

    connection = get_connection()

    user = connection.execute(
        """
        SELECT id, name, email, password_hash, role, status
        FROM users
        WHERE email = ?
        """,
        (email,),
    ).fetchone()

    connection.close()

    if user is None:
        return None, "Invalid email or password."

    if user["status"] != "active":
        return None, "This account is not active."

    if user["role"] != requested_role:
        return None, "The selected login role does not match this account."

    if not verify_password(password, user["password_hash"]):
        return None, "Invalid email or password."

    return dict(user), None


def get_user_by_id(user_id: int):
    connection = get_connection()

    user = connection.execute(
        """
        SELECT id, name, email, role, status, created_at
        FROM users
        WHERE id = ?
        """,
        (user_id,),
    ).fetchone()

    connection.close()

    return dict(user) if user else None


def get_all_users():
    connection = get_connection()

    users = connection.execute(
        """
        SELECT id, name, email, role, status, created_at
        FROM users
        ORDER BY id DESC
        """
    ).fetchall()

    connection.close()

    return [dict(user) for user in users]