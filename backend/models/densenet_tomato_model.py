"""
DenseNet169 Tomato Disease Model - Optimized for Single Model Training
Based on MarkoArsenovic/DeepLearning_PlantDiseases but focused solely on DenseNet169

This module provides DenseNet169 specifically for tomato disease detection
with optimized training and inference capabilities.
"""

import torch
import torch.nn as nn
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
import io
import numpy as np


class DenseNetTomatoClassifier:
    """DenseNet169 classifier optimized for tomato disease detection"""

    def __init__(self):
        """Initialize DenseNet169 for 10 tomato disease classes"""
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model_type = 'densenet169'
        self.num_classes = 10
        self.input_size = (224, 224)

        # 10 tomato disease classes (PlantVillage subset)
        self.class_names = [
            'Tomato___Bacterial_spot',
            'Tomato___Early_blight',
            'Tomato___Late_blight',
            'Tomato___Leaf_Mold',
            'Tomato___Septoria_leaf_spot',
            'Tomato___Spider_mites Two-spotted_spider_mite',
            'Tomato___Target_Spot',
            'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
            'Tomato___Tomato_mosaic_virus',
            'Tomato___healthy'
        ]

        # Disease severity mapping based on agricultural impact
        self.disease_severity_map = {
            'Tomato___healthy': {'severity': 'none', 'urgency': 'low'},
            'Tomato___Bacterial_spot': {'severity': 'medium', 'urgency': 'medium'},
            'Tomato___Early_blight': {'severity': 'high', 'urgency': 'high'},
            'Tomato___Late_blight': {'severity': 'high', 'urgency': 'high'},
            'Tomato___Leaf_Mold': {'severity': 'medium', 'urgency': 'medium'},
            'Tomato___Septoria_leaf_spot': {'severity': 'medium', 'urgency': 'medium'},
            'Tomato___Spider_mites Two-spotted_spider_mite': {'severity': 'low', 'urgency': 'low'},
            'Tomato___Target_Spot': {'severity': 'medium', 'urgency': 'medium'},
            'Tomato___Tomato_Yellow_Leaf_Curl_Virus': {'severity': 'high', 'urgency': 'high'},
            'Tomato___Tomato_mosaic_virus': {'severity': 'high', 'urgency': 'high'}
        }

        self.model = None

        # Define image transforms for inference
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])

    def create_model(self):
        """Create DenseNet169 model for tomato classification"""
        # Load pre-trained DenseNet169
        model = models.densenet169(pretrained=True)

        # Replace classifier for tomato classes
        num_ftrs = model.classifier.in_features
        model.classifier = nn.Linear(num_ftrs, self.num_classes)

        self.model = model.to(self.device)
        print(f"Created DenseNet169 model with {self.num_classes} output classes.")
        return self.model

    def load_model(self, model_path):
        """Load trained model weights"""
        if self.model is None:
             self.create_model() # Ensure model structure is created first

        if self.model:
            try:
                # Load state_dict from the saved file
                state_dict = torch.load(model_path, map_location=self.device)

                # Adjust state_dict keys if necessary (sometimes 'module.' prefix is added)
                new_state_dict = {}
                for k, v in state_dict.items():
                    if k.startswith('module.'):
                        new_state_dict[k[7:]] = v # remove 'module.' prefix
                    else:
                        new_state_dict[k] = v

                self.model.load_state_dict(new_state_dict)
                self.model.to(self.device)
                self.model.eval() # Set model to evaluation mode
                print(f"Loading custom weights from: {model_path}")
                return self.model # Return the loaded model for confirmation
            except Exception as e:
                print(f"Error loading model state_dict: {e}")
                return None
        else:
            print("Model structure not created. Cannot load weights.")
            return None

    def assess_severity(self, predicted_class_name, confidence_score):
        """
        Assess disease severity based on disease type and model confidence
        
        Returns:
        - severity: 'low', 'medium', 'high' 
        - urgency: treatment urgency level
        - assessment: detailed description
        """
        disease_info = self.disease_severity_map.get(predicted_class_name, {
            'severity': 'medium', 
            'urgency': 'medium'
        })
        
        base_severity = disease_info['severity']
        base_urgency = disease_info['urgency']
        
        # Adjust severity based on confidence
        if confidence_score > 0.9:
            confidence_modifier = "high"
        elif confidence_score > 0.7:
            confidence_modifier = "medium" 
        else:
            confidence_modifier = "low"
        
        # Generate assessment description
        if predicted_class_name == 'Tomato___healthy':
            assessment = f"Plant appears healthy with {confidence_score:.1%} confidence"
        else:
            disease_name = predicted_class_name.replace('Tomato___', '').replace('_', ' ')
            assessment = f"{disease_name} detected with {confidence_score:.1%} confidence. "
            
            if base_severity == 'high':
                assessment += "This is a serious disease requiring immediate attention."
            elif base_severity == 'medium':
                assessment += "This disease needs monitoring and treatment."
            else:
                assessment += "This is a minor issue that should be addressed."
        
        return {
            'severity': base_severity,
            'urgency': base_urgency,
            'confidence_level': confidence_modifier,
            'assessment': assessment,
            'treatment_priority': self._get_treatment_priority(base_severity, confidence_score)
        }
    
    def _get_treatment_priority(self, severity, confidence):
        """Calculate treatment priority (1-5 scale, 5 being most urgent)"""
        severity_scores = {'low': 1, 'medium': 3, 'high': 5}
        base_score = severity_scores.get(severity, 3)
        
        # Adjust based on confidence
        if confidence > 0.9:
            return min(5, base_score + 1)
        elif confidence < 0.6:
            return max(1, base_score - 1)
        else:
            return base_score

    def predict_image(self, image_path):
        """Predict the class of a single image with detailed results for GLB assignment"""
        if self.model is None:
            print("Model not loaded. Please call load_model() first.")
            return {
                "error": "Model not loaded",
                "health_status": "unknown",
                "disease_type": "unknown",
                "glb_recommendation": "healthy-leaf.glb",
                "confidence": 0.0
            }

        try:
            # Load and transform the image
            image = Image.open(image_path).convert('RGB')
            image = self.transform(image).unsqueeze(0).to(self.device) # Add batch dimension

            # Perform inference
            with torch.no_grad():
                outputs = self.model(image)
                probabilities = torch.nn.functional.softmax(outputs, dim=1)
                confidence, predicted = torch.max(probabilities, 1)
                predicted_class_index = predicted.item()
                confidence_score = confidence.item()

            # Get the class name
            if 0 <= predicted_class_index < len(self.class_names):
                predicted_class_name = self.class_names[predicted_class_index]
                
                # Determine health status and GLB recommendation
                is_healthy = predicted_class_name == 'Tomato___healthy'
                health_status = "healthy" if is_healthy else "diseased"
                disease_type = "none" if is_healthy else predicted_class_name.replace('Tomato___', '').replace('_', ' ')
                glb_recommendation = "healthy-leaf.glb" if is_healthy else "deceased-leaf.glb"
                
                # Assess disease severity
                severity_info = self.assess_severity(predicted_class_name, confidence_score)
                
                return {
                    "predicted_class": predicted_class_name,
                    "health_status": health_status,
                    "disease_type": disease_type,
                    "glb_recommendation": glb_recommendation,
                    "confidence": confidence_score,
                    "class_index": predicted_class_index,
                    "severity": severity_info['severity'],
                    "urgency": severity_info['urgency'],
                    "confidence_level": severity_info['confidence_level'],
                    "assessment": severity_info['assessment'],
                    "treatment_priority": severity_info['treatment_priority']
                }
            else:
                return {
                    "error": f"Invalid predicted class index {predicted_class_index}",
                    "health_status": "unknown",
                    "disease_type": "unknown",
                    "glb_recommendation": "healthy-leaf.glb",
                    "confidence": 0.0
                }

        except FileNotFoundError:
            return {
                "error": f"Image file not found at {image_path}",
                "health_status": "unknown",
                "disease_type": "unknown",
                "glb_recommendation": "healthy-leaf.glb",
                "confidence": 0.0
            }
        except Exception as e:
            return {
                "error": f"Error during prediction: {e}",
                "health_status": "unknown",
                "disease_type": "unknown",
                "glb_recommendation": "healthy-leaf.glb",
                "confidence": 0.0
            }

    # You can add other methods here if needed, e.g., for full evaluation
    # def evaluate(self, dataloader):
    #     ...