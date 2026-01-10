import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import { API_CONFIG } from '../config/api';
import { Leaf, Loader2 } from 'lucide-react';

// GLB Model Component
function GLBModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3; // Slightly faster rotation for better aesthetics
    }
  });

  // Clone the scene to avoid sharing between instances
  const clonedScene = scene.clone();
  
  return (
    <group ref={meshRef} dispose={null}>
      <primitive object={clonedScene} scale={2.5} position={[0, -0.3, 0]} /> {/* Larger scale for rectangular container */}
    </group>
  );
}

// Loading component
function LoadingSpinner() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-green-50/95 to-blue-50/95 z-20">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
        <p className="text-sm text-gray-600">Loading 3D Model...</p>
      </div>
    </div>
  );
}

// Error fallback
function ErrorDisplay({ healthStatus }: { healthStatus: 'healthy' | 'diseased' }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="text-center">
        <Leaf className={`w-16 h-16 mx-auto mb-2 ${healthStatus === 'healthy' ? 'text-green-500' : 'text-red-500'}`} />
        <p className="text-xs text-gray-500">3D Model Error</p>
      </div>
    </div>
  );
}

interface RobustGLBViewerProps {
  glbUrl: string;
  healthStatus: 'healthy' | 'diseased';
  className?: string;
  plantId?: string;
}

export function RobustGLBViewer({ glbUrl, healthStatus, className = '', plantId }: RobustGLBViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isCanvasReady, setIsCanvasReady] = useState(false);

  useEffect(() => {
    if (!glbUrl) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasError(false);
    setIsCanvasReady(false);

    // Simple timeout to simulate loading
    const timer = setTimeout(() => {
      setIsCanvasReady(true);
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [glbUrl]);

  if (!glbUrl) {
    return (
      <div className={`w-full h-full relative ${className}`}>
        <ErrorDisplay healthStatus={healthStatus} />
      </div>
    );
  }

  return (
    <div className={`w-full h-full relative overflow-hidden ${className}`}>
      {isLoading && <LoadingSpinner />}
      
      {hasError && <ErrorDisplay healthStatus={healthStatus} />}
      
      {!hasError && (
        <Canvas
          camera={{ position: [0, 0, 6], fov: 50 }}
          gl={{ 
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
            preserveDrawingBuffer: false
          }}
          style={{ 
            background: 'transparent',
            width: '100%',
            height: '100%'
          }}
          dpr={Math.min(window.devicePixelRatio, 2)}
          onCreated={(state) => {
            state.gl.setClearColor('#f0f9ff', 0);
          }}
        >
          <Suspense fallback={null}>
            {isCanvasReady && <GLBModel url={glbUrl} />}
            
            {/* Improved lighting */}
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} />
            <directionalLight position={[-5, -5, -5]} intensity={0.3} />
            
            {/* Environment for better reflections */}
            <Environment preset="sunset" />
            
            {/* Controls */}
            <OrbitControls
              enablePan={false}
              enableZoom={true}
              enableRotate={true}
              minDistance={2}
              maxDistance={15}
              autoRotate={false}
              enableDamping={true}
              dampingFactor={0.05}
            />
          </Suspense>
        </Canvas>
      )}
      
      {/* Status indicators: Healthy/Diseased badge and 3D Active badge aligned */}
      {!isLoading && !hasError && isCanvasReady && (
        <div className="absolute top-2 right-2 flex flex-row gap-2 items-center">
          <div className={`px-2 py-1 rounded text-xs font-semibold flex items-center ${healthStatus === 'healthy' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            {healthStatus === 'healthy' ? '✓ Healthy' : '⚠ Diseased'}
          </div>
          <div className="bg-green-500/90 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            3D Active
          </div>
        </div>
      )}
      
      {/* Plant ID badge */}
      {plantId && (
        <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
          {plantId}
        </div>
      )}
    </div>
  );
}

// Preload common models
if (typeof window !== 'undefined') {
  // Preload models asynchronously
  setTimeout(() => {
    try {
      useGLTF.preload(`${API_CONFIG.GLB_PROXY_URL}/healthy-leaf.glb`);
      useGLTF.preload(`${API_CONFIG.GLB_PROXY_URL}/deceased-leaf.glb`);
    } catch (error) {
      console.log('Model preload failed, will load on demand');
    }
  }, 2000);
}