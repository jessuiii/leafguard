import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Plus, Stethoscope, Leaf } from 'lucide-react';
import { RobustGLBViewer } from '@/components/RobustGLBViewer';
import { TreatmentRecommendations } from '@/components/TreatmentRecommendations';

// Use Vite environment variable for backend base URL
const BACKEND_BASE_URL = import.meta.env.VITE_PYTHON_API_URL || 'http://localhost:8000';

interface Plant {
  id: string;
  name: string;
  healthStatus: 'healthy' | 'diseased';
  diseaseType?: string;
  confidence?: number;
  glbUrl?: string;
  lastScanDate?: string;
  image?: string;
}

interface PlantGalleryProps {
  onPlantSelect: (plant: Plant) => void;
  onAddPlant: () => void;
  onScanLeaf: (plantId: string) => void;
  onUpdatePlantHealth?: (plantId: string, healthData: {
    healthStatus: 'healthy' | 'diseased';
    diseaseType?: string;
    confidence?: number;
    glbUrl?: string;
  }) => void;
  refreshKey?: number;
}

export function PlantGallery({ onPlantSelect, onAddPlant, onScanLeaf, onUpdatePlantHealth, refreshKey }: PlantGalleryProps) {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTreatmentRecommendations, setShowTreatmentRecommendations] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const loadPlantsFromLocalStorage = () => {
    console.log('🔄 Loading plants from localStorage...');
    const demoPlants: Plant[] = [
      {
        id: 'PLANT_001',
        name: 'Tomato Plant A',
        healthStatus: 'healthy',
        lastScanDate: '2024-11-01',
        glbUrl: `${BACKEND_BASE_URL}/proxy-glb/healthy-leaf.glb`
      },
      {
        id: 'PLANT_002',
        name: 'Tomato Plant B',
        healthStatus: 'healthy',
        lastScanDate: '2024-11-02',
        glbUrl: `${BACKEND_BASE_URL}/proxy-glb/healthy-leaf.glb`
      },
      {
        id: 'PLANT_003',
        name: 'Tomato Plant C',
        healthStatus: 'healthy',
        lastScanDate: '2024-11-03',
        glbUrl: `${BACKEND_BASE_URL}/proxy-glb/healthy-leaf.glb`
      }
    ];
    
    const savedPlants = localStorage.getItem('leafGuard_plants');
    if (savedPlants) {
      try {
        const parsedPlants = JSON.parse(savedPlants);
        
        // Check if plants have proper PLANT_XXX IDs, if not, reset to demo data
        const hasValidIds = parsedPlants.every((plant: Plant) => 
          plant.id && plant.id.startsWith('PLANT_') && plant.name
        );
        
        if (!hasValidIds) {
          console.log('Invalid plant data detected, resetting to demo plants');
          setPlants(demoPlants);
          localStorage.setItem('leafGuard_plants', JSON.stringify(demoPlants));
          return;
        }
        
        const updatedPlants = parsedPlants.map((plant: Plant) => ({
          ...plant,
          glbUrl: plant.glbUrl || (
            plant.healthStatus === 'diseased'
              ? `${BACKEND_BASE_URL}/proxy-glb/deceased-leaf.glb`
              : `${BACKEND_BASE_URL}/proxy-glb/healthy-leaf.glb`
          )
        }));
        setPlants(updatedPlants);
        localStorage.setItem('leafGuard_plants', JSON.stringify(updatedPlants));
        console.log(`✅ Loaded ${updatedPlants.length} plants from localStorage`);
      } catch (error) {
        console.log('Error parsing plant data, resetting to demo plants');
        setPlants(demoPlants);
        localStorage.setItem('leafGuard_plants', JSON.stringify(demoPlants));
      }
    } else {
      setPlants(demoPlants);
      localStorage.setItem('leafGuard_plants', JSON.stringify(demoPlants));
      console.log(`✅ Initialized with ${demoPlants.length} demo plants`);
    }
  };

  useEffect(() => {
    loadPlantsFromLocalStorage();
  }, [refreshKey]);

  // Save to localStorage whenever plants change
  useEffect(() => {
    if (plants.length > 0) {
      localStorage.setItem('leafGuard_plants', JSON.stringify(plants));
    }
  }, [plants]);

  // Expose the update function to children via prop if needed
  // Example: <SomeChildComponent onUpdatePlantHealth={handleUpdatePlantHealth} />

  const handleAddNewPlant = () => {
    console.log('➕ Adding new plant to localStorage...');
    const newPlantId = `PLANT_${String(plants.length + 1).padStart(3, '0')}`;
    const newPlant: Plant = {
    id: newPlantId,
    name: `Tomato Plant ${String.fromCharCode(65 + plants.length)}`,
    healthStatus: 'healthy',
    lastScanDate: new Date().toISOString().split('T')[0],
    glbUrl: `${BACKEND_BASE_URL}/proxy-glb/healthy-leaf.glb`
    };
    
    setPlants(prev => [...prev, newPlant]);
    console.log('✅ Plant added successfully!');
  };

  const resetToCleanData = () => {
    console.log('🔄 Resetting to clean demo data...');
    localStorage.removeItem('leafGuard_plants');
    loadPlantsFromLocalStorage();
    setCurrentIndex(0);
  };

  const nextPlant = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % plants.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const prevPlant = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + plants.length) % plants.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  if (plants.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Leaf className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Plants Found</h3>
          <p className="text-gray-600 text-center mb-6">
            Start your plant health monitoring journey by adding your first plant.
          </p>
          <Button onClick={onAddPlant} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Plant
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentPlant = plants[currentIndex];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-8 px-4">
      <div className="relative">
        <Card className={`w-[400px] h-[500px] bg-gradient-to-br from-green-50 to-blue-50 border-2 border-gray-200 shadow-xl overflow-hidden transition-all duration-500 ease-in-out ${isAnimating ? 'scale-98' : 'scale-100'}`}>
          <CardContent className="p-0 h-full relative">
            <div className="w-full h-full">
              <RobustGLBViewer
                glbUrl={currentPlant.glbUrl}
                healthStatus={currentPlant.healthStatus}
                plantId={currentPlant.id}
              />
            </div>
          </CardContent>
        </Card>
        {plants.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              disabled={isAnimating}
              className={`absolute left-[-80px] top-1/2 transform -translate-y-1/2 bg-white/95 hover:bg-white shadow-lg rounded-full w-12 h-12 transition-all duration-300 ease-in-out ${isAnimating ? 'opacity-50' : 'opacity-100 hover:scale-110'}`}
              onClick={prevPlant}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={isAnimating}
              className={`absolute right-[-80px] top-1/2 transform -translate-y-1/2 bg-white/95 hover:bg-white shadow-lg rounded-full w-12 h-12 transition-all duration-300 ease-in-out ${isAnimating ? 'opacity-50' : 'opacity-100 hover:scale-110'}`}
              onClick={nextPlant}
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </>
        )}
        {plants.length > 1 && (
          <div className="absolute bottom-[-60px] left-1/2 transform -translate-x-1/2 flex space-x-3">
            {plants.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (!isAnimating && index !== currentIndex) {
                    setIsAnimating(true);
                    setCurrentIndex(index);
                    setTimeout(() => setIsAnimating(false), 500);
                  }
                }}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-green-500 scale-125' : 'bg-gray-300 hover:bg-gray-400'}`}
              />
            ))}
          </div>
        )}
      </div>
      
      <Card className="w-[400px] overflow-hidden">
        <CardContent className="p-6">
          <div className={`transition-all duration-500 ease-in-out ${isAnimating ? 'opacity-50 transform translate-y-2' : 'opacity-100 transform translate-y-0'}`}>
             <div className="flex flex-col items-center mb-6">
               <h2 className="text-2xl font-bold mb-4 text-center">{currentPlant.name}</h2>
               <div className="flex flex-row gap-4 justify-center items-center">
                 <Button
                   onClick={() => onScanLeaf(currentPlant.id)}
                   className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 font-semibold rounded-lg shadow"
                 >
                   <Leaf className="w-4 h-4 mr-2" />
                   Scan Leaf
                 </Button>
                 {currentPlant.healthStatus === 'diseased' && (
                   <Button
                     onClick={() => setShowTreatmentRecommendations(true)}
                     className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 font-semibold rounded-lg shadow"
                   >
                     <Stethoscope className="w-4 h-4 mr-2" />
                     View Treatment
                   </Button>
                 )}
               </div>
             </div>
            <div className="py-6 border-t border-gray-200">
              {/* Clean status row */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${currentPlant.healthStatus === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-gray-700 font-medium">
                    {currentPlant.healthStatus === 'healthy' ? 'Plant is Healthy' : 'Plant Needs Attention'}
                  </span>
                </div>
                <span className="text-sm text-gray-500">{currentPlant.lastScanDate || 'Never scanned'}</span>
              </div>
              
              {/* Disease information - only show if currently diseased */}
              {currentPlant.healthStatus === 'diseased' && currentPlant.diseaseType && (
                <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-red-800 mb-1">{currentPlant.diseaseType}</h4>
                      <p className="text-red-600 text-sm">Treatment recommended</p>
                    </div>
                    <div className="text-red-400">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col items-center gap-4">
        <div className="text-center text-sm text-gray-500">
          Plant {currentIndex + 1} of {plants.length}
        </div>
        <Button
          onClick={handleAddNewPlant}
          variant="outline"
          className="border-dashed border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 px-6 py-3"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Plant
        </Button>
      </div>

      {showTreatmentRecommendations && (
        <TreatmentRecommendations
          onClose={() => setShowTreatmentRecommendations(false)}
          diseaseType={currentPlant.diseaseType || 'Default'}
          plantId={currentPlant.id}
          onTreatmentApplied={() => {
            // Check if treatment is complete (daysLeft === 0)
            const key = `treatment_start_${currentPlant.id}`;
            const stored = localStorage.getItem(key);
            if (stored) {
              const start = parseInt(stored, 10);
              const now = Date.now();
              // Use maxDays from TreatmentRecommendations duration
              const duration = 10; // fallback, should match maxDays logic
              const days = Math.max(0, duration - Math.floor((now - start) / (1000 * 60 * 60 * 24)));
              if (days <= 0) {
                // Mark plant as healthy
                setPlants(prev => prev.map(p =>
                  p.id === currentPlant.id ? { ...p, healthStatus: 'healthy', diseaseType: undefined } : p
                ));
                localStorage.removeItem(key);
              }
            }
            setShowTreatmentRecommendations(false);
          }}
        />
      )}
    </div>
  );
}
