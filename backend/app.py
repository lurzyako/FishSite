from __future__ import annotations

import base64
import binascii
import hashlib
import hmac
import os
import re
import secrets
import uuid
from datetime import datetime
from decimal import Decimal
from pathlib import Path
from typing import Any

import psycopg
from fastapi import Cookie, FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from psycopg.rows import dict_row


PROJECT_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = Path(__file__).resolve().parent
DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql:///fishsite")
SESSION_COOKIE = "fishsite_session"
PASSWORD_ALGORITHM = "pbkdf2_sha256"
PASSWORD_ITERATIONS = 260_000
DEMO_PASSWORDS = {
    email: password
    for email, password in {
        "olga@example.com": os.environ.get("FISHSITE_DEMO_USER_PASSWORD", ""),
        "admin@fishsite.local": os.environ.get("FISHSITE_DEMO_ADMIN_PASSWORD", ""),
    }.items()
    if password
}

CATEGORY_IMAGES = {
    "fresh": "assets/images/product-fresh-fish.png",
    "frozen": "assets/images/product-frozen-fish.png",
    "seafood": "assets/images/product-seafood.png",
    "fillets": "assets/images/product-fillet.png",
}

PRODUCT_IMAGES = {
    1: "assets/images/product-01-salmon.png",
    2: "assets/images/product-02-trout.png",
    3: "assets/images/product-03-tiger-shrimp.png",
    4: "assets/images/product-04-squid.png",
    5: "assets/images/product-05-cod-fillet.png",
    6: "assets/images/product-06-mussels.png",
    7: "assets/images/product-07-salmon-steaks.png",
    8: "assets/images/product-08-octopus.png",
    9: "assets/images/product-09-dorado.png",
    10: "assets/images/product-10-flounder.png",
    11: "assets/images/product-11-salmon-caviar.png",
    12: "assets/images/product-12-pangasius-fillet.png",
}

ORDER_STATUS_LABELS = {
    "new": "Новый",
    "confirmed": "Подтвержден",
    "processing": "Собирается",
    "courier": "Передан курьеру",
    "delivered": "Доставлен",
    "cancelled": "Отменен",
}
ORDER_STATUS_STEPS = ["new", "confirmed", "processing", "courier", "delivered"]
PAYMENT_LABELS = {
    "cash": "Наличными при получении",
    "card": "Картой при получении",
    "online": "Онлайн оплата",
}

PAYMENT_METHODS = set(PAYMENT_LABELS)

SEARCH_SYNONYMS = {
    "семга": {"семга", "сёмга", "лосось", "лосос", "salmon", "semga"},
    "сёмга": {"семга", "сёмга", "лосось", "лосос", "salmon", "semga"},
    "лосось": {"семга", "сёмга", "лосось", "лосос", "salmon", "semga"},
    "salmon": {"семга", "сёмга", "лосось", "лосос", "salmon", "semga"},
    "semga": {"семга", "сёмга", "лосось", "лосос", "salmon", "semga"},
    "форель": {"форель", "trout"},
    "trout": {"форель", "trout"},
    "креветки": {"креветка", "креветки", "shrimp", "prawn"},
    "креветка": {"креветка", "креветки", "shrimp", "prawn"},
    "shrimp": {"креветка", "креветки", "shrimp", "prawn"},
    "prawn": {"креветка", "креветки", "shrimp", "prawn"},
    "икра": {"икра", "caviar"},
    "caviar": {"икра", "caviar"},
    "гриль": {"гриль", "жарка", "сковорода", "запекание", "grill"},
    "grill": {"гриль", "жарка", "сковорода", "запекание", "grill"},
    "премиум": {"премиум", "премиальный", "premium"},
    "premium": {"премиум", "премиальный", "premium"},
    "морепродукты": {"морепродукты", "креветки", "мидии", "кальмар", "осьминог", "seafood"},
    "seafood": {"морепродукты", "креветки", "мидии", "кальмар", "осьминог", "seafood"},
}


app = FastAPI(
    title="FishSite API",
    description="PostgreSQL API магазина Морские Дары: каталог, корзина, заказы, уведомления и админка.",
    version="3.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:8080",
        "http://localhost:8080",
        "http://127.0.0.1:8081",
        "http://localhost:8081",
        "http://127.0.0.1:8000",
        "http://localhost:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def connect() -> psycopg.Connection:
    return psycopg.connect(DATABASE_URL, row_factory=dict_row)


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        bytes.fromhex(salt),
        PASSWORD_ITERATIONS,
    ).hex()
    return f"{PASSWORD_ALGORITHM}${PASSWORD_ITERATIONS}${salt}${digest}"


def verify_password(password: str, stored_hash: str | None) -> bool:
    if not stored_hash:
        return False
    try:
        algorithm, iterations, salt, digest = stored_hash.split("$", 3)
        if algorithm != PASSWORD_ALGORITHM:
            return False
        candidate = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            bytes.fromhex(salt),
            int(iterations),
        ).hex()
    except (TypeError, ValueError):
        return False
    return hmac.compare_digest(candidate, digest)


def ensure_demo_passwords(connection: psycopg.Connection) -> None:
    if not DEMO_PASSWORDS:
        return
    with connection.cursor() as cursor:
        for email, password in DEMO_PASSWORDS.items():
            cursor.execute(
                """
                UPDATE users
                SET password_hash = %s, updated_at = now()
                WHERE lower(email) = %s AND (password_hash IS NULL OR password_hash = '')
                """,
                (hash_password(password), email),
            )


def ensure_database() -> None:
    schema = (BACKEND_DIR / "schema.postgres.sql").read_text(encoding="utf-8")
    seed = (BACKEND_DIR / "seed.postgres.sql").read_text(encoding="utf-8")
    try:
        with connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(schema)
                cursor.execute(seed)
                ensure_demo_passwords(connection)
                cursor.execute(
                    """
                    UPDATE products
                    SET is_active = false, updated_at = now()
                    WHERE lower(name) LIKE 'asd%' OR lower(coalesce(description, '')) LIKE 'asd%'
                    """
                )
                normalize_existing_contact_values(connection)
                cursor.execute("SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE((SELECT MAX(id) FROM users), 1), true)")
                cursor.execute("SELECT setval(pg_get_serial_sequence('products', 'id'), COALESCE((SELECT MAX(id) FROM products), 1), true)")
            connection.commit()
    except Exception as exc:
        raise RuntimeError(
            "Не удалось подключиться к PostgreSQL. Проверьте DATABASE_URL, запущенный PostgreSQL-сервер и существование базы fishsite."
        ) from exc


@app.on_event("startup")
def startup() -> None:
    ensure_database()


def to_json_value(value: Any) -> Any:
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, datetime):
        return value.isoformat()
    return value


def normalize_row(row: dict[str, Any] | None) -> dict[str, Any] | None:
    if row is None:
        return None
    return {key: to_json_value(value) for key, value in row.items()}


def product_to_api(row: dict[str, Any]) -> dict[str, Any]:
    row = normalize_row(row) or {}
    category = row.get("category_slug") or "fresh"
    return {
        "id": row.get("id"),
        "name": row.get("name"),
        "category": category,
        "price": row.get("price_rub") or 0,
        "image": row.get("image_path") or PRODUCT_IMAGES.get(row.get("id"), CATEGORY_IMAGES.get(category, CATEGORY_IMAGES["fresh"])),
        "imageSymbol": row.get("image_symbol") or "•",
        "popular": bool(row.get("is_popular")),
        "stock": row.get("stock_quantity") or 0,
        "popularity": row.get("popularity") or 0,
        "active": bool(row.get("is_active")),
        "description": row.get("description") or "",
        "weight": row.get("weight") or "",
        "shelfLife": row.get("shelf_life") or "",
        "origin": row.get("origin") or "",
        "storage": row.get("storage") or "",
    }


