# Notes Application (Next.js & Django)

This project is a **full-stack note-taking application** built with **Next.js (React) for the frontend** and **Django for the backend**. It allows users to create, update, and categorize notes efficiently, using debounced input handling for improved performance.

## Table of Contents
- [Technologies Used](#technologies-used)
- [Setup Guide](#setup-guide)
  - [Backend (Django)](#backend-django)
  - [Frontend (Next.js)](#frontend-nextjs)
- [API Endpoints (cURL)](#api-endpoints-curl)
- [Database Models](#database-models)
- [Frontend Page Descriptions](#frontend-page-descriptions)
- [Performance Optimization](#performance-optimization)

---

## Technologies Used

### Backend:
- Django
- Django REST Framework
- SQLite
- JWT Authentication

### Frontend:
- Next.js (React)
- TypeScript
- Tailwind CSS

---

## Setup Guide

### Backend (Django)

1. **Clone the repository:**
   ```sh
   git clone https://github.com/dansant1/notes-app.git
   cd notes-app/backend
   ```

2. **Create a virtual environment & install dependencies:**
   ```sh
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Run migrations & start the server:**
   ```sh
   python manage.py migrate
   python manage.py runserver
   ```

The backend will be running at `http://127.0.0.1:8000/`

### Frontend (Next.js)

1. **Navigate to the frontend folder:**
   ```sh
   cd ../frontend
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Start the development server:**
   ```sh
   npm run dev
   ```

The frontend will be available at `http://localhost:3000/`

---

## API Endpoints (cURL)

### Authentication
#### Login
```sh
curl -X POST http://127.0.0.1:8000/api/login/ \
     -H "Content-Type: application/json" \
     -d '{"username": "testuser", "password": "testpassword"}'
```

#### Signup
```sh
curl -X POST http://127.0.0.1:8000/api/register/ \
     -H "Content-Type: application/json" \
     -d '{"username": "testuser", "password": "testpassword"}'
```

### Notes CRUD
#### Create a Note
```sh
curl -X POST http://127.0.0.1:8000/api/notes/ \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"title": "New Note", "content": "This is a note.", "category": 1}'
```

#### Get All Notes
```sh
curl -X GET http://127.0.0.1:8000/api/notes/ \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Categories

#### Get All Categories
```sh
curl -X GET http://127.0.0.1:8000/api/categories/ \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
---

## Database Models

### Note Model (Django)
```python
from django.db import models
from django.contrib.auth.models import User

class Category(models.Model):
    name = models.CharField(max_length=255)
    color = models.CharField(max_length=7)  # Hex color

class Note(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
```

---

## Frontend Page Descriptions

### `pages/index.tsx` (Home Page)
- Displays a list of all notes.
- Allows filtering by category.

### `pages/note-create.tsx` (Create/Edit Note Page)
- Allows users to create and edit notes.
- Uses **debounce** to optimize API calls.
- Categories are color-coded for better visualization.

### `pages/login.tsx` (Login Page)
- Handles authentication using JWT.

---

## Performance Optimization

### Debounce in Note Creation
To avoid sending too many API requests while a user is typing, we implemented **debounce** in the `CreateNotePage` component. Instead of making a request on every keystroke, the system waits **1 second** after the last keystroke before saving the note.

#### Implementation:
```tsx
useEffect(() => {
  const timer = setTimeout(() => {
    saveNote(title, content, category);
  }, 1000);
  return () => clearTimeout(timer);
}, [title, content, category]);
```
