# 📊 Repository Diagrams for Chapter 3

These four diagrams cover the entire SLIIT rubric requirements for Design and Development.

---

## 1. System/Component Architecture Diagram
**Purpose**: Shows how the frontends, backend, and database are connected.
```mermaid
graph TD
    subgraph "Presentation Layer (Frontends)"
        Warden[Warden Web Dashboard]
        StudentW[Student Web Panel]
        StudentM[Student Mobile App]
        Kiosk[Security Gate Scanner]
    end

    subgraph "Application Layer (Node.js & Express)"
        API[Secure REST API Gateway]
        Auth[JWT & Session Service]
        CheckinProc[Check-in/Out Processor]
        Rules[Curfew & Cooldown Rules Engine]
        Notify[Notice & Comm Service]
    end

    subgraph "Storage & Infrastructure"
        DB[(MongoDB Atlas Database)]
        Storage[Local/Cloud File Storage]
    end

    Warden <--> API
    StudentW <--> API
    StudentM <--> API
    Kiosk <--> API
    
    API <--> Auth
    API <--> CheckinProc
    API <--> Notify
    
    CheckinProc <--> Rules
    API <--> DB
    API <--> Storage
```

---

## 2. Process / Workflow Diagram (Full Student Cycle)
**Purpose**: Documents the high-level process from registration to daily operations.
```mermaid
stateDiagram-v2
    [*] --> Registration: Student Submits NIC & Details
    Registration --> Approval: Warden Verifies Documents
    Approval --> Allocation: Room Assigned to Student
    Allocation --> Active_Living: Access Pass Activated
    
    state Active_Living {
        [*] --> Secure_CheckIn: Student Scans QR
        Secure_CheckIn --> Curfew_Check: Server validates time
        Curfew_Check --> Log_Created: Entry/Exit Recorded
    }
    
    Active_Living --> Checkout: End of Semester/Year
    Checkout --> [*]
```

---

## 3. Database Design Diagram (ER Diagram)
**Purpose**: Displays the relationships between data entities.
```mermaid
erDiagram
    REGISTRATION ||--o{ USER : "authenticates"
    REGISTRATION ||--o| ALLOCATION : "allocated to"
    ROOM ||--o{ ALLOCATION : "belongs to"
    
    REGISTRATION ||--o{ CHECKIN : "logs gate activity"
    REGISTRATION ||--o{ COMPLAINT : "files"
    REGISTRATION ||--o{ PAYMENT : "submits"
    REGISTRATION ||--o{ REVIEW : "provides"
    REGISTRATION ||--o{ BOOKING : "requests visitor"
    
    ROOM ||--o{ CLEANING_TASK : "requires maintenance"
    WARDEN ||--o{ NOTICE : "publishes"
    WARDEN ||--o{ ROOM : "manages"

    REGISTRATION {
        string fullName
        string email
        string qrToken
        string role
    }

    CHECKIN {
        datetime checkInTime
        datetime checkOutTime
        boolean isLate
        string status
    }

    ROOM {
        string roomNumber
        int capacity
        string type
        string status
    }
```

---

## 4. Development-Related Diagram (MERN Mapping Model)
**Purpose**: Maps code components to their technical implementation layers.
```mermaid
graph LR
    subgraph "Frontend (React Components)"
        C1[AuthForms.jsx]
        C2[Scanner.jsx]
        C3[PaymentList.jsx]
    end

    subgraph "Backend (Express Controllers)"
        E1[authController.js]
        E2[checkinController.js]
        E3[paymentController.js]
    end

    subgraph "Database (Mongoose Models)"
        M1[Registration.js]
        M2[CheckIn.js]
        M3[Payment.js]
    end

    C1 ==> E1 ==> M1
    C2 ==> E2 ==> M2
    C3 ==> E3 ==> M3
```
