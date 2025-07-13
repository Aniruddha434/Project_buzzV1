import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Code,
  Shield,
  Heart,
  Star,
  CheckCircle,
  ArrowRight,
  Github,
  Linkedin,
  Mail,
  Award,
  Target,
  Eye,
  Zap,
  Users
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ProjectBuzzLogo from '../components/ui/ProjectBuzzLogo';
import { DevelopmentProcess } from '../components/ui/cards-stack-demo';

const About: React.FC = () => {
  // Set page title and meta tags
  useEffect(() => {
    document.title = 'About ProjectBuzz - Digital Marketplace for Developers';

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Learn about ProjectBuzz, the revolutionary digital marketplace founded by Aniruddha Gayki. Discover our mission to empower developers worldwide with high-quality projects and source code.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Learn about ProjectBuzz, the revolutionary digital marketplace founded by Aniruddha Gayki. Discover our mission to empower developers worldwide with high-quality projects and source code.';
      document.head.appendChild(meta);
    }

    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 'ProjectBuzz, Aniruddha Gayki, digital marketplace, developers, source code, projects, programming, software development');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'keywords';
      meta.content = 'ProjectBuzz, Aniruddha Gayki, digital marketplace, developers, source code, projects, programming, software development';
      document.head.appendChild(meta);
    }

    return () => {
      document.title = 'ProjectBuzz - Digital Marketplace';
    };
  }, []);



  const features = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Secure Transactions',
      description: 'Enterprise-grade security with encrypted payments and secure file delivery.'
    },
    {
      icon: <Code className="h-8 w-8" />,
      title: 'Quality Code',
      description: 'Curated digital projects with clean, well-documented source code.'
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Developer Community',
      description: 'Connect with talented developers and grow your skills together.'
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: 'Instant Access',
      description: 'Get immediate access to purchased projects with lifetime updates.'
    }
  ];

  const values = [
    {
      icon: <Target className="h-6 w-6" />,
      title: 'Innovation',
      description: 'Pushing the boundaries of what\'s possible in digital project sharing.'
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: 'Community',
      description: 'Building a supportive ecosystem where developers thrive together.'
    },
    {
      icon: <Eye className="h-6 w-6" />,
      title: 'Transparency',
      description: 'Open, honest communication and fair practices for all users.'
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: 'Excellence',
      description: 'Maintaining the highest standards in code quality and user experience.'
    }
  ];

  return (
    <div className="min-h-screen bg-black pt-16">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              About <span className="text-primary">ProjectBuzz</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Empowering developers worldwide with a revolutionary digital marketplace
              for high-quality projects, source code, and innovative solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/market">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                  Explore Market
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg">
                  Join Community
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Development Process Section */}
      <DevelopmentProcess />

      {/* Founder Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Meet Our Founder</h2>
            <p className="text-lg text-muted-foreground">
              The visionary behind ProjectBuzz's revolutionary platform
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="p-8 border border-border">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                {/* Founder Image */}
                <div className="lg:col-span-1">
                  <div className="relative">
                    <div className="w-64 h-64 mx-auto bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
                      <div className="w-56 h-56 bg-muted rounded-full flex items-center justify-center">
                        <Users className="h-24 w-24 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium">
                        Founder & CEO
                      </div>
                    </div>
                  </div>
                </div>

                {/* Founder Info */}
                <div className="lg:col-span-2">
                  <h3 className="text-3xl font-bold text-foreground mb-4">Aniruddha Gayki</h3>
                  <p className="text-lg text-muted-foreground mb-6">
                    Passionate developer and entrepreneur with a vision to democratize access to
                    high-quality digital projects. Aniruddha founded ProjectBuzz to bridge the gap
                    between talented developers and those seeking innovative solutions.
                  </p>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-foreground">Full-Stack Developer</h4>
                        <p className="text-sm text-muted-foreground">Expert in modern web technologies and scalable architectures</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-foreground">Tech Entrepreneur</h4>
                        <p className="text-sm text-muted-foreground">Building innovative platforms that empower developer communities</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-foreground">Community Builder</h4>
                        <p className="text-sm text-muted-foreground">Fostering collaboration and knowledge sharing among developers</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button variant="outline" size="sm" leftIcon={<Github className="h-4 w-4" />}>
                      GitHub
                    </Button>
                    <Button variant="outline" size="sm" leftIcon={<Linkedin className="h-4 w-4" />}>
                      LinkedIn
                    </Button>
                    <Button variant="outline" size="sm" leftIcon={<Mail className="h-4 w-4" />}>
                      Contact
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Mission */}
            <Card className="p-8 border border-border">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Our Mission</h3>
              </div>
              <p className="text-muted-foreground text-center leading-relaxed">
                To create the world's most trusted marketplace for digital projects,
                where developers can discover, share, and monetize high-quality code
                while building meaningful connections within a thriving community.
              </p>
            </Card>

            {/* Vision */}
            <Card className="p-8 border border-border">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Eye className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Our Vision</h3>
              </div>
              <p className="text-muted-foreground text-center leading-relaxed">
                To democratize access to innovative digital solutions and empower
                every developer to turn their creative ideas into successful projects
                that make a positive impact on the global tech community.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose ProjectBuzz?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover what makes ProjectBuzz the preferred platform for developers worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 text-center border border-border hover:border-primary/30 transition-colors">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Core Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do at ProjectBuzz
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="p-6 border border-border">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary flex-shrink-0">
                    {value.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Story */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 border border-border">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-4">The ProjectBuzz Story</h2>
                <p className="text-lg text-muted-foreground">
                  From vision to reality - how ProjectBuzz came to life
                </p>
              </div>

              <div className="space-y-6 text-muted-foreground">
                <p className="text-lg leading-relaxed">
                  ProjectBuzz was born from a simple yet powerful idea: <strong className="text-foreground">
                  every developer should have access to high-quality digital projects and the opportunity
                  to share their own creations with the world.</strong>
                </p>

                <p className="leading-relaxed">
                  Founded by <strong className="text-foreground">Aniruddha Gayki</strong>, a passionate
                  full-stack developer, ProjectBuzz emerged from the frustration of searching for reliable,
                  well-documented code projects and the difficulty of monetizing personal development work.
                </p>

                <p className="leading-relaxed">
                  Today, ProjectBuzz serves as a bridge between talented developers who create amazing
                  projects and those who need innovative solutions. Our platform ensures that quality
                  code gets the recognition it deserves while providing developers with a sustainable
                  way to earn from their expertise.
                </p>

                <p className="leading-relaxed">
                  With features like <strong className="text-foreground">secure payments</strong>,
                  <strong className="text-foreground"> instant access</strong>, and
                  <strong className="text-foreground"> comprehensive project documentation</strong>,
                  we've created an ecosystem where both buyers and sellers can thrive.
                </p>
              </div>

              <div className="mt-8 p-6 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center space-x-3 mb-3">
                  <Star className="h-6 w-6 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Our Commitment</h3>
                </div>
                <p className="text-muted-foreground">
                  We're committed to maintaining the highest standards of quality, security, and
                  user experience. Every project on our platform is carefully reviewed to ensure
                  it meets our community's expectations.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Join the ProjectBuzz Community?
          </h2>
          <p className="text-lg mb-8 text-primary-foreground/80">
            Whether you're looking to discover amazing projects or share your own creations,
            ProjectBuzz is the perfect platform to start your journey.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/market">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="h-5 w-5" />}
                className="bg-background text-foreground hover:bg-background/90"
              >
                Browse Market
              </Button>
            </Link>
            <Link to="/login">
              <Button
                variant="outline"
                size="lg"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                Start Selling
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-primary-foreground/70">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Free to join
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Secure platform
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Global community
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="mb-4">
                <ProjectBuzzLogo
                  size="md"
                  variant="default"
                  showTagline={true}
                />
              </div>
              <p className="text-muted-foreground mb-4 max-w-md">
                Empowering developers worldwide with a revolutionary digital marketplace
                for high-quality projects, source code, and innovative solutions.
              </p>
              <p className="text-sm text-muted-foreground">
                Founded by <strong className="text-foreground">Aniruddha Gayki</strong> •
                Building the future of digital project sharing
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">Platform</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/market" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Browse Market
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Start Selling
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Join Community
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">Connect</h3>
              <ul className="space-y-2">
                <li>
                  <a href="mailto:info@projectbuzz.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Contact Support
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    GitHub
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Twitter
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} ProjectBuzz. All rights reserved. Created by Aniruddha Gayki.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="mailto:info@projectbuzz.com" className="text-muted-foreground hover:text-foreground transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;
