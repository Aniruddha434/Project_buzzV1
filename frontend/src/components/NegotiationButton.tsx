import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MessageCircle, X, Send, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button-shadcn';
import { Card } from './ui/card-shadcn';
import { Input } from './ui/input-shadcn';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge-shadcn';
import api from '../api';
import InlineError from './ui/InlineError';
import FieldError from './ui/FieldError';

interface NegotiationButtonProps {
  projectId: string;
  projectTitle: string;
  originalPrice: number;
  onNegotiationStart?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const MESSAGE_TEMPLATES = [
  { id: 'lower_price', content: "Would you consider a lower price for this project?" },
  { id: 'best_offer', content: "What's your best offer for this project?" }
];

export const NegotiationButton: React.FC<NegotiationButtonProps> = ({
  projectId,
  projectTitle,
  originalPrice,
  onNegotiationStart,
  className = '',
  size = 'md'
}) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [priceOffer, setPriceOffer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'template' | 'price' | 'confirm'>('template');
  const [error, setError] = useState('');
  const [priceError, setPriceError] = useState('');

  const minimumPrice = Math.floor(originalPrice * 0.7);

  // Add body scroll lock when modal opens
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  const resetModal = () => {
    setSelectedTemplate('');
    setCustomMessage('');
    setPriceOffer('');
    setStep('template');
    setError('');
    setPriceError('');
    setIsOpen(false);
    // Remove body scroll lock
    document.body.classList.remove('modal-open');
  };

  // Handle body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && !isSubmitting) {
        resetModal();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, isSubmitting]);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (templateId === 'lower_price' || templateId === 'best_offer') {
      setStep('price');
    } else {
      setStep('confirm');
    }
  };

  const handleStartNegotiation = async () => {
    setIsSubmitting(true);

    try {
      const response = await api.post('/negotiations/start', {
        projectId,
        templateId: selectedTemplate,
        message: customMessage || undefined
      });

      if (response.data.success) {
        resetModal();
        onNegotiationStart?.();

        // Navigate to negotiations page immediately
        navigate('/negotiations');
      } else {
        setError(response.data.error || 'Failed to start negotiation');
      }
    } catch (error: any) {
      console.error('Error starting negotiation:', error);
      setError(error.response?.data?.error || 'Failed to start negotiation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePriceSubmit = async () => {
    if (!priceOffer || parseFloat(priceOffer) < minimumPrice) {
      setPriceError(`Price must be at least ₹${minimumPrice}`);
      return;
    }
    setPriceError('');

    setIsSubmitting(true);

    try {
      // First start the negotiation
      const startResponse = await api.post('/negotiations/start', {
        projectId,
        templateId: selectedTemplate,
        message: customMessage || undefined
      });

      if (startResponse.data.success) {
        const { negotiation } = startResponse.data;

        // Then send price offer
        const priceResponse = await api.post(`/negotiations/${negotiation._id}/message`, {
          type: 'price_offer',
          content: `I would like to offer ₹${priceOffer} for this project.`,
          priceOffer: parseFloat(priceOffer)
        });

        if (priceResponse.data.success) {
          resetModal();
          onNegotiationStart?.();

          // Navigate to negotiations page immediately
          navigate('/negotiations');
        }
      }
    } catch (error: any) {
      console.error('Error submitting price offer:', error);
      setError(error.response?.data?.error || 'Failed to submit price offer');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => {
          setIsOpen(true);
          document.body.classList.add('modal-open');
        }}
        variant="outline"
        size={size}
        className={`flex items-center gap-2 bg-muted hover:bg-muted/80 border-border text-foreground ${className}`}
      >
        <MessageCircle className="w-4 h-4" />
        <span className="text-xs">Negotiate</span>
      </Button>
    );
  }

  // Render modal using portal to ensure it's at document body level
  const modalContent = (
    <div
      className="modal-critical-backdrop bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        // Close modal when clicking backdrop
        if (e.target === e.currentTarget) {
          resetModal();
        }
      }}
    >
      <Card className="modal-critical-content bg-card border-border shadow-2xl transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Start Negotiation</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetModal}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">Project: {projectTitle}</p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Original Price: ₹{originalPrice}</Badge>
              <Badge variant="outline">Min: ₹{minimumPrice}</Badge>
            </div>
          </div>

          {/* General Error Display */}
          {error && (
            <div className="mb-4">
              <InlineError
                message={error}
                variant="error"
                dismissible
                onDismiss={() => setError('')}
              />
            </div>
          )}

          {step === 'template' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Choose a message template:
                </label>
                <div className="space-y-2">
                  {MESSAGE_TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template.id)}
                      className="w-full text-left p-3 rounded-lg border border-border hover:bg-muted transition-colors text-sm text-foreground"
                    >
                      {template.content}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Or write a custom message:
                </label>
                <Textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="bg-background border-border text-foreground"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {customMessage.length}/500 characters
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={resetModal}
                  className="flex-1 border-border text-foreground"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleStartNegotiation}
                  disabled={!selectedTemplate && !customMessage.trim() || isSubmitting}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Starting...' : 'Start Negotiation'}
                </Button>
              </div>
            </div>
          )}

          {step === 'price' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Your Price Offer:
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={priceOffer}
                    onChange={(e) => setPriceOffer(e.target.value)}
                    placeholder={`Minimum ₹${minimumPrice}`}
                    min={minimumPrice}
                    max={originalPrice}
                    className="pl-10 bg-background border-border text-foreground"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Price must be between ₹{minimumPrice} and ₹{originalPrice}
                </p>
                {priceError && (
                  <FieldError message={priceError} className="mt-2" />
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep('template')}
                  className="flex-1 border-border text-foreground"
                  disabled={isSubmitting}
                >
                  Back
                </Button>
                <Button
                  variant="outline"
                  onClick={resetModal}
                  className="flex-1 border-border text-foreground"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePriceSubmit}
                  disabled={!priceOffer || parseFloat(priceOffer) < minimumPrice || isSubmitting}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Offer'}
                </Button>
              </div>
            </div>
          )}

          <div className="mt-4 p-3 bg-muted border border-border rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Platform Policy:</strong> All negotiations and payments must be completed through ProjectBuzz.
              Attempting to conduct transactions outside the platform is prohibited.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );

  // Use portal to render modal at document body level, ensuring it's not constrained by parent containers
  return createPortal(modalContent, document.body);
};
