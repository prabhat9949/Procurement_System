import json
import urllib.request

BASE = "http://localhost:8080/api/auth/login"

ACCOUNTS = [
    ("admin@123", "Admin@123"),
    ("hr@123", "Hr@123"),
    ("employee@123", "Employee@123"),
    ("employee2@123", "Employee2@123"),
    ("employee3@123", "Employee3@123"),
    ("employee4@123", "Employee4@123"),
    ("manager@123", "Manager@123"),
    ("manager2@123", "Manager2@123"),
    ("manager3@123", "Manager3@123"),
    ("seniormanager@123", "SeniorManager@123"),
    ("seniormanager2@123", "SeniorManager2@123"),
    ("head@123", "Head@123"),
    ("procurement@123", "Procurement@123"),
    ("procurement2@123", "Procurement2@123"),
    ("procurement3@123", "Procurement3@123"),
    ("equipment@123", "Equipment@123"),
    ("equipment2@123", "Equipment2@123"),
    ("software@123", "Software@123"),
    ("software2@123", "Software2@123"),
    ("facilities@123", "Facilities@123"),
    ("facilities2@123", "Facilities2@123"),
    ("warehouse@123", "Warehouse@123"),
    ("warehouse2@123", "Warehouse2@123"),
    ("finance@123", "Finance@123"),
    ("finance2@123", "Finance2@123"),
    ("auditor@123", "Auditor@123"),
    ("vendor@123", "Vendor@123"),
    ("vendor2@123", "Vendor2@123"),
    ("vendor3@123", "Vendor3@123"),
    ("vendor4@123", "Vendor4@123"),
]

passed = 0
failed = []

for username, password in ACCOUNTS:
    body = json.dumps({"username": username, "password": password}).encode()
    req = urllib.request.Request(BASE, data=body, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            data = json.loads(resp.read().decode())
            role = data.get("roleCode") or (data.get("data") or {}).get("roleCode") or "OK"
            print(f"PASS {username} -> {role}")
            passed += 1
    except Exception as e:
        print(f"FAIL {username} -> {e}")
        failed.append(username)

print(f"\nRESULT: {passed}/{len(ACCOUNTS)} passed")
if failed:
    print("FAILED:", ", ".join(failed))
else:
    print("ALL LOGINS PASS")
