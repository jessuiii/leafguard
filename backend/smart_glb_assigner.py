"""
Smart GLB Assignment System
Automatically determines which GLB file to use based on DenseNet analysis of uploaded images
"""

import cv2
import numpy as np
from typing import Dict, Any
import os
from PIL import Image
from models.densenet_tomato_model import DenseNetTomatoClassifier

class SmartGLBAssigner:
    def __init__(self, model_path: str = None):
        """
        Initialize the smart GLB assigner with DenseNet model
        
        Args:
            model_path: Path to the trained DenseNet model file (optional)
        """
        self.densenet_model = DenseNetTomatoClassifier()
        
        # Use your trained model by default
        if model_path is None:
            model_path = os.path.join(os.path.dirname(__file__), "Trained Model", "densenet169_tomato.pth")
        
        self.model_path = model_path
        self.glb_files = {
            'healthy': "https://leafguardstorage.blob.core.windows.net/glb-models/healthy-leaf.glb",
            'diseased': "https://leafguardstorage.blob.core.windows.net/glb-models/deceased-leaf.glb"
        }
        
        # Load the trained model if path exists
        if os.path.exists(model_path):
            self.load_trained_model(model_path)
            print(f"Initialized SmartGLBAssigner with model: {model_path}")
            print(f"GLB Files: healthy={self.glb_files['healthy']}, diseased={self.glb_files['diseased']}")
        else:
            print(f"Warning: Model file not found at {model_path}")
    
    def load_trained_model(self, model_path: str):
        """Load the trained DenseNet model"""
        try:
            self.densenet_model.load_model(model_path)
            print(f"Loaded trained DenseNet model from {model_path}")
        except Exception as e:
            print(f"Failed to load trained model: {e}")
            print("Will use untrained model or fallback methods")
    
    def register_glb_files(self, healthy_glb_path: str, diseased_glb_path: str):
        """
        Register the available GLB files
        
        Args:
            healthy_glb_path: Path or URL to healthy leaf GLB
            diseased_glb_path: Path or URL to diseased leaf GLB
        """
        self.glb_files['healthy'] = healthy_glb_path
        self.glb_files['diseased'] = diseased_glb_path
        print("GLB files registered successfully")
    
    def analyze_image_with_densenet(self, image_path: str) -> Dict[str, Any]:
        """
        Analyze leaf image using trained DenseNet model
        
        Args:
            image_path: Path to the leaf image
            
        Returns:
            Analysis results with health status and confidence
        """
        try:
            # Use the enhanced predict_image method
            prediction_result = self.densenet_model.predict_image(image_path)
            
            # Check if prediction was successful
            if 'error' in prediction_result:
                print(f"DenseNet prediction error: {prediction_result['error']}")
                return self._simple_color_analysis(image_path)
            
            return {
                'health_status': prediction_result['health_status'],
                'confidence': prediction_result['confidence'],
                'predicted_class': prediction_result['predicted_class'],
                'disease_type': prediction_result['disease_type'],
                'glb_recommendation': prediction_result['glb_recommendation'],
                'class_index': prediction_result['class_index'],
                'analysis_method': 'densenet_trained_model'
            }
            
        except Exception as e:
            print(f"DenseNet analysis failed: {e}")
            # Fallback to simple analysis
            return self._simple_color_analysis(image_path)
    
    def _extract_disease_name(self, predicted_class: str) -> str:
        """
        Extract clean disease name from DenseNet class prediction
        
        Args:
            predicted_class: Full class name from DenseNet (e.g., 'Tomato___Early_blight')
            
        Returns:
            Clean disease name (e.g., 'Early Blight')
        """
        # Remove 'Tomato___' prefix and clean up
        if 'Tomato___' in predicted_class:
            disease = predicted_class.replace('Tomato___', '')
            # Clean up underscores and format
            disease = disease.replace('_', ' ').title()
            return disease
        return predicted_class
    
    def analyze_image(self, image_path: str) -> Dict[str, Any]:
        """
        Main image analysis method - uses DenseNet if available
        
        Args:
            image_path: Path to the leaf image
            
        Returns:
            Analysis results with health status and confidence
        """
        # Try DenseNet analysis first
        if self.densenet_model.model is not None:
            return self.analyze_image_with_densenet(image_path)
        else:
            # Fallback to simple color analysis
            return self._simple_color_analysis(image_path)
    
    def _simple_color_analysis(self, image_path: str) -> Dict[str, Any]:
        """
        Fallback color-based analysis when no ML model is available
        
        Args:
            image_path: Path to the leaf image
            
        Returns:
            Analysis results based on color features
        """
        image = cv2.imread(image_path)
        if image is None:
            return {
                'health_status': 'unknown',
                'confidence': 0.0,
                'analysis_method': 'error'
            }
        
        # Convert to HSV for better color analysis
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        
        # Define green color ranges (healthy leaves)
        lower_green = np.array([35, 50, 50])
        upper_green = np.array([85, 255, 255])
        
        # Create mask for green pixels
        green_mask = cv2.inRange(hsv, lower_green, upper_green)
        green_percentage = np.sum(green_mask > 0) / (image.shape[0] * image.shape[1])
        
        # Calculate average brightness (diseased leaves often appear darker/paler)
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        avg_brightness = np.mean(gray)
        
        # Simple heuristic: healthy if >60% green pixels and good brightness
        is_healthy = green_percentage > 0.6 and 80 < avg_brightness < 200
        confidence = green_percentage * 0.7 + (1 - abs(avg_brightness - 140) / 140) * 0.3
        
        return {
            'health_status': 'healthy' if is_healthy else 'diseased',
            'confidence': confidence,
            'green_percentage': green_percentage,
            'avg_brightness': avg_brightness,
            'analysis_method': 'color_heuristic'
        }
    
    def determine_glb_file(self, image_path: str = None, 
                          manual_health_status: str = None) -> Dict[str, Any]:
        """
        Determine which GLB file to use based on analysis or manual input
        
        Args:
            image_path: Path to leaf image for analysis (optional)
            manual_health_status: Manual health status override (optional)
            
        Returns:
            Dictionary with GLB file assignment and reasoning
        """
        result = {
            'glb_file': None,
            'glb_url': None,
            'health_status': 'unknown',
            'confidence': 0.0,
            'reasoning': 'No analysis performed',
            'conflict_detected': False
        }
        
        # Analyze image if provided
        if image_path:
            analysis = self.analyze_image(image_path)
            result.update(analysis)
        
        # Override with manual status if provided
        if manual_health_status:
            original_status = result['health_status']
            result['health_status'] = manual_health_status
            
            # Detect conflicts
            if image_path and original_status != manual_health_status:
                result['conflict_detected'] = True
                result['ai_analysis'] = original_status
                result['manual_override'] = manual_health_status
                result['reasoning'] = f"Manual override: AI detected {original_status}, but manually set to {manual_health_status}"
            else:
                result['reasoning'] = f"Manual assignment: {manual_health_status}"
        
        # Assign GLB file based on final health status
        if result['health_status'] in self.glb_files:
            result['glb_file'] = result['health_status']
            result['glb_url'] = self.glb_files[result['health_status']]
        
        return result
    
    def get_upload_recommendation(self, plant_id: str, leaf_id: str, 
                                image_path: str = None) -> Dict[str, Any]:
        """
        Get smart recommendation for GLB file upload
        
        Args:
            plant_id: Digital twin plant ID
            leaf_id: Digital twin leaf ID  
            image_path: Path to leaf image for analysis
            
        Returns:
            Upload recommendation with GLB file and metadata
        """
        # Get digital twin information (in real implementation, fetch from Azure)
        # For now, we'll simulate this
        twin_health_status = self._get_twin_health_status(plant_id, leaf_id)
        
        # Analyze the image
        analysis = self.determine_glb_file(
            image_path=image_path,
            manual_health_status=twin_health_status
        )
        
        recommendation = {
            'plant_id': plant_id,
            'leaf_id': leaf_id,
            'recommended_glb': analysis['glb_file'],
            'glb_url': analysis['glb_url'],
            'health_status': analysis['health_status'],
            'confidence': analysis['confidence'],
            'analysis_method': analysis.get('analysis_method', 'unknown'),
            'conflict_detected': analysis['conflict_detected'],
            'reasoning': analysis['reasoning'],
            'upload_metadata': {
                'digital_twin_plant': plant_id,
                'digital_twin_leaf': leaf_id,
                'ai_health_analysis': analysis.get('ai_analysis'),
                'manual_health_status': analysis.get('manual_override'),
                'analysis_confidence': analysis['confidence'],
                'conflict_warning': analysis['conflict_detected']
            }
        }
        
        return recommendation
    
    def _get_twin_health_status(self, plant_id: str, leaf_id: str) -> str:
        """
        Simulate getting health status from digital twin
        (In real implementation, this would query Azure Digital Twins)
        """
        # Demo data mapping
        demo_health_map = {
            'demo_plant_healthy_001': 'healthy',
            'demo_plant_early_disease_002': 'diseased' if 'leaf_002' in leaf_id or 'leaf_003' in leaf_id else 'healthy',
            'demo_plant_advanced_disease_003': 'diseased'
        }
        
        return demo_health_map.get(plant_id, 'unknown')

