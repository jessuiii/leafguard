#!/usr/bin/env python3
"""
Upload GLB files to Azure Blob Storage
"""

import os
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient
from azure.core.exceptions import ResourceExistsError

def upload_glb_files_to_azure():
    """Upload your GLB files to Azure Blob Storage"""
    
    # Azure Storage configuration
    # TODO: Replace these with your actual values from Step 4
    STORAGE_CONNECTION_STRING = "YOUR_CONNECTION_STRING_FROM_STEP_4"
    CONTAINER_NAME = "glb-models"
    
    # Local GLB files
    current_dir = os.path.dirname(__file__)
    glb_files = {
        "healthy-leaf.glb": os.path.join(current_dir, "glb Files", "healthy-leaf.glb"),
        "deceased-leaf.glb": os.path.join(current_dir, "glb Files", "deceased-leaf.glb")
    }
    
    try:
        # Create the BlobServiceClient
        blob_service_client = BlobServiceClient.from_connection_string(STORAGE_CONNECTION_STRING)
        
        # Create container if it doesn't exist
        try:
            container_client = blob_service_client.create_container(CONTAINER_NAME)
            print(f"✅ Created container: {CONTAINER_NAME}")
        except ResourceExistsError:
            print(f"ℹ️ Container {CONTAINER_NAME} already exists")
            container_client = blob_service_client.get_container_client(CONTAINER_NAME)
        
        # Upload each GLB file
        for blob_name, file_path in glb_files.items():
            if os.path.exists(file_path):
                print(f"📤 Uploading {blob_name}...")
                
                # Create blob client
                blob_client = blob_service_client.get_blob_client(
                    container=CONTAINER_NAME, 
                    blob=blob_name
                )
                
                # Upload file
                with open(file_path, "rb") as data:
                    blob_client.upload_blob(data, overwrite=True)
                
                # Get the URL
                blob_url = blob_client.url
                print(f"✅ Uploaded: {blob_url}")
                
            else:
                print(f"❌ File not found: {file_path}")
        
        print("\n🎉 GLB files uploaded successfully!")
        print("\n📋 Next steps:")
        print("1. Update your backend configuration with these URLs")
        print("2. Test the Digital Twins integration")
        
    except Exception as e:
        print(f"❌ Error uploading files: {e}")
        print("\n🔧 Troubleshooting:")
        print("1. Check your connection string")
        print("2. Verify your Azure Storage account is active")
        print("3. Ensure the container permissions are correct")

def get_azure_config_template():
    """Generate configuration template for Azure services"""
    
    config_template = """
# Azure Configuration Template
# Copy these values from your Azure portal

AZURE_STORAGE_CONNECTION_STRING = "DefaultEndpointsProtocol=https;AccountName=leafguardstorage;AccountKey=YOUR_KEY;EndpointSuffix=core.windows.net"
AZURE_STORAGE_CONTAINER_NAME = "glb-models"

# Digital Twins Configuration
AZURE_DIGITAL_TWINS_URL = "https://leaf-guard-twins.api.eus.digitaltwins.azure.net"
AZURE_CLIENT_ID = "YOUR_APP_CLIENT_ID"
AZURE_CLIENT_SECRET = "YOUR_APP_CLIENT_SECRET"
AZURE_TENANT_ID = "YOUR_TENANT_ID"

# GLB File URLs (after upload)
HEALTHY_GLB_URL = "https://leafguardstorage.blob.core.windows.net/glb-models/healthy-leaf.glb"
DISEASED_GLB_URL = "https://leafguardstorage.blob.core.windows.net/glb-models/deceased-leaf.glb"
"""
    
    print("📝 Azure Configuration Template:")
    print("=" * 50)
    print(config_template)
    
    # Save to file
    config_file = os.path.join(os.path.dirname(__file__), "azure_config_template.env")
    with open(config_file, "w") as f:
        f.write(config_template)
    
    print(f"💾 Template saved to: {config_file}")

if __name__ == "__main__":
    print("🚀 Azure GLB Upload Setup")
    print("=" * 50)
    print()
    
    print("📋 Before running this script:")
    print("1. Complete Azure account setup (Steps 1-7)")
    print("2. Replace STORAGE_CONNECTION_STRING with your actual connection string")
    print("3. Ensure your GLB files are in the 'glb Files' folder")
    print()
    
    get_azure_config_template()
    print()
    
    # Uncomment the line below after updating the connection string
    # upload_glb_files_to_azure()
    
    print("⚠️ Remember to uncomment the upload_glb_files_to_azure() call after updating your connection string!")