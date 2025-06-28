import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Star, Heart, Download, Settings, Search, User,
  Mail, Lock, Eye, EyeOff, Plus, Edit, Trash2
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const UIShowcase: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            UI Component Showcase
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Explore all the beautiful components in ProjectBuzz
          </p>
        </motion.div>

        {/* Buttons Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Buttons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

            <Card variant="default" className="p-6">
              <h3 className="text-lg font-semibold mb-4">Button Variants</h3>
              <div className="space-y-3">
                <Button variant="primary" className="w-full">Primary Button</Button>
                <Button variant="secondary" className="w-full">Secondary Button</Button>
                <Button variant="outline" className="w-full">Outline Button</Button>
                <Button variant="ghost" className="w-full">Ghost Button</Button>
                <Button variant="destructive" className="w-full">Destructive Button</Button>
                <Button variant="gradient" className="w-full" glow>Gradient Button</Button>
              </div>
            </Card>

            <Card variant="glass" className="p-6">
              <h3 className="text-lg font-semibold mb-4">Button Sizes</h3>
              <div className="space-y-3">
                <Button size="sm" className="w-full">Small Button</Button>
                <Button size="md" className="w-full">Medium Button</Button>
                <Button size="lg" className="w-full">Large Button</Button>
                <Button size="xl" className="w-full">Extra Large</Button>
              </div>
            </Card>

            <Card variant="gradient" className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-white">With Icons</h3>
              <div className="space-y-3">
                <Button leftIcon={<Plus className="h-4 w-4" />} className="w-full">Add Item</Button>
                <Button rightIcon={<Download className="h-4 w-4" />} variant="outline" className="w-full">Download</Button>
                <Button leftIcon={<Heart className="h-4 w-4" />} rightIcon={<Star className="h-4 w-4" />} variant="secondary" className="w-full">Like & Star</Button>
                <Button isLoading className="w-full">Loading...</Button>
              </div>
            </Card>
          </div>
        </section>

        {/* Cards Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            <Card variant="default" hover className="p-6">
              <h3 className="text-lg font-semibold mb-2">Default Card</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Standard card with shadow and hover effects.
              </p>
            </Card>

            <Card variant="glass" hover className="p-6">
              <h3 className="text-lg font-semibold mb-2">Glass Card</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Beautiful glassmorphism effect with backdrop blur.
              </p>
            </Card>

            <Card variant="gradient" hover className="p-6">
              <h3 className="text-lg font-semibold mb-2">Gradient Card</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Subtle gradient background with modern styling.
              </p>
            </Card>

            <Card variant="neon" hover className="p-6">
              <h3 className="text-lg font-semibold mb-2 text-cyan-400">Neon Card</h3>
              <p className="text-cyan-300 text-sm">
                Futuristic neon-bordered card for special content.
              </p>
            </Card>
          </div>
        </section>

        {/* Inputs Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Input Fields</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

            <Card variant="default" className="p-6">
              <h3 className="text-lg font-semibold mb-4">Default Inputs</h3>
              <div className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email"
                  leftIcon={<Mail className="h-4 w-4" />}
                />
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  leftIcon={<Lock className="h-4 w-4" />}
                  rightIcon={
                    <button onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                />
                <Input
                  label="Search"
                  placeholder="Search projects..."
                  leftIcon={<Search className="h-4 w-4" />}
                />
              </div>
            </Card>

            <Card variant="glass" className="p-6">
              <h3 className="text-lg font-semibold mb-4">Glass Inputs</h3>
              <div className="space-y-4">
                <Input
                  variant="glass"
                  label="Username"
                  placeholder="Enter username"
                  leftIcon={<User className="h-4 w-4" />}
                />
                <Input
                  variant="glass"
                  label="Bio"
                  placeholder="Tell us about yourself"
                  helperText="This will be displayed on your profile"
                />
                <Input
                  variant="glass"
                  label="Website"
                  placeholder="https://example.com"
                  error="Please enter a valid URL"
                />
              </div>
            </Card>

            <Card variant="neon" className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-cyan-400">Neon Inputs</h3>
              <div className="space-y-4">
                <Input
                  variant="neon"
                  label="Project Name"
                  placeholder="Enter project name"
                />
                <Input
                  variant="neon"
                  label="Price"
                  type="number"
                  placeholder="0.00"
                />
              </div>
            </Card>
          </div>
        </section>

        {/* Badges Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Badges</h2>
          <Card variant="default" className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              <div>
                <h3 className="text-lg font-semibold mb-4">Status Badges</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="success">Approved</Badge>
                  <Badge variant="warning">Pending</Badge>
                  <Badge variant="error">Rejected</Badge>
                  <Badge variant="info">Info</Badge>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Special Effects</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="gradient">Gradient</Badge>
                  <Badge variant="neon">Neon</Badge>
                  <Badge variant="success" pulse>Pulse</Badge>
                  <Badge variant="gradient" glow>Glow</Badge>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Sizes</h3>
                <div className="flex flex-wrap gap-2 items-center">
                  <Badge size="sm">Small</Badge>
                  <Badge size="md">Medium</Badge>
                  <Badge size="lg">Large</Badge>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Loading Spinners Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Loading Spinners</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            <Card variant="default" className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-4">Default</h3>
              <LoadingSpinner variant="default" text="Loading..." />
            </Card>

            <Card variant="glass" className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-4">Gradient</h3>
              <LoadingSpinner variant="gradient" text="Processing..." />
            </Card>

            <Card variant="gradient" className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-4">Dots</h3>
              <LoadingSpinner variant="dots" text="Please wait..." />
            </Card>

            <Card variant="neon" className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-4 text-cyan-400">Pulse</h3>
              <LoadingSpinner variant="pulse" text="Syncing..." />
            </Card>
          </div>
        </section>

        {/* Modal Demo */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Modal</h2>
          <Card variant="default" className="p-6">
            <div className="flex gap-4">
              <Button onClick={() => setShowModal(true)}>Open Modal</Button>
            </div>
          </Card>
        </section>

        {/* Interactive Actions */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Interactive Elements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <Card variant="glass" hover className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Project Card</h3>
                <div className="flex gap-2">
                  <button className="p-2 text-gray-400">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                This card demonstrates hover effects and interactive elements.
              </p>
              <div className="flex items-center justify-between">
                <Badge variant="success">Active</Badge>
                <span className="text-2xl font-bold text-green-600">$29</span>
              </div>
            </Card>

            <Card variant="default" hover glow className="p-6">
              <h3 className="text-lg font-semibold mb-4">Glow Effect Card</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                This card has a beautiful glow effect on hover.
              </p>
              <Button variant="gradient" glow className="w-full">
                Try Glow Effect
              </Button>
            </Card>
          </div>
        </section>

        {/* Modal Component */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Beautiful Modal"
          variant="glass"
        >
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              This is a beautiful modal with glassmorphism effects and smooth animations.
            </p>
            <Input
              label="Your Name"
              placeholder="Enter your name"
              leftIcon={<User className="h-4 w-4" />}
            />
            <div className="flex gap-3 pt-4">
              <Button variant="primary" className="flex-1">Save</Button>
              <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default UIShowcase;
