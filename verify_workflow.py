import json
import urllib.request
import urllib.error

BASE = "http://localhost:8080"


def req(method, path, token=None, body=None):
    r = urllib.request.Request(BASE + path, method=method)
    r.add_header("Content-Type", "application/json")
    if token:
        r.add_header("Authorization", "Bearer " + token)
    data = json.dumps(body).encode() if body is not None else None
    try:
        with urllib.request.urlopen(r, data=data, timeout=25) as resp:
            raw = resp.read().decode()
            return resp.status, (json.loads(raw) if raw else None)
    except urllib.error.HTTPError as e:
        raw = e.read().decode()
        try:
            payload = json.loads(raw)
        except Exception:
            payload = raw
        return e.code, payload


def D(p):
    return p["data"] if isinstance(p, dict) and "data" in p and "success" in p else p


def login(u, p):
    code, payload = req("POST", "/api/auth/login", body={"username": u, "password": p})
    if code != 200:
        return None
    return payload["accessToken"]


def login_any(u, candidates):
    for c in candidates:
        t = login(u, c)
        if t:
            return t, c
    return None, None


def cc_state(admin, cc_id):
    c, cc = req("GET", f"/api/cost-centers/{cc_id}", admin)
    return D(cc)


def main():
    print("== WORKFLOW + BUDGET LIFECYCLE ==")
    admin = login("admin@123", "Admin@123")
    emp = login("employee@123", "Employee@123")
    if not admin or not emp:
        print("login failed")
        return

    # 1. Remove junk HACK rule (id 4) and configure IT workflow
    req("DELETE", "/api/approval-rules/4", admin)
    c, page = req("GET", "/api/approval-rules?page=0&size=50", admin)
    page = D(page)
    existing = next((r for r in page["content"] if r.get("departmentId") == 4 and r.get("ruleCode") == "AR-IT-001"), None)
    if not existing:
        c, rule = req("POST", "/api/approval-rules", admin, {
            "ruleCode": "AR-IT-001", "ruleName": "IT Standard Approval", "departmentId": 4,
            "minimumAmount": 0.0, "maximumAmount": None, "active": True,
            "description": "Two-stage approval for Information Technology requests",
        })
        rule = D(rule)
        print(f"created AR-IT-001 -> {c} id={rule.get('id') if isinstance(rule, dict) else rule}")
        rule_id = rule["id"]
        for st, seq, name, role in [
            (1, 1, "Department Manager Approval", 10),
            (2, 2, "Senior Manager Approval", 11),
        ]:
            c2, stage = req("POST", "/api/approval-stages", admin, {
                "approvalRuleId": rule_id, "stageNumber": st, "stageName": name,
                "approverRoleId": role, "minimumApprovers": 1, "mandatoryApproval": True,
                "sequence": seq, "active": True,
            })
            print(f"  stage {st} ({name}) -> {c2}")
    else:
        rule_id = existing["id"]
        print(f"AR-IT-001 already exists id={rule_id}")

    # 2. Employee submits a request
    c, me = req("GET", "/api/auth/me", emp)
    me = D(me)
    emp_id, dept_id = me["employeeId"], me["departmentId"]
    c, prof = req("GET", "/api/employees/me", emp)
    prof = D(prof)
    cc_id = prof["costCenterId"]
    before = cc_state(admin, cc_id)
    print(f"[IT-001] before: remaining={before['remainingBudget']} used={before['usedBudget']}")

    c, pr = req("POST", "/api/purchase-requests", emp, {
        "requesterId": emp_id, "departmentId": dept_id, "costCenterId": cc_id,
        "requiredDate": "2026-12-31", "priority": "HIGH",
        "purpose": "Workflow verification - department manager to senior manager chain",
        "estimatedAmount": 15000.0,
    })
    pr = D(pr)
    print(f"create -> {c} {pr.get('requestNumber') if isinstance(pr, dict) else pr}")
    if c != 201:
        return
    pr_id = pr["id"]
    req("POST", "/api/purchase-request-lines", emp, {
        "purchaseRequestId": pr_id, "productId": 1, "quantity": 1, "unitPrice": 15000.0,
    })
    c, _ = req("POST", f"/api/purchase-requests/{pr_id}/submit", emp)
    print(f"submit -> {c} (expect 200)")
    if c != 200:
        return

    after = cc_state(admin, cc_id)
    print(f"[COMMIT] remaining {before['remainingBudget']} -> {after['remainingBudget']} used {before['usedBudget']} -> {after['usedBudget']}")

    c, tasks = req("GET", f"/api/approval-tasks?purchaseRequestId={pr_id}&size=5", admin)
    tasks = D(tasks)
    t1 = next((t for t in tasks["content"] if t.get("status") == "PENDING"), None)
    print(f"[TASK1] {t1.get('taskNumber')} assigned to emp {t1.get('assignedEmployeeId')} ({t1.get('assignedRoleName')})")

    # 3. Manager approves -> senior manager task
    mgr_tok, pw = login_any("manager@123", ["Manager@123", "manager@123", "Manager@1234"])
    print(f"manager@123 login -> {'ok (' + pw + ')' if mgr_tok else 'FAILED'}")
    if mgr_tok:
        c, _ = req("POST", f"/api/approval-tasks/{t1['id']}/approve", mgr_tok, {"comments": "Approved by manager"})
        print(f"manager approve -> {c}")
        c, tasks = req("GET", f"/api/approval-tasks?purchaseRequestId={pr_id}&size=5", admin)
        tasks = D(tasks)
        t2 = next((t for t in tasks["content"] if t.get("status") == "PENDING"), None)
        if t2:
            print(f"[TASK2] {t2.get('taskNumber')} assigned to emp {t2.get('assignedEmployeeId')} ({t2.get('assignedRoleName')})")
            sm_tok, pw2 = login_any("seniormanager@123", ["SeniorManager@123", "seniormanager@123", "SeniorManager@1234"])
            print(f"seniormanager@123 login -> {'ok (' + pw2 + ')' if sm_tok else 'FAILED'}")
            if sm_tok:
                c, _ = req("POST", f"/api/approval-tasks/{t2['id']}/approve", sm_tok, {"comments": "Approved by senior manager"})
                print(f"senior manager approve -> {c}")
                c, pr2 = req("GET", f"/api/purchase-requests/{pr_id}", admin)
                pr2 = D(pr2)
                print(f"[PR STATUS] {pr2.get('status')} / {pr2.get('approvalStatus')} (expect APPROVED/APPROVED)")

    # 4. Return path releases budget
    c, pr3 = req("POST", "/api/purchase-requests", emp, {
        "requesterId": emp_id, "departmentId": dept_id, "costCenterId": cc_id,
        "requiredDate": "2026-12-31", "priority": "MEDIUM",
        "purpose": "Workflow return test", "estimatedAmount": 800.0,
    })
    pr3 = D(pr3)
    req("POST", f"/api/purchase-requests/{pr3['id']}/submit", emp)
    c, tasks = req("GET", f"/api/approval-tasks?purchaseRequestId={pr3['id']}&size=5", admin)
    tasks = D(tasks)
    t3 = next((t for t in tasks["content"] if t.get("status") == "PENDING"), None)
    if mgr_tok and t3:
        c, _ = req("POST", f"/api/approval-tasks/{t3['id']}/return", mgr_tok, {"comments": "Please add more justification"})
        print(f"manager return -> {c}")
        after_return = cc_state(admin, cc_id)
        print(f"[RETURN RELEASE] remaining now {after_return['remainingBudget']} used {after_return['usedBudget']} (released={after_return['remainingBudget'] > after['remainingBudget']})")
        c, pr4 = req("GET", f"/api/purchase-requests/{pr3['id']}", admin)
        pr4 = D(pr4)
        print(f"[PR3 STATUS] {pr4.get('status')} / {pr4.get('approvalStatus')} (expect DRAFT/RETURNED)")

    print("== DONE ==")


if __name__ == "__main__":
    main()
