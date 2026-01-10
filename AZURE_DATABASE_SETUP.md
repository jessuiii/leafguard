# Azure Database Setup Guide for LeafGuard App

## Overview
This guide will help you set up Azure Cosmos DB for the LeafGuard plant health monitoring application. We'll use Cosmos DB with SQL API for flexible document storage and scalability.

## Prerequisites
- Azure account (free tier available: https://azure.microsoft.com/free/)
- Azure CLI installed (optional, but recommended)
- Python 3.8+ for backend

## Step 1: Create Azure Cosmos DB Account

### Option A: Using Azure Portal (Recommended for beginners)

1. **Go to Azure Portal**
   - Visit: https://portal.azure.com
   - Sign in with your Azure account

2. **Create Cosmos DB Account**
   - Click "Create a resource"
   - Search for "Azure Cosmos DB"
   - Click "Create"

3. **Configure Basic Settings**
   ```
   Subscription: Your Azure subscription
   Resource Group: Create new "leafguard-rg"
   Account Name: "leafguard-cosmosdb" (must be globally unique)
   API: Core (SQL) - Recommended
   Location: Choose nearest region (e.g., East US, West Europe)
   Capacity mode: Provisioned throughput (for predictable costs)
   Apply Free Tier Discount: Yes (if available)
   ```

4. **Configure Backup & Networking**
   - Backup: Periodic (default)
   - Networking: All networks (for development)
   - Encryption: Service-managed key (default)

5. **Review and Create**
   - Review settings
   - Click "Create"
   - Wait for deployment (5-10 minutes)
   - Or use Azure Cloud Shell in the browser

## Option 1: Azure Cosmos DB (Recommended for this app)

### Why Cosmos DB?
- NoSQL document database (perfect for our JSON plant records)
- Global distribution and scalability
- Built-in APIs for MongoDB, SQL, Cassandra, etc.
- Generous free tier: 1000 RU/s and 25 GB storage

### Setup Steps:

#### 1. Create Cosmos DB Account via Azure Portal

```bash
# Login to Azure
az login

# Create resource group
az group create --name leafguard-rg --location "East US"

# Create Cosmos DB account
az cosmosdb create \
  --resource-group leafguard-rg \
  --name leafguard-cosmosdb \
  --kind GlobalDocumentDB \
  --locations regionName="East US" failoverPriority=0 isZoneRedundant=False \
  --default-consistency-level "Session" \
  --enable-automatic-failover false \
  --enable-multiple-write-locations false
```

#### 2. Create Database and Containers

```bash
# Create database
az cosmosdb sql database create \
  --account-name leafguard-cosmosdb \
  --resource-group leafguard-rg \
  --name LeafGuardDB

# Create plants container
az cosmosdb sql container create \
  --account-name leafguard-cosmosdb \
  --resource-group leafguard-rg \
  --database-name LeafGuardDB \
  --name plants \
  --partition-key-path "/plantId" \
  --throughput 400

# Create scan history container
az cosmosdb sql container create \
  --account-name leafguard-cosmosdb \
  --resource-group leafguard-rg \
  --database-name LeafGuardDB \
  --name scanHistory \
  --partition-key-path "/plantId" \
  --throughput 400

# Create treatments container
az cosmosdb sql container create \
  --account-name leafguard-cosmosdb \
  --resource-group leafguard-rg \
  --database-name LeafGuardDB \
  --name treatments \
  --partition-key-path "/plantId" \
  --throughput 400
```

#### 3. Get Connection Details

```bash
# Get connection string
az cosmosdb keys list \
  --resource-group leafguard-rg \
  --name leafguard-cosmosdb \
  --type connection-strings

# Get endpoint and keys
az cosmosdb show \
  --resource-group leafguard-rg \
  --name leafguard-cosmosdb

az cosmosdb keys list \
  --resource-group leafguard-rg \
  --name leafguard-cosmosdb
```

#### 4. Alternative: Azure Portal Setup

1. Go to https://portal.azure.com
2. Click "Create a resource"
3. Search for "Azure Cosmos DB"
4. Select "Azure Cosmos DB for NoSQL"
5. Fill in:
   - **Subscription**: Your subscription
   - **Resource Group**: Create new "leafguard-rg"
   - **Account Name**: "leafguard-cosmosdb"
   - **Location**: Choose nearest region
   - **Capacity mode**: Provisioned throughput
   - **Apply Free Tier Discount**: Yes (if available)
6. Click "Review + Create"

### 5. Environment Variables Setup

After creating the database, you'll get:

```env
# Add to .env file
AZURE_COSMOS_ENDPOINT=https://leafguard-cosmosdb.documents.azure.com:443/
AZURE_COSMOS_KEY=your-primary-key-here
AZURE_COSMOS_DATABASE_ID=LeafGuardDB
```

## Option 2: Azure SQL Database

### Why SQL Database?
- Traditional relational database
- Familiar SQL syntax
- Good for structured data
- Can be more cost-effective for simple apps

### Setup Steps:

```bash
# Create SQL Server
az sql server create \
  --name leafguard-sqlserver \
  --resource-group leafguard-rg \
  --location "East US" \
  --admin-user sqladmin \
  --admin-password "YourStrongPassword123!"

# Create SQL Database
az sql db create \
  --resource-group leafguard-rg \
  --server leafguard-sqlserver \
  --name LeafGuardDB \
  --service-objective Basic

# Configure firewall (allow your IP)
az sql server firewall-rule create \
  --resource-group leafguard-rg \
  --server leafguard-sqlserver \
  --name AllowMyIP \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 255.255.255.255
```

## Storage Account for GLB Models

```bash
# Create storage account for GLB files
az storage account create \
  --name leafguardstorage \
  --resource-group leafguard-rg \
  --location "East US" \
  --sku Standard_LRS

# Create blob container
az storage container create \
  --name glb-models \
  --account-name leafguardstorage \
  --public-access blob
```

## Security Best Practices

1. **Use Managed Identity** (for production)
2. **Restrict network access** (firewall rules)
3. **Enable encryption** (enabled by default)
4. **Use Azure Key Vault** for secrets
5. **Monitor with Azure Monitor**

## Cost Optimization

1. **Cosmos DB Free Tier**: 1000 RU/s + 25GB
2. **SQL Database Basic**: ~$5/month
3. **Storage Account**: ~$0.02/GB/month
4. **Total estimated cost**: $0-10/month for development

## Next Steps

1. Choose your database option (Cosmos DB recommended)
2. Set up the Azure resources
3. Get the connection strings
4. Update the `.env` file
5. Test the connection

## Troubleshooting

- **Can't connect**: Check firewall rules
- **Authentication failed**: Verify keys/connection strings
- **Quota exceeded**: Check free tier limits
- **Performance issues**: Monitor RU consumption (Cosmos DB)

Would you like me to help you set up any of these options?