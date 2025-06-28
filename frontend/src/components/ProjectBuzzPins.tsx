import React from "react";
import { PinContainer } from "./ui/3d-pin";
import {
  Code,
  Users,
  Zap,
  Shield,
  Download,
  ShoppingCart,
  Globe,
  CheckCircle
} from "lucide-react";

// Why Choose ProjectBuzz Section with 3D Pins
export function WhyChooseProjectBuzzPins() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Why Choose ProjectBuzz?
          </h2>
          <p className="text-lg text-muted-foreground">
            Trusted platform for digital projects
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Secure Transactions Pin */}
          <div className="flex justify-center">
            <PinContainer title="Secure Platform" href="/projects">
              <div className="flex flex-col p-6 tracking-tight text-slate-100/70 w-[20rem] h-[20rem] bg-gradient-to-b from-slate-900/40 to-slate-800/20 backdrop-blur-sm border border-slate-700/30 rounded-2xl">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-slate-300" />
                  <div className="text-xs text-slate-400">Enterprise Security</div>
                </div>

                <div className="flex-1 mt-4 space-y-4">
                  <div className="text-2xl font-bold text-slate-100">
                    Secure Transactions
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-3xl font-bold text-slate-200">100%</div>
                      <div className="text-xs text-slate-400">Encrypted</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-3xl font-bold text-slate-200">24/7</div>
                      <div className="text-xs text-slate-400">Protected</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle className="w-3 h-3 text-slate-300" />
                      <span>SSL Encryption</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle className="w-3 h-3 text-slate-300" />
                      <span>Secure Payments</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="text-xs text-slate-400">
                      Industry standard security
                    </div>
                    <div className="text-slate-200 text-sm font-medium">
                      Learn More →
                    </div>
                  </div>
                </div>
              </div>
            </PinContainer>
          </div>

          {/* Instant Download Pin */}
          <div className="flex justify-center">
            <PinContainer title="Instant Access" href="/projects">
              <div className="flex flex-col p-6 tracking-tight text-slate-100/70 w-[20rem] h-[20rem] bg-gradient-to-b from-slate-900/40 to-slate-800/20 backdrop-blur-sm border border-slate-700/30 rounded-2xl">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-slate-300" />
                  <div className="text-xs text-slate-400">Lightning Fast</div>
                </div>

                <div className="flex-1 mt-4 space-y-4">
                  <div className="text-2xl font-bold text-slate-100">
                    Instant Downloads
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-3xl font-bold text-slate-200">&lt;1s</div>
                      <div className="text-xs text-slate-400">Download</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-3xl font-bold text-slate-200">24/7</div>
                      <div className="text-xs text-slate-400">Access</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Download className="w-3 h-3 text-slate-300" />
                      <span>ZIP Files</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Code className="w-3 h-3 text-slate-300" />
                      <span>Source Code</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="text-xs text-slate-400">
                      Ready to use immediately
                    </div>
                    <div className="text-slate-200 text-sm font-medium">
                      Try Now →
                    </div>
                  </div>
                </div>
              </div>
            </PinContainer>
          </div>

          {/* Community Pin */}
          <div className="flex justify-center">
            <PinContainer title="Join Community" href="/about">
              <div className="flex flex-col p-6 tracking-tight text-slate-100/70 w-[20rem] h-[20rem] bg-gradient-to-b from-slate-900/40 to-slate-800/20 backdrop-blur-sm border border-slate-700/30 rounded-2xl">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-slate-300" />
                  <div className="text-xs text-slate-400">Growing Community</div>
                </div>

                <div className="flex-1 mt-4 space-y-4">
                  <div className="text-2xl font-bold text-slate-100">
                    Verified Sellers
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-3xl font-bold text-slate-200">1K+</div>
                      <div className="text-xs text-slate-400">Developers</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-3xl font-bold text-slate-200">500+</div>
                      <div className="text-xs text-slate-400">Projects</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle className="w-3 h-3 text-slate-300" />
                      <span>Quality Reviewed</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Globe className="w-3 h-3 text-slate-300" />
                      <span>Global Network</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="text-xs text-slate-400">
                      Trusted developers worldwide
                    </div>
                    <div className="text-slate-200 text-sm font-medium">
                      Join →
                    </div>
                  </div>
                </div>
              </div>
            </PinContainer>
          </div>
        </div>
      </div>
    </section>
  );
}

