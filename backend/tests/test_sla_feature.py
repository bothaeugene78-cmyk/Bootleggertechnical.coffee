"""
SLA Feature Tests - Bootlegger Service Management System
Tests: SLA Plans, Manual Assignment, Stripe Subscribe, Subscription Management
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "john@bootlegger.co.za"
ADMIN_PASSWORD = "newpassword123"
STORE_STAFF_EMAIL = "teststaff@bootlegger.co.za"
STORE_STAFF_PASSWORD = "test123456"


@pytest.fixture(scope="module")
def admin_token():
    """Get admin authentication token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    assert response.status_code == 200, f"Admin login failed: {response.text}"
    return response.json()["token"]


@pytest.fixture(scope="module")
def store_staff_token():
    """Get or create store staff user and return token"""
    # First try to login
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": STORE_STAFF_EMAIL,
        "password": STORE_STAFF_PASSWORD
    })
    
    if response.status_code == 200:
        return response.json()["token"]
    
    # If login fails, register the user
    response = requests.post(f"{BASE_URL}/api/auth/register", json={
        "email": STORE_STAFF_EMAIL,
        "password": STORE_STAFF_PASSWORD,
        "name": "Test Staff User",
        "store_name": "TEST Store"
    })
    
    if response.status_code == 200:
        return response.json()["token"]
    
    # If registration also fails, try login again (user might already exist)
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": STORE_STAFF_EMAIL,
        "password": STORE_STAFF_PASSWORD
    })
    
    if response.status_code == 200:
        return response.json()["token"]
    
    pytest.skip("Could not authenticate store staff user")


class TestSLAPlans:
    """Test GET /api/sla/plans endpoint"""
    
    def test_get_sla_plans_returns_3_plans(self):
        """Verify SLA plans endpoint returns exactly 3 plans"""
        response = requests.get(f"{BASE_URL}/api/sla/plans")
        assert response.status_code == 200, f"Failed to get plans: {response.text}"
        
        plans = response.json()
        assert len(plans) == 3, f"Expected 3 plans, got {len(plans)}"
    
    def test_silver_plan_price_1000_zar(self):
        """Verify Silver plan is R1000"""
        response = requests.get(f"{BASE_URL}/api/sla/plans")
        assert response.status_code == 200
        
        plans = response.json()
        silver = next((p for p in plans if p["id"] == "silver"), None)
        
        assert silver is not None, "Silver plan not found"
        assert silver["price"] == 1000.0, f"Expected 1000, got {silver['price']}"
        assert silver["currency"] == "zar", f"Expected 'zar', got {silver['currency']}"
        assert silver["name"] == "Silver", f"Expected 'Silver', got {silver['name']}"
    
    def test_gold_plan_price_1250_zar(self):
        """Verify Gold plan is R1250"""
        response = requests.get(f"{BASE_URL}/api/sla/plans")
        assert response.status_code == 200
        
        plans = response.json()
        gold = next((p for p in plans if p["id"] == "gold"), None)
        
        assert gold is not None, "Gold plan not found"
        assert gold["price"] == 1250.0, f"Expected 1250, got {gold['price']}"
        assert gold["currency"] == "zar"
        assert gold["name"] == "Gold"
    
    def test_platinum_plan_price_1500_zar(self):
        """Verify Platinum plan is R1500"""
        response = requests.get(f"{BASE_URL}/api/sla/plans")
        assert response.status_code == 200
        
        plans = response.json()
        platinum = next((p for p in plans if p["id"] == "platinum"), None)
        
        assert platinum is not None, "Platinum plan not found"
        assert platinum["price"] == 1500.0, f"Expected 1500, got {platinum['price']}"
        assert platinum["currency"] == "zar"
        assert platinum["name"] == "Platinum"
    
    def test_plans_have_price_display_format(self):
        """Verify plans have correctly formatted price_display"""
        response = requests.get(f"{BASE_URL}/api/sla/plans")
        assert response.status_code == 200
        
        plans = response.json()
        
        for plan in plans:
            assert "price_display" in plan, f"Plan {plan['id']} missing price_display"
            assert "R" in plan["price_display"], f"Price display should contain 'R': {plan['price_display']}"
            assert "/month" in plan["price_display"], f"Price display should contain '/month': {plan['price_display']}"


