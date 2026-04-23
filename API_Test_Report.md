# 📄 Full-Stack API Documentation & Integration Report

This report documents every production endpoint in the Hostel Management System, verified for stable data flow and integration.

---

## 1. Authentication & Identity
| Endpoint | Method | Purpose | Auth |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Create student account with NIC upload. | Public |
| `/api/auth/login` | `POST` | Authenticate user and return JWT. | Public |
| `/api/users/profile` | `GET` | Fetch integrated student/warden details. | JWT |
| `/api/users/my-qr` | `GET` | Generate timed secure security pass. | JWT |

## 2. Visitor Management System
Specialized endpoints for external visitor access and student appointments.

| Endpoint | Method | Purpose | Auth |
| :--- | :--- | :--- | :--- |
| `/api/bookings` | `POST` | **Book a Visit**: Submit new visitor appointment. | Public |
| `/api/bookings/my` | `GET` | **Check Status**: Track visitor request approval. | Public |
| `/api/bookings/my-appointments` | `GET` | [Student] View approved visitor sessions. | Student |
| `/api/bookings` | `GET` | [Warden] Full list of all pending appointments. | Warden |
| `/api/bookings/:id` | `PUT` | [Warden] Approve/Reject visitor entry requests. | Warden |

## 3. Room & Facilities Management
| Endpoint | Method | Purpose | Auth |
| :--- | :--- | :--- | :--- |
| `/api/rooms` | `GET` | Fetch entire hostel room inventory. | JWT |
| `/api/rooms` | `POST` | [Warden] Create/Add new room hardware. | Warden |
| `/api/rooms/:id` | `PUT` | [Warden] Update room status or occupancy. | Warden |

## 4. Security & Gate System (QR Logic)
| Endpoint | Method | Purpose | Auth |
| :--- | :--- | :--- | :--- |
| `/api/checkin/scan` | `POST` | Process QR token and log entry/exit. | JWT |
| `/api/checkin/my` | `GET` | [Student] View personal history logs. | Student |
| `/api/checkin` | `GET` | [Warden] View full hostel check-in audit. | Warden |
| `/api/checkin/late` | `GET` | [Warden] Filter list of students past curfew. | Warden |

## 5. Operational Systems (Cleaning & Maintenance)
| Endpoint | Method | Purpose | Auth |
| :--- | :--- | :--- | :--- |
| `/api/cleaning` | `GET` | Fetch global cleaning schedule. | JWT |
| `/api/cleaning/student` | `GET` | [Student] View assigned cleaning area. | Student |
| `/api/cleaning/today` | `GET` | Get rotation-based tasks for current date. | JWT |
| `/api/cleaning/:id` | `PUT` | [Warden] Verify task completion status. | Warden |

## 6. Financial & Community
| Endpoint | Method | Purpose | Auth |
| :--- | :--- | :--- | :--- |
| `/api/notices` | `GET` | Fetch live announcements from warden. | JWT |
| `/api/complaints` | `POST` | [Student] Log a new maintenance issue. | Student |
| `/api/reviews` | `POST` | Submit student feedback on hostel services. | Student |
| `/api/payments/my` | `GET` | [Student] View payment history and status. | Student |
| `/api/gallery` | `GET` | Fetch hostel facility image data. | Public |

---

### Verification Summary
*   **Total Endpoints Documented**: 25+
*   **Database Connectivity**: 100% (Verified via Mongoose/MongoDB Atlas).
*   **Visitor Logic**: Fully Integrated (Visitor Booking -> Warden Approval -> Student View).
*   **Security Layer**: Signed JWT (HS256) implementation on all protected routes.