# Usage example
def create_smart_assigner(trained_model_path: str = None):
    """
    Create a configured smart GLB assigner with trained DenseNet model
    
    Args:
        trained_model_path: Path to your trained DenseNet model (.pth file)
    """
    # Use your trained model by default
    if not trained_model_path:
        current_dir = os.path.dirname(__file__)
        trained_model_path = os.path.join(current_dir, "Trained Model", "densenet169_tomato.pth")
        
        # Fallback to other possible locations if needed
        if not os.path.exists(trained_model_path):
            possible_paths = [
                os.path.join(current_dir, "plant_disease_model.h5"),
                os.path.join(current_dir, "..", "trained_models", "densenet169_tomato.pth"),
                os.path.join(current_dir, "models", "densenet_tomato_model.pth"),
            ]
            
            for path in possible_paths:
                if os.path.exists(path):
                    trained_model_path = path
                    break

    # The SmartGLBAssigner constructor now automatically sets up GLB file paths
    assigner = SmartGLBAssigner(model_path=trained_model_path)
    
    return assigner

def analyze_leaf_for_demo(image_path: str, trained_model_path: str = None):
    """
    Analyze a leaf image and get GLB recommendation
    
    Args:
        image_path: Path to the leaf image to analyze
        trained_model_path: Path to trained DenseNet model
        
    Returns:
        Analysis results and GLB recommendation
    """
    assigner = create_smart_assigner(trained_model_path)
    
    # Analyze the image
    analysis = assigner.analyze_image(image_path)
    
    print("\n🔍 Leaf Analysis Results:")
    print(f"📊 Health Status: {analysis['health_status']}")
    print(f"🎯 Confidence: {analysis['confidence']:.2%}")
    
    if 'predicted_class' in analysis:
        print(f"🔬 DenseNet Prediction: {analysis['predicted_class']}")
        if analysis.get('disease_type'):
            print(f"🦠 Disease Type: {analysis['disease_type']}")
    
    print(f"🔧 Analysis Method: {analysis['analysis_method']}")
    
    # Get GLB recommendation
    glb_recommendation = 'healthy.glb' if analysis['health_status'] == 'healthy' else 'diseased.glb'
    print(f"📦 Recommended GLB: {glb_recommendation}")
    
    return analysis

if __name__ == "__main__":
    # Example usage
    assigner = create_smart_assigner()
    
    # Test recommendation
    recommendation = assigner.get_upload_recommendation(
        plant_id="demo_plant_healthy_001",
        leaf_id="demo_plant_healthy_001_leaf_001",
        image_path="sample_leaf.jpg"
    )
    
    print("GLB Assignment Recommendation:")
    print(f"- Plant: {recommendation['plant_id']}")
    print(f"- Leaf: {recommendation['leaf_id']}")
    print(f"- Recommended GLB: {recommendation['recommended_glb']}")
    print(f"- Health Status: {recommendation['health_status']}")
    print(f"- Confidence: {recommendation['confidence']:.2f}")
    print(f"- Reasoning: {recommendation['reasoning']}")
    
    if recommendation['conflict_detected']:
        print("⚠️  CONFLICT DETECTED!")
        print(f"- AI Analysis: {recommendation['upload_metadata']['ai_health_analysis']}")
        print(f"- Manual Override: {recommendation['upload_metadata']['manual_health_status']}")