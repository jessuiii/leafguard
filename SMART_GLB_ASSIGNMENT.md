# Smart GLB Assignment System

## 🤖 **How It Works**

Your question: *"If a healthy plant is identified as diseased, will the plant id get the diseased GLB file?"*

**Answer: YES! With our new Smart GLB Assignment System, the system automatically determines which GLB file to use based on REAL-TIME AI analysis, not just pre-configured digital twin status.**

## 🎯 **Three Assignment Methods**

### 1. **AI-Driven Assignment** (Recommended)
```
Image Upload → AI Analysis → Smart GLB Selection
```
- **Real-time analysis** of uploaded leaf images
- Uses computer vision to detect disease symptoms
- Automatically assigns healthy.glb or diseased.glb based on actual leaf condition
- **Conflict detection** when AI analysis differs from digital twin status

### 2. **Digital Twin Based** (Current Default)
```
Digital Twin Status → GLB Assignment
```
- Uses pre-configured health status from digital twin
- Healthy digital twin → healthy.glb
- Diseased digital twin → diseased.glb

### 3. **Manual Override** (User Choice)
```
User Decision → GLB Assignment
```
- User manually chooses which GLB file to upload
- Useful for edge cases or when disagreeing with AI/digital twin

## 🧠 **Smart Analysis Features**

### **Conflict Detection**
When AI analysis conflicts with digital twin status:
```
Digital Twin: "Healthy"
AI Analysis: "Diseased" (85% confidence)
Result: ⚠️ CONFLICT DETECTED!
```

The system will:
1. **Alert the user** about the conflict
2. **Show both recommendations** side by side
3. **Let user choose** which recommendation to follow
4. **Log the conflict** for future model improvement

### **Analysis Methods**
1. **AI Model**: Uses your trained DenseNet model for disease detection
2. **Color Heuristics**: Fallback method analyzing green percentage and brightness
3. **Digital Twin**: Uses pre-configured plant health status

## 📊 **Example Scenarios**

### **Scenario 1: Perfect Match**
```
Digital Twin: Healthy
AI Analysis: Healthy (92% confidence)
Result: ✅ Use healthy.glb
```

### **Scenario 2: Conflict Detection**
```
Digital Twin: Healthy  
AI Analysis: Diseased (87% confidence)
Result: ⚠️ Conflict! User chooses:
  - Option A: Follow AI → Use diseased.glb
  - Option B: Follow Digital Twin → Use healthy.glb
  - Option C: Manual review → User decides
```

### **Scenario 3: Disease Progression**
```
Week 1: Digital Twin: Healthy, AI: Healthy → healthy.glb
Week 2: Digital Twin: Healthy, AI: Diseased → diseased.glb + Update digital twin
Week 3: Digital Twin: Diseased, AI: Diseased → diseased.glb
```

## 🔧 **Implementation**

### **Backend Components**
- **`smart_glb_assigner.py`**: Core AI analysis and GLB assignment logic
- **`api_3d.py`**: REST endpoints for image analysis and recommendations
- **Integration**: Works with existing Azure Digital Twins and disease detection models

### **Frontend Components**
- **`SmartGLBSelector.tsx`**: Interactive UI for GLB assignment
- **`ModelUploadManager.tsx`**: Enhanced upload with smart recommendations
- **`PlantSelector.tsx`**: Choose specific plants/leaves for upload

### **API Endpoints**
```
POST /api/analyze-for-glb
- Upload image + plant/leaf ID
- Returns: Smart GLB recommendation + conflict detection

GET /api/glb-recommendations/{plant_id}/{leaf_id}  
- Get recommendation based on digital twin only
- Returns: Default GLB assignment

POST /api/upload-glb
- Enhanced upload with smart assignment metadata
- Logs conflicts and AI analysis results
```

## 🎮 **User Experience**

### **Upload Flow**
1. **Select Plant/Leaf** from demo digital twins
2. **Upload Image** of the actual leaf
3. **AI Analysis** runs automatically
4. **Smart Recommendation** appears:
   - ✅ No conflict: "Use healthy.glb (92% confidence)"
   - ⚠️ Conflict detected: Choose between AI vs Digital Twin
5. **Upload GLB** file with enhanced metadata
6. **View in 3D** with conflict warnings if applicable

### **Visual Indicators**
- 🟢 **Green badges**: Healthy recommendations
- 🔴 **Red badges**: Diseased recommendations  
- ⚠️ **Warning icons**: Conflicts detected
- 🧠 **Brain icons**: AI-powered features
- 📊 **Confidence scores**: Analysis reliability

## 🚀 **Benefits**

1. **Accuracy**: Real-time AI analysis vs static digital twin data
2. **Transparency**: See why each GLB was chosen
3. **Flexibility**: Multiple assignment methods
4. **Learning**: Conflict data improves future models
5. **Traceability**: Full audit trail of GLB assignments

## 🔄 **Future Enhancements**

1. **Auto-Update Digital Twins**: When AI detects disease progression
2. **Historical Analysis**: Track disease development over time
3. **Batch Processing**: Analyze multiple leaves simultaneously
4. **Advanced Models**: Integration with more sophisticated disease detection
5. **IoT Integration**: Automatic image capture and analysis

This system ensures that your GLB files always match the ACTUAL leaf condition, not just the pre-configured digital twin status! 🎯