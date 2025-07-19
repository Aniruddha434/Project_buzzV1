import React, { useState } from 'react';
import { Mail, MessageCircle, Clock, Send, MapPin, Phone } from 'lucide-react';
import { Card } from '../components/ui/card-shadcn';
import { Button } from '../components/ui/button-shadcn';
import { Input } from '../components/ui/input-shadcn';
import { Textarea } from '../components/ui/textarea';
import toast from 'react-hot-toast';
import api from '../api';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // In a real implementation, you would send this to your backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast.success('Message sent successfully! We\'ll get back to you within 24 hours.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black page-with-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Have questions about ProjectBuzz? Need support with your projects? We're here to help!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="p-8 bg-gray-900 border-gray-800">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-white mb-2">Send us a Message</h2>
              <p className="text-gray-400">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                  Subject
                </label>
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="What is this regarding?"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                  Message *
                </label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Tell us how we can help you..."
                  rows={6}
                  className="bg-gray-800 border-gray-700 text-white resize-none"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-white text-black hover:bg-gray-200 font-medium py-3"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="p-6 bg-gray-900 border-gray-800">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Email Support</h3>
                  <p className="text-gray-400 mb-2">
                    For general inquiries, support, and business partnerships
                  </p>
                  <a 
                    href="mailto:infoprojectbuzz@gmail.com"
                    className="text-white hover:text-gray-300 font-medium"
                  >
                    infoprojectbuzz@gmail.com
                  </a>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gray-900 border-gray-800">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Response Time</h3>
                  <p className="text-gray-400 mb-2">
                    We typically respond to all inquiries within:
                  </p>
                  <ul className="text-white space-y-1">
                    <li>• General inquiries: 24 hours</li>
                    <li>• Technical support: 12 hours</li>
                    <li>• Payment issues: 6 hours</li>
                    <li>• Urgent matters: 2-4 hours</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gray-900 border-gray-800">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Common Topics</h3>
                  <p className="text-gray-400 mb-2">
                    We're here to help with:
                  </p>
                  <ul className="text-white space-y-1">
                    <li>• Account and registration issues</li>
                    <li>• Payment and billing questions</li>
                    <li>• Project listing and selling</li>
                    <li>• Technical support</li>
                    <li>• Partnership opportunities</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-12 text-center">
          <Card className="p-8 bg-gray-900 border-gray-800">
            <h3 className="text-xl font-semibold text-white mb-4">Need Immediate Help?</h3>
            <p className="text-gray-400 mb-6">
              For urgent technical issues or payment problems, please include your account email 
              and a detailed description of the issue in your message. This helps us resolve 
              your concern faster.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline" 
                className="border-gray-600 text-white hover:bg-gray-800"
                onClick={() => window.open('/terms', '_blank')}
              >
                View Terms & Conditions
              </Button>
              <Button 
                variant="outline" 
                className="border-gray-600 text-white hover:bg-gray-800"
                onClick={() => window.open('/privacy', '_blank')}
              >
                Privacy Policy
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
