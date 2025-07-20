import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface PaymentRedirectProps {
  project: {
    _id: string;
    title: string;
    price: number;
  };
  onPaymentSuccess?: (orderId: string) => void;
  onPaymentError?: (error: string) => void;
  children: React.ReactNode;
  source?: string;
}

/**
 * PaymentRedirect Component
 * 
 * This component wraps any trigger element (like a button) and redirects
 * to the dedicated payment page when clicked. It maintains backward
 * compatibility with existing payment modal interfaces.
 */
const PaymentRedirect: React.FC<PaymentRedirectProps> = ({
  project,
  onPaymentSuccess,
  onPaymentError,
  children,
  source = 'component'
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    // Store callbacks in sessionStorage for the payment page to use
    if (onPaymentSuccess || onPaymentError) {
      const callbacks = {
        onPaymentSuccess: onPaymentSuccess ? 'stored' : null,
        onPaymentError: onPaymentError ? 'stored' : null,
        timestamp: Date.now()
      };
      sessionStorage.setItem(`payment_callbacks_${project._id}`, JSON.stringify(callbacks));
    }

    // Navigate to payment page
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    navigate(`/payment/${project._id}?returnUrl=${returnUrl}&source=${source}`);
  };

  return (
    <div onClick={handleClick} style={{ cursor: 'pointer' }}>
      {children}
    </div>
  );
};

export default PaymentRedirect;
