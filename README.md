# LeafGuard - Advanced Plant Disease Detection System

# 🌿 LeafGuard

LeafGuard is a full-stack web application for **plant leaf disease analysis**.  
Users upload or capture a photo of a plant leaf, the backend runs a machine-learning model on the image, and the app returns the predicted plant health status along with optional **3D visualization assets (GLB files)**.

This repository contains both the **frontend (React)** and **backend (FastAPI + ML inference)** code.

---

## 🧠 How It Works (System Overview)

```

Browser (React UI)
↓ image upload
FastAPI Backend
↓ ML inference
Prediction Result (JSON)
↓
Frontend renders result + optional 3D model

```

1. User captures or uploads a leaf image in the browser  
2. Image is sent to the FastAPI backend  
3. Backend runs a trained ML model on the image  
4. Backend returns prediction data (class, confidence, health status)  
5. Frontend displays results and optionally loads a 3D GLB model  

---

## 📁 Project Structure

```

leafguard/
│
├── backend/
│   ├── main.py              # FastAPI app and inference endpoints
│   ├── requirements.txt     # Backend dependencies
│   └── ...                  # ML helpers, assets, configs
│
├── src/
│   ├── App.tsx              # Main React application
│   ├── components/          # UI components
│   ├── hooks/               # React hooks
│   └── styles/              # Styling (Tailwind / CSS)
│
├── .env.example             # Environment variable template
├── package.json             # Frontend dependencies
└── README.md

```

---

## ⚙️ Backend (FastAPI)

### Entry Point
```

backend/main.py

````

### Backend Responsibilities

- Loads a pre-trained machine learning model at startup
- Accepts uploaded leaf images
- Runs inference on uploaded images
- Maps predictions to:
  - plant health status
  - disease class
  - confidence score
  - optional 3D GLB model
- Proxies GLB files from Azure Blob Storage to avoid CORS issues

---

### API Endpoints

#### `GET /`
Health check endpoint.  
Returns server status and whether the ML model is loaded.

---

#### `GET /model-info`
Returns metadata about the loaded model, including:
- load status
- class names
- device information
- available GLB assets

---

#### `POST /analyze-leaf`
**Main inference endpoint**

**Request**
- Content-Type: `multipart/form-data`
- Field name: `file`
- Value: image file (`.jpg`, `.png`, etc.)

**Response (example)**
```json
{
  "status": "healthy",
  "predicted_class": "Tomato_Healthy",
  "confidence": 0.94,
  "glb_model_url": "/proxy-glb/healthy.glb"
}
````

---

#### `GET /proxy-glb/{filename}`

Proxies GLB files from Azure Blob Storage and serves them with proper CORS headers so they can be loaded directly in the browser.

---

## 🧠 Machine Learning

* The ML model is loaded once when the backend starts
* Image preprocessing and prediction are handled internally
* Each prediction includes:

  * predicted class
  * confidence score
* Predictions can be mapped to corresponding **3D GLB models** for visualization

> The backend assumes trained model weights are already available and properly configured.

---

## 🖥️ Frontend (React + TypeScript)

### Entry Point

```
src/App.tsx
```

### Frontend Responsibilities

* Capture image from camera or upload from device
* Preview selected image
* Send image to backend using `fetch` and `FormData`
* Display prediction results:

  * health status
  * disease name
  * confidence score
* Load and display optional 3D GLB models
* Store previous plant scans in browser local storage

---

## 🔐 Environment Variables

Create a `.env` file using `.env.example` as a reference.

### Backend

* Model paths
* Azure Blob Storage configuration
* Allowed frontend origins

### Frontend

* Backend API base URL

---

## ▶️ Running Locally

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at:

```
http://localhost:8000
```

---

### Frontend

```bash
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

## 🧪 Notes & Limitations

* No automated tests included
* Model training pipeline is not part of this repository
* No authentication or authorization
* Not production-hardened
* Assumes model files are already present

---

## 🚀 What This Project Is

✔ A working full-stack ML inference application
✔ Image → model → prediction pipeline
✔ Real backend inference (not mocked)
✔ Frontend and backend clearly separated

---

## ❌ What This Project Is Not

✘ A production-ready service
✘ A fully documented ML training framework
✘ A public API with versioning

---

## 📌 Future Improvements

* Add backend and frontend tests
* Document model training and evaluation
* Add Docker support
* Add CI/CD pipelines
* Improve error handling and logging

```



