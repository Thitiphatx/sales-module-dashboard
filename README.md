## Project Structure

```text
sales-module-dashboard/
├── backend/          # FastAPI application
└── frontend/         # Vite + Vanilla JS application
```

## Prerequisites

- **Python**: 3.12 or higher
- **Node.js**: v18 or higher
- **uv**: or **pip**
- **npm**: (Included with Node.js)

---

## Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   Using `uv`:
   ```bash
   uv venv
   .venv\Scripts\activate  # Windows
   # source .venv/bin/activate  # Unix/macOS
   ```
   Using `python`:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   ```

3. **Install dependencies**:
   Using `uv`:
   ```bash
   uv sync
   ```
   Using `pip`:
   ```bash
   pip install fastapi[standard] sqlalchemy aiosqlite fastapi-pagination
   ```

4. **Run the backend**:
   ```bash
   fastapi dev main.py
   ```
   The backend will start at `http://127.0.0.1:8000`.

---

## Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Configuration**:
   Create a `.env` file (or update the existing one) to point to the backend API:
   ```env
   VITE_API_BASE_URL=http://127.0.0.1:8000
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```
   The frontend will start at `http://localhost:5173`.

---

## Development

- **Backend**: Uses FastAPI with SQLAlchemy and SQLite. The database is initialized automatically on startup.
- **Frontend**: Uses Vanilla JavaScript with Vite, Axios for API calls, and Chart.js for data visualization.