def user_to_api(row: dict[str, Any] | None) -> dict[str, Any] | None:
    row = normalize_row(row)
    if not row:
        return None
    full_name = row.get("full_name") or ""
    return {
        "id": row.get("id"),
        "name": full_name,
        "fullName": full_name,
        "email": row.get("email"),
        "phone": row.get("phone") or "",
        "initials": row.get("initials") or "".join(part[:1] for part in full_name.split()[:2]).upper(),
        "role": row.get("role"),
    }


def normalize_search_text(value: Any) -> str:
    return re.sub(r"\s+", " ", re.sub(r"[^a-zа-я0-9]+", " ", str(value or "").lower().replace("ё", "е"))).strip()


def normalize_email(value: Any) -> str:
    email = re.sub(r"\s+", "", str(value or "")).lower()
    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email):
        raise HTTPException(status_code=400, detail="Введите корректный email")
    return email


def normalize_phone(value: Any) -> str:
    digits = re.sub(r"\D+", "", str(value or ""))
    if len(digits) == 10:
        digits = f"7{digits}"
    elif len(digits) == 11 and digits.startswith("8"):
        digits = f"7{digits[1:]}"
    if len(digits) != 11 or not digits.startswith("7"):
        raise HTTPException(status_code=400, detail="Введите телефон в формате +7 (999) 123-45-67")
    return f"+{digits}"


def normalize_existing_contact_values(connection: psycopg.Connection) -> None:
    with connection.cursor() as cursor:
        cursor.execute("SELECT id, email, phone FROM users")
        for row in cursor.fetchall():
            updates: list[str] = []
            values: list[Any] = []
            try:
                email = normalize_email(row.get("email"))
                if email != row.get("email"):
                    updates.append("email = %s")
                    values.append(email)
            except HTTPException:
                pass
            if row.get("phone"):
                try:
                    phone = normalize_phone(row.get("phone"))
                    if phone != row.get("phone"):
                        updates.append("phone = %s")
                        values.append(phone)
                except HTTPException:
                    pass
            if updates:
                values.append(row["id"])
                cursor.execute(f"UPDATE users SET {', '.join(updates)}, updated_at = now() WHERE id = %s", values)

        cursor.execute("SELECT id, customer_email, customer_phone FROM orders")
        for row in cursor.fetchall():
            updates = []
            values = []
            try:
                email = normalize_email(row.get("customer_email"))
                if email != row.get("customer_email"):
                    updates.append("customer_email = %s")
                    values.append(email)
            except HTTPException:
                pass
            try:
                phone = normalize_phone(row.get("customer_phone"))
                if phone != row.get("customer_phone"):
                    updates.append("customer_phone = %s")
                    values.append(phone)
            except HTTPException:
                pass
            if updates:
                values.append(row["id"])
                cursor.execute(f"UPDATE orders SET {', '.join(updates)}, updated_at = now() WHERE id = %s", values)

        cursor.execute("SELECT id, email FROM contact_requests")
        for row in cursor.fetchall():
            try:
                email = normalize_email(row.get("email"))
            except HTTPException:
                continue
            if email != row.get("email"):
                cursor.execute("UPDATE contact_requests SET email = %s WHERE id = %s", (email, row["id"]))


def stem_search_token(token: str) -> str:
    if len(token) < 5:
        return token
    return re.sub(r"(ами|ями|ого|ему|ыми|ими|ая|яя|ое|ее|ые|ие|ый|ий|ой|ом|ем|ам|ям|ах|ях|ов|ев|ей|ую|юю|а|я|ы|и|у|ю|е|о)$", "", token)


def search_variants(token: str) -> set[str]:
    stemmed = stem_search_token(token)
    variants = {token, stemmed}
    for synonym in SEARCH_SYNONYMS.get(token, set()) | SEARCH_SYNONYMS.get(stemmed, set()):
        variants.add(synonym)
        variants.add(stem_search_token(synonym))
    return {variant for variant in variants if len(variant) > 1}


def close_search_token(left: str, right: str) -> bool:
    if abs(len(left) - len(right)) > 2:
        return False
    previous = range(len(right) + 1)
    for i, left_char in enumerate(left, 1):
        current = [i]
        for j, right_char in enumerate(right, 1):
            current.append(min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + (left_char != right_char)))
        previous = current
    return previous[-1] <= 2


def build_tracking(status: str, created_at: Any) -> list[dict[str, Any]]:
    created = to_json_value(created_at)
    if status == "cancelled":
        return [
            {"step": "Заказ принят", "time": created, "completed": True},
            {"step": "Отменен", "time": "Статус обновлен", "completed": True},
        ]
    status_index = ORDER_STATUS_STEPS.index(status) if status in ORDER_STATUS_STEPS else 0
    labels = {
        "new": "Заказ принят",
        "confirmed": "Подтвержден",
        "processing": "Собирается",
        "courier": "Передан курьеру",
        "delivered": "Доставлен",
    }
    return [
        {
            "step": labels[step],
            "time": created if index == 0 else ("В работе" if index == status_index else "По готовности"),
            "completed": index <= status_index,
        }
        for index, step in enumerate(ORDER_STATUS_STEPS)
    ]


def order_to_api(connection: psycopg.Connection, row: dict[str, Any]) -> dict[str, Any]:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT oi.product_id, oi.product_name, oi.product_category_slug, oi.price_rub,
                   oi.quantity, oi.line_total_rub, p.image_symbol
            FROM order_items oi
            LEFT JOIN products p ON p.id = oi.product_id
            WHERE oi.order_id = %s
            ORDER BY oi.id
            """,
            (row["id"],),
        )
        items = cursor.fetchall()
        cursor.execute(
            """
            SELECT status, comment, created_at
            FROM order_status_history
            WHERE order_id = %s
            ORDER BY created_at, id
            """,
            (row["id"],),
        )
        history_rows = cursor.fetchall()

    products = [
        {
            "id": item["product_id"],
            "name": item["product_name"],
            "category": item["product_category_slug"],
            "price": item["price_rub"],
            "quantity": to_json_value(item["quantity"]),
            "unit": "кг",
            "image": PRODUCT_IMAGES.get(item["product_id"], CATEGORY_IMAGES.get(item["product_category_slug"], CATEGORY_IMAGES["fresh"])),
            "imageSymbol": item["image_symbol"] or "•",
            "total": item["line_total_rub"],
        }
        for item in items
    ]
    created_at = row["created_at"]
    created_date = created_at.date() if hasattr(created_at, "date") else datetime.fromisoformat(str(created_at)).date()
    return {
        "id": row["order_number"],
        "date": to_json_value(row["created_at"]),
        "status": row["status"],
        "customer": row["customer_name"],
        "phone": row["customer_phone"],
        "email": row["customer_email"],
        "products": products,
        "items": products,
        "total": row["total_amount_rub"],
        "address": row["delivery_address"],
        "deliveryTime": "по согласованию",
        "deliveryDate": created_date.strftime("%d.%m.%Y"),
        "paymentMethod": PAYMENT_LABELS.get(row["payment_method"], row["payment_method"]),
        "notes": row["comment"] or "",
        "tracking": build_tracking(row["status"], row["created_at"]),
        "statusHistory": [
            {
                "status": item["status"],
                "label": ORDER_STATUS_LABELS.get(item["status"], item["status"]),
                "comment": item["comment"] or "",
                "createdAt": to_json_value(item["created_at"]),
            }
            for item in history_rows
        ],
    }


def chat_thread_to_api(row: dict[str, Any]) -> dict[str, Any]:
    row = normalize_row(row) or {}
    return {
        "id": row.get("id"),
        "status": row.get("status"),
        "subject": row.get("subject") or "Консультация по заказу",
        "customerName": row.get("customer_name") or "Гость сайта",
        "customerEmail": row.get("customer_email") or "",
        "unreadAdmin": row.get("unread_admin") or 0,
        "unreadUser": row.get("unread_user") or 0,
        "lastMessageAt": row.get("last_message_at"),
        "createdAt": row.get("created_at"),
        "updatedAt": row.get("updated_at"),
    }


def chat_message_to_api(row: dict[str, Any]) -> dict[str, Any]:
    row = normalize_row(row) or {}
    return {
        "id": row.get("id"),
        "threadId": row.get("thread_id"),
        "senderRole": row.get("sender_role"),
        "senderUserId": row.get("sender_user_id"),
        "body": row.get("body") or "",
        "createdAt": row.get("created_at"),
    }


def get_session(response: Response, session_id: str | None) -> str:
    session_id = session_id or uuid.uuid4().hex
    response.set_cookie(SESSION_COOKIE, session_id, httponly=True, samesite="lax", path="/")
    with connect() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO sessions (id) VALUES (%s)
                ON CONFLICT (id) DO UPDATE SET updated_at = now()
                """,
                (session_id,),
            )
        connection.commit()
    return session_id


