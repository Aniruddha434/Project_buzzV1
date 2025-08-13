# System Architecture

Below is the system architecture in Mermaid format.

```mermaid
graph LR
    subgraph User_Interface
        FRONTEND_APP["React App Vite TS"]
    end

    subgraph Application_Backend
        API_SERVER["Node.js Express API"]
        AUTH_SERVICE["Auth Service JWT Bcrypt"]
        PAYMENT_SERVICE["Payment Service Razorpay Logic"]
        EMAIL_SERVICE["Email Service Nodemailer"]
        FILE_UPLOAD_SERVICE["File Upload Service Multer"]
        MIDDLEWARE["Middleware Helmet CORS Rate Limit"]
    end

    subgraph Data_Stores
        MONGODB_DB["MongoDB Atlas Database"]
        REDIS_CACHE["Redis Cache"]
    end

    subgraph External_Services
        RAZORPAY_GATEWAY["Razorpay Payment Gateway"]
    end

    subgraph Deployment_CI_CD
        GITHUB_ACTIONS["GitHub Actions CI CD"]
        VERCEL_PLATFORM["Vercel Deployment"]
        RENDER_PLATFORM["Render Deployment"]
        DOCKER_CONTAINERS["Docker Containers"]
    end

    USER_BROWSER["User Browser"] -->|HTTP| FRONTEND_APP
    FRONTEND_APP -->|HTTP REST API| API_SERVER

    API_SERVER -->|Internal Call| AUTH_SERVICE
    API_SERVER -->|Internal Call| PAYMENT_SERVICE
    API_SERVER -->|Internal Call| EMAIL_SERVICE
    API_SERVER -->|Internal Call| FILE_UPLOAD_SERVICE
    API_SERVER -->|Applies| MIDDLEWARE

    API_SERVER -->|Mongoose Driver| MONGODB_DB
    API_SERVER -->|Redis Client| REDIS_CACHE

    PAYMENT_SERVICE -->|HTTP API| RAZORPAY_GATEWAY

    GITHUB_ACTIONS -->|Deploy Frontend| VERCEL_PLATFORM
    GITHUB_ACTIONS -->|Deploy Backend| RENDER_PLATFORM
    GITHUB_ACTIONS -->|Build & Push| DOCKER_CONTAINERS

    VERCEL_PLATFORM -->|Hosts| FRONTEND_APP
    RENDER_PLATFORM -->|Hosts| API_SERVER
```
