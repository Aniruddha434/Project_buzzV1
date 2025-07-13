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
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Why Choose ProjectBuzz?
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Trusted platform for digital projects
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Secure Platform Pin */}
          <div className="flex justify-center">
            <PinContainer title="Secure Platform" href="/projects">
              <div className="flex flex-col p-4 sm:p-6 tracking-tight text-slate-100/70 w-[280px] sm:w-[320px] h-[200px] sm:h-[240px] bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/60 backdrop-blur-sm border border-slate-700/40 rounded-2xl shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-slate-700/50">
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-slate-300" />
                  </div>
                  <div>
                    <div className="text-lg sm:text-xl font-bold text-slate-100">
                      Secure Platform
                    </div>
                    <div className="text-xs text-slate-400">Enterprise Security</div>
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Your transactions and data are protected with industry-standard security measures.
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span>SSL Encryption</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span>Secure Payments</span>
                    </div>
                  </div>
                </div>
              </div>
            </PinContainer>
          </div>

          {/* Instant Access Pin */}
          <div className="flex justify-center">
            <PinContainer title="Instant Access" href="/projects">
              <div className="flex flex-col p-4 sm:p-6 tracking-tight text-slate-100/70 w-[280px] sm:w-[320px] h-[200px] sm:h-[240px] bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/60 backdrop-blur-sm border border-slate-700/40 rounded-2xl shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-slate-700/50">
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                  </div>
                  <div>
                    <div className="text-lg sm:text-xl font-bold text-slate-100">
                      Instant Access
                    </div>
                    <div className="text-xs text-slate-400">Lightning Fast</div>
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Get immediate access to your purchased projects with instant downloads.
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Download className="w-3 h-3 text-blue-400" />
                      <span>ZIP Files</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Code className="w-3 h-3 text-blue-400" />
                      <span>Source Code</span>
                    </div>
                  </div>
                </div>
              </div>
            </PinContainer>
          </div>

          {/* Verified Sellers Pin */}
          <div className="flex justify-center">
            <PinContainer title="Verified Sellers" href="/about">
              <div className="flex flex-col p-4 sm:p-6 tracking-tight text-slate-100/70 w-[280px] sm:w-[320px] h-[200px] sm:h-[240px] bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/60 backdrop-blur-sm border border-slate-700/40 rounded-2xl shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-slate-700/50">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-lg sm:text-xl font-bold text-slate-100">
                      Verified Sellers
                    </div>
                    <div className="text-xs text-slate-400">Trusted Community</div>
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Connect with verified developers and quality-reviewed projects.
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span>Quality Reviewed</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Globe className="w-3 h-3 text-green-400" />
                      <span>Global Network</span>
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
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-muted/10 via-background to-muted/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Get started in three simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Step 1 */}
          <div className="flex justify-center">
            <PinContainer title="Browse Market" href="/market">
              <div className="flex flex-col p-4 sm:p-6 tracking-tight text-slate-100/70 w-[260px] sm:w-[300px] h-[180px] sm:h-[220px] bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/60 backdrop-blur-sm border border-slate-700/40 rounded-2xl shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center">1</div>
                  <div>
                    <div className="text-lg sm:text-xl font-bold text-slate-100">
                      Browse & Discover
                    </div>
                    <div className="text-xs text-slate-400">First Step</div>
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Explore our curated collection of quality projects.
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Globe className="w-3 h-3 text-blue-400" />
                      <span>Explore Projects</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Code className="w-3 h-3 text-blue-400" />
                      <span>Filter by Tech</span>
                    </div>
                  </div>
                </div>
              </div>
            </PinContainer>
          </div>

          {/* Step 2 */}
          <div className="flex justify-center">
            <PinContainer title="Secure Purchase" href="/projects">
              <div className="flex flex-col p-4 sm:p-6 tracking-tight text-slate-100/70 w-[260px] sm:w-[300px] h-[180px] sm:h-[220px] bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/60 backdrop-blur-sm border border-slate-700/40 rounded-2xl shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-green-500 text-white text-sm font-bold flex items-center justify-center">2</div>
                  <div>
                    <div className="text-lg sm:text-xl font-bold text-slate-100">
                      Purchase & Access
                    </div>
                    <div className="text-xs text-slate-400">Secure Payment</div>
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Complete your purchase with secure payment processing.
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Shield className="w-3 h-3 text-green-400" />
                      <span>Secure Payment</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <ShoppingCart className="w-3 h-3 text-green-400" />
                      <span>Instant Processing</span>
                    </div>
                  </div>
                </div>
              </div>
            </PinContainer>
          </div>

          {/* Step 3 */}
          <div className="flex justify-center">
            <PinContainer title="Download & Use" href="/dashboard">
              <div className="flex flex-col p-4 sm:p-6 tracking-tight text-slate-100/70 w-[260px] sm:w-[300px] h-[180px] sm:h-[220px] bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/60 backdrop-blur-sm border border-slate-700/40 rounded-2xl shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-purple-500 text-white text-sm font-bold flex items-center justify-center">3</div>
                  <div>
                    <div className="text-lg sm:text-xl font-bold text-slate-100">
                      Download & Use
                    </div>
                    <div className="text-xs text-slate-400">Ready to Use</div>
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Download your project and start building immediately.
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Download className="w-3 h-3 text-purple-400" />
                      <span>Instant Download</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Code className="w-3 h-3 text-purple-400" />
                      <span>Full Source Code</span>
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

