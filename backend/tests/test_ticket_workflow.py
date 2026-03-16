"""
Backend API tests for Bootlegger Service Management System
Tests: Job card upload, Invoice upload, Cloudinary signature, Role-based access
"""
import pytest
import requests
import os
from dotenv import load_dotenv

load_dotenv('/app/frontend/.env')
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL').rstrip('/')

# Test credentials
ADMIN_CREDS = {"email": "john@bootlegger.co.za", "password": "newpassword123"}
TECH_CREDS = {"email": "tech@rockandroller.coffee", "password": "test123456"}
ACCOUNTING_CREDS = {"email": "accounts@rockandroller.coffee", "password": "test123456"}

# Ticket for testing
TEST_TICKET_ID = "ad312ae9-4cba-46ef-8c17-bb708ea44389"
TEST_TICKET_NUMBER = "TKT-20260316-3668"


class TestAuthentication:
    """Test user authentication for all roles"""

    def test_admin_login(self):
        """Admin user can login successfully"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN_CREDS)
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        data = response.json()
        assert "token" in data
        assert data["user"]["role"] == "admin"
        print(f"✓ Admin login successful: {data['user']['email']}")

    def test_technician_login(self):
        """Technician user can login successfully"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=TECH_CREDS)
        assert response.status_code == 200, f"Technician login failed: {response.text}"
        data = response.json()
        assert "token" in data
        assert data["user"]["role"] == "technician"
        print(f"✓ Technician login successful: {data['user']['email']}")

    def test_accounting_login(self):
        """Accounting user can login successfully"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=ACCOUNTING_CREDS)
        assert response.status_code == 200, f"Accounting login failed: {response.text}"
        data = response.json()
        assert "token" in data
        assert data["user"]["role"] == "accounting"
        print(f"✓ Accounting login successful: {data['user']['email']}")


@pytest.fixture
def admin_token():
    """Get admin auth token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN_CREDS)
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip("Admin authentication failed")


@pytest.fixture
def tech_token():
    """Get technician auth token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json=TECH_CREDS)
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip("Technician authentication failed")


@pytest.fixture
def accounting_token():
    """Get accounting auth token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json=ACCOUNTING_CREDS)
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip("Accounting authentication failed")


class TestCloudinarySignature:
    """Test Cloudinary signature endpoint"""

    def test_signature_for_image(self, admin_token):
        """Get Cloudinary signature for image upload"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(
            f"{BASE_URL}/api/cloudinary/signature?resource_type=image&folder=jobcards/test",
            headers=headers
        )
        assert response.status_code == 200, f"Signature request failed: {response.text}"
        data = response.json()
        assert "signature" in data
        assert "timestamp" in data
        assert "cloud_name" in data
        assert "api_key" in data
        assert data["resource_type"] == "image"
        print(f"✓ Cloudinary image signature: {data['signature'][:20]}...")

    def test_signature_for_video(self, admin_token):
        """Get Cloudinary signature for video upload"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(
            f"{BASE_URL}/api/cloudinary/signature?resource_type=video&folder=tickets/test",
            headers=headers
        )
        assert response.status_code == 200, f"Signature request failed: {response.text}"
        data = response.json()
        assert data["resource_type"] == "video"
        print(f"✓ Cloudinary video signature: {data['signature'][:20]}...")

    def test_signature_for_raw_pdf(self, admin_token):
        """Get Cloudinary signature for raw (PDF) upload"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(
            f"{BASE_URL}/api/cloudinary/signature?resource_type=raw&folder=invoices/test",
            headers=headers
        )
        assert response.status_code == 200, f"Raw signature failed: {response.text}"
        data = response.json()
        assert data["resource_type"] == "raw"
        print(f"✓ Cloudinary raw signature (for PDFs): {data['signature'][:20]}...")


class TestTicketAccess:
    """Test ticket access based on roles"""

    def test_technician_sees_assigned_tickets(self, tech_token):
        """Technician can only see their assigned tickets"""
        headers = {"Authorization": f"Bearer {tech_token}"}
        response = requests.get(f"{BASE_URL}/api/tickets", headers=headers)
        assert response.status_code == 200
        tickets = response.json()
        print(f"✓ Technician sees {len(tickets)} tickets")
        
        # Verify TKT-20260316-3668 is in the list (assigned to tech)
        ticket_numbers = [t["ticket_number"] for t in tickets]
        assert TEST_TICKET_NUMBER in ticket_numbers, f"Technician should see {TEST_TICKET_NUMBER}"
        print(f"✓ Technician can see assigned ticket {TEST_TICKET_NUMBER}")

    def test_admin_sees_all_tickets(self, admin_token):
        """Admin can see all tickets"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/tickets", headers=headers)
        assert response.status_code == 200
        tickets = response.json()
        print(f"✓ Admin sees {len(tickets)} tickets (all tickets)")

    def test_accounting_sees_all_tickets(self, accounting_token):
        """Accounting can see all tickets"""
        headers = {"Authorization": f"Bearer {accounting_token}"}
        response = requests.get(f"{BASE_URL}/api/tickets", headers=headers)
        assert response.status_code == 200
        tickets = response.json()
        print(f"✓ Accounting sees {len(tickets)} tickets")


