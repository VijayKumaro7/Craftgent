"""
Password strength policy for new account registrations.

Validates that a chosen password is long enough, has the expected
character mix, isn't on a short list of well-known leaked passwords,
and doesn't trivially echo the username. Login does NOT call this
module — pre-existing users with weaker passwords stay grandfathered.

`validate_password_strength` raises ``ValueError`` with a
human-readable reason on the first rule it fails, so the message can
flow straight through Pydantic into the 422 response body.
"""
import re

MIN_PASSWORD_LENGTH = 12

# Curated denylist of the most-attacked passwords, sourced from SecLists
# rockyou-top100 and a few obvious extras. Comparison is case-insensitive
# (we lower() the candidate before lookup) so 'Password' and 'PASSWORD'
# are caught as well.
_COMMON_PASSWORDS: frozenset[str] = frozenset({
    "password", "password1", "password12", "password123", "password1234",
    "passw0rd", "p@ssw0rd", "passwordpassword",
    "123456", "1234567", "12345678", "123456789", "1234567890",
    "12345678901", "123456789012",
    "qwerty", "qwerty123", "qwertyuiop", "qwertyuiop123",
    "asdfgh", "asdfghjkl", "zxcvbn", "zxcvbnm", "qazwsx", "qazwsxedc",
    "abc123", "abcdef", "abcdefgh", "abcdefghij", "abcd1234", "abcd12345",
    "letmein", "letmein1", "letmein123",
    "iloveyou", "iloveyou1", "iloveyou123",
    "welcome", "welcome1", "welcome123",
    "admin", "admin1", "admin123", "administrator",
    "root", "toor", "guest", "test", "test123",
    "monkey", "dragon", "master", "shadow", "sunshine",
    "football", "baseball", "superman", "batman",
    "trustno1", "ninja", "mustang", "michael",
    "hunter", "hunter2",
    "changeme", "changeme1", "changeme123",
})

_RE_LOWER   = re.compile(r"[a-z]")
_RE_UPPER   = re.compile(r"[A-Z]")
_RE_DIGIT   = re.compile(r"\d")
_RE_SPECIAL = re.compile(r"[^A-Za-z0-9]")


def validate_password_strength(password: str, username: str | None = None) -> None:
    """Raise ``ValueError`` if ``password`` does not satisfy the policy.

    Policy (all required):
      * length >= ``MIN_PASSWORD_LENGTH``
      * at least one lowercase ASCII letter
      * at least one uppercase ASCII letter
      * at least one digit
      * at least one non-alphanumeric character
      * not on the embedded common-password denylist
      * does not contain the username (case-insensitive, only when
        the username is at least 3 characters long)
    """
    if not isinstance(password, str) or not password:
        raise ValueError("Password is required")

    if len(password) < MIN_PASSWORD_LENGTH:
        raise ValueError(
            f"Password must be at least {MIN_PASSWORD_LENGTH} characters long"
        )

    # Run the denylist check before composition rules so that obvious-bad
    # entries like 'password1234' get the more informative "too common"
    # message rather than "must contain an uppercase letter".
    if password.lower() in _COMMON_PASSWORDS:
        raise ValueError("Password is too common; choose a stronger one")

    if not _RE_LOWER.search(password):
        raise ValueError("Password must contain at least one lowercase letter")
    if not _RE_UPPER.search(password):
        raise ValueError("Password must contain at least one uppercase letter")
    if not _RE_DIGIT.search(password):
        raise ValueError("Password must contain at least one digit")
    if not _RE_SPECIAL.search(password):
        raise ValueError("Password must contain at least one special character")

    if username and len(username) >= 3 and username.lower() in password.lower():
        raise ValueError("Password must not contain the username")
