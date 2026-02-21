import { useState } from "react";
import { Phone, Thermometer, Tag, MapPin, Wrench } from "lucide-react";
import BTUCalculator from "@/components/btu-calculator";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 via-emerald-50 to-cyan-100 relative">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-teal-200/30 to-emerald-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-cyan-200/25 to-teal-200/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-emerald-200/20 to-teal-200/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-gradient-to-br from-cyan-300/15 to-teal-300/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-br from-emerald-300/20 to-cyan-300/15 rounded-full blur-2xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 glass-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-netr-blue rounded-xl flex items-center justify-center shadow-lg">
                <Thermometer className="text-white text-lg lg:text-xl" />
              </div>
              <div>
                <h1 className="text-lg lg:text-xl font-bold text-netr-blue">N.E.T.R., Inc</h1>
                <p className="text-xs lg:text-sm text-gray-600">BTU Calculator</p>
              </div>
            </div>
            <div className="hidden xl:flex items-center space-x-3">
              <span className="text-sm text-gray-600 whitespace-nowrap">New England's #1 Ductless Installer</span>
              <button className="netr-button px-2 py-1.5 rounded-lg shadow-lg whitespace-nowrap text-sm">
                <Phone className="mr-1.5 h-3.5 w-3.5" />
                781-933-6387
              </button>
            </div>
            <div className="hidden lg:block xl:hidden">
              <button className="netr-button px-2 py-1.5 rounded-lg shadow-lg whitespace-nowrap text-sm">
                <Phone className="mr-1.5 h-3.5 w-3.5" />
                Call Us
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center">
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-netr-blue mb-4">
            Professional BTU Calculator
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Calculate your home's heating and cooling requirements with our advanced HVAC load calculator. 
            Get accurate BTU estimates and equipment recommendations from New England's trusted HVAC experts.
          </p>
        </div>

        {/* BTU Calculator Component */}
        <BTUCalculator />

        {/* Features Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="glass-card rounded-2xl p-6 text-center">
            <div className="w-16 h-16 bg-netr-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Tag className="text-2xl text-netr-accent" />
            </div>
            <h3 className="text-xl font-semibold text-netr-blue mb-2">Expert Calculations</h3>
            <p className="text-gray-700 text-sm">Professional-grade BTU calculations based on ACCA Manual J standards and 35+ years of HVAC experience.</p>
          </div>
          <div className="glass-card rounded-2xl p-6 text-center">
            <div className="w-16 h-16 bg-netr-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MapPin className="text-2xl text-netr-accent" />
            </div>
            <h3 className="text-xl font-semibold text-netr-blue mb-2">Climate Zone Mapping</h3>
            <p className="text-gray-700 text-sm">Automatic climate zone detection for accurate regional heating and cooling load calculations.</p>
          </div>
          <div className="glass-card rounded-2xl p-6 text-center">
            <div className="w-16 h-16 bg-netr-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Wrench className="text-2xl text-netr-accent" />
            </div>
            <h3 className="text-xl font-semibold text-netr-blue mb-2">Equipment Matching</h3>
            <p className="text-gray-700 text-sm">Personalized equipment recommendations from top brands like Mitsubishi Electric, Bosch, and Lennox.</p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 bg-amber-50/70 backdrop-blur-sm border border-amber-200/50 rounded-2xl p-6">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 text-amber-600 text-xl mt-1 flex-shrink-0">⚠️</div>
            <div>
              <h4 className="font-semibold text-amber-800 mb-2">Important Disclaimer</h4>
              <p className="text-amber-700 text-sm leading-relaxed">
                <strong>Estimates only. Always consult HVAC professionals before installation.</strong> 
                These calculations provide general estimates based on standard industry formulas. Actual heating and cooling loads may vary based on specific building characteristics, local climate conditions, and other factors not captured in this calculator. For accurate sizing and professional installation, contact N.E.T.R., Inc. at <strong>781-933-6387</strong> for a comprehensive Manual J load calculation and site assessment.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-16 bg-netr-blue text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <Thermometer className="text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">N.E.T.R., Inc</h3>
                  <p className="text-blue-200 text-sm">New England Thermal Refrigeration</p>
                </div>
              </div>
              <p className="text-blue-200 mb-4">
                Solving residential and commercial HVAC problems since 1989. New England's #1 ductless installer with over 800 five-star reviews.
              </p>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-blue-200">Come FEEL the difference!</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-blue-200">
                <li>Ductless Mini-Split Installation</li>
                <li>Central Air Conditioning</li>
                <li>Gas Boiler Systems</li>
                <li>HVAC Maintenance</li>
                <li>Commercial Refrigeration</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <div className="space-y-2 text-sm text-blue-200">
                <div className="flex items-center">
                  <Phone className="mr-2 h-4 w-4" />
                  781-933-6387
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  North Andover, MA
                </div>
                <div className="flex items-center">
                  <span className="mr-2">⭐</span>
                  4.9/5 • 800+ Reviews
                </div>
              </div>
            </div>
          </div>
          <hr className="border-blue-400/20 my-8" />
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-blue-200">
              © 2025 N.E.T.R., Inc. All rights reserved. Licensed & Insured.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0 text-sm text-blue-200">
              <span>Mitsubishi Electric Elite Diamond Contractor</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