def current_user(session_id: str | None) -> dict[str, Any] | None:
    if not session_id:
        return None
    with connect() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT u.*
                FROM sessions s
                JOIN users u ON u.id = s.user_id
                WHERE s.id = %s
                """,
                (session_id,),
            )
            return cursor.fetchone()


def require_user(session_id: str | None) -> dict[str, Any]:
    user = current_user(session_id)
    if not user:
        raise HTTPException(status_code=403, detail="Требуется вход в аккаунт")
    return user


def require_admin(session_id: str | None) -> dict[str, Any]:
    user = require_user(session_id)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Недостаточно прав")
    return user


def get_active_cart_id(connection: psycopg.Connection, session_id: str, user: dict[str, Any] | None) -> int:
    with connection.cursor() as cursor:
        if user:
            cursor.execute("SELECT id FROM carts WHERE user_id = %s AND status = 'active' ORDER BY id DESC LIMIT 1", (user["id"],))
            row = cursor.fetchone()
            if row:
                return row["id"]
            cursor.execute("INSERT INTO carts (user_id, session_id) VALUES (%s, %s) RETURNING id", (user["id"], session_id))
            return cursor.fetchone()["id"]

        cursor.execute(
            "SELECT id FROM carts WHERE session_id = %s AND user_id IS NULL AND status = 'active' ORDER BY id DESC LIMIT 1",
            (session_id,),
        )
        row = cursor.fetchone()
        if row:
            return row["id"]
        cursor.execute("INSERT INTO carts (session_id) VALUES (%s) RETURNING id", (session_id,))
        return cursor.fetchone()["id"]


def get_cart_items(connection: psycopg.Connection, cart_id: int) -> list[dict[str, Any]]:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT ci.product_id, ci.quantity, p.*
            FROM cart_items ci
            JOIN products p ON p.id = ci.product_id
            WHERE ci.cart_id = %s AND p.is_active = true
            ORDER BY ci.created_at, ci.product_id
            """,
            (cart_id,),
        )
        rows = cursor.fetchall()
    items = []
    for row in rows:
        product = product_to_api(row)
        product["quantity"] = to_json_value(row["quantity"])
        product["cartPrice"] = row["price_rub"]
        items.append(product)
    return items


def favorite_ids(connection: psycopg.Connection, session_id: str, user: dict[str, Any] | None) -> list[int]:
    with connection.cursor() as cursor:
        if user:
            cursor.execute("SELECT product_id FROM favorites WHERE user_id = %s ORDER BY created_at DESC", (user["id"],))
        else:
            cursor.execute("SELECT product_id FROM session_favorites WHERE session_id = %s ORDER BY created_at DESC", (session_id,))
        return [row["product_id"] for row in cursor.fetchall()]


