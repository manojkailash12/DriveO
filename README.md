# 🚗 DriveO - Car Rentals

A comprehensive car rental platform built with React.js (frontend) and Node.js (backend), featuring admin dashboard, user management, booking system, and automated email notifications with PDF receipts.

## 🌟 Features

### 🎯 Core Features
- **User Authentication** - Sign up, sign in with OTP verification
- **Vehicle Management** - Browse, filter, and book vehicles
- **Booking System** - Local, intercity, and interstate bookings
- **Payment Integration** - Razorpay integration with multiple payment options
- **Admin Dashboard** - Complete management system for bookings, users, and vehicles
- **Vendor Portal** - Vehicle owners can list and manage their vehicles
- **Email Notifications** - Automated emails with PDF receipts
- **PDF Generation** - Fast PDF generation for receipts and reports
- **Responsive Design** - Mobile-first design, works on all devices

### 📧 Email Features
- ✅ OTP verification emails for registration
- ✅ Booking confirmation emails with PDF attachments
- ✅ Receipt emails from user orders page
- ✅ Admin report exports (PDF downloads)
- ✅ Automated email queue system with offline support

### 📱 Responsive Design
- ✅ Mobile-first approach (320px+)
- ✅ Tablet optimized (768px+)
- ✅ Desktop enhanced (1024px+)
- ✅ Ultra-wide support (1536px+)
- ✅ Cross-browser compatibility

### 🔧 Admin Features
- **Dashboard Analytics** - Revenue, bookings, user statistics
- **User Management** - View, edit, manage all users
- **Booking Management** - Track all bookings, change status
- **Vehicle Management** - Add, edit, delete vehicles
- **Financial Reports** - Export financial data as PDF
- **Travel Analytics** - Distance tracking, travel patterns

## 🚀 Live Demo

- **Frontend (Netlify)**: [Your Netlify URL]
- **Backend (Vercel)**: [Your Vercel URL]
- **API Health Check**: [Your Vercel URL]/api/health

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Redux Toolkit** - State management
- **React Router** - Navigation
- **React Hook Form** - Form handling
- **Zod** - Form validation
- **Ant Design** - UI components
- **Material-UI** - Data grids and components

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (MongoDB Atlas)
- **Mongoose** - ODM
- **JWT** - Authentication
- **Nodemailer** - Email service
- **Puppeteer** - PDF generation
- **html-pdf-node** - Fast PDF generation
- **Cloudinary** - Image storage
- **Razorpay** - Payment gateway

### Deployment
- **Frontend**: Netlify
- **Backend**: Vercel
- **Database**: MongoDB Atlas
- **Email**: Gmail SMTP
- **Storage**: Cloudinary

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account
- Gmail account with App Password
- Cloudinary account
- Razorpay account (optional)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/manojkailash12/DriveO.git
   cd DriveO/CarX
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd client
   npm install
   cd ..
   ```

3. **Environment Configuration**
   
   Create `backend/.env`:
   ```env
   MONGO_URI=your_mongodb_connection_string
   EMAIL_USER=your_gmail_address
   EMAIL_PASS=your_gmail_app_password
   CLOUD_NAME=your_cloudinary_cloud_name
   API_KEY=your_cloudinary_api_key
   API_SECRET=your_cloudinary_api_secret
   JWT_SECRET=your_jwt_secret
   ACCESS_TOKEN=your_access_token_secret
   REFRESH_TOKEN=your_refresh_token_secret
   ENABLE_PDF_GENERATION=true
   PORT=5000
   NODE_ENV=development
   ```
   
   Create `client/.env`:
   ```env
   VITE_PRODUCTION_BACKEND_URL=http://localhost:5000
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

4. **Start the application**
   ```bash
   # Start backend (from CarX root)
   npm run dev
   
   # Start frontend (in new terminal)
   cd client
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000
   - API Health: http://localhost:5000/api/health

## 🚀 Deployment

### Quick Deployment
```bash
# Make deployment script executable
chmod +x quick-deploy.sh

# Run deployment script
./quick-deploy.sh
```

### Manual Deployment

#### Backend (Vercel)
1. Install Vercel CLI: `npm install -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`
4. Set environment variables in Vercel dashboard

#### Frontend (Netlify)
1. Build: `cd client && npm run build`
2. Deploy `dist` folder to Netlify
3. Set build settings: Command `npm run build`, Directory `dist`

For detailed deployment instructions, see [deploy.md](deploy.md)

## 📋 Testing

### Email Features Testing
```bash
# Test email service
curl -X POST https://your-vercel-url.vercel.app/api/test/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@gmail.com"}'

# Test PDF generation
curl -X POST https://your-vercel-url.vercel.app/api/test/test-pdf \
  --output test-receipt.pdf
```

### Feature Testing Checklist
- [ ] User registration with OTP email
- [ ] User login and authentication
- [ ] Vehicle booking flow
- [ ] Booking confirmation emails with PDF
- [ ] Admin dashboard access
- [ ] Admin PDF exports
- [ ] User order management
- [ ] Email receipt sending
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility

## 📁 Project Structure

```
CarX/
├── backend/
│   ├── controllers/        # Route controllers
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── services/          # Business logic services
│   ├── utils/             # Utility functions
│   ├── scripts/           # Database scripts
│   └── server.js          # Main server file
├── client/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── redux/         # State management
│   │   └── utils/         # Utility functions
│   ├── public/            # Static assets
│   └── dist/              # Build output
├── vercel.json            # Vercel deployment config
├── deploy.md              # Deployment guide
├── DEPLOYMENT_CHECKLIST.md # Deployment checklist
└── quick-deploy.sh        # Deployment script
```

## 🔧 Configuration Files

- **vercel.json** - Vercel deployment configuration
- **netlify.toml** - Netlify deployment configuration
- **.env.production** - Production environment variables template
- **deploy.md** - Comprehensive deployment guide
- **DEPLOYMENT_CHECKLIST.md** - Step-by-step deployment checklist

## 🐛 Troubleshooting

### Common Issues

1. **Email not sending**
   - Check Gmail App Password
   - Verify environment variables
   - Check spam folder

2. **PDF generation fails**
   - Ensure `ENABLE_PDF_GENERATION=true`
   - Check Vercel function timeout
   - Verify Puppeteer compatibility

3. **CORS errors**
   - Update allowed origins in server.js
   - Verify frontend URL in backend config

4. **Database connection issues**
   - Check MongoDB Atlas connection string
   - Verify IP whitelist (0.0.0.0/0 for Vercel)

For detailed troubleshooting, see [deploy.md](deploy.md)

## 📊 Performance

- **Page Load Time**: < 3 seconds
- **PDF Generation**: < 10 seconds
- **Email Delivery**: < 30 seconds
- **Mobile Performance**: 90%+ Lighthouse score
- **Desktop Performance**: 95%+ Lighthouse score

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Environment variable protection
- CORS configuration
- Input validation and sanitization
- Secure file upload handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Manoj Kailash**
- GitHub: [@manojkailash12](https://github.com/manojkailash12)
- Email: [Your Email]

## 🙏 Acknowledgments

- React.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- MongoDB team for the database solution
- Vercel and Netlify for hosting platforms
- All open-source contributors

## 📞 Support

If you encounter any issues or need help with deployment:

1. Check the [deployment guide](deploy.md)
2. Review the [deployment checklist](DEPLOYMENT_CHECKLIST.md)
3. Open an issue on GitHub
4. Contact the development team

---

**⭐ If you found this project helpful, please give it a star!**