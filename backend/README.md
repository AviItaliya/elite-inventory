# Elite Inventory API

A production-ready Inventory Management REST API built with **Node.js**, **Express.js**, **TypeScript**, **PostgreSQL**, and **Prisma ORM**. The project follows a clean architecture (Controller → Service → Repository) and includes authentication, role-based authorization, inventory management, Excel import/export, automated email notifications, and scheduled background jobs.

---

## Features

### Authentication & Authorization
- JWT Authentication (Access Token + Refresh Token)
- Secure Password Hashing (bcrypt)
- Role-Based Access Control (Admin, Manager, Staff)
- Protected Routes
- Refresh Token Management

### Inventory Management
- Product CRUD Operations
- Category Management
- Supplier Management
- Search, Filtering & Pagination
- Sorting
- Inventory Transactions

### Excel Integration
- Export Products to Excel
- Import Products from Excel
- Download Excel Template
- Bulk Import Validation

### Email Notifications
- Test Email
- Low Stock Alerts
- Daily Inventory Summary
- Weekly Inventory Report (Excel Attachment)

### Background Jobs
- Automated Daily Summary Emails
- Automated Low Stock Alerts
- Automated Weekly Inventory Reports
- node-cron Scheduling

### Project Architecture
- Controller Layer
- Service Layer
- Repository Layer
- Middleware
- Validation with Zod
- Global Error Handling
- Async Handler
- Standard API Response Format

---

## Tech Stack

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT Authentication
- bcrypt
- Zod
- ExcelJS
- Nodemailer
- node-cron
- Multer

---

## Folder Structure

src/
├── config/
├── controllers/
├── services/
├── repositories/
├── routes/
├── middlewares/
├── validators/
├── utils/
├── cron/
├── generated/
└── server.ts

---

## API Modules

- Authentication
- Products
- Categories
- Suppliers
- Inventory Transactions
- Excel Import/Export
- Email Notifications

---

## Future Improvements

- Dashboard Analytics
- Audit Logs
- Swagger API Documentation
- Unit & Integration Testing
- Docker Support
- CI/CD Pipeline
- AWS Deployment

---

## License

MIT License
