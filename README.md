Here's a well-structured and refactored version of your content in **README.md** format for a GitHub project:

---

# 🧑‍💼 Job Search Portal

An online job portal designed to automate the job search and application process.

---

## 🔍 Overview

This project provides a platform with three types of users:

* **Applicants** – Search and apply for jobs based on location, salary, or designation. They can also register, log in, upload resumes, and track application statuses.
* **Company Users** – Log in to post job advertisements.
* **Admin** – Monitors and manages the entire system.

📧 Email notifications are sent to applicants and company users when a job is applied for.

> ⚠️ **Mail Functionality Notice**:
> The SMTP credentials used for sending emails **must not be shared**. To enable mail services, update your credentials in the `application.properties` file.

---

## 🚀 Getting Started

### 📦 Clone the Repository

```bash
git clone https://github.com/tushar-trivedi/Job-Search-Portal.git
cd Job-Search-Portal
```

---

### 🖥️ Backend Setup (Spring Boot)

```bash
cd backend
mvn spring-boot:run
```

Ensure that you update SMTP credentials in:

```bash
backend/src/main/resources/application.properties
```

> The backend also includes a **Bruno collection** for API testing:

```bash
backend/src/main/resources/JobSearchPortal.json
```

---

### 🌐 Frontend Setup (React)

```bash
cd frontend
npm install
npm start
```

---

## 📁 Bruno API Collection

* Use the provided Bruno collection (`JobSearchPortal.json`) to test and interact with APIs efficiently.
* Requires [Bruno](https://www.usebruno.com/) API client.

---

## 🛡️ Security

* Method-level access control is implemented using Spring Security and `@PreAuthorize` annotations.
* Passwords are stored securely using **BCrypt encryption**.

---

## 📬 Mail Configuration

In `application.properties`, set the following:

```properties
spring.mail.username=your_email@example.com
spring.mail.password=your_password
```

> 🔒 **Do not commit these credentials to version control.**

---

## 🛠️ Tech Stack

* **Backend**: Spring Boot, Spring Security, JPA, MySQL
* **Frontend**: ReactJS
* **Other**: SMTP (Mail), Bruno (API Testing)

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

Let me know if you'd like to add screenshots, badges (build, license), or contribution guidelines!
