# SAHAKAR // SERVICES

**Local skills. Shared opportunity.**

A production-quality frontend prototype for a cooperative gig services platform designed for Smart India Hackathon demonstration.

## 🎯 Overview

SAHAKAR // SERVICES is a cooperative service platform with three distinct role-based experiences:
- **Customer**: Request on-demand services and track jobs
- **Worker**: Manage job requests, view earnings, and maintain skill passport
- **Cooperative**: Monitor operations, view demand forecasting, and analyze skill gaps

## ✨ Key Features

### 6 Priority Demo Screens

1. **Customer Journey** (Screens #1)
   - Service selection with hero landing
   - Live job tracking with worker ETA
   - ON-DEMAND service request (no scheduling)

2. **Worker Dashboard** (Screens #2 & #3)
   - Availability toggle and earnings dashboard
   - Incoming job requests with accept/reject
   - Skill passport with verified skills and training progress

3. **Cooperative Management** (Screens #4, #5, #6)
   - Operations dashboard with KPIs
   - Workforce & demand heatmap visualization
   - **AI-powered** demand forecasting (7-day predictions)
   - **AI-powered** skill gap analysis with training recommendations

### Technical Highlights

- **Geospatial + Rule-Based Dispatch** (NOT AI): Skill → Availability → Radius → Distance
- **Two AI/ML Features** (Simulated): Demand forecasting & skill gap detection
- **Restrained Monochrome Design**: Off-white backgrounds, controlled blue accent
- **Hardcoded Mock Data**: No backend, auth, or database required
- **Mobile-First Responsive**: Works seamlessly on all devices

## 🛠️ Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **Tailwind CSS** with custom design tokens
- **React Router** for client-side navigation
- **Recharts** for data visualization

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will open at `http://localhost:3000`

## 🎨 Design System

### Color Palette
- **Background**: #F7F7F7 (off-white)
- **Text**: #121212 (near black), #0A1929 (navy)
- **Accent**: #174A8B (controlled blue - primary actions only)

### Typography
- **Body**: Inter (400, 500, 600, 800)
- **Mono**: JetBrains Mono (labels and technical elements)
- **Headlines**: 3.5rem (56px) at weight 800

### Border Radius
- **Bento cards**: 24px
- **Large containers**: 40px

## 📱 Role Switching

Use the role switcher in the top-right corner to switch between:
- **Customer** - Request and track services
- **Worker** - Manage jobs and view earnings
- **Cooperative** - Operations and intelligence dashboards

## 🧪 Demo Features

### Government Integrations (Marked as DEMO)
- e-Shram registration linking
- DigiLocker credential verification
- Bhashini multilingual support

All government integrations are clearly labeled as demonstration features.

### AI/ML Features (Simulated with Mock Data)
- Demand forecasting uses pre-calculated 7-day predictions
- Skill gap analysis uses pre-analyzed workforce data
- All marked with "AI-Powered" labels and DEMO disclaimers

## 📊 Mock Data

The prototype uses comprehensive hardcoded data:
- **25 worker profiles** across 5 service categories
- **6 service categories** with subcategories
- **35 demand forecasts** (7 days × 5 categories)
- **10 skill gap analyses** with severity levels
- **10 sample jobs** with various statuses

## 🎯 Priority Screens Implementation Status

- ✅ Customer: Service Selection + Live Job Tracking
- ✅ Worker: Dashboard + Incoming Job + Skill Passport
- ✅ Cooperative: Operations Dashboard + Heatmap
- ✅ Cooperative: Demand Intelligence (AI Feature)
- ✅ Cooperative: Skill Intelligence (AI Feature)

## 🚫 What's NOT Included

Following the MVP philosophy:
- No backend API or database
- No authentication system
- No payment processing
- No real geolocation services
- No scheduled booking (ON-DEMAND only)
- Optional screens (job history, earnings, workforce directory)

## 📝 Important Notes

### Dispatch System
The worker matching system is **RULE-BASED**, not AI:
1. Filter by required skills
2. Filter by availability
3. Filter by service radius (geospatial)
4. Calculate distances
5. Select nearest worker

### ON-DEMAND Model
This prototype demonstrates **immediate service requests** only:
- No calendar booking
- No scheduled appointments
- "Request Service Now" workflow

## 🏗️ Project Structure

```
src/
├── components/
│   ├── primitives/     # Button, Card, Badge, Input
│   └── layouts/        # RoleSwitcher, PageHeader
├── contexts/           # RoleContext, MockDataContext
├── data/              # Mock data files
├── design/            # Design tokens
├── engines/           # Dispatch and intelligence engines
├── features/          # Role-specific pages
│   ├── customer/
│   ├── worker/
│   └── cooperative/
├── types/             # TypeScript definitions
└── utils/             # Formatters, distance calculations
```

## 📦 Deployment

The app is built as a static site and can be deployed to:
- GitHub Pages
- Netlify
- Vercel
- Any static hosting service

```bash
npm run build
# Deploy the 'dist' folder
```

## 👥 Contributing

This is a hackathon demonstration prototype. For production use, consider:
- Implementing real backend APIs
- Adding authentication and authorization
- Integrating actual payment gateways
- Using real mapping and geolocation services
- Implementing actual machine learning models

## 📄 License

MIT License - Created for Smart India Hackathon demonstration

---

**SAHAKAR // SERVICES** - Demonstrating the future of cooperative gig work platforms