def set_favorite(connection: psycopg.Connection, session_id: str, user: dict[str, Any] | None, product_id: int, enabled: bool) -> list[int]:
    with connection.cursor() as cursor:
        cursor.execute("SELECT id FROM products WHERE id = %s AND is_active = true", (product_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Товар не найден")
        if user:
            if enabled:
                cursor.execute("INSERT INTO favorites (user_id, product_id) VALUES (%s, %s) ON CONFLICT DO NOTHING", (user["id"], product_id))
            else:
                cursor.execute("DELETE FROM favorites WHERE user_id = %s AND product_id = %s", (user["id"], product_id))
        else:
            if enabled:
                cursor.execute("INSERT INTO session_favorites (session_id, product_id) VALUES (%s, %s) ON CONFLICT DO NOTHING", (session_id, product_id))
            else:
                cursor.execute("DELETE FROM session_favorites WHERE session_id = %s AND product_id = %s", (session_id, product_id))
    return favorite_ids(connection, session_id, user)


def ensure_chat_thread(connection: psycopg.Connection, session_id: str, user: dict[str, Any] | None) -> dict[str, Any]:
    with connection.cursor() as cursor:
        if user:
            cursor.execute(
                """
                SELECT *
                FROM chat_threads
                WHERE user_id = %s AND status = 'open'
                ORDER BY updated_at DESC
                LIMIT 1
                """,
                (user["id"],),
            )
        else:
            cursor.execute(
                """
                SELECT *
                FROM chat_threads
                WHERE session_id = %s AND user_id IS NULL AND status = 'open'
                ORDER BY updated_at DESC
                LIMIT 1
                """,
                (session_id,),
            )
        thread = cursor.fetchone()
        if thread:
            return thread

        cursor.execute(
            """
            INSERT INTO chat_threads (session_id, user_id, customer_name, customer_email, subject, last_message_at)
            VALUES (%s, %s, %s, %s, %s, now())
            RETURNING *
            """,
            (
                session_id,
                user["id"] if user else None,
                user["full_name"] if user else "Гость сайта",
                user["email"] if user else None,
                "Консультация по заказу",
            ),
        )
        return cursor.fetchone()


def get_chat_messages(connection: psycopg.Connection, thread_id: int) -> list[dict[str, Any]]:
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT *
            FROM chat_messages
            WHERE thread_id = %s
            ORDER BY created_at, id
            """,
            (thread_id,),
        )
        return [chat_message_to_api(row) for row in cursor.fetchall()]


@app.get("/api/health")
def health() -> dict[str, bool]:
    with connect() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1 AS ok")
            cursor.fetchone()
    return {"ok": True}


@app.get("/api/me")
def me(response: Response, fishsite_session: str | None = Cookie(default=None)) -> dict[str, Any]:
    session_id = get_session(response, fishsite_session)
    return {"user": user_to_api(current_user(session_id))}


@app.post("/api/auth/login")
async def login(request: Request, response: Response, fishsite_session: str | None = Cookie(default=None)) -> dict[str, Any]:
    payload = await request.json()
    email = normalize_email(payload.get("email"))
    password = (payload.get("password") or "").strip()
    session_id = get_session(response, fishsite_session)
    with connect() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM users WHERE lower(email) = %s", (email,))
            user = cursor.fetchone()
            if not user or not verify_password(password, user["password_hash"]):
                raise HTTPException(status_code=400, detail="Неверный email или пароль")
            cursor.execute("UPDATE sessions SET user_id = %s, updated_at = now() WHERE id = %s", (user["id"], session_id))
        connection.commit()
    return {"user": user_to_api(user)}


@app.post("/api/auth/register")
async def register(request: Request, response: Response, fishsite_session: str | None = Cookie(default=None)) -> dict[str, Any]:
    payload = await request.json()
    name = (payload.get("name") or payload.get("fullName") or "").strip()
    email = normalize_email(payload.get("email"))
    phone = normalize_phone(payload.get("phone"))
    password = (payload.get("password") or "").strip()
    if not name or not password:
        raise HTTPException(status_code=400, detail="Введите имя, email, телефон и пароль")
    initials = "".join(part[:1] for part in name.split()[:2]).upper() or email[:2].upper()
    session_id = get_session(response, fishsite_session)
    with connect() as connection:
        with connection.cursor() as cursor:
            try:
                cursor.execute(
                    """
                    INSERT INTO users (full_name, email, phone, password_hash, initials, role)
                    VALUES (%s, %s, %s, %s, %s, 'customer')
                    RETURNING *
                    """,
                    (name, email, phone, hash_password(password), initials),
                )
                user = cursor.fetchone()
            except psycopg.errors.UniqueViolation as exc:
                raise HTTPException(status_code=400, detail="Пользователь с таким email уже существует") from exc
            cursor.execute("UPDATE sessions SET user_id = %s, updated_at = now() WHERE id = %s", (user["id"], session_id))
        connection.commit()
    return {"user": user_to_api(user)}


@app.post("/api/auth/logout")
def logout(response: Response, fishsite_session: str | None = Cookie(default=None)) -> dict[str, bool]:
    if fishsite_session:
        with connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute("UPDATE sessions SET user_id = NULL, updated_at = now() WHERE id = %s", (fishsite_session,))
            connection.commit()
    response.delete_cookie(SESSION_COOKIE, path="/")
    return {"ok": True}


@app.get("/api/auth/{provider}/start")
def oauth_start(provider: str, returnTo: str = "/") -> RedirectResponse:
    if provider not in {"google", "vk"}:
        raise HTTPException(status_code=404, detail="Провайдер не найден")
    safe_return_to = returnTo if returnTo.startswith("/") and not returnTo.startswith("//") else "/"
    separator = "&" if "?" in safe_return_to else "?"
    return RedirectResponse(f"{safe_return_to}{separator}auth_error=oauth_not_configured")


@app.get("/api/products")
def products() -> list[dict[str, Any]]:
    with connect() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM products WHERE is_active = true ORDER BY is_popular DESC, popularity DESC, id")
            return [product_to_api(row) for row in cursor.fetchall()]


@app.get("/api/products/search")
def product_search(q: str = "") -> list[dict[str, Any]]:
    tokens = [token for token in normalize_search_text(q).split() if len(token) > 1]
    with connect() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM products WHERE is_active = true ORDER BY is_popular DESC, popularity DESC, id")
            rows = cursor.fetchall()
    if not tokens:
        return [product_to_api(row) for row in rows]

    results: list[tuple[int, dict[str, Any]]] = []
    for row in rows:
        product = product_to_api(row)
        search_badges = "премиум premium популярное bestseller" if product.get("popular") else ""
        haystack = normalize_search_text(
            " ".join(str(product.get(key) or "") for key in ["name", "category", "description", "origin", "storage", "weight", "price"])
            + " "
            + search_badges
        )
        hay_words = haystack.split()
        score = 0
        for token in tokens:
            variants = search_variants(token)
            score += max(
                100 if variant in haystack else max((70 if close_search_token(word, variant) else 0) for word in hay_words) if hay_words else 0
                for variant in variants
            )
        if score:
            results.append((score + int(product.get("popularity") or 0), product))
    return [product for _, product in sorted(results, key=lambda item: item[0], reverse=True)]


@app.get("/api/cart")
def cart(response: Response, fishsite_session: str | None = Cookie(default=None)) -> list[dict[str, Any]]:
    session_id = get_session(response, fishsite_session)
    user = current_user(session_id)
    with connect() as connection:
        cart_id = get_active_cart_id(connection, session_id, user)
        connection.commit()
        return get_cart_items(connection, cart_id)


@app.post("/api/cart/items")
async def cart_add(request: Request, response: Response, fishsite_session: str | None = Cookie(default=None)) -> list[dict[str, Any]]:
    payload = await request.json()
    product_id = int(payload.get("productId") or payload.get("id") or 0)
    quantity = float(payload.get("quantity") or 1)
    if product_id <= 0 or quantity <= 0:
        raise HTTPException(status_code=400, detail="Передайте товар и количество")
    session_id = get_session(response, fishsite_session)
    user = current_user(session_id)
    with connect() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM products WHERE id = %s AND is_active = true", (product_id,))
            product = cursor.fetchone()
            if not product:
                raise HTTPException(status_code=404, detail="Товар не найден")
            cart_id = get_active_cart_id(connection, session_id, user)
            cursor.execute(
                "SELECT quantity FROM cart_items WHERE cart_id = %s AND product_id = %s",
                (cart_id, product_id),
            )
            existing_item = cursor.fetchone()
            existing_quantity = Decimal(str(existing_item["quantity"] if existing_item else 0))
            requested_quantity = existing_quantity + Decimal(str(quantity))
            if Decimal(str(product["stock_quantity"] or 0)) < requested_quantity:
                raise HTTPException(status_code=409, detail="Товара нет в наличии")
            cursor.execute(
                """
                INSERT INTO cart_items (cart_id, product_id, quantity, price_rub)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (cart_id, product_id) DO UPDATE SET
                    quantity = cart_items.quantity + EXCLUDED.quantity,
                    price_rub = EXCLUDED.price_rub,
                    updated_at = now()
                """,
                (cart_id, product_id, quantity, product["price_rub"]),
            )
        connection.commit()
        return get_cart_items(connection, cart_id)


@app.post("/api/cart/items/update")
async def cart_update(request: Request, response: Response, fishsite_session: str | None = Cookie(default=None)) -> list[dict[str, Any]]:
    payload = await request.json()
    product_id = int(payload.get("productId") or payload.get("id") or 0)
    quantity = float(payload.get("quantity") or 0)
    if product_id <= 0:
        raise HTTPException(status_code=400, detail="Передайте товар")
    session_id = get_session(response, fishsite_session)
    user = current_user(session_id)
    with connect() as connection:
        cart_id = get_active_cart_id(connection, session_id, user)
        with connection.cursor() as cursor:
            if quantity <= 0:
                cursor.execute("DELETE FROM cart_items WHERE cart_id = %s AND product_id = %s", (cart_id, product_id))
            else:
                cursor.execute("SELECT price_rub, stock_quantity FROM products WHERE id = %s AND is_active = true", (product_id,))
                product = cursor.fetchone()
                if not product:
                    raise HTTPException(status_code=404, detail="Товар не найден")
                if Decimal(str(product["stock_quantity"] or 0)) < Decimal(str(quantity)):
                    raise HTTPException(status_code=409, detail="Товара нет в наличии")
                cursor.execute(
                    """
                    INSERT INTO cart_items (cart_id, product_id, quantity, price_rub)
                    VALUES (%s, %s, %s, %s)
                    ON CONFLICT (cart_id, product_id) DO UPDATE SET
                        quantity = EXCLUDED.quantity,
                        price_rub = EXCLUDED.price_rub,
                        updated_at = now()
                    """,
                    (cart_id, product_id, quantity, product["price_rub"]),
                )
        connection.commit()
        return get_cart_items(connection, cart_id)


@app.post("/api/cart/items/remove")
async def cart_remove(request: Request, response: Response, fishsite_session: str | None = Cookie(default=None)) -> list[dict[str, Any]]:
    payload = await request.json()
    product_id = int(payload.get("productId") or payload.get("id") or 0)
    if product_id <= 0:
        raise HTTPException(status_code=400, detail="Передайте товар")
    session_id = get_session(response, fishsite_session)
    user = current_user(session_id)
    with connect() as connection:
        cart_id = get_active_cart_id(connection, session_id, user)
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM cart_items WHERE cart_id = %s AND product_id = %s", (cart_id, product_id))
        connection.commit()
        return get_cart_items(connection, cart_id)


@app.post("/api/cart/clear")
def cart_clear(response: Response, fishsite_session: str | None = Cookie(default=None)) -> list[dict[str, Any]]:
    session_id = get_session(response, fishsite_session)
    user = current_user(session_id)
    with connect() as connection:
        cart_id = get_active_cart_id(connection, session_id, user)
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM cart_items WHERE cart_id = %s", (cart_id,))
        connection.commit()
    return []


@app.get("/api/favorites")
def favorites(response: Response, fishsite_session: str | None = Cookie(default=None)) -> dict[str, Any]:
    session_id = get_session(response, fishsite_session)
    user = current_user(session_id)
    with connect() as connection:
        ids = favorite_ids(connection, session_id, user)
        if ids:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM products WHERE id = ANY(%s) AND is_active = true", (ids,))
                rows = cursor.fetchall()
            by_id = {row["id"]: product_to_api(row) for row in rows}
            products_payload = [by_id[product_id] for product_id in ids if product_id in by_id]
        else:
            products_payload = []
    return {"ids": ids, "products": products_payload}


@app.post("/api/favorites/toggle")
async def favorite_toggle(request: Request, response: Response, fishsite_session: str | None = Cookie(default=None)) -> dict[str, Any]:
    payload = await request.json()
    product_id = int(payload.get("productId") or payload.get("id") or 0)
    if product_id <= 0:
        raise HTTPException(status_code=400, detail="Передайте товар")
    session_id = get_session(response, fishsite_session)
    user = current_user(session_id)
    with connect() as connection:
        ids = favorite_ids(connection, session_id, user)
        active = product_id not in ids
        ids = set_favorite(connection, session_id, user, product_id, active)
        connection.commit()
    return {"ids": ids, "active": active}


@app.post("/api/favorites/remove")
async def favorite_remove(request: Request, response: Response, fishsite_session: str | None = Cookie(default=None)) -> dict[str, Any]:
    payload = await request.json()
    product_id = int(payload.get("productId") or payload.get("id") or 0)
    session_id = get_session(response, fishsite_session)
    user = current_user(session_id)
    with connect() as connection:
        ids = set_favorite(connection, session_id, user, product_id, False)
        connection.commit()
    return {"ids": ids, "active": False}


@app.post("/api/favorites/clear")
def favorites_clear(response: Response, fishsite_session: str | None = Cookie(default=None)) -> dict[str, Any]:
    session_id = get_session(response, fishsite_session)
    user = current_user(session_id)
    with connect() as connection:
        with connection.cursor() as cursor:
            if user:
                cursor.execute("DELETE FROM favorites WHERE user_id = %s", (user["id"],))
            else:
                cursor.execute("DELETE FROM session_favorites WHERE session_id = %s", (session_id,))
        connection.commit()
    return {"ids": [], "products": []}


@app.post("/api/orders")
async def create_order(request: Request, response: Response, fishsite_session: str | None = Cookie(default=None)) -> dict[str, Any]:
    payload = await request.json()
    required = ["name", "phone", "email", "address", "payment"]
    if any(not payload.get(field) for field in required):
        raise HTTPException(status_code=400, detail="Заполните обязательные поля заказа")
    customer_phone = normalize_phone(payload.get("phone"))
    customer_email = normalize_email(payload.get("email"))
    payment_method = (payload.get("payment") or "cash").strip()
    if payment_method not in PAYMENT_METHODS:
        raise HTTPException(status_code=400, detail="Некорректный способ оплаты")
    session_id = get_session(response, fishsite_session)
    user = current_user(session_id)
    with connect() as connection:
        cart_id = get_active_cart_id(connection, session_id, user)
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT ci.product_id AS id, ci.quantity
                FROM cart_items ci
                JOIN products p ON p.id = ci.product_id
                WHERE ci.cart_id = %s AND p.is_active = true
                ORDER BY ci.created_at, ci.product_id
                """,
                (cart_id,),
            )
            cart_rows = cursor.fetchall()
            incoming_cart = payload.get("cart") if isinstance(payload.get("cart"), list) else []
            source_items = cart_rows or incoming_cart
            if not source_items:
                raise HTTPException(status_code=400, detail="Корзина пуста")

            total = 0
            normalized_items = []
            for item in source_items:
                product_id = item.get("id")
                quantity = float(item.get("quantity") or 1)
                cursor.execute("SELECT id, name, category_slug, price_rub, stock_quantity FROM products WHERE id = %s AND is_active = true", (product_id,))
                product = cursor.fetchone()
                if not product or quantity <= 0:
                    continue
                if Decimal(str(product["stock_quantity"] or 0)) < Decimal(str(quantity)):
                    raise HTTPException(status_code=409, detail=f"Товара {product['name']} нет в нужном количестве")
                line_total = int(round(product["price_rub"] * quantity))
                total += line_total
                normalized_items.append((product, quantity, line_total))

            if not normalized_items:
                raise HTTPException(status_code=400, detail="В заказе нет доступных товаров")

            cursor.execute(
                """
                INSERT INTO orders (
                    order_number, user_id, customer_name, customer_phone, customer_email,
                    delivery_address, comment, payment_method, total_amount_rub
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
                """,
                (
                    f"TMP-{uuid.uuid4().hex}",
                    user["id"] if user else None,
                    payload["name"].strip(),
                    customer_phone,
                    customer_email,
                    payload["address"].strip(),
                    (payload.get("comment") or "").strip(),
                    payment_method,
                    total,
                ),
            )
            order_id = cursor.fetchone()["id"]
            order_number = f"FISH-{order_id:06d}"
            cursor.execute("UPDATE orders SET order_number = %s WHERE id = %s", (order_number, order_id))
            cursor.execute(
                "INSERT INTO order_status_history (order_id, status, comment) VALUES (%s, 'new', %s)",
                (order_id, "Заказ создан покупателем"),
            )
            for product, quantity, line_total in normalized_items:
                cursor.execute(
                    """
                    INSERT INTO order_items (
                        order_id, product_id, product_name, product_category_slug,
                        price_rub, quantity, line_total_rub
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s)
                    """,
                    (order_id, product["id"], product["name"], product["category_slug"], product["price_rub"], quantity, line_total),
                )
                cursor.execute(
                    "UPDATE products SET stock_quantity = stock_quantity - %s, updated_at = now() WHERE id = %s",
                    (quantity, product["id"]),
                )
            cursor.execute("DELETE FROM cart_items WHERE cart_id = %s", (cart_id,))
            cursor.execute("UPDATE carts SET status = 'converted', updated_at = now() WHERE id = %s", (cart_id,))
            cursor.execute("SELECT * FROM orders WHERE id = %s", (order_id,))
            order = cursor.fetchone()
        connection.commit()
        return order_to_api(connection, order)


@app.get("/api/orders")
def orders(email: str = "", fishsite_session: str | None = Cookie(default=None)) -> list[dict[str, Any]]:
    user = require_user(fishsite_session)
    normalized_email = normalize_email(email) if email else ""
    with connect() as connection:
        with connection.cursor() as cursor:
            if user["role"] == "admin" and not email:
                cursor.execute("SELECT * FROM orders ORDER BY id DESC")
            elif normalized_email:
                if user["role"] != "admin" and normalized_email != user["email"].lower():
                    raise HTTPException(status_code=403, detail="Недостаточно прав")
                cursor.execute("SELECT * FROM orders WHERE lower(customer_email) = %s ORDER BY id DESC", (normalized_email,))
            else:
                cursor.execute("SELECT * FROM orders WHERE lower(customer_email) = %s ORDER BY id DESC", (user["email"].lower(),))
            rows = cursor.fetchall()
        return [order_to_api(connection, row) for row in rows]


@app.post("/api/contact-requests")
async def contact_request(request: Request) -> dict[str, Any]:
    payload = await request.json()
    if not payload.get("name") or not payload.get("email") or not payload.get("message"):
        raise HTTPException(status_code=400, detail="Заполните имя, email и сообщение")
    email = normalize_email(payload.get("email"))
    with connect() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO contact_requests (name, email, message) VALUES (%s, %s, %s) RETURNING id",
                (payload["name"].strip(), email, payload["message"].strip()),
            )
            request_id = cursor.fetchone()["id"]
        connection.commit()
    return {"ok": True, "id": request_id}


