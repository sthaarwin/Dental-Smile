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
- **TanStack React Query** for data fetching
- **Sonner** for toast notifications

### Backend
- **NestJS** for API development
- **MongoDB** with Mongoose for database
- **JWT Authentication** for secure access
- **RESTful API** architecture

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+)
- **MongoDB**
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
npm install
npm run start:dev
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
│   │   │   └── ui/         # Shadcn UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── hooks/          # Custom React hooks
│   │   ├── data/           # Mock data
│   │   └── lib/            # Utility functions
│   ├── public/             # Static assets
│   └── package.json        # NPM dependencies
│
└── backend/                # NestJS backend application
    ├── src/                # Source files
    │   ├── appointments/   # Appointments module
    │   ├── reviews/        # Reviews module
    │   ├── services/       # Services module
    │   ├── schedules/      # Schedules module
    │   ├── users/          # Users module
    │   └── main.ts         # Application entry point
    └── package.json        # NPM dependencies
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
npm run test
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

- [NestJS](https://nestjs.com/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [MongoDB](https://www.mongodb.com/)