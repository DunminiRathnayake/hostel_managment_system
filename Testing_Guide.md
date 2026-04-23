# 🧪 Hostel System: Integration & System Testing Guide

## 1. System-Level Testing (End-to-End)
This test proves that all components (Warden -> DB -> Student) are talking to each other correctly.

| Test Case | Steps | Expected Result | Result |
| :--- | :--- | :--- | :--- |
| **New Entry Flow** | 1. Warden creates a new student.<br>2. Log in as that student on the Web Panel. | Student sees their room number and personal details instantly. | **PASS** |
| **Security Scan** | 1. Open Student QR.<br>2. Scan via Kiosk Scanner. | Gate Log updates; Toast notification appears on student panel. | **PASS** |
| **Curfew Check** | 1. Scan a QR code at 11:00 PM (Simulated). | System flags the entry as "LATE" in red. | **PASS** |

---

## 2. Integration Testing (Handling Dependencies)
We tested how components depend on each other.

*   **Mock Hardware Test**: We verified that if a webcam is disconnected, the **Kiosk Interface** gracefully shows a "Retry" button rather than crashing. 
*   **Validation Test**: We verified that if a student attempts to access a Warden route (`/warden`), the **Protected Route Middleware** redirects them to login immediately.

---

## 3. Edge Case Handling
What happens in unusual situations?

1.  **Scanner Cooldown**: If a student is jittery and scans the phone twice in 2 seconds, the backend prevents a second log entry.
2.  **Missing Profile**: If a student logs in but hasn't been assigned a room yet, the UI shows "Pending Approval" instead of a blank screen.
3.  **Invalid QR**: We tested scanning a generic QR code (like a juice bottle). The system correctly identifies it as "Invalid Pass Format."

---

## 4. Live Evidence Instructions
1.  Open **Postman**.
2.  Load the collection.
3.  Show that a `GET /api/checkin` call returns a structured JSON list of all scans. This proves the backend is writing to MongoDB correctly.
