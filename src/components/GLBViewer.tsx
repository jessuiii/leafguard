import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Html } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, RotateCcw, ZoomIn, ZoomOut, AlertTriangle, Brain, Database } from 'lucide-react';

interface LeafModelProps {
  url: string;
  scale?: number;
  position?: [number, number, number];
  autoRotate?: boolean;
}

function LeafModel({ url, scale = 1, position = [0, 0, 0], autoRotate = false }: LeafModelProps) {
  const { scene } = useGLTF(url);
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (autoRotate && meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group ref={meshRef} position={position} scale={scale}>
      <primitive object={scene} />
    </group>
  );
}

interface GLBViewerProps {
  glbUrl: string;
  metadata?: {
    healthStatus: string;
    diseaseType?: string;
    confidence?: number;
    captureDate?: string;
    leafArea?: number;
    lesionArea?: number;
    // Smart assignment metadata
    aiAnalysis?: {
      healthStatus: string;
      confidence: number;
      method: string;
      conflictDetected?: boolean;
      originalDigitalTwin?: string;
    };
    digitalTwin?: {
      plantId: string;
      leafId: string;
      originalHealth: string;
    };
  };
  className?: string;
}

export function GLBViewer({ glbUrl, metadata, className }: GLBViewerProps) {
  const [autoRotate, setAutoRotate] = useState(false);
  const [zoom, setZoom] = useState(1);
  const controlsRef = useRef<any>(null);

  const handleReset = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
    setZoom(1);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.3));
  };

  const getHealthStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
        return 'bg-green-500';
      case 'diseased':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">3D Leaf Model</CardTitle>
          {metadata?.healthStatus && (
            <Badge className={getHealthStatusColor(metadata.healthStatus)}>
              {metadata.healthStatus}
            </Badge>
          )}
        </div>
        
        {/* Controls */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRotate(!autoRotate)}
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            {autoRotate ? 'Stop' : 'Rotate'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* 3D Viewer */}
        <div className="w-full h-96 border rounded-lg overflow-hidden bg-slate-50">
          <Canvas
            camera={{ position: [2, 2, 2], fov: 50 }}
            gl={{ preserveDrawingBuffer: true }}
          >
            <Suspense 
              fallback={
                <Html center>
                  <div className="flex items-center gap-2 text-blue-600">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Loading 3D model...</span>
                  </div>
                </Html>
              }
            >
              <LeafModel 
                url={glbUrl} 
                scale={zoom}
                autoRotate={autoRotate}
              />
              <Environment preset="studio" />
              <ambientLight intensity={0.4} />
              <directionalLight position={[2, 2, 2]} intensity={1} />
              <OrbitControls 
                ref={controlsRef}
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={1}
                maxDistance={10}
              />
            </Suspense>
          </Canvas>
        </div>

        {/* Metadata */}
        {metadata && (
          <div className="mt-4 space-y-4">
            
            {/* Smart Assignment Info */}
            {metadata.aiAnalysis?.conflictDetected && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Smart Assignment Override</span>
                </div>
                <div className="text-sm space-y-1">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="font-medium">Original Status:</span>
                      <p className="text-gray-600">{metadata.aiAnalysis.originalDigitalTwin}</p>
                    </div>
                    <div>
                      <span className="font-medium">AI Analysis:</span>
                      <p className="text-gray-600">{metadata.aiAnalysis.healthStatus} ({(metadata.aiAnalysis.confidence * 100).toFixed(1)}%)</p>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-yellow-700">
                    GLB file chosen based on AI analysis instead of digital twin status
                  </div>
                </div>
              </div>
            )}

            {/* AI Analysis Info */}
            {metadata.aiAnalysis && !metadata.aiAnalysis.conflictDetected && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">AI-Powered Assignment</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Analysis Method:</span>
                  <p className="text-gray-600 capitalize">{metadata.aiAnalysis.method.replace('_', ' ')}</p>
                  <span className="font-medium">Confidence:</span>
                  <p className="text-gray-600">{(metadata.aiAnalysis.confidence * 100).toFixed(1)}%</p>
                </div>
              </div>
            )}

            {/* Digital Twin Info */}
            {metadata.digitalTwin && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-slate-600" />
                  <span className="font-medium text-slate-800">Digital Twin</span>
                </div>
                <div className="text-sm grid grid-cols-2 gap-2">
                  <div>
                    <span className="font-medium">Plant ID:</span>
                    <p className="text-gray-600">{metadata.digitalTwin.plantId.split('_').slice(-1)[0]}</p>
                  </div>
                  <div>
                    <span className="font-medium">Leaf ID:</span>
                    <p className="text-gray-600">{metadata.digitalTwin.leafId.split('_').slice(-1)[0]}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Standard Metadata */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {metadata.diseaseType && (
                <div>
                  <span className="font-medium">Disease Type:</span>
                  <p className="text-gray-600">{metadata.diseaseType}</p>
                </div>
              )}
              {metadata.confidence && (
                <div>
                  <span className="font-medium">Confidence:</span>
                  <p className="text-gray-600">{(metadata.confidence * 100).toFixed(1)}%</p>
                </div>
              )}
              {metadata.leafArea && (
                <div>
                  <span className="font-medium">Leaf Area:</span>
                  <p className="text-gray-600">{metadata.leafArea.toFixed(2)} cm²</p>
                </div>
              )}
              {metadata.lesionArea && (
                <div>
                  <span className="font-medium">Lesion Area:</span>
                  <p className="text-gray-600">{metadata.lesionArea.toFixed(2)} cm²</p>
                </div>
              )}
              {metadata.captureDate && (
                <div>
                  <span className="font-medium">Capture Date:</span>
                  <p className="text-gray-600">
                    {new Date(metadata.captureDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Component for comparing two models side by side
interface GLBComparisonProps {
  healthyModelUrl: string;
  diseasedModelUrl: string;
  metadata?: {
    healthy: any;
    diseased: any;
  };
  className?: string;
}

export function GLBComparison({ 
  healthyModelUrl, 
  diseasedModelUrl, 
  metadata, 
  className 
}: GLBComparisonProps) {
  const [autoRotate, setAutoRotate] = useState(false);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Health Comparison</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAutoRotate(!autoRotate)}
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          {autoRotate ? 'Stop Rotation' : 'Auto Rotate'}
        </Button>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium mb-2 text-green-600">Healthy Leaf</h3>
            <div className="w-full h-64 border rounded-lg overflow-hidden bg-slate-50">
              <Canvas camera={{ position: [2, 2, 2], fov: 50 }}>
                <Suspense fallback={null}>
                  <LeafModel 
                    url={healthyModelUrl} 
                    position={[0, 0, 0]}
                    autoRotate={autoRotate}
                  />
                  <Environment preset="studio" />
                  <ambientLight intensity={0.4} />
                  <directionalLight position={[2, 2, 2]} intensity={1} />
                  <OrbitControls enableZoom={true} />
                </Suspense>
              </Canvas>
            </div>
            {metadata?.healthy && (
              <div className="mt-2 text-xs text-gray-600">
                Area: {metadata.healthy.leafArea?.toFixed(2)} cm²
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2 text-red-600">Diseased Leaf</h3>
            <div className="w-full h-64 border rounded-lg overflow-hidden bg-slate-50">
              <Canvas camera={{ position: [2, 2, 2], fov: 50 }}>
                <Suspense fallback={null}>
                  <LeafModel 
                    url={diseasedModelUrl} 
                    position={[0, 0, 0]}
                    autoRotate={autoRotate}
                  />
                  <Environment preset="studio" />
                  <ambientLight intensity={0.4} />
                  <directionalLight position={[2, 2, 2]} intensity={1} />
                  <OrbitControls enableZoom={true} />
                </Suspense>
              </Canvas>
            </div>
            {metadata?.diseased && (
              <div className="mt-2 text-xs text-gray-600">
                Area: {metadata.diseased.leafArea?.toFixed(2)} cm²
                {metadata.diseased.lesionArea && (
                  <br />
                )}
                {metadata.diseased.lesionArea && 
                  `Lesions: ${metadata.diseased.lesionArea.toFixed(2)} cm²`
                }
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Preload GLB files
useGLTF.preload = (url: string) => {
  useGLTF(url);
};