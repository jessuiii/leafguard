import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Droplets, Scissors, Pill, Clock, CheckCircle } from 'lucide-react';

interface TreatmentRecommendationsProps {
  diseaseType: string;
  plantId: string;
  onClose: () => void;
  onTreatmentApplied: () => void;
}

const treatmentDatabase: Record<string, {
  description: string;
  urgency: 'low' | 'medium' | 'high';
  treatments: Array<{
    title: string;
    description: string;
    icon: React.ReactNode;
    duration: string;
    steps: string[];
  }>;
}> = {
  'Tomato Late Blight': {
    description: 'A serious fungal disease that can rapidly destroy tomato plants if left untreated.',
    urgency: 'high',
    treatments: [
      {
        title: 'Fungicide Treatment',
        description: 'Apply copper-based fungicide to affected areas',
        icon: <Pill className="w-4 h-4" />,
        duration: '7-14 days',
        steps: [
          'Remove all affected leaves and stems',
          'Apply copper sulfate fungicide every 7 days',
          'Ensure good air circulation around plant',
          'Avoid overhead watering'
        ]
      },
      {
        title: 'Cultural Management',
        description: 'Improve growing conditions to prevent spread',
        icon: <Droplets className="w-4 h-4" />,
        duration: 'Ongoing',
        steps: [
          'Water at soil level, not on leaves',
          'Increase spacing between plants',
          'Remove plant debris regularly',
          'Apply mulch to reduce soil splash'
        ]
      },
      {
        title: 'Pruning & Removal',
        description: 'Remove infected plant parts immediately',
        icon: <Scissors className="w-4 h-4" />,
        duration: 'Immediate',
        steps: [
          'Cut affected leaves and stems 2 inches below symptoms',
          'Disinfect pruning tools between cuts',
          'Dispose of infected material in trash (not compost)',
          'Monitor plant daily for new symptoms'
        ]
      }
    ]
  },
  'Tomato Early Blight': {
    description: 'A common fungal disease causing dark spots on leaves and fruit.',
    urgency: 'medium',
    treatments: [
      {
        title: 'Organic Treatment',
        description: 'Use baking soda spray and neem oil',
        icon: <Pill className="w-4 h-4" />,
        duration: '10-14 days',
        steps: [
          'Mix 1 tsp baking soda per quart of water',
          'Add few drops of liquid soap',
          'Spray every 3-4 days in evening',
          'Apply neem oil weekly'
        ]
      },
      {
        title: 'Preventive Care',
        description: 'Strengthen plant immunity and environment',
        icon: <Droplets className="w-4 h-4" />,
        duration: 'Ongoing',
        steps: [
          'Ensure proper soil drainage',
          'Provide consistent watering schedule',
          'Apply balanced fertilizer monthly',
          'Maintain proper plant spacing'
        ]
      }
    ]
  },
  'Default': {
    description: 'General plant disease detected. Apply standard treatment protocols.',
    urgency: 'medium',
    treatments: [
      {
        title: 'General Treatment',
        description: 'Standard care for diseased plants',
        icon: <Pill className="w-4 h-4" />,
        duration: '7-10 days',
        steps: [
          'Remove visibly diseased parts',
          'Improve air circulation',
          'Adjust watering schedule',
          'Monitor plant recovery'
        ]
      }
    ]
  }
};



