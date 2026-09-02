/**
 * Customer Home Page - Hero Landing and Service Selection
 * 
 * PRIORITY SCREEN: Part of customer journey
 * 
 * Validates Requirements: 3.1, 14.1, 14.2, 14.3, 16.1
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMockData } from '../../contexts/MockDataContext';
import { Card } from '../../components/primitives/Card';
import { Icon } from '../../components/primitives/Icon';
import { dispatchWorker } from '../../engines/dispatchEngine';
import type { ServiceRequest } from '../../types/job';

export function CustomerHome() {
  const { services, workers } = useMockData();
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        simulateAIAnalysis();
      };
      reader.readAsDataURL(file);
    }
  };

  const simulateAIAnalysis = () => {
    setAiAnalyzing(true);
    
    setTimeout(() => {
      const aiDiagnosis = getAIDiagnosis(selectedService);
      setDescription(aiDiagnosis);
      setAiAnalyzing(false);
    }, 2000);
  };

  const getAIDiagnosis = (serviceId: string | null): string => {
    const diagnoses: Record<string, string> = {
      'S001': 'Based on the image analysis, this appears to be a leak in the main water pipe connection under the sink. Estimated repair time: 1 hour. Requires pipe sealant and wrench.',
      'S002': 'AI detected a faulty circuit breaker switch showing signs of wear. Recommend immediate replacement to prevent electrical hazards. Service time: 45 minutes.',
      'S003': 'Image shows a damaged door hinge with loose screws. Simple repair needed - hinge replacement and proper mounting. Estimated time: 30 minutes.',
      'S004': 'Wall surface shows peeling paint and moisture damage. Requires surface preparation, primer application, and repainting. Estimated time: 3-4 hours.',
      'S005': 'Heavy buildup detected in kitchen exhaust and countertop areas. Deep cleaning with degreaser recommended. Estimated time: 2 hours.',
      'S006': 'Refrigerator compressor showing irregular patterns. Likely needs coolant refill or compressor check. Estimated repair: 1-2 hours.'
    };
    
    return diagnoses[serviceId || 'S001'] || 'AI analysis complete. Please describe additional details about the issue.';
  };

  const handleRequestService = async () => {
    if (!selectedService || !description.trim()) return;

    setLoading(true);

    // Create mock service request
    const request: ServiceRequest = {
      serviceCategory: services.find(s => s.id === selectedService)?.name || '',
      serviceSubcategory: '',
      description: description.trim(),
      location: {
        address: 'Demo Location, Delhi',
        coordinates: { lat: 28.6139, lng: 77.2090 }
      },
      immediate: true
    };

    try {
      // Simulate dispatch
      const result = await new Promise<any>((resolve) => {
        setTimeout(() => {
          resolve(dispatchWorker(request, workers));
        }, 2000);
      });

      // Navigate to live job (mock job creation)
      navigate('/job/DEMO001');
    } catch (error) {
      console.error('Dispatch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (selectedService) {
    const service = services.find(s => s.id === selectedService);
    
    return (
      <div className="min-h-screen px-6 py-12 max-w-4xl mx-auto">
        <button
          onClick={() => setSelectedService(null)}
          className="text-accent-primary font-medium mb-8 hover:underline"
        >
          ← Back to services
        </button>

        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-extrabold text-text-navy mb-4">
              Request {service?.name} Service
            </h1>
            <p className="text-text-secondary text-lg">
              Describe what you need help with
            </p>
          </div>

          <Card variant="container" padding="lg">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-mono font-medium text-text-secondary mb-2">
                  SERVICE CATEGORY
                </label>
                <p className="text-xl font-semibold">{service?.name}</p>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-mono font-medium text-text-secondary mb-2">
                  DESCRIPTION *
                </label>
                
                {/* AI Photo Upload Feature */}
                <div className="mb-4 p-4 bg-accent-light rounded-lg border-2 border-accent-primary/20">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-text-navy">AI-Powered Problem Detection</h4>
                        <span className="px-2 py-0.5 bg-accent-primary text-white text-xs font-mono rounded">BETA</span>
                      </div>
                      <p className="text-sm text-text-secondary mb-3">
                        Upload a photo and our AI will analyze the issue and suggest a description
                      </p>
                      
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-accent-primary text-accent-primary rounded-lg cursor-pointer hover:bg-accent-primary hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="font-medium text-sm">
                          {uploadedImage ? 'Change Photo' : 'Upload Photo'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      
                      {aiAnalyzing && (
                        <div className="mt-3 flex items-center gap-2 text-accent-primary">
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span className="text-sm font-medium">AI analyzing image...</span>
                        </div>
                      )}
                      
                      {uploadedImage && !aiAnalyzing && (
                        <div className="mt-3 flex items-center gap-2 text-green-600">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm font-medium">AI analysis complete</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the work needed (minimum 10 characters)"
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-status-subtle rounded-lg focus:border-accent-primary focus:outline-none resize-none"
                />
                {description.length > 0 && description.length < 10 && (
                  <p className="text-sm text-text-tertiary mt-2">
                    {10 - description.length} more characters required
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-mono font-medium text-text-secondary mb-2">
                  DELIVERY
                </label>
                <div className="flex items-center gap-3 text-accent-primary">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Immediate Service</span>
                </div>
              </div>

              <button
                onClick={handleRequestService}
                disabled={loading || description.length < 10}
                className={`
                  w-full py-4 rounded-xl font-semibold text-lg transition-all
                  ${
                    loading || description.length < 10
                      ? 'bg-status-subtle text-text-tertiary cursor-not-allowed'
                      : 'bg-accent-primary text-white hover:bg-accent-hover active:scale-[0.98]'
                  }
                `}
              >
                {loading ? 'Finding worker...' : 'Request Service Now'}
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-12 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-4xl lg:text-[3.5rem] font-extrabold text-text-navy leading-tight">
          CoWork
        </h1>
        <p className="text-xl text-text-secondary">
          Local skills. Shared opportunity.
        </p>
        <p className="text-sm font-mono text-text-tertiary tracking-wide">
          COOPERATIVE SERVICE NETWORK
        </p>
      </div>

      {/* Service Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card
            key={service.id}
            variant="bento"
            padding="lg"
            interactive
            onClick={() => handleServiceSelect(service.id)}
          >
            <div className="flex flex-col h-full">
              <div className="space-y-4 flex-1">
                <div className="text-text-navy">
                  <Icon name={service.icon} size={48} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-text-navy mb-2">
                    {service.name}
                  </h3>
                  <p className="text-text-secondary text-sm mb-4">
                    {service.description}
                  </p>
                </div>
                <div className="pt-4 border-t border-status-subtle space-y-1">
                  <p className="text-sm text-text-tertiary">
                    <span className="font-mono text-xs">AVG PRICE:</span> {service.avgPrice}
                  </p>
                  <p className="text-sm text-text-tertiary">
                    <span className="font-mono text-xs">AVG TIME:</span> {service.avgDuration}
                  </p>
                </div>
              </div>
              
              {/* Book Now Button */}
              <div className="flex justify-end mt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleServiceSelect(service.id);
                  }}
                  className="px-6 py-2 bg-accent-primary text-white rounded-full font-medium text-sm hover:bg-accent-hover transition-colors duration-200"
                >
                  Book Now
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