// How It Works Section with 3D Pins
export function HowItWorksPins() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Get started in three simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="flex justify-center">
            <PinContainer title="Browse Projects" href="/projects">
              <div className="flex flex-col p-6 tracking-tight text-slate-100/70 w-[18rem] h-[18rem] bg-gradient-to-b from-slate-900/40 to-slate-800/20 backdrop-blur-sm border border-slate-700/30 rounded-2xl">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-900 text-xs font-bold flex items-center justify-center">1</div>
                  <div className="text-xs text-slate-400">First Step</div>
                </div>

                <div className="flex-1 mt-4 space-y-4">
                  <div className="text-xl font-bold text-slate-100">
                    Browse & Discover
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Globe className="w-3 h-3 text-slate-300" />
                      <span>Explore Projects</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Code className="w-3 h-3 text-slate-300" />
                      <span>Filter by Tech</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle className="w-3 h-3 text-slate-300" />
                      <span>View Previews</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400">
                    Explore hundreds of quality projects
                  </div>
                </div>
              </div>
            </PinContainer>
          </div>

          {/* Step 2 */}
          <div className="flex justify-center">
            <PinContainer title="Secure Purchase" href="/projects">
              <div className="flex flex-col p-6 tracking-tight text-slate-100/70 w-[18rem] h-[18rem] bg-gradient-to-b from-slate-900/40 to-slate-800/20 backdrop-blur-sm border border-slate-700/30 rounded-2xl">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-900 text-xs font-bold flex items-center justify-center">2</div>
                  <div className="text-xs text-slate-400">Secure Payment</div>
                </div>

                <div className="flex-1 mt-4 space-y-4">
                  <div className="text-xl font-bold text-slate-100">
                    Purchase & Access
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Shield className="w-3 h-3 text-slate-300" />
                      <span>Secure Payment</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <ShoppingCart className="w-3 h-3 text-slate-300" />
                      <span>Instant Processing</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle className="w-3 h-3 text-slate-300" />
                      <span>Money Back Guarantee</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400">
                    Safe and encrypted transactions
                  </div>
                </div>
              </div>
            </PinContainer>
          </div>

          {/* Step 3 */}
          <div className="flex justify-center">
            <PinContainer title="Download & Use" href="/dashboard">
              <div className="flex flex-col p-6 tracking-tight text-slate-100/70 w-[18rem] h-[18rem] bg-gradient-to-b from-slate-900/40 to-slate-800/20 backdrop-blur-sm border border-slate-700/30 rounded-2xl">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-900 text-xs font-bold flex items-center justify-center">3</div>
                  <div className="text-xs text-slate-400">Ready to Use</div>
                </div>

                <div className="flex-1 mt-4 space-y-4">
                  <div className="text-xl font-bold text-slate-100">
                    Build & Launch
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Download className="w-3 h-3 text-slate-300" />
                      <span>Instant Download</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Zap className="w-3 h-3 text-slate-300" />
                      <span>Deploy Anywhere</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Code className="w-3 h-3 text-slate-300" />
                      <span>Full Source Code</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400">
                    Start building immediately
                  </div>
                </div>
              </div>
            </PinContainer>
          </div>
        </div>
      </div>
    </section>
  );
}

