import React, { useState, useEffect } from 'react';
import { MessageCircle, Clock, CheckCircle, XCircle, AlertTriangle, Send, DollarSign } from 'lucide-react';
import { Card } from './ui/card-shadcn';
import { Button } from './ui/button-shadcn';
import { Badge } from './ui/badge-shadcn';
import { Input } from './ui/input-shadcn';
import { Textarea } from './ui/textarea';
import { useAuth } from '../context/AuthContext';
import api from '../api';

interface Negotiation {
  _id: string;
  project: {
    _id: string;
    title: string;
    price: number;
    images: string[];
  };
  buyer: {
    _id: string;
    username: string;
  };
  seller: {
    _id: string;
    username: string;
  };
  status: 'active' | 'accepted' | 'rejected' | 'expired' | 'completed';
  originalPrice: number;
  currentOffer?: number;
  finalPrice?: number;
  minimumPrice: number;
  messages: Array<{
    _id: string;
    type: string;
    content: string;
    sender: {
      _id: string;
      username: string;
    };
    timestamp: string;
    priceOffer?: number;
  }>;
  discountCode?: {
    code: string;
    expiresAt: string;
  };
  lastActivity: string;
  expiresAt: string;
}

interface NegotiationDashboardProps {
  onNegotiationUpdate?: () => void;
  userRole?: 'buyer' | 'seller';
}

