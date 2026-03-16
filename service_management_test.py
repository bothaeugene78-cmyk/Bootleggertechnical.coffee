import requests
import sys
import json
from datetime import datetime

class ServiceManagementTester:
    def __init__(self, base_url="https://bootleg-service-test.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.test_ticket_id = None
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
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)

            print(f"   Response: {response.status_code}")
            if response.text:
                print(f"   Body: {response.text[:300]}...")
            
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
                    "response": response.text[:500]
                })
                print(f"❌ FAILED - Expected {expected_status}, got {response.status_code}")
                return False, response.json() if response.text and response.status_code != 500 else {}

        except Exception as e:
            self.failed_tests.append({
                "test": name,
                "error": str(e)
            })
            print(f"❌ FAILED - Error: {str(e)}")
            return False, {}

    def test_admin_login(self):
        """Test admin login with the credentials from review request"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "/auth/login",
            200,
            data={
                "email": "john@bootlegger.co.za",
                "password": "newpassword123"  # Updated password from backend test
            }
        )
        if success:
            self.token = response.get("token")
            user = response.get("user", {})
            print(f"   Logged in as: {user.get('name')} ({user.get('role')})")
            return "token" in response and user.get("role") == "admin"
        return False

    def test_dashboard_stats(self):
        """Test dashboard statistics endpoint"""
        if not self.token:
            print("❌ No token available for stats")
            return False
            
        success, response = self.run_test(
            "Dashboard Stats",
            "GET",
            "/admin/stats",
            200,
            auth_required=True
        )
        if success:
            required_fields = ["total_tickets", "open_tickets", "scheduled_tickets", "in_progress", "completed", "invoiced"]
            return all(field in response for field in required_fields)
        return False

    def test_create_ticket(self):
        """Test creating a new service ticket"""
        if not self.token:
            print("❌ No token available for ticket creation")
            return False

        ticket_data = {
            "store_id": "test-store-001", 
            "store_name": "Test Coffee Shop",
            "issue_description": "Espresso machine not heating up properly",
            "machine_type": "Nuova Simonelli Aurelia",
            "urgency": "high"
        }
            
        success, response = self.run_test(
            "Create Service Ticket",
            "POST",
            "/tickets",
            200,
            data=ticket_data,
            auth_required=True
        )
        if success:
            self.test_ticket_id = response.get("id")
            required_fields = ["id", "ticket_number", "store_name", "issue_description", "status", "created_at"]
            has_fields = all(field in response for field in required_fields)
            print(f"   Created ticket: {response.get('ticket_number')}")
            return has_fields and response.get("status") == "open"
        return False

    def test_get_tickets_list(self):
        """Test getting list of tickets"""
        if not self.token:
            print("❌ No token available for tickets list")
            return False
            
        success, response = self.run_test(
            "Get Tickets List",
            "GET",
            "/tickets",
            200,
            auth_required=True
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} tickets")
            if len(response) > 0:
                ticket = response[0]
                required_fields = ["id", "ticket_number", "store_name", "status"]
                return all(field in ticket for field in required_fields)
            return True
        return False

    def test_get_single_ticket(self):
        """Test getting a single ticket by ID"""
        if not self.token or not self.test_ticket_id:
            print("❌ No token or ticket ID available")
            return False
            
        success, response = self.run_test(
            "Get Single Ticket",
            "GET",
            f"/tickets/{self.test_ticket_id}",
            200,
            auth_required=True
        )
        if success:
            required_fields = ["id", "ticket_number", "store_name", "issue_description", "status"]
            return all(field in response for field in required_fields)
        return False

    def test_update_ticket_status(self):
        """Test updating ticket status (admin function)"""
        if not self.token or not self.test_ticket_id:
            print("❌ No token or ticket ID available")
            return False

        update_data = {
            "status": "scheduled",
            "resolution_type": "onsite",
            "scheduled_date": "2026-03-15",
            "scheduled_time": "10:00",
            "notes": "Scheduled technician visit to check heating element"
        }
            
        success, response = self.run_test(
            "Update Ticket Status",
            "PUT",
            f"/tickets/{self.test_ticket_id}",
            200,
            data=update_data,
            auth_required=True
        )
        if success:
            return response.get("status") == "scheduled" and response.get("resolution_type") == "onsite"
        return False

    def test_cloudinary_signature(self):
        """Test Cloudinary upload signature (expected to fail - not configured)"""
        if not self.token:
            print("❌ No token available for Cloudinary test")
            return False
            
        success, response = self.run_test(
            "Cloudinary Upload Signature",
            "GET",
            "/cloudinary/signature?resource_type=video&folder=tickets",
            503,  # Expected to fail - Cloudinary not configured
            auth_required=True
        )
        if success:
            detail = response.get("detail", "")
            return "Cloudinary not configured" in detail
        return False

    def test_get_technicians(self):
        """Test getting list of technicians"""
        if not self.token:
            print("❌ No token available for technicians list")
            return False
            
        success, response = self.run_test(
            "Get Technicians List",
            "GET",
            "/admin/technicians",
            200,
            auth_required=True
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} technicians")
            return True
        return False

    def test_admin_users_detailed(self):
        """Test admin users endpoint with detailed error checking"""
        if not self.token:
            print("❌ No token available for users list")
            return False
            
        success, response = self.run_test(
            "Admin Users List (Detailed)",
            "GET",
            "/admin/users",
            200,
            auth_required=True
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} users")
            if len(response) > 0:
                user = response[0]
                required_fields = ["id", "email", "name", "role"]
                return all(field in user for field in required_fields)
            return True
        return False


def main():
    print("🚀 Starting Service Management System Tests")
    print("=" * 60)
    
    tester = ServiceManagementTester()
    
    # Test sequence - focusing on service management workflow
    tests = [
        ("Admin Login", tester.test_admin_login),
        ("Dashboard Stats", tester.test_dashboard_stats),
        ("Admin Users List", tester.test_admin_users_detailed),
        ("Get Technicians", tester.test_get_technicians),
        ("Create Service Ticket", tester.test_create_ticket),
        ("Get Tickets List", tester.test_get_tickets_list),
        ("Get Single Ticket", tester.test_get_single_ticket),
        ("Update Ticket Status", tester.test_update_ticket_status),
        ("Cloudinary Signature", tester.test_cloudinary_signature),
    ]

    passed_tests = []
    for test_name, test_func in tests:
        try:
            if test_func():
                passed_tests.append(test_name)
        except Exception as e:
            print(f"❌ {test_name} - Exception: {str(e)}")

    # Print results
    print("\n" + "=" * 60)
    print("📊 SERVICE MANAGEMENT TEST RESULTS")
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
                print(f"     Response: {failure['response'][:200]}...")
            if 'error' in failure:
                print(f"     Error: {failure['error']}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())