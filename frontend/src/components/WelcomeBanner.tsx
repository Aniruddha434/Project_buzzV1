import React, { useState, useEffect } from 'react';
import { X, Gift, Sparkles, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface WelcomeBannerProps {
  onClose?: () => void;
}

const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ onClose }) => {
  // Component disabled - no welcome banner will be shown
  return null;


};

export default WelcomeBanner;