@app.post("/api/delivery-requests")
async def delivery_request(request: Request) -> dict[str, Any]:
    payload = await request.json()
    if not payload.get("address"):
        raise HTTPException(status_code=400, detail="Введите адрес доставки")
    estimated_price = 350
    with connect() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO delivery_requests (address, delivery_type, estimated_price_rub)
                VALUES (%s, %s, %s)
                RETURNING id
                """,
                (payload["address"].strip(), payload.get("deliveryTime") or "standard", estimated_price),
            )
            request_id = cursor.fetchone()["id"]
        connection.commit()
    return {"ok": True, "id": request_id, "estimatedPrice": estimated_price}


@app.get("/api/chat/thread")
def chat_thread(response: Response, fishsite_session: str | None = Cookie(default=None)) -> dict[str, Any]:
    session_id = get_session(response, fishsite_session)
    user = current_user(session_id)
    with connect() as connection:
        thread = ensure_chat_thread(connection, session_id, user)
        with connection.cursor() as cursor:
            cursor.execute("UPDATE chat_threads SET unread_user = 0, updated_at = now() WHERE id = %s", (thread["id"],))
            cursor.execute("SELECT * FROM chat_threads WHERE id = %s", (thread["id"],))
            thread = cursor.fetchone()
        messages = get_chat_messages(connection, thread["id"])
        connection.commit()
    return {"thread": chat_thread_to_api(thread), "messages": messages}


@app.get("/api/chat/messages")
def chat_messages(response: Response, fishsite_session: str | None = Cookie(default=None)) -> dict[str, Any]:
    session_id = get_session(response, fishsite_session)
    user = current_user(session_id)
    with connect() as connection:
        thread = ensure_chat_thread(connection, session_id, user)
        with connection.cursor() as cursor:
            cursor.execute("UPDATE chat_threads SET unread_user = 0, updated_at = now() WHERE id = %s", (thread["id"],))
            cursor.execute("SELECT * FROM chat_threads WHERE id = %s", (thread["id"],))
            thread = cursor.fetchone()
        messages = get_chat_messages(connection, thread["id"])
        connection.commit()
    return {"thread": chat_thread_to_api(thread), "messages": messages}


@app.post("/api/chat/messages")
async def chat_message_send(request: Request, response: Response, fishsite_session: str | None = Cookie(default=None)) -> dict[str, Any]:
    payload = await request.json()
    body = (payload.get("message") or payload.get("body") or "").strip()
    if not body:
        raise HTTPException(status_code=400, detail="Введите сообщение")
    if len(body) > 1200:
        raise HTTPException(status_code=400, detail="Сообщение слишком длинное")

    session_id = get_session(response, fishsite_session)
    user = current_user(session_id)
    with connect() as connection:
        thread = ensure_chat_thread(connection, session_id, user)
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO chat_messages (thread_id, sender_role, sender_user_id, body)
                VALUES (%s, 'customer', %s, %s)
                RETURNING *
                """,
                (thread["id"], user["id"] if user else None, body),
            )
            message = cursor.fetchone()
            cursor.execute(
                """
                UPDATE chat_threads
                SET unread_admin = unread_admin + 1,
                    last_message_at = %s,
                    updated_at = now()
                WHERE id = %s
                RETURNING *
                """,
                (message["created_at"], thread["id"]),
            )
            thread = cursor.fetchone()
        connection.commit()
    return {"thread": chat_thread_to_api(thread), "message": chat_message_to_api(message)}


