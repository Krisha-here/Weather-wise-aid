# 🌊 Weather Wise Aid — Coastal Prediction AI System

An Advanced Multi-Agentic AI Framework for Coastal Disaster Risk Assessment, Early Warning Alerts, and Decision Support.

---

## 📌 Project Overview

**Weather Wise Aid** is an AI-powered coastal disaster forecasting and risk management platform designed to help coastal communities, emergency responders, and environmental authorities predict, prepare for, and respond to extreme weather events.

By combining real-time meteorological data, oceanographic reanalysis (ERA5, CMEMS, SST), and specialized multi-agent AI prediction models, the system delivers precise risk assessments for floods, cyclones, and heavy rainfall.

---

## ✨ Key Features

### 🌊 1. Flood Prediction Agent
- **Real-Time Water Level Monitoring**: Tracks river discharge, coastal tide levels, and rainfall accumulation.
- **Inundation Risk Modeling**: Evaluates flood severity and provides regional risk badges and alerts.

### 🌀 2. Cyclone Prediction Agent
- **Sea Surface Temperature (SST) & OHC Analysis**: Tracks Ocean Heat Content and sea surface temperature anomalies.
- **Trajectory & Intensity Forecasting**: Predicts cyclone pathways, landfall estimations, and wind speeds.

### 🌧️ 3. Rainfall Forecast Agent
- **High-Resolution Precipitation Models**: Visualizes short-term and long-term rainfall trends.
- **ERA5 & Satellite Data Synthesis**: Integrates historical and real-time atmospheric reanalysis datasets.

### 🚨 4. Emergency Alerts & Risk Monitoring
- **Real-Time Risk Gauges**: Dynamic visualization of current threat levels (Safe, Advisory, Warning, Critical).
- **Broadcast Alarm System**: Audio and visual emergency alert notifications for urgent weather events.

### 🤖 5. AI Emergency Chatbot Assistant
- Interactive AI assistant for instant weather queries, safety protocols, and emergency evacuation guidelines.

### 📊 6. Comprehensive Analytics & Incident Reports
- Detailed historical risk charts and exportable analytical reports for decision-makers.

---

## 🛠️ Technology Stack

- **Framework**: React 18 with TypeScript & Vite
- **Styling**: Tailwind CSS & shadcn/ui components
- **Animations**: Framer Motion
- **Data Visualization**: Recharts
- **State Management & Routing**: React Router v6 & TanStack Query
- **Data Processing**: Python (ERA5, CMEMS, SST NetCDF dataset scripts)

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/)

### Installation & Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/Krisha-here/Weather-wise-aid.git

# 2. Navigate into the project folder
cd Weather-wise-aid/weather-wise-aid-main

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

Open `http://localhost:8080` in your browser to view the application.

---

## 🌐 Live Deployment

This repository is configured with GitHub Actions for automatic deployment to **GitHub Pages**.

- **Live Site**: [https://krisha-here.github.io/Weather-wise-aid/](https://krisha-here.github.io/Weather-wise-aid/)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
