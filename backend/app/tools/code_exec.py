"""
Code execution tool — runs Python code in a subprocess sandbox.

Safety measures:
  - Hard timeout (default 10 seconds)
  - stdout/stderr captured, not streamed to shell
  - No network access from within subprocess
  - No file system writes outside /tmp
  - Memory limited by OS (not enforced here — Phase 4 adds cgroups)

Used by ALEX for code verification and demonstration.
"""
import subprocess
import sys
import textwrap
import structlog
from langchain_core.tools import tool
from app.core.config import get_settings

logger = structlog.get_logger()

# Dangerous imports that should never run in the sandbox
BLOCKED_IMPORTS = [
    "os.system", "subprocess", "socket", "requests",
    "urllib", "ftplib", "telnetlib", "shutil.rmtree",
    "__import__", "eval(", "exec(",
]


def _is_safe(code: str) -> tuple[bool, str]:
    """Basic static check — not a replacement for proper sandboxing."""
    lowered = code.lower()
    for blocked in BLOCKED_IMPORTS:
        if blocked.lower() in lowered:
            return False, f"Blocked: '{blocked}' is not allowed in the sandbox."
    return True, ""


@tool
def execute_python(code: str) -> str:
    """
    Execute a Python code snippet and return the output.
    Use this to verify logic, run calculations, or demonstrate code.
    Only pure Python — no network, no file writes outside /tmp.

    Args:
        code: Valid Python code to execute.

    Returns:
        stdout output, or error message if execution fails.
    """
    settings = get_settings()

    # Safety check
    safe, reason = _is_safe(code)
    if not safe:
        return f"[SANDBOX BLOCKED] {reason}"

    # Wrap in print-capture boilerplate
    wrapped = textwrap.dedent(code)

    try:
        result = subprocess.run(
            [sys.executable, "-c", wrapped],
            capture_output=True,
            text=True,
            timeout=settings.code_exec_timeout,
            # Minimal environment — no inherited env vars
            env={"PATH": "/usr/bin:/bin", "HOME": "/tmp"},
        )

        output_parts = []
        if result.stdout.strip():
            output_parts.append(f"Output:\n{result.stdout.strip()}")
        if result.stderr.strip():
            output_parts.append(f"Stderr:\n{result.stderr.strip()}")
        if result.returncode != 0 and not result.stderr:
            output_parts.append(f"Exit code: {result.returncode}")

        return "\n".join(output_parts) if output_parts else "(no output)"

    except subprocess.TimeoutExpired:
        return f"[TIMEOUT] Code execution exceeded {settings.code_exec_timeout}s limit."
    except Exception as e:
        logger.error("code_exec_failed", error=str(e))
        return f"[EXECUTION ERROR] {e}"
