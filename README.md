# 🦷 Dental Smile - Dental Appointment System

![Dental Smile](frontend/public/og-image.png)

## 📖 Overview

Dental Smile is a modern web application designed to simplify dental appointment scheduling and management. It connects patients with verified dental professionals, making dental care more accessible and efficient.

## ✨ Features

### For Patients
- **Search Dentists**: Find dentists by location, specialty, and availability.
- **Book Appointments**: Schedule, reschedule, or cancel appointments with ease.
- **Verified Professionals**: Access a network of licensed and verified dentists.
- **Reminders**: Get email and SMS reminders for upcoming appointments.
- **Reviews**: Read and post reviews about dentists.

### For Dentists
- **Manage Schedules**: Set availability and manage appointments.
- **Patient Insights**: View patient details and appointment history.
- **Profile Customization**: Highlight expertise, services, and reviews.
- **Analytics**: Track practice performance and patient statistics.

---

## 🛠️ Technology Stack

### Frontend
- **React** with TypeScript
- **Tailwind CSS** for styling
- **Shadcn UI** component library
- **React Router** for navigation
- **Framer Motion** for animations

### Backend
- **Django REST Framework** for APIs
- **PostgreSQL** for database
- **JWT Authentication** for secure access
- **Docker** for containerized development

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v14+)
- **Python** (v3.9+)
- **PostgreSQL**
- **Docker** (optional)

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Using Docker
```bash
docker-compose up -d
```

---

## 📋 Project Structure

```
dental_appointment/
├── frontend/               # React frontend application
│   ├── src/                # Source files
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
│   ├── public/             # Static assets
│   └── package.json        # NPM dependencies
│
└── backend/                # Django backend application
    ├── api/                # REST API app
    │   ├── migrations/     # Database migrations
    │   ├── models.py       # Data models
    │   ├── serializers.py  # API serializers
    │   ├── views.py        # API views
    │   └── urls.py         # API routes
    └── backend/            # Django project settings
        ├── settings.py     # Project configuration
        └── urls.py         # URL configuration
```

---

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm test
```

### Backend Tests
```bash
cd backend
python manage.py test
```

---

## 📷 Demo

![Demo](frontend/public/og-image.png)

---

## 📝 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## 👥 Contributors

- [Arwin Shrestha](https://github.com/sthaarwin)

---

## 🙏 Acknowledgements

- [Django](https://www.djangoproject.com/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)