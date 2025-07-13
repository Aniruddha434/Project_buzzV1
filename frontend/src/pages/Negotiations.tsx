import React from 'react';
import { NegotiationDashboard } from '../components/NegotiationDashboard';
import { MessageCircle, Shield, Clock, DollarSign } from 'lucide-react';
import { Card } from '../components/ui/card-shadcn';

const Negotiations: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <MessageCircle className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Price Negotiations</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Communicate with sellers and negotiate project prices
          </p>
        </div>

        {/* Platform Guidelines */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-foreground">Secure Platform</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              All negotiations and payments must be completed through ProjectBuzz for your protection.
            </p>
          </Card>

          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-green-400" />
              <h3 className="font-semibold text-foreground">Time Limits</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Negotiations expire after 7 days. Discount codes are valid for 48 hours.
            </p>
          </Card>

          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-amber-400" />
              <h3 className="font-semibold text-foreground">Price Limits</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Sellers can offer discounts up to 30% off the original project price.
            </p>
          </Card>
        </div>

        {/* Negotiation Dashboard */}
        <NegotiationDashboard />

        {/* Platform Policies */}
        <div className="mt-8">
          <Card className="p-6 bg-muted/30 border-border">
            <h3 className="font-semibold text-foreground mb-4">Platform Policies</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground mb-2">Prohibited Activities:</h4>
                <ul className="space-y-1">
                  <li>• Sharing contact information (email, phone, social media)</li>
                  <li>• Attempting payments outside ProjectBuzz</li>
                  <li>• Sharing external payment methods</li>
                  <li>• Directing users to other platforms</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Guidelines:</h4>
                <ul className="space-y-1">
                  <li>• Be respectful in all communications</li>
                  <li>• Use predefined templates when possible</li>
                  <li>• Complete transactions within time limits</li>
                  <li>• Report suspicious behavior</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm text-yellow-400">
                <strong>Warning:</strong> Violations of platform policies may result in account suspension.
                All negotiations are monitored for compliance.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Negotiations;