export const NegotiationDashboard: React.FC<NegotiationDashboardProps> = ({ onNegotiationUpdate, userRole }) => {
  const { user } = useAuth();
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [selectedNegotiation, setSelectedNegotiation] = useState<Negotiation | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [priceOffer, setPriceOffer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNegotiations();
    }
  }, [user]);

  const fetchNegotiations = async () => {
    if (!user) return;

    try {
      const response = await api.get('/negotiations/my');

      if (response.data.success) {
        const data = response.data;
        // Filter negotiations based on user role if specified
        let filteredNegotiations = data.negotiations;

        if (userRole === 'buyer') {
          // Show only negotiations where current user is the buyer
          filteredNegotiations = data.negotiations.filter((neg: any) =>
            neg.buyer._id === user._id || neg.buyer === user._id
          );
        } else if (userRole === 'seller') {
          // Show only negotiations where current user is the seller
          filteredNegotiations = data.negotiations.filter((neg: any) =>
            neg.seller._id === user._id || neg.seller === user._id
          );
        }

        setNegotiations(filteredNegotiations);
      }
    } catch (error) {
      console.error('Error fetching negotiations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNegotiationDetails = async (negotiationId: string) => {
    try {
      const response = await api.get(`/negotiations/${negotiationId}`);

      if (response.data.success) {
        const data = response.data;
        setSelectedNegotiation(data.negotiation);
      }
    } catch (error) {
      console.error('Error fetching negotiation details:', error);
    }
  };

  const sendMessage = async (type: 'template' | 'price_offer' | 'counter_offer') => {
    if (!selectedNegotiation) return;

    setIsSubmitting(true);
    try {
      const body: any = { type };

      if (type === 'price_offer' || type === 'counter_offer') {
        if (!priceOffer) {
          alert('Please enter a price offer');
          return;
        }
        body.priceOffer = parseFloat(priceOffer);
        body.content = `I offer ₹${priceOffer} for this project.`;
      } else {
        if (!messageText.trim()) {
          alert('Please enter a message');
          return;
        }
        body.content = messageText;
      }

      const response = await api.post(`/negotiations/${selectedNegotiation._id}/message`, body);

      if (response.data.success) {
        setMessageText('');
        setPriceOffer('');
        fetchNegotiationDetails(selectedNegotiation._id);
        fetchNegotiations();
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      alert(error.response?.data?.error || 'Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  const acceptOffer = async () => {
    if (!selectedNegotiation) return;

    setIsSubmitting(true);
    try {
      const response = await api.post(`/negotiations/${selectedNegotiation._id}/accept`);

      if (response.data.success) {
        const data = response.data;
        alert(`Offer accepted! Discount code: ${data.discountCode}`);
        fetchNegotiationDetails(selectedNegotiation._id);
        fetchNegotiations();
        // Notify parent component to update counts
        if (onNegotiationUpdate) {
          onNegotiationUpdate();
        }
      }
    } catch (error: any) {
      console.error('Error accepting offer:', error);
      alert(error.response?.data?.error || 'Failed to accept offer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const rejectOffer = async () => {
    if (!selectedNegotiation) return;

    const reason = prompt('Reason for rejection (optional):');

    setIsSubmitting(true);
    try {
      const response = await api.post(`/negotiations/${selectedNegotiation._id}/reject`, { reason });

      if (response.data.success) {
        alert('Offer rejected');
        fetchNegotiationDetails(selectedNegotiation._id);
        fetchNegotiations();
        // Notify parent component to update counts
        if (onNegotiationUpdate) {
          onNegotiationUpdate();
        }
      }
    } catch (error: any) {
      console.error('Error rejecting offer:', error);
      alert(error.response?.data?.error || 'Failed to reject offer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="w-4 h-4 text-blue-400" />;
      case 'accepted': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'expired': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default: return <MessageCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'accepted': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'expired': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      default: return 'bg-muted/50 text-muted-foreground border-border';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading negotiations...</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[600px]">
      {/* Negotiations List */}
      <div className="lg:col-span-1">
        <Card className="h-fit lg:h-full bg-card border-border shadow-lg">
          <div className="p-4 border-b border-border bg-muted/50">
            <h3 className="font-semibold text-foreground">My Negotiations</h3>
          </div>
          <div className="overflow-y-auto max-h-[500px] lg:h-[calc(100%-60px)]">
            {negotiations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No negotiations found
              </div>
            ) : (
              <div className="space-y-2 p-2">
                {negotiations.map((negotiation) => (
                  <div
                    key={negotiation._id}
                    onClick={() => fetchNegotiationDetails(negotiation._id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                      selectedNegotiation?._id === negotiation._id
                        ? 'bg-primary/30 border-primary/60 shadow-md'
                        : 'bg-card border-border hover:bg-muted hover:border-primary/50 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm text-foreground truncate">
                        {negotiation.project.title}
                      </h4>
                      {getStatusIcon(negotiation.status)}
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <Badge className={`text-xs ${getStatusColor(negotiation.status)}`}>
                        {negotiation.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        ₹{negotiation.currentOffer || negotiation.originalPrice}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {userRole === 'buyer' ? `Seller: ${negotiation.seller.username}` : `Buyer: ${negotiation.buyer.username}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Negotiation Details */}
      <div className="lg:col-span-2">
        {selectedNegotiation ? (
          <Card className="h-fit lg:h-full bg-card border-border shadow-lg flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-border bg-muted/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{selectedNegotiation.project.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Original: ₹{selectedNegotiation.originalPrice} |
                    Current: ₹{selectedNegotiation.currentOffer || selectedNegotiation.originalPrice}
                  </p>
                </div>
                <Badge className={getStatusColor(selectedNegotiation.status)}>
                  {selectedNegotiation.status}
                </Badge>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[400px] lg:max-h-none">
              {selectedNegotiation.messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${
                    message.sender._id === selectedNegotiation.buyer._id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs p-3 rounded-lg shadow-sm ${
                      message.sender._id === selectedNegotiation.buyer._id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground border border-border'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    {message.priceOffer && (
                      <p className="text-xs mt-1 font-medium">
                        Offer: ₹{message.priceOffer}
                      </p>
                    )}
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(message.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            {selectedNegotiation.status === 'active' && (
              <div className="p-4 border-t border-border space-y-3">
                {/* Message Input */}
                <div className="flex gap-2">
                  <Textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-background border-border text-foreground"
                    rows={2}
                  />
                  <Button
                    onClick={() => sendMessage('template')}
                    disabled={!messageText.trim() || isSubmitting}
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>

                {/* Price Offer */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      value={priceOffer}
                      onChange={(e) => setPriceOffer(e.target.value)}
                      placeholder={`Min ₹${selectedNegotiation.minimumPrice}`}
                      min={selectedNegotiation.minimumPrice}
                      className="pl-10 bg-background border-border text-foreground"
                    />
                  </div>
                  <Button
                    onClick={() => sendMessage('price_offer')}
                    disabled={!priceOffer || isSubmitting}
                    size="sm"
                    variant="outline"
                    className="border-border text-foreground"
                  >
                    Send Offer
                  </Button>
                </div>

                {/* Seller Actions - Only show if user is the seller */}
                {selectedNegotiation.currentOffer &&
                 (selectedNegotiation.seller._id === user?._id || selectedNegotiation.seller === user?._id) && (
                  <div className="flex gap-2">
                    <Button
                      onClick={acceptOffer}
                      disabled={isSubmitting}
                      size="sm"
                      className="bg-green-600 text-white hover:bg-green-700"
                    >
                      Accept Offer
                    </Button>
                    <Button
                      onClick={rejectOffer}
                      disabled={isSubmitting}
                      size="sm"
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-500/10"
                    >
                      Reject Offer
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Discount Code Display */}
            {selectedNegotiation.discountCode && (
              <div className="p-4 border-t border-border bg-green-500/10">
                <div className="text-sm text-green-400">
                  <strong>Discount Code:</strong> {selectedNegotiation.discountCode.code}
                </div>
                <div className="text-xs text-muted-foreground">
                  Expires: {new Date(selectedNegotiation.discountCode.expiresAt).toLocaleString()}
                </div>
              </div>
            )}
          </Card>
        ) : (
          <Card className="h-fit lg:h-full bg-card border-border shadow-lg flex items-center justify-center min-h-[300px]">
            <div className="text-center text-muted-foreground">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-70" />
              <p className="text-lg font-medium">Select a negotiation to view details</p>
              <p className="text-sm mt-2">Choose a negotiation from the list to start messaging</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