@app.post("/api/order-ratings")
async def order_rating(request: Request, fishsite_session: str | None = Cookie(default=None)) -> dict[str, bool]:
    payload = await request.json()
    order_number = payload.get("orderId")
    try:
        rating = int(payload.get("rating") or 0)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="Оценка должна быть числом от 1 до 5")
    if not order_number or rating < 1 or rating > 5:
        raise HTTPException(status_code=400, detail="Передайте заказ и оценку от 1 до 5")
    user = require_user(fishsite_session)
    with connect() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id, user_id, customer_email FROM orders WHERE order_number = %s", (order_number,))
            order = cursor.fetchone()
            if not order:
                raise HTTPException(status_code=404, detail="Заказ не найден")
            is_owner = order["user_id"] == user["id"]
            is_same_email = (order.get("customer_email") or "").lower() == (user.get("email") or "").lower()
            if user["role"] != "admin" and not (is_owner or is_same_email):
                raise HTTPException(status_code=403, detail="Недостаточно прав")
            cursor.execute(
                """
                INSERT INTO order_ratings (order_id, user_id, rating, comment)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (order_id) DO UPDATE SET
                    rating = EXCLUDED.rating,
                    comment = EXCLUDED.comment,
                    updated_at = now()
                """,
                (order["id"], user["id"], rating, payload.get("comment") or ""),
            )
        connection.commit()
    return {"ok": True}


