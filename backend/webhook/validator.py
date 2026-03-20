"""
PRISM Webhook Validator — GitLab token verification.
"""
import hmac


def validate_gitlab_signature(payload: bytes, signature: str, secret: str) -> bool:
    """Validate the GitLab webhook token.
    
    GitLab sends the raw secret in the X-Gitlab-Token header (not HMAC).
    We use constant-time comparison to prevent timing attacks.
    
    Args:
        payload: Raw request body bytes (unused for token-based auth, kept for interface).
        signature: Value of the X-Gitlab-Token header.
        secret: The configured webhook secret.
        
    Returns:
        True if the token matches, False otherwise.
    """
    return hmac.compare_digest(signature, secret)
