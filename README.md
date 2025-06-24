# 🏥 Doctor Appointment System

A comprehensive MERN stack application for managing doctor appointments with PayHere payment integration.

##  Features

### For Doctors
- **Dashboard Overview** - View appointments, earnings, and patient statistics
- **Appointment Management** - Accept, reschedule, or cancel appointments
- **Schedule Management** - Set availability and working hours
- **Patient Records** - Access patient history and medical records
- **Earnings Tracking** - Monitor income and payment history
- **Profile Management** - Update professional information and qualifications

### For Patients
- **Doctor Discovery** - Browse and search qualified doctors
- **Online Booking** - Schedule appointments with preferred doctors
- **Payment Integration** - Secure payments via PayHere gateway
- **Appointment History** - Track past and upcoming appointments
- **Real-time Updates** - Instant notifications for appointment changes
- **Profile Management** - Manage personal and medical information

### For Administrators
- **System Overview** - Comprehensive dashboard with analytics
- **User Management** - Manage patients, doctors, and staff
- **Hospital Management** - Add and manage medical facilities
- **Payment Monitoring** - Track all transactions and revenue
- **System Settings** - Configure application preferences

## Technology Stack

### Backend
- **Node.js** - Server runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - Authentication and authorization
- **PayHere** - Payment gateway integration
- **Socket.io** - Real-time communication
- **Nodemailer** - Email notifications
- **PDF Generation** - Invoice and report generation
- **bcryptjs** - Password hashing

### Frontend
- **React 18** - User interface library
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests
- **Socket.io Client** - Real-time updates
- **React Hot Toast** - User notifications
- **Lucide React** - Modern icon library
- **jsPDF** - PDF export functionality

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB database
- PayHere merchant account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/doctor-appointment-system.git
   cd doctor-appointment-system
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Configuration**
   
   Create `.env` file in the `backend` directory:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/doctor-appointment
   
   # JWT
   JWT_SECRET=your_jwt_secret_key
   
   # PayHere Configuration
   PAYHERE_MERCHANT_ID=your_merchant_id
   PAYHERE_MERCHANT_SECRET=your_merchant_secret
   PAYHERE_SANDBOX=true
   
   # URLs
   CLIENT_URL=http://localhost:3000
   SERVER_URL=http://localhost:5000
   
   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password
   ```
   
   Create `.env` file in the `frontend` directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_PAYHERE_SANDBOX=true
   ```

5. **Start the Application**
   
   Backend (Terminal 1):
   ```bash
   cd backend
   npm run dev
   ```
   
   Frontend (Terminal 2):
   ```bash
   cd frontend
   npm start
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 💳 PayHere Integration

This application uses PayHere as the payment gateway for processing appointment fees.

### Configuration
- Supports both Sandbox and Live environments
- Automatic hash generation for secure transactions
- Webhook integration for payment notifications
- Real-time payment status updates

### Test Payment Details (Sandbox)
- **Card Number:** 4916217501611292
- **CVV:** 123
- **Expiry:** 12/25

## 📱 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Appointment Endpoints
- `GET /api/appointments` - Get user appointments
- `POST /api/appointments` - Create new appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

### Payment Endpoints
- `POST /api/payments/initiate` - Initiate payment
- `POST /api/payments/notify` - PayHere webhook
- `GET /api/payments` - Get payment history

## Security Features

- **JWT Authentication** - Secure user sessions
- **Password Hashing** - bcrypt encryption
- **Input Validation** - Request data sanitization
- **CORS Protection** - Cross-origin request security
- **Rate Limiting** - API abuse prevention
- **Hash Verification** - PayHere payment security

## Database Schema

### User Model
- Personal information and authentication
- Role-based access (Patient, Doctor, Admin)
- Profile pictures and contact details

### Appointment Model
- Doctor-patient appointment scheduling
- Time slots and availability management
- Status tracking and updates

### Payment Model
- Transaction records and history
- PayHere integration data
- Invoice generation

## Deployment

### Backend Deployment
1. Set up MongoDB Atlas or similar cloud database
2. Configure environment variables for production
3. Deploy to Heroku, DigitalOcean, or AWS
4. Set up PayHere live environment

### Frontend Deployment
1. Build the React application: `npm run build`
2. Deploy to Netlify, Vercel, or similar platform
3. Update API URLs for production environment

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- PayHere for payment gateway integration
- MongoDB for database services
- React and Node.js communities
- Contributors and testers

Made with ❤️ by Coding Yash