export function TreatmentRecommendations({ diseaseType, plantId, onClose, onTreatmentApplied }: TreatmentRecommendationsProps) {
  const [selectedTreatment, setSelectedTreatment] = useState<number | null>(null);
  const [appliedTreatments, setAppliedTreatments] = useState<number[]>([]);
  const [treatmentStartDate, setTreatmentStartDate] = useState<number | null>(null);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  const treatment = treatmentDatabase[diseaseType] || treatmentDatabase['Default'];
  // Parse duration (e.g., '7-10 days')
  const durationMatch = treatment.treatments[0]?.duration?.match(/(\d+)-(\d+)/);
  const minDays = durationMatch ? parseInt(durationMatch[1], 10) : 7;
  const maxDays = durationMatch ? parseInt(durationMatch[2], 10) : 10;

  useEffect(() => {
    // Check localStorage for treatment start date
    const key = `treatment_start_${plantId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      const start = parseInt(stored, 10);
      setTreatmentStartDate(start);
      const now = Date.now();
      const days = Math.max(0, maxDays - Math.floor((now - start) / (1000 * 60 * 60 * 24)));
      setDaysLeft(days);
    }
  }, [plantId]);

  useEffect(() => {
    if (treatmentStartDate) {
      const interval = setInterval(() => {
        const now = Date.now();
        const days = Math.max(0, maxDays - Math.floor((now - treatmentStartDate) / (1000 * 60 * 60 * 24)));
        setDaysLeft(days);
      }, 1000 * 60 * 60); // update every hour
      return () => clearInterval(interval);
    }
  }, [treatmentStartDate, maxDays]);

  const handleApplyTreatment = (treatmentIndex: number) => {
    if (!appliedTreatments.includes(treatmentIndex)) {
      setAppliedTreatments([...appliedTreatments, treatmentIndex]);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-orange-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Treatment Recommendations</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Plant {plantId} • {diseaseType}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">{treatment.description}</p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-4">
            {treatment.treatments.map((treatmentOption, index) => (
              <Card 
                key={index} 
                className={`cursor-pointer transition-all duration-200 ${
                  selectedTreatment === index ? 'ring-2 ring-blue-500' : ''
                } ${appliedTreatments.includes(index) ? 'bg-green-50 border-green-200' : ''}`}
                onClick={() => setSelectedTreatment(selectedTreatment === index ? null : index)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${appliedTreatments.includes(index) ? 'bg-green-500 text-white' : 'bg-blue-100 text-blue-600'}`}>
                      {appliedTreatments.includes(index) ? <CheckCircle className="w-4 h-4" /> : treatmentOption.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{treatmentOption.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {treatmentOption.duration}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{treatmentOption.description}</p>
                      
                      {selectedTreatment === index && (
                        <div className="mt-3 space-y-2">
                          <h4 className="text-sm font-medium">Treatment Steps:</h4>
                          <ol className="text-sm space-y-1">
                            {treatmentOption.steps.map((step, stepIndex) => (
                              <li key={stepIndex} className="flex items-start gap-2">
                                <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center mt-0.5">
                                  {stepIndex + 1}
                                </span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                          
                          <div className="flex gap-2 mt-4">
                            <Button
                              size="sm"
                              onClick={() => handleApplyTreatment(index)}
                              disabled={appliedTreatments.includes(index)}
                              className="flex-1"
                            >
                              {appliedTreatments.includes(index) ? 'Treatment Applied' : 'Mark as Applied'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-sm text-gray-600">
              {appliedTreatments.length} of {treatment.treatments.length} treatments applied
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              {appliedTreatments.length > 0 && !treatmentStartDate && (
                <Button onClick={() => {
                  // Store treatment start date
                  const now = Date.now();
                  localStorage.setItem(`treatment_start_${plantId}`, now.toString());
                  setTreatmentStartDate(now);
                  setDaysLeft(maxDays);
                  if (onTreatmentApplied) onTreatmentApplied();
                }}>
                  Complete Treatment Session
                </Button>
              )}
              {treatmentStartDate && daysLeft !== null && daysLeft > 0 && (
                <div className="ml-4 text-green-700 font-semibold flex items-center">
                  {daysLeft} day{daysLeft !== 1 ? 's' : ''} left until plant is healthy
                </div>
              )}
              {treatmentStartDate && daysLeft === 0 && (
                <div className="ml-4 text-green-700 font-semibold flex items-center">
                  Treatment complete! Plant should now be healthy.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}