# Azure Digital Twins Integration Setup

This guide will help you set up Azure Digital Twins integration for your LeafGuard project to enable 3D visualization and real-time monitoring.

## Prerequisites

- Azure subscription
- Azure CLI installed (optional but recommended)
- GLB files of your tomato leaves (healthy and diseased)

## Step 1: Create Azure Resources

### 1.1 Create Azure Storage Account

```bash
# Login to Azure CLI
az login

# Create resource group
az group create --name leafguard-rg --location eastus

# Create storage account
az storage account create \
    --name leafguardstorage \
    --resource-group leafguard-rg \
    --location eastus \
    --sku Standard_LRS
```

### 1.2 Create Azure Digital Twins Instance

```bash
# Create Digital Twins instance
az dt create \
    --dt-name leafguard-dt \
    --resource-group leafguard-rg \
    --location eastus
```

## Step 2: Configure Authentication

### 2.1 For Local Development

Use Azure CLI authentication (simplest for development):

```bash
az login
```

### 2.2 For Production

Create a service principal:

```bash
az ad sp create-for-rbac --name leafguard-app --role Contributor
```

This will output:
```json
{
  "appId": "your-client-id",
  "displayName": "leafguard-app",
  "password": "your-client-secret",
  "tenant": "your-tenant-id"
}
```

## Step 3: Configure Environment Variables

1. Copy the environment template:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Edit `backend/.env` with your Azure details:
   ```env
   AZURE_STORAGE_ACCOUNT_NAME=leafguardstorage
   AZURE_STORAGE_CONTAINER_NAME=leaf-models
   AZURE_DIGITAL_TWINS_URL=https://leafguard-dt.api.eastus.digitaltwins.azure.net
   
   # For production (if using service principal):
   # AZURE_CLIENT_ID=your-client-id
   # AZURE_CLIENT_SECRET=your-client-secret
   # AZURE_TENANT_ID=your-tenant-id
   ```

## Step 4: Install Dependencies

```bash
# Backend dependencies
cd backend
pip install -r requirements.txt

# Frontend dependencies (if not already installed)
cd ..
npm install
```

## Step 5: Start the 3D API Server

```bash
# Windows PowerShell
.\start-3d-api.ps1

# Or manually:
cd backend
python -m uvicorn api_3d:app --host 0.0.0.0 --port 8000 --reload
```

## Step 6: Start the Frontend

```bash
npm run dev
```

Navigate to `http://localhost:5173` and click on "3D Digital Twin" to access the upload interface.

## Step 7: Upload Your GLB Files

1. Go to the Digital Twin page in your app
2. Select your GLB file (healthy or diseased leaf)
3. Fill in the metadata (health status, disease type, etc.)
4. Click "Upload to Azure"

## Verifying the Setup

1. **API Health Check**: Visit `http://localhost:8000/api/health`
2. **API Documentation**: Visit `http://localhost:8000/docs`
3. **Azure Portal**: Check your storage account for uploaded files
4. **Digital Twins Explorer**: Use Azure portal to view your digital twins

## Digital Twin Models

The system creates two types of digital twins:

### Plant Model
```json
{
  "$dtId": "plant_123",
  "name": "Tomato Plant #1",
  "species": "Tomato",
  "location": "Greenhouse A",
  "healthStatus": "monitoring",
  "lastInspection": "2025-11-02T10:00:00Z"
}
```

### Leaf Model
```json
{
  "$dtId": "leaf_456",
  "parentPlant": "plant_123",
  "healthStatus": "diseased",
  "diseaseType": "Early Blight",
  "confidence": 0.89,
  "leafArea": 15.2,
  "lesionArea": 2.1,
  "model3dUrl": "https://storage.blob.core.windows.net/leaf-models/leaf_456.glb",
  "captureDate": "2025-11-02T10:00:00Z"
}
```

## Troubleshooting

### Common Issues

1. **Authentication errors**: Make sure you're logged in with `az login`
2. **Storage account not found**: Check the account name in your .env file
3. **Digital Twins URL error**: Verify the URL format includes the full domain
4. **CORS issues**: Make sure the API server is running on the correct port

### Logs

Check the API logs for detailed error messages:
```bash
# API server logs will show in the terminal where you started the server
```

## Future Enhancements

Once this foundation is working, you can add:

1. **IoT Integration**: Connect real sensors for environmental data
2. **Automated Capture**: Set up cameras for automatic image capture
3. **Real-time Updates**: Use Azure Event Grid for live notifications
4. **Advanced Analytics**: Implement time-series analysis of plant health
5. **Mobile App**: Build a mobile interface for field workers

## Cost Optimization

- Use Azure Free Tier where possible
- Set up lifecycle policies for blob storage
- Monitor usage with Azure Cost Management
- Consider using Azure Functions for serverless processing

## Security Best Practices

- Use managed identities in production
- Implement proper RBAC for Digital Twins
- Enable blob storage encryption
- Use private endpoints for secure access