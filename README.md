# LeafGuard - Advanced Plant Disease Detection System

LeafGuard is an AI-powered plant disease detection system that integrates machine learning models for accurate plant disease identification and treatment recommendations.

## 🌟 Features
- **Comprehensive Disease Coverage**: Support for 39+ plant diseases across 14+ plant types
- **Real-time Analysis**: Fast inference with detailed confidence scores
- **Treatment Recommendations**: Expert advice for each identified disease
- **Modern Web Interface**: User-friendly React frontend with camera integration
- **RESTful API**: FastAPI backend with comprehensive endpoints

## 🚀 Model Integration Branches

This project includes:

### 🍅 Marko Tomato-Only Branch (`marko-tomato-only`) - **RECOMMENDED**
**Source**: [MarkoArsenovic/DeepLearning_PlantDiseases](https://github.com/MarkoArsenovic/DeepLearning_PlantDiseases) (Tomato subset)

- **Models**: AlexNet, DenseNet169, Inception_v3, ResNet34, VGG13, SqueezeNet1_1
- **Focus**: Tomato disease classification only (10 classes)
- **Best Accuracy**: 99.76% (Inception_v3)
- **Framework**: PyTorch
- **Specialization**: Highest accuracy for tomato farming applications
- **Documentation**: [README-Marko-Tomato.md](README-Marko-Tomato.md)


## 🛠 How to Use Different Model Branches

### Switch to Marko Tomato-Only (RECOMMENDED for tomato farming)
```bash
git checkout marko-tomato-only
pip install -r backend/requirements.txt
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

### Available API Endpoints
#### Common Endpoints
- `GET /health` - System health check
- `GET /models` - Available models information
- `POST /predict` - Original model (backward compatibility)

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js & npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- Python 3.8+ with pip
- Git

### Installation Steps

```bash
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Step 3: Install frontend dependencies
npm install

# Step 4: Choose your model branch
# For Bhargavi models (tomato-focused):
git checkout b-model-integration

# OR for Marko models (multi-plant):
git checkout marko-model-integration

# Step 5: Install Python dependencies
pip install -r backend/requirements.txt

# Step 6: Start the backend
uvicorn backend.main:app --host 0.0.0.0 --port 5000 --reload

# Step 7: In a new terminal, start the frontend
npm run dev
```
### Use Your Preferred IDE
Clone this repo and push changes. Pushed changes will also be reflected in Lovable.

### Edit Files Directly in GitHub
- Navigate to the desired file(s)
- Click the "Edit" button (pencil icon) at the top right of the file view
- Make your changes and commit the changes

### Use GitHub Codespaces
- Navigate to the main page of your repository
- Click on the "Code" button (green button) near the top right
- Select the "Codespaces" tab
- Click on "New codespace" to launch a new Codespace environment

### Marko Models Training
```bash
cd backend/models
python marko_trainer.py
```

## 📚 Documentation
- [Marko Models Documentation](./README-Marko.md) - Comprehensive multi-plant disease models

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments
- [MarkoArsenovic](https://github.com/MarkoArsenovic) for comprehensive PlantVillage models
- PlantVillage dataset contributors
- Open source community for frameworks and tools
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS


