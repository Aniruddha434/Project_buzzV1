# System Architecture

Below is the system architecture in Mermaid format.

```mermaid
graph LR
    subgraph Context
        User["Users/Clients"]
    end

    subgraph Frontend
        ReactApp["React Frontend"]
        style ReactApp fill:#e1f5fe
    end

    subgraph Backend_Services
        API_Gateway["Express.js API Gateway"]
        AuthService["Passport.js Auth Service"]
        PaymentService["Razorpay Payment Service"]
        FileService["Multer File Upload Service"]
        style API_Gateway fill:#f3e5f5
        style AuthService fill:#f3e5f5
        style PaymentService fill:#f3e5f5
        style FileService fill:#f3e5f5

    end

    subgraph Data_Stores
        MongoDB["MongoDB"]
        Redis["Redis Cache"]
        style MongoDB fill:#e8f5e8
        style Redis fill:#e8f5e8
    end

    subgraph External_Services
        GoogleOAuth["Google OAuth2.0"]
        NodemailerService["Nodemailer Email Service"]
        style GoogleOAuth fill:#e0f7fa
        style NodemailerService fill:#e0f7fa
    end

    subgraph CI_CD
        GitHubActions["GitHub Actions"]
        style GitHubActions fill:#ffe0b2
    end


    User -->|HTTP| ReactApp
    ReactApp -->|HTTP/REST| API_Gateway
    API_Gateway -->|HTTP| AuthService
    API_Gateway -->|HTTP| PaymentService
    API_Gateway -->|HTTP| FileService
    API_Gateway -->|Mongoose| MongoDB
    API_Gateway -->|Cache| Redis
    AuthService -->|OAuth2| GoogleOAuth
    PaymentService -->|API| Razorpay
    FileService -->|API| Multer
    API_Gateway -->|Email| NodemailerService
    GitHubActions -->|Deployment| API_Gateway
    GitHubActions -->|Deployment| ReactApp
```
