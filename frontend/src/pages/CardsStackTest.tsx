import React from 'react';
import { DevelopmentProcess, FeaturedProjects, PlatformAchievements } from '../components/ui/cards-stack-demo';

const CardsStackTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Cards Stack Component Test
          </h1>
          <p className="text-lg text-muted-foreground">
            Testing the cards-stack component integration with ProjectBuzz-specific content
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center space-x-4 mb-8">
          <a href="#process" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
            Development Process
          </a>
          <a href="#projects" className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90">
            Featured Projects
          </a>
          <a href="#achievements" className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90">
            Platform Achievements
          </a>
        </div>
      </div>

      {/* Development Process Section */}
      <section id="process">
        <DevelopmentProcess />
      </section>

      {/* Featured Projects Section */}
      <section id="projects">
        <FeaturedProjects />
      </section>

      {/* Platform Achievements Section */}
      <section id="achievements">
        <PlatformAchievements />
      </section>

      {/* Back to About */}
      <div className="container mx-auto py-8 px-4 text-center">
        <a 
          href="/about" 
          className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          ← Back to About Page
        </a>
      </div>
    </div>
  );
};

export default CardsStackTest;