// Join Our Community Section with 3D Pins
export function JoinCommunityPins() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Join Our Community
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with developers worldwide
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Active Community Pin */}
          <div className="flex justify-center">
            <PinContainer title="Active Community" href="/about">
              <div className="flex flex-col p-4 sm:p-6 tracking-tight text-slate-100/70 w-[280px] sm:w-[320px] h-[200px] sm:h-[240px] bg-gradient-to-br from-slate-900/60 via-blue-950/30 to-slate-900/60 backdrop-blur-sm border border-blue-500/30 rounded-2xl shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-300" />
                  </div>
                  <div>
                    <div className="text-lg sm:text-xl font-bold text-slate-100">
                      Active Community
                    </div>
                    <div className="text-xs text-slate-400">Growing Network</div>
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Connect with developers and share knowledge in our growing community.
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle className="w-3 h-3 text-blue-400" />
                      <span>Knowledge Sharing</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Users className="w-3 h-3 text-blue-400" />
                      <span>Peer Support</span>
                    </div>
                  </div>
                </div>
              </div>
            </PinContainer>
          </div>

          {/* Growing Platform Pin */}
          <div className="flex justify-center">
            <PinContainer title="Growing Platform" href="/projects">
              <div className="flex flex-col p-4 sm:p-6 tracking-tight text-slate-100/70 w-[280px] sm:w-[320px] h-[200px] sm:h-[240px] bg-gradient-to-br from-slate-900/60 via-emerald-950/30 to-slate-900/60 backdrop-blur-sm border border-emerald-500/30 rounded-2xl shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-emerald-500/20">
                    <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-300" />
                  </div>
                  <div>
                    <div className="text-lg sm:text-xl font-bold text-slate-100">
                      Growing Platform
                    </div>
                    <div className="text-xs text-slate-400">Expanding Reach</div>
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Be part of our expanding global marketplace for digital projects.
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                      <span>Quality Projects</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Globe className="w-3 h-3 text-emerald-400" />
                      <span>Global Marketplace</span>
                    </div>
                  </div>
                </div>
              </div>
            </PinContainer>
          </div>
          {/* Trusted & Secure Pin */}
          <div className="flex justify-center">
            <PinContainer title="Trusted Platform" href="/about">
              <div className="flex flex-col p-4 sm:p-6 tracking-tight text-slate-100/70 w-[280px] sm:w-[320px] h-[200px] sm:h-[240px] bg-gradient-to-br from-slate-900/60 via-amber-950/30 to-slate-900/60 backdrop-blur-sm border border-amber-500/30 rounded-2xl shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-amber-500/20">
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" />
                  </div>
                  <div>
                    <div className="text-lg sm:text-xl font-bold text-slate-100">
                      Trusted & Secure
                    </div>
                    <div className="text-xs text-slate-400">Enterprise Security</div>
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Trust in our secure platform with enterprise-grade protection.
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Shield className="w-3 h-3 text-amber-400" />
                      <span>Enterprise Security</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle className="w-3 h-3 text-amber-400" />
                      <span>Verified Transactions</span>
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