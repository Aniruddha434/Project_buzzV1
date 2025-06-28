import React from 'react';
import { WhyChooseProjectBuzzPins, HowItWorksPins, JoinCommunityPins } from '../components/ProjectBuzzPins';
import { PinContainer } from '../components/ui/3d-pin';
import { Code, Users, Zap, Shield, Download, CheckCircle } from 'lucide-react';

const TestPins: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          ProjectBuzz 3D Pin Components
        </h1>
        <p className="text-muted-foreground">
          Professional 3D interactive components with minimal color design
        </p>
      </div>

      {/* Single Pin Demo */}
      <section className="py-8">
        <h2 className="text-2xl font-bold text-center text-foreground mb-8">
          Individual Pin Example
        </h2>
        <div className="flex justify-center">
          <PinContainer title="Explore ProjectBuzz" href="/projects">
            <div className="flex flex-col p-6 tracking-tight text-slate-100/70 w-[20rem] h-[20rem] bg-gradient-to-b from-slate-900/40 to-slate-800/20 backdrop-blur-sm border border-slate-700/30 rounded-2xl">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-slate-300" />
                <div className="text-xs text-slate-400">Digital Marketplace</div>
              </div>

              <div className="flex-1 mt-4 space-y-4">
                <div className="text-2xl font-bold text-slate-100">
                  ProjectBuzz
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-3xl font-bold text-slate-200">500+</div>
                    <div className="text-xs text-slate-400">Projects</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-3xl font-bold text-slate-200">99%</div>
                    <div className="text-xs text-slate-400">Satisfaction</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <Shield className="w-3 h-3 text-slate-300" />
                    <span>Secure Platform</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <Download className="w-3 h-3 text-slate-300" />
                    <span>Instant Downloads</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <Users className="w-3 h-3 text-slate-300" />
                    <span>Verified Sellers</span>
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div className="text-xs text-slate-400">
                    Join thousands of developers
                  </div>
                  <div className="text-slate-200 text-sm font-medium">
                    Explore →
                  </div>
                </div>
              </div>
            </div>
          </PinContainer>
        </div>
      </section>

      {/* Why Choose ProjectBuzz Section */}
      <WhyChooseProjectBuzzPins />

      {/* How It Works Section */}
      <HowItWorksPins />

      {/* Join Our Community Section */}
      <JoinCommunityPins />

      {/* Usage Instructions */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Integration Complete
            </h2>
            <p className="text-lg text-muted-foreground">
              3D Pin components are now integrated into ProjectBuzz homepage
            </p>
          </div>

          <div className="bg-card rounded-xl p-8 border border-border">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              ✅ What's Been Implemented:
            </h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-slate-300" />
                <span>Professional 3D pin components with minimal color design</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-slate-300" />
                <span>Replaced "Why Choose ProjectBuzz" section with interactive 3D pins</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-slate-300" />
                <span>Replaced "How It Works" section with step-by-step 3D pins</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-slate-300" />
                <span>Replaced "Join Our Community" section with colorful 3D pins</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-slate-300" />
                <span>Consistent dark theme with slate colors throughout</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-slate-300" />
                <span>React Router integration for seamless navigation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-slate-300" />
                <span>Responsive design that works on all devices</span>
              </li>
            </ul>

            <div className="mt-8 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> The 3D pin components are now live on your homepage at{' '}
                <code className="bg-background px-2 py-1 rounded text-foreground">
                  http://localhost:5174
                </code>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TestPins;
