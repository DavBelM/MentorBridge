"use client";

import React from 'react';

const FeatureShowcase = () => {
  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8">Featured Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature items would go here */}
          <div className="p-6 border rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg mb-2">Personalized Matching</h3>
            <p className="text-muted-foreground">Our algorithm ensures the perfect mentor-mentee pairing based on goals and expertise.</p>
          </div>
          <div className="p-6 border rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg mb-2">Progress Tracking</h3>
            <p className="text-muted-foreground">Monitor your growth with detailed analytics and milestone achievements.</p>
          </div>
          <div className="p-6 border rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg mb-2">Community Support</h3>
            <p className="text-muted-foreground">Connect with peers facing similar challenges and share experiences.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureShowcase;