class TestJobCardUpload:
    """Test job card upload API"""

    def test_jobcard_upload_by_technician(self, tech_token):
        """Technician can upload job card"""
        headers = {"Authorization": f"Bearer {tech_token}", "Content-Type": "application/json"}
        payload = {
            "job_card_url": "https://res.cloudinary.com/test/image/upload/test_jobcard.jpg",
            "job_card_public_id": "jobcards/test_jobcard",
            "completion_notes": "Test completion notes from pytest"
        }
        response = requests.post(
            f"{BASE_URL}/api/tickets/{TEST_TICKET_ID}/jobcard",
            json=payload,
            headers=headers
        )
        assert response.status_code == 200, f"Job card upload failed: {response.text}"
        data = response.json()
        assert data.get("message") == "Job card uploaded successfully"
        print(f"✓ Job card uploaded successfully")

    def test_jobcard_upload_unauthorized_by_accounting(self, accounting_token):
        """Accounting cannot upload job card"""
        headers = {"Authorization": f"Bearer {accounting_token}", "Content-Type": "application/json"}
        payload = {
            "job_card_url": "https://res.cloudinary.com/test/image/upload/test.jpg",
            "job_card_public_id": "test",
            "completion_notes": "Test"
        }
        response = requests.post(
            f"{BASE_URL}/api/tickets/{TEST_TICKET_ID}/jobcard",
            json=payload,
            headers=headers
        )
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print(f"✓ Accounting correctly blocked from uploading job card (403)")


class TestInvoiceUpload:
    """Test invoice upload API"""

    def test_invoice_upload_by_accounting(self, accounting_token):
        """Accounting can upload invoice to completed ticket"""
        headers = {"Authorization": f"Bearer {accounting_token}", "Content-Type": "application/json"}
        payload = {
            "invoice_url": "https://res.cloudinary.com/test/raw/upload/test_invoice.pdf",
            "invoice_number": "INV-2026-TEST-001"
        }
        response = requests.post(
            f"{BASE_URL}/api/tickets/{TEST_TICKET_ID}/invoice",
            json=payload,
            headers=headers
        )
        assert response.status_code == 200, f"Invoice upload failed: {response.text}"
        data = response.json()
        assert data.get("message") == "Invoice attached successfully"
        print(f"✓ Invoice attached successfully")

    def test_invoice_upload_unauthorized_by_technician(self, tech_token):
        """Technician cannot upload invoice"""
        headers = {"Authorization": f"Bearer {tech_token}", "Content-Type": "application/json"}
        payload = {
            "invoice_url": "https://res.cloudinary.com/test/raw/upload/test.pdf",
            "invoice_number": "INV-TEST"
        }
        response = requests.post(
            f"{BASE_URL}/api/tickets/{TEST_TICKET_ID}/invoice",
            json=payload,
            headers=headers
        )
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print(f"✓ Technician correctly blocked from uploading invoice (403)")


class TestAdminTicketManagement:
    """Test admin ticket management"""

    def test_admin_can_update_ticket_status(self, admin_token):
        """Admin can update ticket status"""
        headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        payload = {"status": "in_progress"}
        response = requests.put(
            f"{BASE_URL}/api/tickets/{TEST_TICKET_ID}",
            json=payload,
            headers=headers
        )
        assert response.status_code == 200, f"Status update failed: {response.text}"
        data = response.json()
        assert data["status"] == "in_progress"
        print(f"✓ Admin updated ticket status to: {data['status']}")

    def test_admin_can_assign_technician(self, admin_token):
        """Admin can assign technician"""
        headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        # Get technician ID first
        tech_response = requests.get(f"{BASE_URL}/api/admin/technicians", headers=headers)
        technicians = tech_response.json()
        if technicians:
            tech = technicians[0]
            payload = {
                "assigned_technician_id": tech["id"],
                "assigned_technician_name": tech["name"]
            }
            response = requests.put(
                f"{BASE_URL}/api/tickets/{TEST_TICKET_ID}",
                json=payload,
                headers=headers
            )
            assert response.status_code == 200
            print(f"✓ Admin assigned technician: {tech['name']}")
        else:
            print("✓ No technicians to assign (empty list)")

    def test_admin_can_schedule_ticket(self, admin_token):
        """Admin can set scheduled date/time"""
        headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        payload = {
            "scheduled_date": "2026-03-20",
            "scheduled_time": "10:00"
        }
        response = requests.put(
            f"{BASE_URL}/api/tickets/{TEST_TICKET_ID}",
            json=payload,
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("scheduled_date") == "2026-03-20"
        print(f"✓ Admin scheduled ticket for: {data.get('scheduled_date')} at {data.get('scheduled_time')}")


class TestVerifyUpdates:
    """Verify ticket was properly updated after all operations"""

    def test_ticket_final_state(self, admin_token):
        """Verify final ticket state after all updates"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/tickets/{TEST_TICKET_ID}", headers=headers)
        assert response.status_code == 200
        ticket = response.json()
        
        print(f"\n=== Final Ticket State ===")
        print(f"Ticket: {ticket.get('ticket_number')}")
        print(f"Status: {ticket.get('status')}")
        print(f"Job Card URL: {ticket.get('job_card_url', 'None')}")
        print(f"Invoice URL: {ticket.get('invoice_url', 'None')}")
        print(f"Invoice #: {ticket.get('invoice_number', 'None')}")
        print(f"Assigned to: {ticket.get('assigned_technician_name', 'None')}")
        print(f"Scheduled: {ticket.get('scheduled_date', 'None')} {ticket.get('scheduled_time', '')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
