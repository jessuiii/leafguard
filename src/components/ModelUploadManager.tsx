import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GLBViewer, GLBComparison } from './GLBViewer';
import { PlantSelector } from './PlantSelector';
import { Upload, FileUp, AlertCircle, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';

// Types
interface GLBModel {
  id: string;
  name: string;
  url: string;
  metadata: {
    uploadDate: string;
    plantId: string;
    leafId: string;
    analysisResult?: any;
  };
}

export function ModelUploadManager() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [models, setModels] = useState<GLBModel[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<any>(null);
  const [selectedLeaf, setSelectedLeaf] = useState<any>(null);
  
  // Form fields
  const [plantName, setPlantName] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePlantLeafSelect = (plant: any, leaf: any) => {
    setSelectedPlant(plant);
    setSelectedLeaf(leaf);
    setPlantName(plant.name);
    setLocation(plant.location);
    setNotes(`Demo upload for ${plant.name} - ${leaf.disease ? leaf.disease : 'Healthy leaf'}`);
  };

  const handleBackToSelection = () => {
    setSelectedPlant(null);
    setSelectedLeaf(null);
    setSelectedFile(null);
    setUploadStatus('idle');
  };

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus('idle');
    }
  }, []);

  const simulateUpload = async () => {
    setUploadStatus('uploading');
    setUploadProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // Create FormData for the API call
      const formData = new FormData();
      if (selectedFile) {
        formData.append('file', selectedFile);
        formData.append('plant_name', plantName);
        formData.append('location', location);
        formData.append('notes', notes);
      }

      // Call your real API endpoint
  const response = await fetch('http://localhost:8000/analyze-leaf', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setAnalysisResult(result);
        
        // Create new model entry
        const newModel: GLBModel = {
          id: `model_${Date.now()}`,
          name: `${plantName} - ${selectedLeaf?.disease || 'Analysis'}`,
          url: result.glb_url || result.recommended_glb_url,
          metadata: {
            uploadDate: new Date().toISOString(),
            plantId: selectedPlant?.id || 'unknown',
            leafId: selectedLeaf?.id || 'unknown',
            analysisResult: result,
          },
        };
        
        setModels(prev => [newModel, ...prev]);
        setUploadProgress(100);
        setUploadStatus('success');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
    }

    clearInterval(interval);
  };

  const healthyModels = models.filter(model => 
    model.metadata.analysisResult?.health_status === 'healthy'
  );
  
  const diseasedModels = models.filter(model => 
    model.metadata.analysisResult?.health_status === 'diseased'
  );

  // If no plant is selected, show plant selector
  if (!selectedPlant) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Leaf Guard 3D Analysis</h1>
          <p className="text-muted-foreground">
            Select a plant and leaf to analyze, then upload an image for 3D visualization
          </p>
        </div>
        <PlantSelector onPlantSelected={handlePlantLeafSelect} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={handleBackToSelection}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Selection
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Upload & Analyze</h1>
          <p className="text-muted-foreground">
            {selectedPlant.name} - {selectedLeaf.disease || 'Healthy Leaf'}
          </p>
        </div>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload & Analyze</TabsTrigger>
          <TabsTrigger value="models">3D Models ({models.length})</TabsTrigger>
          <TabsTrigger value="comparison">Compare Models</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Leaf Image for Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="file-upload">Select Image</Label>
                <Input
                  id="file-upload"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={uploadStatus === 'uploading'}
                />
              </div>

              {/* Plant Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plant-name">Plant Name</Label>
                  <Input
                    id="plant-name"
                    value={plantName}
                    onChange={(e) => setPlantName(e.target.value)}
                    disabled={uploadStatus === 'uploading'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    disabled={uploadStatus === 'uploading'}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={uploadStatus === 'uploading'}
                  rows={3}
                />
              </div>

              {/* Upload Progress */}
              {uploadStatus === 'uploading' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing image...</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}

              {/* Upload Button */}
              <Button
                onClick={simulateUpload}
                disabled={!selectedFile || uploadStatus === 'uploading'}
                className="w-full"
              >
                {uploadStatus === 'uploading' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <FileUp className="w-4 h-4 mr-2" />
                    Analyze & Generate 3D Model
                  </>
                )}
              </Button>

              {/* Status Messages */}
              {uploadStatus === 'success' && (
                <Alert>
                  <CheckCircle className="w-4 h-4" />
                  <AlertDescription>
                    Image analyzed successfully! 3D model generated and ready for viewing.
                  </AlertDescription>
                </Alert>
              )}

              {uploadStatus === 'error' && (
                <Alert variant="destructive">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    Upload failed. Please try again.
                  </AlertDescription>
                </Alert>
              )}

              {/* Analysis Results */}
              {analysisResult && (
                <Card>
                  <CardHeader>
                    <CardTitle>Analysis Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <strong>Health Status:</strong> {analysisResult.health_status}
                      </div>
                      <div>
                        <strong>Disease:</strong> {analysisResult.disease_type || 'None detected'}
                      </div>
                      <div>
                        <strong>Confidence:</strong> {(analysisResult.confidence * 100).toFixed(1)}%
                      </div>
                      <div>
                        <strong>3D Model:</strong> {analysisResult.glb_recommendation}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="space-y-6">
          {models.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No 3D Models Yet</h3>
                <p className="text-muted-foreground">
                  Upload and analyze a leaf image to generate your first 3D model.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {models.map((model) => (
                <Card key={model.id}>
                  <CardHeader>
                    <CardTitle>{model.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Uploaded: {new Date(model.metadata.uploadDate).toLocaleString()}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <GLBViewer
                      glbUrl={model.url}
                      metadata={{
                        healthStatus: model.metadata.analysisResult?.health_status || 'unknown',
                        diseaseType: model.metadata.analysisResult?.disease_type,
                        confidence: model.metadata.analysisResult?.confidence,
                        captureDate: model.metadata.uploadDate,
                        aiAnalysis: model.metadata.analysisResult ? {
                          healthStatus: model.metadata.analysisResult.health_status,
                          confidence: model.metadata.analysisResult.confidence,
                          method: model.metadata.analysisResult.analysis_method || 'densenet'
                        } : undefined,
                        digitalTwin: {
                          plantId: model.metadata.plantId,
                          leafId: model.metadata.leafId,
                          originalHealth: model.metadata.analysisResult?.health_status || 'unknown'
                        }
                      }}
                      className="w-full h-64"
                    />
                    {model.metadata.analysisResult && (
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <h4 className="font-semibold mb-2">Analysis Details</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>Health: {model.metadata.analysisResult.health_status}</div>
                          <div>Disease: {model.metadata.analysisResult.disease_type || 'None'}</div>
                          <div>Confidence: {(model.metadata.analysisResult.confidence * 100).toFixed(1)}%</div>
                          <div>Method: {model.metadata.analysisResult.analysis_method}</div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          {healthyModels.length === 0 || diseasedModels.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Need Both Model Types</h3>
                <p className="text-muted-foreground">
                  Upload both healthy and diseased leaf images to enable side-by-side comparison.
                </p>
                <div className="mt-4 text-sm">
                  <div>Healthy models: {healthyModels.length}</div>
                  <div>Diseased models: {diseasedModels.length}</div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Model Comparison</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Comparing healthy vs diseased leaf models
                </p>
              </CardHeader>
              <CardContent>
                <GLBComparison
                  healthyModelUrl={healthyModels[0].url}
                  diseasedModelUrl={diseasedModels[0].url}
                  metadata={{
                    healthy: healthyModels[0].metadata,
                    diseased: diseasedModels[0].metadata,
                  }}
                  className="w-full"
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}