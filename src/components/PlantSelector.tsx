import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plant, 
  Leaf, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Info,
  Upload
} from 'lucide-react';

interface PlantTwin {
  id: string;
  name: string;
  location: string;
  healthStatus: string;
  leaves: LeafTwin[];
}

interface LeafTwin {
  id: string;
  health: string;
  disease?: string;
  confidence: number;
  area: number;
  lesions: number;
  hasGLB: boolean;
  glbUrl?: string;
}

// Demo data - in real app this would come from Azure Digital Twins
const DEMO_PLANTS: PlantTwin[] = [
  {
    id: "demo_plant_healthy_001",
    name: "Healthy Demo Plant",
    location: "Demo Greenhouse - Row 1, Position A",
    healthStatus: "healthy",
    leaves: [
      { id: "demo_plant_healthy_001_leaf_001", health: "healthy", confidence: 0.96, area: 19.2, lesions: 0.0, hasGLB: false },
      { id: "demo_plant_healthy_001_leaf_002", health: "healthy", confidence: 0.94, area: 18.8, lesions: 0.0, hasGLB: false },
      { id: "demo_plant_healthy_001_leaf_003", health: "healthy", confidence: 0.97, area: 20.1, lesions: 0.0, hasGLB: false }
    ]
  },
  {
    id: "demo_plant_early_disease_002",
    name: "Early Stage Disease Plant",
    location: "Demo Greenhouse - Row 1, Position B", 
    healthStatus: "warning",
    leaves: [
      { id: "demo_plant_early_disease_002_leaf_001", health: "healthy", confidence: 0.93, area: 18.5, lesions: 0.0, hasGLB: false },
      { id: "demo_plant_early_disease_002_leaf_002", health: "diseased", disease: "Early Blight", confidence: 0.85, area: 16.8, lesions: 2.1, hasGLB: false },
      { id: "demo_plant_early_disease_002_leaf_003", health: "diseased", disease: "Bacterial Spot", confidence: 0.79, area: 15.9, lesions: 1.8, hasGLB: false }
    ]
  },
  {
    id: "demo_plant_advanced_disease_003",
    name: "Advanced Disease Plant",
    location: "Demo Greenhouse - Row 1, Position C",
    healthStatus: "diseased", 
    leaves: [
      { id: "demo_plant_advanced_disease_003_leaf_001", health: "diseased", disease: "Late Blight", confidence: 0.91, area: 14.2, lesions: 4.8, hasGLB: false },
      { id: "demo_plant_advanced_disease_003_leaf_002", health: "diseased", disease: "Leaf Mold", confidence: 0.88, area: 13.6, lesions: 3.9, hasGLB: false },
      { id: "demo_plant_advanced_disease_003_leaf_003", health: "diseased", disease: "Septoria Leaf Spot", confidence: 0.82, area: 15.1, lesions: 5.2, hasGLB: false }
    ]
  }
];

interface PlantSelectorProps {
  onPlantSelected: (plant: PlantTwin, leaf: LeafTwin) => void;
}

