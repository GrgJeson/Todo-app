# Full-Stack Todo Application (Django + React + PostgreSQL/SQLite)

A modern, highly secure, and aesthetic Todo application built as an internship project using Django REST Framework (Backend), React + Vite (Frontend), and PostgreSQL/SQLite (Database).

---

## Features
- **User Registration & Login** with password security.
- **JWT (JSON Web Token) Authentication** with automatic client-side token refresh.
- **Complete Todo CRUD** (Create, Read, Update, Delete).
- **User Isolation**: Enforced at the database and API layer. Users can *only* access and manage their own tasks.
- **Task Attributes**: Priorities (Low, Medium, High) and Timezone-aware Due Dates.
- **Interactive Dashboard**: Modern dark-themed layout with glassmorphic cards, statistics trackers, filter tabs, search functionality, and task completion progress bars.

---

## Step-by-Step Execution Guide

### Prerequisites
Make sure you have the following installed on your machine:
- **Python (v3.10+)**
- **Node.js (v18+) & npm**
- **PostgreSQL** (Optional, falls back to SQLite automatically if credentials are not provided)

---

### Step 1: Set Up and Run the Backend (Django)

1. **Open a terminal** and navigate to the project directory:
   ```bash
   cd c:\Users\Hp\todo-pro
   ```

2. **Activate the Virtual Environment**:
   * **On Windows (PowerShell)**:
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   * **On Windows (CMD)**:
     ```cmd
     .\venv\Scripts\activate.bat
     ```
   * **On macOS/Linux**:
     ```bash
     source venv/bin/activate
     ```

3. **Install Dependencies** (if not already installed):
   ```bash
   pip install django djangorestframework djangorestframework-simplejwt django-cors-headers psycopg2-binary python-dotenv
   ```

4. **Configure Environment Variables** (Optional, for PostgreSQL):
   Create a `.env` file in the project root directory (next to `manage.py`) and supply your PostgreSQL credentials:
   ```env
   SECRET_KEY=your-custom-django-secret-key
   DEBUG=True
   DB_NAME=todo_db
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   DB_HOST=localhost
   DB_PORT=5432
   ```
   *If you do not create a `.env` file, the backend will automatically fall back to using local SQLite (`db.sqlite3`).*

5. **Generate & Run Migrations**:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Start the Django Development Server**:
   ```bash
   python manage.py runserver
   ```
   The backend API will now be running at: **`http://127.0.0.1:8000/`**

---

### Step 2: Set Up and Run the Frontend (React + Vite)

1. **Open a second terminal window** and navigate to the `frontend` folder:
   ```bash
   cd c:\Users\Hp\todo-pro\frontend
   ```

2. **Install Node Packages**:
   ```bash
   npm install
   ```

3. **Start the Frontend Development Server**:
   ```bash
   npm run dev
   ```
   The frontend application will now be running at: **`http://localhost:5173/`**

---

### Step 3: Access and Use the Application
1. Open your web browser and navigate to **`http://localhost:5173/`**
2. You will be redirected to the **Sign In** page.
3. Click the **Sign Up** link at the bottom to register a new user account.
4. Log in using your registered username and password.
5. Create, update, filter, sort, and complete your tasks!
