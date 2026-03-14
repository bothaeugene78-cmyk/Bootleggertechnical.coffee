import requests
import sys
import json
from datetime import datetime

class BootleggerAPITester:
    def __init__(self, base_url="https://claude-employee-hub.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.test_user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, auth_required=False):
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if auth_required and self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {method} {url}")
        if data:
            print(f"   Data: {json.dumps(data, indent=2)}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)

            print(f"   Response: {response.status_code} - {response.text[:200]}...")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ PASSED - Status: {response.status_code}")
                return True, response.json() if response.text else {}
            else:
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:300]
                })
                print(f"❌ FAILED - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:300]}")
                return False, {}

        except requests.exceptions.RequestException as e:
            self.failed_tests.append({
                "test": name,
                "error": str(e)
            })
            print(f"❌ FAILED - Network Error: {str(e)}")
            return False, {}
        except Exception as e:
            self.failed_tests.append({
                "test": name,
                "error": str(e)
            })
            print(f"❌ FAILED - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test basic API health"""
        success, response = self.run_test(
            "API Health Check",
            "GET",
            "/",
            200
        )
        return success and "Bootlegger Asset Tracker API" in response.get("message", "")

    def test_invalid_domain_registration(self):
        """Test registration with invalid domain (@gmail.com)"""
        success, response = self.run_test(
            "Registration with Invalid Domain (@gmail.com)",
            "POST",
            "/auth/register",
            400,
            data={
                "name": "Test User",
                "email": "test@gmail.com", 
                "password": "test123456"
            }
        )
        if success:
            detail = response.get("detail", "")
            return "Email domain not allowed" in detail
        return False

    def test_valid_domain_registration(self):
        """Test registration with valid domain (@bootlegger.co.za)"""
        timestamp = datetime.now().strftime("%H%M%S")
        test_email = f"testuser{timestamp}@bootlegger.co.za"
        
        success, response = self.run_test(
            "Registration with Valid Domain (@bootlegger.co.za)",
            "POST", 
            "/auth/register",
            200,
            data={
                "name": "Test User",
                "email": test_email,
                "password": "test123456"
            }
        )
        if success:
            self.token = response.get("token")
            user = response.get("user", {})
            self.test_user_id = user.get("id")
            return "token" in response and "user" in response
        return False

    def test_login_existing_user(self):
        """Test login with existing user (john@bootlegger.co.za)"""
        success, response = self.run_test(
            "Login with Existing User",
            "POST",
            "/auth/login", 
            200,
            data={
                "email": "john@bootlegger.co.za",
                "password": "test123456"
            }
        )
        if success:
            self.token = response.get("token")
            user = response.get("user", {})
            self.test_user_id = user.get("id")
            return "token" in response and user.get("email") == "john@bootlegger.co.za"
        return False

    def test_login_wrong_password(self):
        """Test login with wrong password"""
        success, response = self.run_test(
            "Login with Wrong Password",
            "POST",
            "/auth/login",
            401,
            data={
                "email": "john@bootlegger.co.za", 
                "password": "wrongpassword"
            }
        )
        if success:
            detail = response.get("detail", "")
            return "Invalid email or password" in detail
        return False

    def test_auth_verification(self):
        """Test JWT token verification"""
        if not self.token:
            print("❌ No token available for auth verification")
            return False
            
        success, response = self.run_test(
            "JWT Token Verification",
            "GET", 
            "/auth/verify",
            200,
            auth_required=True
        )
        if success:
            return response.get("valid") is True and "user_id" in response
        return False

    def test_get_current_user(self):
        """Test getting current user info"""
        if not self.token:
            print("❌ No token available for user info")
            return False
            
        success, response = self.run_test(
            "Get Current User Info",
            "GET",
            "/auth/me",
            200,
            auth_required=True
        )
        if success:
            required_fields = ["id", "email", "name", "created_at"]
            return all(field in response for field in required_fields)
        return False

    def test_login_history(self):
        """Test login history endpoint"""
        if not self.token:
            print("❌ No token available for login history")
            return False
            
        success, response = self.run_test(
            "Get Login History",
            "GET",
            "/admin/login-history",
            200,
            auth_required=True
        )
        if success and isinstance(response, list):
            if len(response) > 0:
                entry = response[0]
                required_fields = ["id", "user_id", "user_email", "user_name", "login_time"]
                return all(field in entry for field in required_fields)
            else:
                print("📝 Login history is empty but endpoint works")
                return True
        return False

    def test_unauthorized_access(self):
        """Test accessing protected endpoints without token"""
        success, response = self.run_test(
            "Unauthorized Access (No Token)",
            "GET",
            "/auth/me", 
            401,
            auth_required=False  # Explicitly no token
        )
        return success

def main():
    print("🚀 Starting Bootlegger Asset Tracker API Tests")
    print("=" * 60)
    
    tester = BootleggerAPITester()
    
    # Test sequence
    tests = [
        ("API Health Check", tester.test_health_check),
        ("Invalid Domain Registration", tester.test_invalid_domain_registration),
        ("Valid Domain Registration", tester.test_valid_domain_registration),
        ("Login Existing User", tester.test_login_existing_user),
        ("Login Wrong Password", tester.test_login_wrong_password), 
        ("JWT Verification", tester.test_auth_verification),
        ("Get User Info", tester.test_get_current_user),
        ("Login History", tester.test_login_history),
        ("Unauthorized Access", tester.test_unauthorized_access),
    ]

    passed_tests = []
    for test_name, test_func in tests:
        try:
            if test_func():
                passed_tests.append(test_name)
        except Exception as e:
            print(f"❌ {test_name} - Exception: {str(e)}")

    # Print final results
    print("\n" + "=" * 60)
    print("📊 BACKEND TEST RESULTS")
    print("=" * 60)
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    print(f"\n✅ PASSED TESTS ({len(passed_tests)}):")
    for test in passed_tests:
        print(f"   - {test}")
    
    if tester.failed_tests:
        print(f"\n❌ FAILED TESTS ({len(tester.failed_tests)}):")
        for failure in tester.failed_tests:
            print(f"   - {failure.get('test', 'Unknown')}")
            if 'expected' in failure:
                print(f"     Expected: {failure['expected']}, Got: {failure['actual']}")
            if 'response' in failure:
                print(f"     Response: {failure['response']}")
            if 'error' in failure:
                print(f"     Error: {failure['error']}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())