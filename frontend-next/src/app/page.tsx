'use client';
import React from 'react';
import UrlShortener from '@/components/url/UrlShortener';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h2 className="text-5xl font-bold text-primary-lightest mb-4">
          Shorten Your URLs Now!
        </h2>
        <p className="text-xl text-primary-light">
          Create short, memorable links that are easy to share
        </p>
      </div>
      <UrlShortener />
    </div>
  );
};