class TestSLAManualAssign:
    """Test POST /api/sla/manual-assign endpoint - Admin only"""
    
    def test_admin_can_manual_assign_silver(self, admin_token):
        """Admin can manually assign Silver SLA to store"""
        test_store = f"TEST_SLA_Store_{uuid.uuid4().hex[:6]}"
        
        response = requests.post(
            f"{BASE_URL}/api/sla/manual-assign",
            json={
                "store_name": test_store,
                "plan_id": "silver",
                "notes": "Test assignment - pytest"
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200, f"Manual assign failed: {response.text}"
        
        data = response.json()
        assert data["store_name"] == test_store
        assert data["plan_id"] == "silver"
        assert data["plan_name"] == "Silver"
        assert data["price"] == 1000.0
        assert data["status"] == "active"
        assert data["payment_method"] == "manual"
        assert data["notes"] == "Test assignment - pytest"
    
    def test_admin_can_manual_assign_gold(self, admin_token):
        """Admin can manually assign Gold SLA to store"""
        test_store = f"TEST_SLA_Gold_{uuid.uuid4().hex[:6]}"
        
        response = requests.post(
            f"{BASE_URL}/api/sla/manual-assign",
            json={
                "store_name": test_store,
                "plan_id": "gold",
                "notes": None
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200, f"Manual assign failed: {response.text}"
        
        data = response.json()
        assert data["plan_id"] == "gold"
        assert data["plan_name"] == "Gold"
        assert data["price"] == 1250.0
    
    def test_admin_can_manual_assign_platinum(self, admin_token):
        """Admin can manually assign Platinum SLA to store"""
        test_store = f"TEST_SLA_Plat_{uuid.uuid4().hex[:6]}"
        
        response = requests.post(
            f"{BASE_URL}/api/sla/manual-assign",
            json={
                "store_name": test_store,
                "plan_id": "platinum",
                "notes": "Premium store"
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200, f"Manual assign failed: {response.text}"
        
        data = response.json()
        assert data["plan_id"] == "platinum"
        assert data["plan_name"] == "Platinum"
        assert data["price"] == 1500.0
    
    def test_non_admin_cannot_manual_assign(self, store_staff_token):
        """Non-admin users get 403 on manual-assign"""
        response = requests.post(
            f"{BASE_URL}/api/sla/manual-assign",
            json={
                "store_name": "Blocked Store",
                "plan_id": "silver"
            },
            headers={"Authorization": f"Bearer {store_staff_token}"}
        )
        
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
    
    def test_invalid_plan_returns_400(self, admin_token):
        """Invalid plan_id returns 400 error"""
        response = requests.post(
            f"{BASE_URL}/api/sla/manual-assign",
            json={
                "store_name": "Test Store",
                "plan_id": "diamond"  # Invalid plan
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"


class TestSLASubscribe:
    """Test POST /api/sla/subscribe endpoint - Stripe checkout"""
    
    def test_subscribe_creates_checkout_session(self, admin_token):
        """Subscribe endpoint creates Stripe checkout session and returns URL"""
        response = requests.post(
            f"{BASE_URL}/api/sla/subscribe",
            json={
                "store_name": "Test Stripe Store",
                "plan_id": "gold",
                "origin_url": "https://bootleg-service-test.preview.emergentagent.com"
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200, f"Subscribe failed: {response.text}"
        
        data = response.json()
        assert "url" in data, "Response should contain checkout URL"
        assert "session_id" in data, "Response should contain session_id"
        assert "stripe.com" in data["url"], "URL should be Stripe checkout URL"
        assert data["session_id"].startswith("cs_"), "Session ID should start with 'cs_'"
    
    def test_subscribe_invalid_plan_returns_400(self, admin_token):
        """Subscribe with invalid plan returns 400"""
        response = requests.post(
            f"{BASE_URL}/api/sla/subscribe",
            json={
                "store_name": "Test Store",
                "plan_id": "invalid_plan",
                "origin_url": "https://test.com"
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"


class TestSLASubscriptions:
    """Test GET /api/sla/subscriptions endpoint"""
    
    def test_admin_sees_all_subscriptions(self, admin_token):
        """Admin can see all subscriptions"""
        response = requests.get(
            f"{BASE_URL}/api/sla/subscriptions",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200, f"Get subscriptions failed: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        # Check structure of subscription if any exist
        if len(data) > 0:
            sub = data[0]
            assert "id" in sub
            assert "store_name" in sub
            assert "plan_id" in sub
            assert "status" in sub
            assert "payment_method" in sub
    
    def test_store_staff_sees_own_subscriptions(self, store_staff_token):
        """Store staff can only see their store's subscriptions"""
        response = requests.get(
            f"{BASE_URL}/api/sla/subscriptions",
            headers={"Authorization": f"Bearer {store_staff_token}"}
        )
        
        assert response.status_code == 200, f"Get subscriptions failed: {response.text}"
        
        # Response should be a list (may be empty for stores without subscriptions)
        data = response.json()
        assert isinstance(data, list)


class TestSLASubscriptionUpdate:
    """Test PUT /api/sla/subscriptions/{id} endpoint"""
    
    def test_admin_can_cancel_subscription(self, admin_token):
        """Admin can cancel a subscription"""
        # First create a subscription to cancel
        test_store = f"TEST_Cancel_{uuid.uuid4().hex[:6]}"
        
        create_response = requests.post(
            f"{BASE_URL}/api/sla/manual-assign",
            json={
                "store_name": test_store,
                "plan_id": "silver",
                "notes": "To be cancelled"
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert create_response.status_code == 200
        sub_id = create_response.json()["id"]
        
        # Now cancel it
        cancel_response = requests.put(
            f"{BASE_URL}/api/sla/subscriptions/{sub_id}?status=cancelled",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert cancel_response.status_code == 200, f"Cancel failed: {cancel_response.text}"
        
        data = cancel_response.json()
        assert data["status"] == "cancelled"
    
    def test_non_admin_cannot_update_subscription(self, store_staff_token, admin_token):
        """Non-admin gets 403 when trying to update subscription"""
        # First create a subscription as admin
        test_store = f"TEST_NoUpdate_{uuid.uuid4().hex[:6]}"
        
        create_response = requests.post(
            f"{BASE_URL}/api/sla/manual-assign",
            json={
                "store_name": test_store,
                "plan_id": "silver"
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert create_response.status_code == 200
        sub_id = create_response.json()["id"]
        
        # Try to update as store staff
        update_response = requests.put(
            f"{BASE_URL}/api/sla/subscriptions/{sub_id}?status=cancelled",
            headers={"Authorization": f"Bearer {store_staff_token}"}
        )
        
        assert update_response.status_code == 403, f"Expected 403, got {update_response.status_code}"


class TestSLAPayments:
    """Test GET /api/sla/payments endpoint - Admin only"""
    
    def test_admin_can_view_payments(self, admin_token):
        """Admin can view payment history"""
        response = requests.get(
            f"{BASE_URL}/api/sla/payments",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200, f"Get payments failed: {response.text}"
        assert isinstance(response.json(), list)
    
    def test_non_admin_cannot_view_payments(self, store_staff_token):
        """Non-admin gets 403 on payments endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/sla/payments",
            headers={"Authorization": f"Bearer {store_staff_token}"}
        )
        
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
