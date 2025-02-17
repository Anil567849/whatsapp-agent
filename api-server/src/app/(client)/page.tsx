import React from 'react';
import { ArrowRight, BarChart2, Zap, BadgeDollarSign, Users } from 'lucide-react';
import FeatureCard from './_components/shared/featureCard';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">

      {/* Navbar Section */}
      <nav className="container mx-auto px-6 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Zap className="w-8 h-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-800">Whatsapp Agent</span>
          </div>
          <div className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-600 hover:text-indigo-600">Features</a>
            <a href="#pricing" className="text-gray-600 hover:text-indigo-600">Pricing</a>
            <a href="#about" className="text-gray-600 hover:text-indigo-600">About</a>
          </div>
          <button className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition-colors">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-20 pb-32">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8">
            Transform your business with Whatsapp Agent
          </h1>
          <p className="text-xl text-gray-600 mb-12 leading-relaxed">
            Whatsapp Agent manages customers from start to finish, learning from every conversation to enhance sales and customer service.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="flex items-center justify-center bg-indigo-600 text-white px-8 py-4 rounded-full hover:bg-indigo-700 transition-colors">
              Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            <button className="flex items-center justify-center bg-white text-indigo-600 px-8 py-4 rounded-full border-2 border-indigo-600 hover:bg-indigo-50 transition-colors">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-24" id="features">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600">Everything you need to automate your business</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            <FeatureCard
              icon={<BarChart2 className="w-12 h-12 text-indigo-600" />}
              title="Customer Handling"
              description="It handles customers from start to finish, without any human intervention."
            />
            <FeatureCard
              icon={<Users className="w-12 h-12 text-indigo-600" />}
              title="Deep Insights"
              description="Get deep insights into your customers and their behavior."
            />
            <FeatureCard
              icon={<BadgeDollarSign className="w-12 h-12 text-indigo-600" />}
              title="Grow Sales"
              description="Understand what your customers want and grow your sales."
            />
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="bg-indigo-50 py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Trusted by Industry Leaders</h2>
            <p className="text-xl text-gray-600">Join thousands of companies automating their business</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 items-center justify-items-center">
            <img src="https://img.freepik.com/free-psd/google-icon-isolated-3d-render-illustration_47987-9777.jpg?t=st=1739206359~exp=1739209959~hmac=7ec0dc6bbfd4930728a9ff2f932d3eeb46dc5cc26b2bf8f494a9850e0365a245&w=1380" alt="Company logo" className="h-12" />
            <img src="https://img.freepik.com/free-psd/facebook-logo-3d-social-media-icon-isolated_47987-11965.jpg?t=st=1739206393~exp=1739209993~hmac=0bdd59495a264e9483bd0d4f25df8db632f91a3a6da6409f7bd824642b569b2b&w=1380" alt="Company logo" className="h-12" />
            <img src="https://img.freepik.com/premium-photo/amazon-logo-icon-illustration-vector_895118-6132.jpg?w=1480" alt="Company logo" className="h-12" />
            <img src="https://img.freepik.com/premium-photo/black-symbol-with-symbol-that-says-t-it_973002-2186.jpg?w=1380" alt="Company logo" className="h-12" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-3xl py-16 px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-8">Ready to Transform Your Business?</h2>
            <p className="text-xl text-indigo-100 mb-12 max-w-2xl mx-auto">
              Join thousands of businesses who have already revolutionized their sales with our platform.
            </p>
            <button className="bg-white text-indigo-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-indigo-50 transition-colors">
              Get Started Now
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Zap className="w-6 h-6 text-indigo-600" />
              <span className="text-lg font-bold text-gray-800">Whatsapp Agent</span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-600 hover:text-indigo-600">Privacy</a>
              <a href="#" className="text-gray-600 hover:text-indigo-600">Terms</a>
              <a href="#" className="text-gray-600 hover:text-indigo-600">Contact</a>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-500">
            © 2025 Whatsapp Agent. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;