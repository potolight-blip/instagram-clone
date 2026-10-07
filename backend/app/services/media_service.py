import io
import uuid
from pathlib import Path

from fastapi import UploadFile
from PIL import Image, ImageOps, UnidentifiedImageError

from app.core.errors import APIError

try:
    from pillow_heif import register_heif_opener

    register_heif_opener()
except ImportError:
    register_heif_opener = None

UPLOAD_DIR = Path("uploads") / "posts"
ALLOWED_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/heic",
    "image/heif",
    "image/heic-sequence",
    "image/heif-sequence",
}
ALLOWED_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".heic", ".heif"}


def ensure_upload_dir() -> None:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def ensure_default_avatar() -> None:
    path = Path("static") / "default_profile.png"
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        return
    Image.new("RGB", (256, 256), (38, 38, 38)).save(path, format="PNG")


def _allowed(upload: UploadFile) -> bool:
    content_type = (upload.content_type or "").lower()
    if content_type.startswith("video/"):
        raise APIError(400, "동영상은 올릴 수 없습니다.", "MEDIA_NOT_ALLOWED")
    suffix = Path(upload.filename or "").suffix.lower()
    return content_type in ALLOWED_TYPES or suffix in ALLOWED_SUFFIXES


def save_post_image(upload: UploadFile) -> str:
    if not _allowed(upload):
        raise APIError(400, "지원하지 않는 이미지 형식입니다.", "MEDIA_NOT_ALLOWED")
    raw = upload.file.read()
    if not raw:
        raise APIError(400, "빈 파일은 올릴 수 없습니다.", "MEDIA_NOT_ALLOWED")
    try:
        image = Image.open(io.BytesIO(raw))
        image = ImageOps.exif_transpose(image)
    except UnidentifiedImageError as exc:
        raise APIError(400, "이미지 파일을 열 수 없습니다.", "MEDIA_NOT_ALLOWED") from exc

    if getattr(image, "is_animated", False):
        image.seek(0)
    if image.mode in ("RGBA", "LA"):
        background = Image.new("RGB", image.size, (255, 255, 255))
        background.paste(image, mask=image.getchannel("A"))
        image = background
    elif image.mode != "RGB":
        image = image.convert("RGB")

    image.thumbnail((1080, 1080), Image.Resampling.LANCZOS)
    ensure_upload_dir()
    name = f"{uuid.uuid4().hex}.webp"
    image.save(UPLOAD_DIR / name, format="WEBP", quality=85)
    return f"/uploads/posts/{name}"
