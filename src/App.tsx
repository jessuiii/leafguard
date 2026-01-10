import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Leaf, Camera, Image as ImageIcon, Upload, ArrowLeft, Eye, Download } from "lucide-react";
import { useState, useRef, Suspense } from "react";
import { toast } from "sonner";
import { RobustGLBViewer } from "@/components/RobustGLBViewer";
import { PlantGallery } from "@/components/PlantGallery";

const queryClient = new QueryClient();

// Camera Capture Component
const CameraCapture = ({ onImageCapture }: { onImageCapture: (imageData: string) => void }) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onImageCapture(result);
        toast.success('Image captured successfully!');
      }
    };
    reader.onerror = () => {
      toast.error('Failed to read image. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const triggerCamera = () => {
    cameraInputRef.current?.click();
  };

  const triggerGallery = () => {
    galleryInputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelect}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
      
      <Button 
        onClick={triggerCamera}
        size="lg" 
        className="h-16 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
      >
        <Camera className="w-6 h-6 mr-3" />
        Take Photo
      </Button>
      
      <Button 
        onClick={triggerGallery}
        variant="outline" 
        size="lg" 
        className="h-16 text-lg font-semibold"
      >
        <ImageIcon className="w-6 h-6 mr-3" />
        Choose from Gallery
      </Button>
    </div>
  );
};

