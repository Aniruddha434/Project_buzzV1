"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CreditCard, X } from "lucide-react";
import Button from "./Button";
import Input from "./Input";
import { DiscountCodeInput } from "../DiscountCodeInput";

interface PaymentDialogProps {
  projectTitle?: string;
  projectPrice?: number;
  projectId?: string;
  onPayment?: (paymentData: any) => void;
  trigger?: React.ReactNode;
}

function PaymentDialog({
  projectTitle = "Premium Project",
  projectPrice = 32,
  projectId,
  onPayment,
  trigger
}: PaymentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("onetime");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvc, setCvc] = useState("");
  const [nameOnCard, setNameOnCard] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    discountAmount: number;
    finalPrice: number;
    originalPrice: number;
  } | null>(null);

  // Manage body scroll lock
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

  const getFinalPrice = () => {
    if (appliedDiscount) {
      return appliedDiscount.finalPrice;
    }
    return selectedPlan === "onetime" ? projectPrice : projectPrice * 0.8;
  };

  const handlePayment = () => {
    const paymentData = {
      projectTitle,
      projectId,
      amount: getFinalPrice(),
      plan: selectedPlan,
      cardNumber,
      expiryDate,
      cvc,
      nameOnCard,
      discountCode: appliedDiscount?.code
    };

    onPayment?.(paymentData);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <div onClick={() => setIsOpen(true)}>
        {trigger || <Button variant="primary">Checkout</Button>}
      </div>
    );
  }

  // Payment dialog content
  const paymentDialogContent = (
    <div className="modal-payment-backdrop bg-black/60 backdrop-blur-sm overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setIsOpen(false)} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="modal-payment-content relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full max-h-[95vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confirm and pay</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Purchase {projectTitle} securely with Razorpay.
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handlePayment(); }}>
              <div className="space-y-4">
                {/* Plan Selection */}
                <div className="grid grid-cols-2 gap-3">
                  <label className={`relative flex cursor-pointer flex-col gap-1 rounded-lg border px-4 py-3 transition-colors ${
                    selectedPlan === "onetime"
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}>
                    <input
                      type="radio"
                      value="onetime"
                      checked={selectedPlan === "onetime"}
                      onChange={(e) => setSelectedPlan(e.target.value)}
                      className="sr-only"
                    />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">One-time</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">₹{projectPrice}</p>
                  </label>
                  <label className={`relative flex cursor-pointer flex-col gap-1 rounded-lg border px-4 py-3 transition-colors ${
                    selectedPlan === "bundle"
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}>
                    <input
                      type="radio"
                      value="bundle"
                      checked={selectedPlan === "bundle"}
                      onChange={(e) => setSelectedPlan(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Bundle</p>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Save 20%</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">₹{(projectPrice * 0.8).toFixed(0)}</p>
                  </label>
                </div>

                {/* Discount Code */}
                {projectId && (
                  <DiscountCodeInput
                    projectId={projectId}
                    originalPrice={projectPrice}
                    onDiscountApplied={setAppliedDiscount}
                    onDiscountRemoved={() => setAppliedDiscount(null)}
                    appliedDiscount={appliedDiscount}
                  />
                )}

                {/* Name on card */}
                <Input
                  label="Name on card"
                  type="text"
                  required
                  value={nameOnCard}
                  onChange={(e) => setNameOnCard(e.target.value)}
                  placeholder="John Doe"
                />

                {/* Card Details */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Card Details
                  </label>
                  <Input
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    rightIcon={<CreditCard size={16} />}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                    />
                    <Input
                      placeholder="CVC"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full bg-black hover:bg-gray-800"
              >
                Pay ₹{getFinalPrice()}
                {appliedDiscount && (
                  <span className="ml-2 text-xs opacity-75">
                    (₹{appliedDiscount.discountAmount} off)
                  </span>
                )}
              </Button>
            </form>

            <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
              Secure payment powered by Razorpay. Cancel anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Use portal to render payment dialog at document body level
  return createPortal(paymentDialogContent, document.body);
}

export { PaymentDialog };