@app.get("/api/notifications")
def notifications(fishsite_session: str | None = Cookie(default=None)) -> list[dict[str, Any]]:
    user = current_user(fishsite_session)
    if not user:
        return []
    with connect() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT n.*, o.order_number
                FROM notifications n
                LEFT JOIN orders o ON o.id = n.order_id
                WHERE n.user_id = %s
                ORDER BY n.created_at DESC
                LIMIT 30
                """,
                (user["id"],),
            )
            return [normalize_row(row) for row in cursor.fetchall()]


@app.post("/api/notifications/read")
async def notifications_read(request: Request, fishsite_session: str | None = Cookie(default=None)) -> dict[str, bool]:
    user = require_user(fishsite_session)
    payload = await request.json()
    notification_id = int(payload.get("id") or 0)
    with connect() as connection:
        with connection.cursor() as cursor:
            if notification_id:
                cursor.execute("UPDATE notifications SET is_read = true WHERE id = %s AND user_id = %s", (notification_id, user["id"]))
            else:
                cursor.execute("UPDATE notifications SET is_read = true WHERE user_id = %s", (user["id"],))
        connection.commit()
    return {"ok": True}


@app.get("/api/admin/orders")
def admin_orders(fishsite_session: str | None = Cookie(default=None)) -> list[dict[str, Any]]:
    require_admin(fishsite_session)
    with connect() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM orders ORDER BY id DESC")
            rows = cursor.fetchall()
        return [order_to_api(connection, row) for row in rows]


@app.get("/api/admin/overview")
def admin_overview(fishsite_session: str | None = Cookie(default=None)) -> dict[str, Any]:
    require_admin(fishsite_session)
    with connect() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM orders ORDER BY id DESC")
            order_rows = cursor.fetchall()
            cursor.execute(
                """
                SELECT r.*, o.order_number, o.customer_name
                FROM order_ratings r
                JOIN orders o ON o.id = r.order_id
                ORDER BY r.created_at DESC
                """
            )
            ratings = [normalize_row(row) for row in cursor.fetchall()]
        return {"orders": [order_to_api(connection, row) for row in order_rows], "ratings": ratings}


@app.get("/api/admin/statistics")
def admin_statistics(period: str = "90", fishsite_session: str | None = Cookie(default=None)) -> dict[str, Any]:
    require_admin(fishsite_session)
    period_map = {"7": 7, "30": 30, "90": 90, "180": 180, "365": 365}
    days = period_map.get(str(period))
    bucket = "day" if days and days <= 31 else "month"
    order_filter = "WHERE created_at >= now() - (%s || ' days')::interval" if days else ""
    item_filter = "WHERE o.created_at >= now() - (%s || ' days')::interval" if days else ""
    rating_filter = "WHERE r.created_at >= now() - (%s || ' days')::interval" if days else ""
    order_params = (days,) if days else ()

    def fetch_all(cursor: psycopg.Cursor, query: str, params: tuple[Any, ...] = ()) -> list[dict[str, Any]]:
        cursor.execute(query, params)
        return [normalize_row(row) for row in cursor.fetchall()]

    with connect() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                f"""
                SELECT
                    COUNT(*)::integer AS orders_count,
                    COALESCE(SUM(total_amount_rub), 0)::integer AS revenue_rub,
                    COALESCE(ROUND(AVG(total_amount_rub)), 0)::integer AS average_check_rub,
                    COUNT(*) FILTER (WHERE status = 'delivered')::integer AS delivered_count
                FROM orders
                {order_filter}
                """,
                order_params,
            )
            summary = normalize_row(cursor.fetchone()) or {}

            cursor.execute(
                f"""
                SELECT
                    COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0)::float AS average_rating,
                    COUNT(r.id)::integer AS ratings_count
                FROM order_ratings r
                {rating_filter}
                """,
                order_params,
            )
            rating_summary = normalize_row(cursor.fetchone()) or {}

            time_series = fetch_all(
                cursor,
                f"""
                SELECT
                    date_trunc(%s, created_at) AS bucket,
                    COUNT(*)::integer AS orders_count,
                    COALESCE(SUM(total_amount_rub), 0)::integer AS revenue_rub,
                    COALESCE(ROUND(AVG(total_amount_rub)), 0)::integer AS average_check_rub,
                    COUNT(*) FILTER (WHERE status = 'delivered')::integer AS delivered_count
                FROM orders
                {order_filter}
                GROUP BY 1
                ORDER BY 1
                """,
                (bucket, *order_params),
            )

            statuses = fetch_all(
                cursor,
                f"""
                SELECT status, COUNT(*)::integer AS count
                FROM orders
                {order_filter}
                GROUP BY status
                ORDER BY count DESC
                """,
                order_params,
            )

            categories = fetch_all(
                cursor,
                f"""
                SELECT
                    COALESCE(oi.product_category_slug, 'other') AS category,
                    COUNT(DISTINCT oi.order_id)::integer AS orders_count,
                    COALESCE(SUM(oi.line_total_rub), 0)::integer AS revenue_rub,
                    COALESCE(SUM(oi.quantity), 0)::float AS quantity
                FROM order_items oi
                JOIN orders o ON o.id = oi.order_id
                {item_filter}
                GROUP BY COALESCE(oi.product_category_slug, 'other')
                ORDER BY revenue_rub DESC
                """,
                order_params,
            )

            payments = fetch_all(
                cursor,
                f"""
                SELECT payment_method, COUNT(*)::integer AS count, COALESCE(SUM(total_amount_rub), 0)::integer AS revenue_rub
                FROM orders
                {order_filter}
                GROUP BY payment_method
                ORDER BY count DESC
                """,
                order_params,
            )

            ratings = fetch_all(
                cursor,
                f"""
                SELECT rating, COUNT(*)::integer AS count
                FROM order_ratings r
                {rating_filter}
                GROUP BY rating
                ORDER BY rating DESC
                """,
                order_params,
            )

    first_bucket = time_series[0]["bucket"] if time_series else None
    last_bucket = time_series[-1]["bucket"] if time_series else None
    summary.update(rating_summary)
    return {
        "period": str(period),
        "bucket": bucket,
        "dateFrom": to_json_value(first_bucket),
        "dateTo": to_json_value(last_bucket),
        "summary": summary,
        "timeSeries": time_series,
        "statuses": statuses,
        "categories": categories,
        "payments": [
            {**item, "label": PAYMENT_LABELS.get(item["payment_method"], item["payment_method"])}
            for item in payments
        ],
        "ratings": ratings,
    }


@app.get("/api/admin/chat/threads")
def admin_chat_threads(fishsite_session: str | None = Cookie(default=None)) -> list[dict[str, Any]]:
    require_admin(fishsite_session)
    with connect() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT *
                FROM chat_threads
                ORDER BY
                    CASE WHEN status = 'open' THEN 0 ELSE 1 END,
                    COALESCE(last_message_at, created_at) DESC,
                    id DESC
                LIMIT 100
                """
            )
            return [chat_thread_to_api(row) for row in cursor.fetchall()]


@app.get("/api/admin/chat/messages")
def admin_chat_messages(threadId: int, fishsite_session: str | None = Cookie(default=None)) -> dict[str, Any]:
    require_admin(fishsite_session)
    with connect() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM chat_threads WHERE id = %s", (threadId,))
            thread = cursor.fetchone()
            if not thread:
                raise HTTPException(status_code=404, detail="Диалог не найден")
            cursor.execute("UPDATE chat_threads SET unread_admin = 0, updated_at = now() WHERE id = %s", (threadId,))
            cursor.execute("SELECT * FROM chat_threads WHERE id = %s", (threadId,))
            thread = cursor.fetchone()
        messages = get_chat_messages(connection, threadId)
        connection.commit()
    return {"thread": chat_thread_to_api(thread), "messages": messages}


@app.post("/api/admin/chat/messages")
async def admin_chat_message_send(request: Request, fishsite_session: str | None = Cookie(default=None)) -> dict[str, Any]:
    admin = require_admin(fishsite_session)
    payload = await request.json()
    thread_id = int(payload.get("threadId") or 0)
    body = (payload.get("message") or payload.get("body") or "").strip()
    if thread_id <= 0:
        raise HTTPException(status_code=400, detail="Передайте диалог")
    if not body:
        raise HTTPException(status_code=400, detail="Введите сообщение")
    if len(body) > 1200:
        raise HTTPException(status_code=400, detail="Сообщение слишком длинное")

    with connect() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM chat_threads WHERE id = %s", (thread_id,))
            thread = cursor.fetchone()
            if not thread:
                raise HTTPException(status_code=404, detail="Диалог не найден")
            cursor.execute(
                """
                INSERT INTO chat_messages (thread_id, sender_role, sender_user_id, body)
                VALUES (%s, 'admin', %s, %s)
                RETURNING *
                """,
                (thread_id, admin["id"], body),
            )
            message = cursor.fetchone()
            cursor.execute(
                """
                UPDATE chat_threads
                SET unread_user = unread_user + 1,
                    unread_admin = 0,
                    last_message_at = %s,
                    updated_at = now()
                WHERE id = %s
                RETURNING *
                """,
                (message["created_at"], thread_id),
            )
            thread = cursor.fetchone()
        connection.commit()
    return {"thread": chat_thread_to_api(thread), "message": chat_message_to_api(message)}


@app.post("/api/admin/chat/threads/status")
async def admin_chat_thread_status(request: Request, fishsite_session: str | None = Cookie(default=None)) -> dict[str, Any]:
    require_admin(fishsite_session)
    payload = await request.json()
    thread_id = int(payload.get("threadId") or 0)
    status = (payload.get("status") or "").strip()
    if thread_id <= 0 or status not in {"open", "closed"}:
        raise HTTPException(status_code=400, detail="Некорректный статус диалога")
    with connect() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                "UPDATE chat_threads SET status = %s, updated_at = now() WHERE id = %s RETURNING *",
                (status, thread_id),
            )
            thread = cursor.fetchone()
            if not thread:
                raise HTTPException(status_code=404, detail="Диалог не найден")
        connection.commit()
    return chat_thread_to_api(thread)


