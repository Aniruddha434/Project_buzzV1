import React, { useState } from 'react';
import { Tag, Check, X, Loader2 } from 'lucide-react';
import { Button } from './ui/button-shadcn';
import { Input } from './ui/input-shadcn';
import { Card } from './ui/card-shadcn';

interface DiscountCodeInputProps {
  projectId: string;
  originalPrice: number;
  onDiscountApplied: (discount: {
    code: string;
    discountAmount: number;
    finalPrice: number;
    originalPrice: number;
  }) => void;
  onDiscountRemoved: () => void;
  appliedDiscount?: {
    code: string;
    discountAmount: number;
    finalPrice: number;
    originalPrice: number;
  } | null;
}

export const DiscountCodeInput: React.FC<DiscountCodeInputProps> = ({
  projectId,
  originalPrice,
  onDiscountApplied,
  onDiscountRemoved,
  appliedDiscount
}) => {
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');

  const validateCode = async () => {
    if (!code.trim()) {
      setError('Please enter a discount code');
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/negotiations/validate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code: code.trim(),
          projectId
        })
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        onDiscountApplied({
          code: code.trim(),
          discountAmount: data.discountAmount,
          finalPrice: data.finalPrice,
          originalPrice: data.originalPrice
        });
        setCode('');
      } else {
        setError(data.error || 'Invalid discount code');
      }
    } catch (error) {
      console.error('Error validating discount code:', error);
      setError('Failed to validate discount code');
    } finally {
      setIsValidating(false);
    }
  };

  const removeDiscount = () => {
    onDiscountRemoved();
    setCode('');
    setError('');
  };

  if (appliedDiscount) {
    return (
      <Card className="p-4 bg-green-500/10 border-green-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-400" />
            <div>
              <p className="font-medium text-green-400">Discount Applied</p>
              <p className="text-sm text-muted-foreground">
                Code: {appliedDiscount.code}
              </p>
            </div>
          </div>
          <Button
            onClick={removeDiscount}
            variant="ghost"
            size="sm"
            className="text-green-400 hover:text-green-300"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Original Price:</span>
            <span className="line-through text-muted-foreground">₹{appliedDiscount.originalPrice}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Discount:</span>
            <span className="text-green-400">-₹{appliedDiscount.discountAmount}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span className="text-foreground">Final Price:</span>
            <span className="text-green-400">₹{appliedDiscount.finalPrice}</span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-card border-border">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-muted-foreground" />
          <label className="text-sm font-medium text-foreground">
            Have a discount code?
          </label>
        </div>

        <div className="flex gap-2">
          <Input
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError('');
            }}
            placeholder="Enter discount code"
            className="flex-1 bg-background border-border text-foreground"
            disabled={isValidating}
          />
          <Button
            onClick={validateCode}
            disabled={!code.trim() || isValidating}
            variant="outline"
            className="border-border text-foreground hover:bg-muted"
          >
            {isValidating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Apply'
            )}
          </Button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-400">
            <X className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Discount codes are generated through price negotiations with sellers.
        </div>
      </div>
    </Card>
  );
};
