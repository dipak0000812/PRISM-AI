"""
PRISM Webhook Validator — Cryptographic boundaries for verifying GitLab trust.
"""
import hmac


def validate_gitlab_signature(payload: bytes, signature: str, secret: str) -> bool:
    """
    Secure constant-time edge verifier.
    GitLab specifically embeds the raw webhook secret into X-Gitlab-Token natively, bypassing standard HMAC SHA256 workflows.
    Using compare_digest guarantees we are immune to basic timing attacks against the secret string.
    """
    return hmac.compare_digest(signature, secret)