@app.get("/api/admin/products")
def admin_products(fishsite_session: str | None = Cookie(default=None)) -> list[dict[str, Any]]:
    require_admin(fishsite_session)
    with connect() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT *
                FROM products
                WHERE lower(name) NOT LIKE 'asd%' AND lower(coalesce(description, '')) NOT LIKE 'asd%'
                ORDER BY is_active DESC, is_popular DESC, id
                """
            )
            return [product_to_api(row) for row in cursor.fetchall()]


@app.post("/api/admin/products")
async def admin_product_save(request: Request, fishsite_session: str | None = Cookie(default=None)) -> dict[str, Any]:
    require_admin(fishsite_session)
    payload = await request.json()
    name = (payload.get("name") or "").strip()
    category = (payload.get("category") or payload.get("category_slug") or "fresh").strip()
    try:
        price = int(payload.get("price") or payload.get("price_rub") or 0)
        stock = max(0, float(payload.get("stock") or payload.get("stock_quantity") or 0))
        popularity = max(0, int(payload.get("popularity") or 0))
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="Цена, остаток и популярность должны быть числами")
    if not name or price <= 0:
        raise HTTPException(status_code=400, detail="Заполните название и корректную цену")
    values = {
        "category": category,
        "name": name,
        "price": price,
        "stock": stock,
        "popularity": popularity,
        "image_path": (payload.get("image") or payload.get("image_path") or "").strip() or None,
        "image_symbol": (payload.get("imageSymbol") or payload.get("image_symbol") or "").strip() or None,
        "description": (payload.get("description") or "").strip(),
        "weight": (payload.get("weight") or "1 кг").strip(),
        "shelf_life": (payload.get("shelfLife") or payload.get("shelf_life") or "").strip(),
        "origin": (payload.get("origin") or "").strip(),
        "storage": (payload.get("storage") or "").strip(),
        "is_popular": bool(payload.get("popular") or payload.get("is_popular")),
        "is_active": not (payload.get("active") is False or payload.get("is_active") is False),
    }
    with connect() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT slug FROM categories WHERE slug = %s", (values["category"],))
            if not cursor.fetchone():
                raise HTTPException(status_code=400, detail="Категория не найдена")
            try:
                product_id = int(payload.get("id") or 0)
            except (TypeError, ValueError):
                raise HTTPException(status_code=400, detail="Передайте корректный товар")
            if product_id:
                cursor.execute(
                    """
                    UPDATE products SET
                        category_slug = %s, name = %s, price_rub = %s, stock_quantity = %s,
                        popularity = %s, image_path = %s, image_symbol = %s, description = %s,
                        weight = %s, shelf_life = %s, origin = %s, storage = %s,
                        is_popular = %s, is_active = %s, updated_at = now()
                    WHERE id = %s
                    RETURNING *
                    """,
                    (
                        values["category"], values["name"], values["price"], values["stock"],
                        values["popularity"], values["image_path"], values["image_symbol"], values["description"],
                        values["weight"], values["shelf_life"], values["origin"], values["storage"],
                        values["is_popular"], values["is_active"], product_id,
                    ),
                )
            else:
                cursor.execute(
                    """
                    INSERT INTO products (
                        category_slug, name, price_rub, stock_quantity, popularity,
                        image_path, image_symbol, description, weight, shelf_life, origin,
                        storage, is_popular, is_active
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING *
                    """,
                    (
                        values["category"], values["name"], values["price"], values["stock"],
                        values["popularity"], values["image_path"], values["image_symbol"], values["description"],
                        values["weight"], values["shelf_life"], values["origin"], values["storage"],
                        values["is_popular"], values["is_active"],
                    ),
                )
            row = cursor.fetchone()
        connection.commit()
    return product_to_api(row)


@app.post("/api/admin/products/upload-image")
async def admin_product_upload(request: Request, fishsite_session: str | None = Cookie(default=None)) -> dict[str, str]:
    require_admin(fishsite_session)
    payload = await request.json()
    data_url = payload.get("dataUrl") or ""
    filename = re.sub(r"[^a-zA-Z0-9_.-]+", "-", payload.get("filename") or "product-image")
    match = re.match(r"data:image/(png|jpeg|jpg|webp);base64,(.+)", data_url)
    if not match:
        raise HTTPException(status_code=400, detail="Передайте изображение PNG, JPG или WebP")
    extension = "jpg" if match.group(1) == "jpeg" else match.group(1)
    clean_name = f"{Path(filename).stem[:48] or 'product-image'}-{secrets.token_hex(5)}.{extension}"
    try:
        image_bytes = base64.b64decode(match.group(2), validate=True)
    except (binascii.Error, ValueError):
        raise HTTPException(status_code=400, detail="Некорректные данные изображения")
    if len(image_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Файл слишком большой, максимум 5 МБ")

    upload_dir_env = os.environ.get("UPLOAD_DIR", "assets/uploads")
    upload_dir = Path(upload_dir_env)
    if not upload_dir.is_absolute():
        upload_dir = PROJECT_DIR / upload_dir
    upload_dir.mkdir(parents=True, exist_ok=True)
    (upload_dir / clean_name).write_bytes(image_bytes)

    public_prefix = os.environ.get("UPLOAD_PUBLIC_PREFIX", "assets/uploads").strip("/")
    return {"path": f"{public_prefix}/{clean_name}"}


@app.post("/api/admin/products/delete")
async def admin_product_delete(request: Request, fishsite_session: str | None = Cookie(default=None)) -> dict[str, bool]:
    require_admin(fishsite_session)
    payload = await request.json()
    try:
        product_id = int(payload.get("id") or payload.get("productId") or 0)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="Передайте корректный товар")
    if product_id <= 0:
        raise HTTPException(status_code=400, detail="Передайте товар")
    with connect() as connection:
        with connection.cursor() as cursor:
            cursor.execute("UPDATE products SET is_active = false, updated_at = now() WHERE id = %s", (product_id,))
        connection.commit()
    return {"ok": True}


@app.post("/api/admin/products/out-of-stock")
async def admin_product_out_of_stock(request: Request, fishsite_session: str | None = Cookie(default=None)) -> dict[str, Any]:
    require_admin(fishsite_session)
    payload = await request.json()
    try:
        product_id = int(payload.get("id") or payload.get("productId") or 0)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="Передайте корректный товар")
    if product_id <= 0:
        raise HTTPException(status_code=400, detail="Передайте товар")
    with connect() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                "UPDATE products SET stock_quantity = 0, updated_at = now() WHERE id = %s RETURNING *",
                (product_id,),
            )
            row = cursor.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Товар не найден")
        connection.commit()
    return product_to_api(row)


@app.post("/api/admin/orders/status")
async def admin_order_status(request: Request, fishsite_session: str | None = Cookie(default=None)) -> dict[str, Any]:
    require_admin(fishsite_session)
    payload = await request.json()
    order_number = (payload.get("orderId") or payload.get("id") or "").strip()
    status = (payload.get("status") or "").strip()
    if status not in ORDER_STATUS_LABELS:
        raise HTTPException(status_code=400, detail="Некорректный статус заказа")
    with connect() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM orders WHERE order_number = %s", (order_number,))
            order = cursor.fetchone()
            if not order:
                raise HTTPException(status_code=404, detail="Заказ не найден")
            cursor.execute("UPDATE orders SET status = %s, updated_at = now() WHERE id = %s", (status, order["id"]))
            cursor.execute(
                "INSERT INTO order_status_history (order_id, status, comment) VALUES (%s, %s, %s)",
                (order["id"], status, (payload.get("comment") or f"Статус изменен на {ORDER_STATUS_LABELS[status]}").strip()),
            )
            if order["user_id"]:
                cursor.execute(
                    """
                    INSERT INTO notifications (user_id, order_id, title, message)
                    VALUES (%s, %s, %s, %s)
                    """,
                    (
                        order["user_id"],
                        order["id"],
                        f"Статус заказа {order_number} обновлен",
                        f"Теперь заказ: {ORDER_STATUS_LABELS[status].lower()}.",
                    ),
                )
            cursor.execute("SELECT * FROM orders WHERE id = %s", (order["id"],))
            updated = cursor.fetchone()
        connection.commit()
        return order_to_api(connection, updated)


@app.get("/")
def site_index() -> FileResponse:
    return FileResponse(PROJECT_DIR / "index.html")


@app.get("/index.html")
def site_index_html() -> FileResponse:
    return FileResponse(PROJECT_DIR / "index.html")


@app.get("/robots.txt")
def robots() -> FileResponse:
    return FileResponse(PROJECT_DIR / "robots.txt")


@app.get("/sitemap.xml")
def sitemap() -> FileResponse:
    return FileResponse(PROJECT_DIR / "sitemap.xml", media_type="application/xml")


app.mount("/assets", StaticFiles(directory=PROJECT_DIR / "assets"), name="assets")
app.mount("/css", StaticFiles(directory=PROJECT_DIR / "css"), name="css")
app.mount("/js", StaticFiles(directory=PROJECT_DIR / "js"), name="js")
app.mount("/pages", StaticFiles(directory=PROJECT_DIR / "pages", html=True), name="pages")
