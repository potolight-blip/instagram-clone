import io
import uuid
from PIL import Image
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

from sqlalchemy import select
from app.core.database import SessionLocal
from app.models.user import User

_db = SessionLocal()
_leftovers = _db.scalars(select(User.username).where(User.username.like("smoke_%"))).all()
_db.close()
for _name in _leftovers:
    _login = client.post("/api/v1/auth/login", json={"username_or_email": _name, "password": "12345"})
    if _login.status_code == 200:
        client.request(
            "DELETE",
            "/api/v1/users/me",
            headers={"Authorization": f"Bearer {_login.json()['access_token']}"},
            json={"confirm": "삭제"},
        )


def auth(token):
    return {"Authorization": f"Bearer {token}"}


def expect(response, code):
    if response.status_code != code:
        raise SystemExit(f"{response.request.method} {response.request.url} -> {response.status_code} {response.text}")
    return response


login = expect(client.post("/api/v1/auth/login", json={"username_or_email": "test@gmail.com", "password": "12345"}), 200).json()
token = login["access_token"]
assert login["user"]["username"] == "test"
headers = auth(token)

me = expect(client.get("/api/v1/auth/me", headers=headers), 200).json()
assert "unread_notification_count" in me
assert "hide_likes_by_default" in me

feed = expect(client.get("/api/v1/posts/feed", headers=headers), 200).json()
assert feed["items"], "feed empty"
post_id = feed["items"][0]["id"]

expect(client.get(f"/api/v1/posts/{post_id}", headers=headers), 200)
expect(client.get("/api/v1/posts/explore", headers=headers), 200)
expect(client.get("/api/v1/posts/user/test", headers=headers), 200)
expect(client.get("/api/v1/posts/bookmarked", headers=headers), 200)
expect(client.get(f"/api/v1/posts/{post_id}/comments", headers=headers), 200)
stories = expect(client.get("/api/v1/stories/feed", headers=headers), 200).json()
expect(client.get("/api/v1/stories/archive", headers=headers), 200)
notes = expect(client.get("/api/v1/notifications", headers=headers), 200).json()
assert isinstance(notes, list)
rooms = expect(client.get("/api/v1/chats/rooms", headers=headers), 200).json()
assert rooms
expect(client.get(f"/api/v1/chats/rooms/{rooms[0]['id']}/messages", headers=headers), 200)
expect(client.get("/api/v1/users/test", headers=headers), 200)
expect(client.get("/api/v1/users/search", headers=headers), 200)
expect(client.get("/api/v1/users/search?q=june", headers=headers), 200)
expect(client.get("/api/v1/users/suggested", headers=headers), 200)

suffix = uuid.uuid4().hex[:8]
signup = expect(client.post("/api/v1/auth/signup", json={
    "email": f"Smoke.{suffix}@example.com",
    "username": f"smoke_{suffix}",
    "password": "12345",
    "full_name": "",
}), 201).json()
smoke = auth(signup["access_token"])
assert signup["user"]["email"] == f"smoke.{suffix}@example.com"
assert signup["user"]["full_name"] is None
if stories:
    expect(client.post(f"/api/v1/stories/{stories[0]['stories'][0]['id']}/view", headers=smoke), 204)
    expect(client.post(f"/api/v1/stories/{stories[0]['stories'][0]['id']}/view", headers=smoke), 204)

expect(client.post("/api/v1/auth/signup", json={
    "email": f"other.{suffix}@example.com",
    "username": f"Smoke_{suffix}",
    "password": "12345",
}), 400)

buf = io.BytesIO()
Image.new("RGB", (20, 20), (10, 120, 200)).save(buf, format="PNG")
buf.seek(0)
created = expect(client.post(
    "/api/v1/posts",
    headers=smoke,
    data={"caption": "hello", "location": "Seoul", "aspect_ratio": "4:5", "hide_likes": "true", "disable_comments": "false"},
    files=[("files", ("a.png", buf.getvalue(), "image/png"))],
), 201).json()
assert created["media"][0]["aspect_ratio"] == "4:5"
assert created["hide_likes"] is True
new_id = created["id"]

liked = expect(client.post(f"/api/v1/posts/{post_id}/like", headers=smoke), 200).json()
expect(client.post(f"/api/v1/posts/{post_id}/like", headers=smoke), 200)
expect(client.post(f"/api/v1/posts/{new_id}/bookmark", headers=smoke), 200)
comment = expect(client.post(f"/api/v1/posts/{post_id}/comments", headers=smoke, json={"content": "  smoke comment  "}), 201).json()
expect(client.post(f"/api/v1/comments/{comment['id']}/like", headers=headers), 200)
expect(client.post(f"/api/v1/comments/{comment['id']}/like", headers=headers), 200)

followed = expect(client.post("/api/v1/users/7/follow", headers=smoke), 200).json()
assert followed["is_following"] is True
expect(client.post("/api/v1/users/7/follow", headers=smoke), 200)

room = expect(client.post("/api/v1/chats/rooms", headers=smoke, json={"target_user_id": 7}), 200).json()
expect(client.post(f"/api/v1/chats/rooms/{room['id']}/messages", headers=smoke, json={"content": "  hi  "}), 201)
expect(client.get(f"/api/v1/chats/rooms/{room['id']}/messages", headers=headers), 200)
expect(client.post("/api/v1/auth/change-password", headers=smoke, json={"current_password": "12345", "new_password": "123456"}), 204)
expect(client.patch("/api/v1/users/me", headers=smoke, json={"bio": "hi", "phone": "", "is_private": True}), 200)
expect(client.get("/api/v1/users/me/export", headers=smoke), 200)
expect(client.request("DELETE", "/api/v1/users/me", headers=smoke, json={"confirm": "삭제"}), 204)
expect(client.post("/api/v1/auth/login", json={"username_or_email": f"smoke_{suffix}", "password": "123456"}), 401)
print("ok", "feed", len(feed["items"]), "rooms", len(rooms), "liked_was", liked["liked"])
