# One-time codemod: replace USD currency literals with INR (₹) across the EPS frontend.
# - "$38,990.00" -> "₹38,990.00" (Indian digit grouping)
# - "$1,440,000" -> "₹14,40,000"
# - "$480k"      -> "₹4,80,000"
# - DollarSign icon import/usage -> IndianRupee
# - "USD" / "($USD)" / "($ USD)" labels -> "INR" / "(₹)"
# Idempotent: already-converted values are left untouched.
import os
import re

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend", "src")

def indian_group(n_str):
    """Group a plain digit string using Indian (2-2-3) grouping."""
    if len(n_str) <= 3:
        return n_str
    last3 = n_str[-3:]
    rest = n_str[:-3]
    parts = []
    while len(rest) > 2:
        parts.insert(0, rest[-2:])
        rest = rest[:-2]
    if rest:
        parts.insert(0, rest)
    return ",".join(parts) + "," + last3

def convert_amount(m):
    """Convert a '$X,XXX.XX' or '$X,XXX' match to '₹' + Indian grouping."""
    whole = m.group("whole").replace(",", "")
    frac = m.group("frac")  # may be None
    body = indian_group(whole)
    if frac:
        body += frac
    return "\u20b9" + body

def convert_k(m):
    """Convert '$480k' -> '₹4,80,000'."""
    num = int(m.group("num"))
    return "\u20b9" + indian_group(str(num * 1000))

CURRENCY_RE = re.compile(r"\$(?P<whole>\d{1,3}(?:,\d{3})+|\d+)(?P<frac>\.\d+)?")
K_RE = re.compile(r"\$(?P<num>\d{1,3})k\b", re.IGNORECASE)

def process_file(path):
    with open(path, "r", encoding="utf-8", errors="replace") as f:
        text = f.read()
    orig = text

    # 1. $NNNk shorthand first (so the later full-amount regex doesn't grab the k).
    text = K_RE.sub(convert_k, text)

    # 2. Full currency amounts.
    text = CURRENCY_RE.sub(convert_amount, text)

    # 3. DollarSign icon -> IndianRupee.
    text = text.replace("DollarSign", "IndianRupee")

    # 4. USD labels -> INR / ₹.
    text = text.replace("($USD)", "(INR)")
    text = text.replace("($ USD)", "(₹)")
    text = text.replace("$USD", "INR")
    text = text.replace("USD ($ - United States Dollar)", "INR (\u20b9 - Indian Rupee)")
    text = re.sub(r"\bUnited States Dollar\b", "Indian Rupee", text)
    text = re.sub(r"\bUSD\b", "INR", text)
    text = text.replace("usd", "INR")

    if text != orig:
        with open(path, "w", encoding="utf-8", newline="") as f:
            f.write(text)
        return True
    return False

changed = []
for dirpath, _dirs, files in os.walk(ROOT):
    for fn in files:
        if fn.endswith((".jsx", ".js")):
            p = os.path.join(dirpath, fn)
            if process_file(p):
                changed.append(os.path.relpath(p, ROOT))

print(f"Converted {len(changed)} files:")
for c in sorted(changed):
    print("  " + c)
