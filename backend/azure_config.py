"""
Azure Configuration for Leaf Guard Project
Contains storage account URLs and settings
"""

# Azure Storage Account Details
AZURE_STORAGE_ACCOUNT_NAME = "leafguardstorage"
AZURE_STORAGE_ACCOUNT_URL = "https://leafguardstorage.blob.core.windows.net"

# GLB File URLs (Public Access)
GLB_URLS = {
    "healthy": "https://leafguardstorage.blob.core.windows.net/glb-models/healthy-leaf.glb",
    "diseased": "https://leafguardstorage.blob.core.windows.net/glb-models/deceased-leaf.glb"
}

# Container Names
CONTAINERS = {
    "glb_models": "glb-models"
}

# Azure Digital Twins (if you want to set it up later)
AZURE_DIGITAL_TWINS_URL = ""  # To be filled when Digital Twins is set up

# Azure Region
AZURE_REGION = "southindia"

def get_glb_url(health_status: str) -> str:
    """
    Get GLB URL based on health status
    
    Args:
        health_status: 'healthy' or 'diseased'
        
    Returns:
        URL to the appropriate GLB file
    """
    return GLB_URLS.get(health_status, GLB_URLS["healthy"])

def get_storage_info():
    """Get storage account information"""
    return {
        "account_name": AZURE_STORAGE_ACCOUNT_NAME,
        "account_url": AZURE_STORAGE_ACCOUNT_URL,
        "glb_urls": GLB_URLS,
        "containers": CONTAINERS,
        "region": AZURE_REGION
    }