// Join Our Community Section with 3D Pins
export function JoinCommunityPins() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Join Our Community
          </h2>
          <p className="text-lg text-muted-foreground">
            Connect with developers worldwide
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Active Community Pin */}
          <div className="flex justify-center">
            <PinContainer title="Active Community" href="/about">
              <div className="flex flex-col p-6 tracking-tight text-slate-100/70 w-[20rem] h-[20rem] bg-gradient-to-b from-slate-900/40 via-blue-950/20 to-slate-800/20 backdrop-blur-sm border border-blue-500/20 rounded-2xl">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-300" />
                  <div className="text-xs text-slate-400">Growing Network</div>
                </div>

                <div className="flex-1 mt-4 space-y-4">
                  <div className="text-2xl font-bold text-slate-100">
                    Active Community
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-3xl font-bold text-blue-300">1K+</div>
                      <div className="text-xs text-slate-400">Developers</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-3xl font-bold text-blue-200">24/7</div>
                      <div className="text-xs text-slate-400">Support</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle className="w-3 h-3 text-blue-300" />
                      <span>Knowledge Sharing</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Users className="w-3 h-3 text-blue-300" />
                      <span>Peer Support</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="text-xs text-slate-400">
                      Join developers sharing knowledge
                    </div>
                    <div className="text-blue-300 text-sm font-medium">
                      Connect →
                    </div>
                  </div>
                </div>
              </div>
            </PinContainer>
          </div>

          {/* Growing Platform Pin */}
          <div className="flex justify-center">
            <PinContainer title="Growing Platform" href="/projects">
              <div className="flex flex-col p-6 tracking-tight text-slate-100/70 w-[20rem] h-[20rem] bg-gradient-to-b from-slate-900/40 via-emerald-950/20 to-slate-800/20 backdrop-blur-sm border border-emerald-500/20 rounded-2xl">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-emerald-300" />
                  <div className="text-xs text-slate-400">Expanding Reach</div>
                </div>

                <div className="flex-1 mt-4 space-y-4">
                  <div className="text-2xl font-bold text-slate-100">
                    Growing Platform
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-3xl font-bold text-emerald-300">500+</div>
                      <div className="text-xs text-slate-400">Projects</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-3xl font-bold text-emerald-200">95%</div>
                      <div className="text-xs text-slate-400">Success Rate</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle className="w-3 h-3 text-emerald-300" />
                      <span>Quality Projects</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Globe className="w-3 h-3 text-emerald-300" />
                      <span>Global Marketplace</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="text-xs text-slate-400">
                      Be part of growing marketplace
                    </div>
                    <div className="text-emerald-300 text-sm font-medium">
                      Explore →
                    </div>
                  </div>
                </div>
              </div>
            </PinContainer>
          </div>

          {/* Trusted & Secure Pin */}
          <div className="flex justify-center">
            <PinContainer title="Trusted Platform" href="/about">
              <div className="flex flex-col p-6 tracking-tight text-slate-100/70 w-[20rem] h-[20rem] bg-gradient-to-b from-slate-900/40 via-amber-950/20 to-slate-800/20 backdrop-blur-sm border border-amber-500/20 rounded-2xl">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-amber-300" />
                  <div className="text-xs text-slate-400">Enterprise Security</div>
                </div>

                <div className="flex-1 mt-4 space-y-4">
                  <div className="text-2xl font-bold text-slate-100">
                    Trusted & Secure
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-3xl font-bold text-amber-300">100%</div>
                      <div className="text-xs text-slate-400">Secure</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-3xl font-bold text-amber-200">SSL</div>
                      <div className="text-xs text-slate-400">Protected</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Shield className="w-3 h-3 text-amber-300" />
                      <span>Enterprise Security</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle className="w-3 h-3 text-amber-300" />
                      <span>Verified Transactions</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="text-xs text-slate-400">
                      Your projects are protected
                    </div>
                    <div className="text-amber-300 text-sm font-medium">
                      Learn More →
                    </div>
                  </div>
                </div>
              </div>
            </PinContainer>
          </div>
        </div>
      </div>
    </section>
  );
}