// Leaf Analysis Component
const LeafAnalysis = ({ 
  imageData, 
  onBack,
  onAnalysisComplete 
}: { 
  imageData: string; 
  onBack: () => void; 
  onAnalysisComplete?: (result: any) => void;
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  console.log('LeafAnalysis component rendering with imageData:', imageData ? 'present' : 'missing');

  const analyzeImage = async () => {
    console.log('Starting analysis...');
    setIsAnalyzing(true);
    try {
      // First test if the API is reachable
      console.log('Testing API connection...');
  const testResponse = await fetch('http://localhost:8000/');
      if (testResponse.ok) {
        const testData = await testResponse.json();
        console.log('API root response:', testData);
      }

      // Convert base64 to blob
      const response = await fetch(imageData);
      const blob = await response.blob();
      
      // Create FormData
      const formData = new FormData();
      formData.append('file', blob, 'leaf.jpg');

      console.log('Sending request to analyze-leaf endpoint...');
      // Send to your backend API - CORRECTED ENDPOINT AND PORT
  const apiResponse = await fetch('http://localhost:8000/analyze-leaf', {
        method: 'POST',
        body: formData
      });

      console.log('API Response status:', apiResponse.status);
      console.log('API Response headers:', Object.fromEntries(apiResponse.headers));

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API Error: ${apiResponse.status} ${apiResponse.statusText}`);
      }

      const analysisResult = await apiResponse.json();
      console.log('Full API Response:', analysisResult); // Debug log
      console.log('Response keys:', Object.keys(analysisResult));
      setResult(analysisResult);
      
      // Call the completion callback if provided
      if (onAnalysisComplete) {
        const mappedResult = {
          isHealthy: (analysisResult.analysis?.health_status || analysisResult.health_status) === 'healthy',
          confidence: analysisResult.analysis?.confidence || analysisResult.confidence || 0,
          disease: analysisResult.analysis?.disease_type || analysisResult.disease_type,
          recommendations: [], // Add if your API provides recommendations
          timestamp: Date.now(),
          imageData
        };
        onAnalysisComplete(mappedResult);
      }
      
      toast.success('Analysis complete!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(`Failed to analyze image: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
          <h2 className="text-2xl font-bold">Leaf Analysis</h2>
        </div>

        {/* Image Preview */}
        <div className="bg-card rounded-lg p-4">
          <img 
            src={imageData} 
            alt="Captured leaf" 
            className="w-full max-w-md mx-auto rounded-lg shadow-lg"
          />
        </div>

        {/* Analysis Button */}
        {!result && (
          <div className="text-center">
            <Button 
              onClick={analyzeImage} 
              disabled={isAnalyzing}
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-3" />
                  Analyze Leaf
                </>
              )}
            </Button>
          </div>
        )}

      {/* Results */}
      {result && (
        <div className="bg-card rounded-lg p-6 space-y-4">
          <h3 className="text-xl font-semibold">Analysis Results</h3>
          <div className="space-y-2">
            <p><strong>Health Status:</strong> 
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                (result.analysis?.health_status || result.health_status) === 'healthy' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {result.analysis?.health_status || result.health_status || 'Unknown'}
              </span>
            </p>
            
            {(result.analysis?.disease_type || result.disease_type) && (result.analysis?.disease_type || result.disease_type) !== 'none' && (
              <p><strong>Disease Type:</strong> {result.analysis?.disease_type || result.disease_type}</p>
            )}
            
            <p><strong>Confidence:</strong> {
              result.analysis?.confidence ? `${(result.analysis.confidence * 100).toFixed(1)}%` :
              result.confidence ? `${(result.confidence * 100).toFixed(1)}%` : 'N/A'
            }</p>
            
            {/* Severity Information */}
            {(result.analysis?.severity || result.severity) && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-semibold mb-2">Severity Assessment</h4>
                <div className="space-y-1">
                  <p><strong>Severity Level:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                      (result.analysis?.severity || result.severity) === 'high' 
                        ? 'bg-red-100 text-red-800'
                        : (result.analysis?.severity || result.severity) === 'medium'
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {(result.analysis?.severity || result.severity)?.toUpperCase()}
                    </span>
                  </p>
                  
                  {(result.analysis?.urgency || result.urgency) && (
                    <p><strong>Treatment Urgency:</strong> 
                      <span className="ml-2 capitalize">{result.analysis?.urgency || result.urgency}</span>
                    </p>
                  )}
                  
                  {(result.analysis?.treatment_priority || result.treatment_priority) && (
                    <p><strong>Priority Level:</strong> 
                      <span className="ml-2">{result.analysis?.treatment_priority || result.treatment_priority}/5</span>
                    </p>
                  )}
                  
                  {(result.analysis?.assessment || result.assessment) && (
                    <div className="mt-2">
                      <p><strong>Assessment:</strong></p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {result.analysis?.assessment || result.assessment}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* 3D Model Display */}
            {(result.analysis?.glb_url || result.glb_url) && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">3D Model Visualization:</h4>
                <RobustGLBViewer 
                  glbUrl={result.analysis?.glb_url || result.glb_url}
                  healthStatus={result.analysis?.health_status === 'healthy' ? 'healthy' : 'diseased'}
                  className="h-64 w-full rounded-lg overflow-hidden border"
                />
              </div>
            )}
            
            {result.error && (
              <div className="mt-4 p-4 bg-destructive/10 rounded-lg">
                <h4 className="font-semibold mb-2 text-destructive">Error:</h4>
                <p className="text-sm text-destructive">{result.error}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Index component with plant gallery and camera functionality
const EnhancedIndex = () => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'gallery' | 'scan' | 'analysis'>('gallery');
  const [plants, setPlants] = useState<any[]>([]);
  const [galleryRefreshKey, setGalleryRefreshKey] = useState(0); // Add refresh key

  const handleImageCapture = (imageData: string) => {
    setCapturedImage(imageData);
    setCurrentView('analysis');
  };

  const handleBack = () => {
    setCapturedImage(null);
    setSelectedPlantId(null);
    setCurrentView('gallery');
    // Increment refresh key to force PlantGallery to reload from localStorage
    setGalleryRefreshKey(prev => prev + 1);
  };

  const handleScanLeaf = (plantId: string) => {
    setSelectedPlantId(plantId);
    setCurrentView('scan');
  };

  const handleAddPlant = () => {
    toast.success('Add plant functionality triggered!');
  };

  const handlePlantSelect = (plant: any) => {
    toast.info(`Selected plant: ${plant.name}`);
  };

  const handleUpdatePlantHealth = (plantId: string, healthData: any) => {
    // Update plant health in localStorage when analysis is complete
    console.log('Plant health update:', plantId, healthData);
    
    const savedPlants = localStorage.getItem('leafGuard_plants');
    if (savedPlants) {
      const plants = JSON.parse(savedPlants);
      const updatedPlants = plants.map((plant: any) => 
        plant.id === plantId 
          ? { 
              ...plant, 
              healthStatus: healthData.healthStatus,
              diseaseType: healthData.diseaseType,
              confidence: healthData.confidence,
              glbUrl: healthData.glbUrl || (
                healthData.healthStatus === 'diseased' 
                  ? 'http://localhost:8000/proxy-glb/deceased-leaf.glb'
                  : 'http://localhost:8000/proxy-glb/healthy-leaf.glb'
              ),
              lastScanDate: new Date().toISOString().split('T')[0]
            }
          : plant
      );
      localStorage.setItem('leafGuard_plants', JSON.stringify(updatedPlants));
      toast.success(`${plantId} health status updated to ${healthData.healthStatus}!`);
    }
  };

  const handleAnalysisComplete = (result: any) => {
    // Handle analysis completion and update plant health
    if (selectedPlantId) {
      const healthData = {
        healthStatus: result.isHealthy ? 'healthy' : 'diseased',
        diseaseType: result.disease,
        confidence: result.confidence,
      };
      handleUpdatePlantHealth(selectedPlantId, healthData);
    }
  };

  if (capturedImage && currentView === 'analysis') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="container max-w-2xl mx-auto px-4 py-8">
          <div className="bg-card rounded-2xl p-8 shadow-medium">
            <div className="mb-6 flex flex-col items-center justify-center">
              <h2 className="text-2xl font-bold text-center">
                {selectedPlantId ? `Analyzing ${selectedPlantId}` : 'Leaf Analysis'}
              </h2>
            </div>
            <LeafAnalysis
              imageData={capturedImage}
              onBack={handleBack}
              onAnalysisComplete={handleAnalysisComplete}
            />
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'scan') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="container max-w-2xl mx-auto px-4 py-8">
          <div className="bg-card rounded-2xl p-8 shadow-medium">
            <div className="flex items-center justify-between mb-6">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Gallery
              </Button>
              <h2 className="text-2xl font-bold">
                Scan Plant {selectedPlantId}
              </h2>
              <div></div>
            </div>
            <CameraCapture onImageCapture={handleImageCapture} />
          </div>
        </div>
      </div>
    );
  }

  // Default view - Plant Gallery
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <PlantGallery
        key={galleryRefreshKey} // Force re-render when refreshKey changes
        onPlantSelect={handlePlantSelect}
        onAddPlant={handleAddPlant}
        onScanLeaf={handleScanLeaf}
        onUpdatePlantHealth={handleUpdatePlantHealth}
        refreshKey={galleryRefreshKey}
      />
    </div>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_relativeSplatPath: true }}>
            <Routes>
              <Route path="/" element={<EnhancedIndex />} />
              <Route path="*" element={<div>Page not found</div>} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