export function PlantSelector({ onPlantSelected }: PlantSelectorProps) {
  const [selectedPlantId, setSelectedPlantId] = useState<string>("");
  const [selectedLeafId, setSelectedLeafId] = useState<string>("");
  const [selectedPlant, setSelectedPlant] = useState<PlantTwin | null>(null);
  const [selectedLeaf, setSelectedLeaf] = useState<LeafTwin | null>(null);

  const handlePlantChange = (plantId: string) => {
    setSelectedPlantId(plantId);
    setSelectedLeafId("");
    setSelectedLeaf(null);
    
    const plant = DEMO_PLANTS.find(p => p.id === plantId);
    setSelectedPlant(plant || null);
  };

  const handleLeafChange = (leafId: string) => {
    setSelectedLeafId(leafId);
    
    if (selectedPlant) {
      const leaf = selectedPlant.leaves.find(l => l.id === leafId);
      setSelectedLeaf(leaf || null);
    }
  };

  const handleSelectForUpload = () => {
    if (selectedPlant && selectedLeaf) {
      onPlantSelected(selectedPlant, selectedLeaf);
    }
  };

  const getHealthStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'diseased':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'diseased':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plant className="w-5 h-5" />
          Select Plant & Leaf for Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Plant Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Choose Plant:</label>
          <Select value={selectedPlantId} onValueChange={handlePlantChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a demo plant..." />
            </SelectTrigger>
            <SelectContent>
              {DEMO_PLANTS.map((plant) => (
                <SelectItem key={plant.id} value={plant.id}>
                  <div className="flex items-center gap-2">
                    {getHealthStatusIcon(plant.healthStatus)}
                    {plant.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Plant Details */}
        {selectedPlant && (
          <Card className="bg-slate-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{selectedPlant.name}</h3>
                <Badge className={getHealthStatusColor(selectedPlant.healthStatus)}>
                  {selectedPlant.healthStatus}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">{selectedPlant.location}</p>
              
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 bg-white rounded">
                  <div className="font-medium">Total Leaves</div>
                  <div>{selectedPlant.leaves.length}</div>
                </div>
                <div className="text-center p-2 bg-white rounded">
                  <div className="font-medium">Healthy</div>
                  <div className="text-green-600">
                    {selectedPlant.leaves.filter(l => l.health === 'healthy').length}
                  </div>
                </div>
                <div className="text-center p-2 bg-white rounded">
                  <div className="font-medium">Diseased</div>
                  <div className="text-red-600">
                    {selectedPlant.leaves.filter(l => l.health === 'diseased').length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leaf Selection */}
        {selectedPlant && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Choose Leaf:</label>
            <Select value={selectedLeafId} onValueChange={handleLeafChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a leaf to upload GLB for..." />
              </SelectTrigger>
              <SelectContent>
                {selectedPlant.leaves.map((leaf, index) => (
                  <SelectItem key={leaf.id} value={leaf.id}>
                    <div className="flex items-center gap-2">
                      <Leaf className={`w-4 h-4 ${leaf.health === 'healthy' ? 'text-green-600' : 'text-red-600'}`} />
                      <span>Leaf {index + 1}</span>
                      {leaf.disease && <span className="text-xs text-gray-500">({leaf.disease})</span>}
                      {leaf.hasGLB && <Badge variant="outline" className="text-xs">Has GLB</Badge>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Leaf Details */}
        {selectedLeaf && (
          <Card className="bg-slate-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Leaf className={`w-4 h-4 ${selectedLeaf.health === 'healthy' ? 'text-green-600' : 'text-red-600'}`} />
                  Leaf Details
                </h4>
                <Badge className={getHealthStatusColor(selectedLeaf.health)}>
                  {selectedLeaf.health}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Disease:</span>
                  <p className="text-gray-600">{selectedLeaf.disease || 'None'}</p>
                </div>
                <div>
                  <span className="font-medium">Confidence:</span>
                  <p className="text-gray-600">{(selectedLeaf.confidence * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <span className="font-medium">Leaf Area:</span>
                  <p className="text-gray-600">{selectedLeaf.area.toFixed(1)} cm²</p>
                </div>
                <div>
                  <span className="font-medium">Lesion Area:</span>
                  <p className="text-gray-600">{selectedLeaf.lesions.toFixed(1)} cm²</p>
                </div>
              </div>

              {selectedLeaf.hasGLB && (
                <Alert className="mt-3">
                  <Info className="w-4 h-4" />
                  <AlertDescription>
                    This leaf already has a GLB model. Uploading will replace the existing model.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Upload Guidance */}
        {selectedLeaf && (
          <Alert>
            <Upload className="w-4 h-4" />
            <AlertDescription>
              <strong>Upload Guidance:</strong> This leaf is {selectedLeaf.health}. 
              Please upload your <strong>{selectedLeaf.health === 'healthy' ? 'healthy (green)' : 'diseased (pale)'}</strong> GLB file.
            </AlertDescription>
          </Alert>
        )}

        {/* Select Button */}
        {selectedPlant && selectedLeaf && (
          <Button 
            onClick={handleSelectForUpload}
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload GLB for {selectedPlant.name} - Leaf {selectedPlant.leaves.indexOf(selectedLeaf) + 1}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}