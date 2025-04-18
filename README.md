
# 🌊 Ocean: Smart Voyage Optimization

**Ocean** is a smart maritime routing platform developed during **Prayatna 2.0** at Acropolis Indore. It uses AI and real-time weather data to optimize sea routes, enhancing fuel efficiency, safety, and voyage time.

---

## 🧠 Problem Statement

Traditional ship routing ignores dynamic weather and sea conditions, leading to fuel waste and safety risks. Ocean addresses this with an intelligent, adaptive system powered by AI.

---

## 🚀 Key Features

- 🌐 Real-time weather & ocean data integration
- 🧠 AI-based route planning using Dijkstra’s & A* algorithms
- 📉 Fuel and emission optimization
- ⚓ Port and traffic awareness
- 📊 Interactive dashboard with live routing feedback

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Tailwind CSS
- **Backend**: Python, Flask
- **AI**: Gemini, SOLO
- **APIs**: Weather API, Port Data
- **Tools**: MongoDB, GitHub

---

## ⚙️ Setup Instructions

```bash
# Clone
git clone https://github.com/am1t0/ocean.git && cd ocean

# Frontend
cd praytna2
npm install && npm run start

# Backend (optional)
cd ../devdockDir
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python app.py
```

Create `.env` with:
```
GEMINI_API_KEY=your_key
SOLO_API_KEY=your_key
WEATHER_API_KEY=your_key
```

---

## 👨‍💻 Team CanvasIO

- Amit Pandey – Frontend & Logic  
- Love Goyner – AI & Backend  
- Tanishq Bhadouria – Data & Graphs  
- Aakanksha Ghodki – Integration & Docs & Frontend  
🎓 IET DAVV, IT | Batch: 2026

---

## 🏁 Hackathon

- **Prayatna 2.0**, Acropolis Indore  
- Powered by **Unstop**
