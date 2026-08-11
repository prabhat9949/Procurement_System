import json
import urllib.request
import urllib.error

BASE = "http://localhost:8080"
BUDGETS = {"ADM-001": 1500000, "PROC-001": 12000000, "FIN-001": 3500000,
           "IT-001": 5000000, "HR-001": 2000000, "WH-001": 7000000, "IT-002": 2500000}


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


def cc_state(admin, cc_id):
    c, cc = req("GET", f"/api/cost-centers/{cc_id}", admin)
    cc = D(cc)
    return cc


def main():
    print("== BUDGET ALLOCATION + LIFECYCLE ==")
    emp = login("employee@123", "Employee@123")
    admin = login("admin@123", "Admin@123")
    if not emp or not admin:
        print("login failed")
        return

    # 1. Allocate budgets
    c, page = req("GET", "/api/cost-centers?page=0&size=50", admin)
    page = D(page)
    for cc in page.get("content", []):
        budget = BUDGETS.get(cc.get("code"))
        if budget and (cc.get("budget") or 0) == 0:
            c2, _ = req("PUT", f"/api/cost-centers/{cc['id']}", admin, {
                "code": cc["code"], "name": cc["name"], "departmentId": cc["departmentId"],
                "budget": budget, "active": True,
            })
            print(f"allocated {cc['code']} budget={budget} -> {c2}")
    c, page = req("GET", "/api/cost-centers?page=0&size=50", admin)
    page = D(page)
    it = next(cc for cc in page["content"] if cc.get("code") == "IT-001")
    cc_id = it["id"]
    rem0, used0 = it["remainingBudget"], it["usedBudget"]
    print(f"[IT-001] after allocation: remaining={rem0} used={used0}")

    c, me = req("GET", "/api/auth/me", emp)
    me = D(me)
    emp_id, dept_id = me["employeeId"], me["departmentId"]

    def create_submit(amount, purpose):
        c, pr = req("POST", "/api/purchase-requests", emp, {
            "requesterId": emp_id, "departmentId": dept_id, "costCenterId": cc_id,
            "requiredDate": "2026-12-31", "priority": "LOW",
            "purpose": purpose, "estimatedAmount": amount,
        })
        pr = D(pr)
        if c != 201:
            print(f"  create failed {c}: {pr}")
            return None
        c2, _ = req("POST", f"/api/purchase-requests/{pr['id']}/submit", emp)
        print(f"  submit {amount} -> {c2}")
        return pr["id"] if c2 == 200 else None

    # 2. Submit commits
    pr1 = create_submit(500, "Budget lifecycle test 1")
    if pr1:
        s = cc_state(admin, cc_id)
        print(f"[SUBMIT] remaining {rem0} -> {s['remainingBudget']} (delta={rem0 - s['remainingBudget']})")
        rem_after_submit = s["remainingBudget"]
        # 3. Cancel releases
        req("POST", f"/api/purchase-requests/{pr1}/cancel", emp)
        s = cc_state(admin, cc_id)
        print(f"[CANCEL] remaining {rem_after_submit} -> {s['remainingBudget']} (restored={s['remainingBudget'] == rem0})")

    # 4. Reject releases
    pr2 = create_submit(600, "Budget lifecycle test 2")
    if pr2:
        c, tasks = req("GET", f"/api/approval-tasks?purchaseRequestId={pr2}&size=5", admin)
        tasks = D(tasks)
        task = next((t for t in tasks.get("content", []) if t.get("status") == "PENDING"), None)
        if task:
            uname = None
            c, users = req("GET", "/api/users/search?page=0&size=200", admin)
            users = D(users)
            # try matching by employee id in the user response (id or employeeId field)
            for u in users.get("content", []):
                if u.get("employeeId") == task.get("assignedEmployeeId"):
                    uname = u.get("username")
                    break
            print(f"[REJECT] task {task['id']} assigned emp {task.get('assignedEmployeeId')} ({task.get('assignedRoleName')}) user={uname}")
            tok = None
            if uname:
                for cand in ["Manager@123", "SeniorManager@123", "Head@123", "Procurement@123", "Admin@123"]:
                    tok = login(uname, cand)
                    if tok:
                        break
            if tok:
                c, _ = req("POST", f"/api/approval-tasks/{task['id']}/reject", tok, {"comments": "reject for release test"})
                s = cc_state(admin, cc_id)
                print(f"[REJECT] after reject remaining={s['remainingBudget']} (restored={s['remainingBudget'] == rem0})")
            else:
                print("[REJECT] could not log in as approver - skipped")
        else:
            print("[REJECT] no pending task")
    print("== DONE ==")


if __name__ == "__main__":
    main()
