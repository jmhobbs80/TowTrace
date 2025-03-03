import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { isAuthenticated } from '../lib/auth';

/**
 * Home/Landing Page Component
 * Showcases the TowTrace application features with Apple-inspired design
 */
export default function Home() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Check authentication status on client-side only
  useEffect(() => {
    setAuthenticated(isAuthenticated());
    
    // Add scroll listener for header effects
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <>
      <Head>
        <title>TowTrace | Modern Transport Management Solution</title>
        <meta name="description" content="TowTrace provides comprehensive towing and transport management with real-time GPS tracking, multi-vehicle VIN scanning, and fleet management tools." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="TowTrace - Transport Management Made Simple" />
        <meta property="og:description" content="Streamline your towing and transport operations with real-time tracking, fleet management, and more." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.towtrace.com" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className={`sticky top-0 z-40 transition-all duration-200 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-xl shadow-md">
                  TT
                </div>
                <span className="ml-3 text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-800">TowTrace</span>
              </div>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex space-x-8">
                <a href="#features" className="px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 transition-colors">Features</a>
                <a href="#how-it-works" className="px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 transition-colors">How It Works</a>
                <a href="#about" className="px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 transition-colors">About</a>
                <a href="#contact" className="px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 transition-colors">Contact</a>
              </nav>
              
              {/* Mobile Menu Button */}
              <div className="md:hidden flex items-center">
                <button 
                  type="button" 
                  className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  <span className="sr-only">Open main menu</span>
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
              
              {/* Auth Button */}
              <div className="hidden md:block">
                {authenticated ? (
                  <Link href="/dashboard">
                    <a className="btn btn-primary">
                      Dashboard
                    </a>
                  </Link>
                ) : (
                  <Link href="/login">
                    <a className="btn btn-primary">
                      Log In
                    </a>
                  </Link>
                )}
              </div>
            </div>
          </div>
          
          {/* Mobile Menu (slide down) */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-200 shadow-lg animate-fadeIn">
              <div className="pt-2 pb-3 space-y-1 px-2">
                <a 
                  href="#features" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a 
                  href="#how-it-works" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  How It Works
                </a>
                <a 
                  href="#about" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </a>
                <a 
                  href="#contact" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </a>
                {authenticated ? (
                  <Link href="/dashboard">
                    <a className="block w-full text-center mt-5 px-4 py-3 rounded-md shadow-sm text-base font-medium text-white bg-gradient-primary hover:from-primary-700 hover:to-primary-900"
                    onClick={() => setMobileMenuOpen(false)}>
                      Dashboard
                    </a>
                  </Link>
                ) : (
                  <Link href="/login">
                    <a className="block w-full text-center mt-5 px-4 py-3 rounded-md shadow-sm text-base font-medium text-white bg-gradient-primary hover:from-primary-700 hover:to-primary-900"
                    onClick={() => setMobileMenuOpen(false)}>
                      Log In
                    </a>
                  </Link>
                )}
              </div>
            </div>
          )}
        </header>

        {/* Hero Section */}
        <section className="relative pt-16 pb-32 overflow-hidden">
          {/* Background gradient & decoration */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary-50 to-white -z-10"></div>
          <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-white to-transparent -z-10"></div>
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob -z-10"></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 -z-10"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 lg:pt-16">
            <div className="lg:flex lg:items-center lg:justify-between">
              <div className="lg:w-1/2 text-center lg:text-left animate-slideUp">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                  Transport Management
                  <span className="block bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-900">Made Simple</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-xl mx-auto lg:mx-0">
                  TowTrace provides comprehensive towing and transport management for drivers and dispatchers, with real-time tracking, fleet management, and more.
                </p>
                <div className="flex flex-col sm:flex-row sm:justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                  {authenticated ? (
                    <Link href="/dashboard">
                      <a className="btn btn-primary text-base px-8 py-3 shadow-lg transform transition hover:-translate-y-0.5">
                        Go to Dashboard
                      </a>
                    </Link>
                  ) : (
                    <Link href="/login">
                      <a className="btn btn-primary text-base px-8 py-3 shadow-lg transform transition hover:-translate-y-0.5">
                        Get Started Free
                      </a>
                    </Link>
                  )}
                  <a href="#how-it-works" className="btn btn-secondary text-base px-8 py-3">
                    See How It Works
                  </a>
                </div>
                
                {/* Trusted by */}
                <div className="mt-12 hidden lg:block">
                  <p className="text-sm font-medium text-gray-500 mb-4">TRUSTED BY TRANSPORT COMPANIES</p>
                  <div className="flex items-center justify-start space-x-8">
                    <div className="text-gray-400 font-medium">Company A</div>
                    <div className="text-gray-400 font-medium">Company B</div>
                    <div className="text-gray-400 font-medium">Company C</div>
                  </div>
                </div>
              </div>
              
              {/* Hero image */}
              <div className="hidden lg:block lg:w-1/2 pl-10 mt-10 lg:mt-0 animate-fadeIn">
                <div className="relative">
                  <div className="absolute -top-6 -left-6 w-72 h-72 bg-primary-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                  <div className="absolute -bottom-6 -right-6 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                  
                  <div className="relative shadow-2xl rounded-2xl overflow-hidden border-8 border-white transform rotate-1">
                    {/* This would be a dashboard screenshot in a real implementation */}
                    <div className="aspect-w-16 aspect-h-9 bg-gray-100 w-full">
                      <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-200 to-white">
                        <div className="text-gray-400 text-xl">Dashboard Preview</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Comprehensive Transport Management</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Every feature you need to manage your fleet efficiently, track vehicles in real-time, and streamline your operations
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Multi-Vehicle VIN Scanning</h3>
                <p className="text-gray-600 mb-4">Scan and record multiple vehicle VINs with up to 4 optional photos per vehicle. Automatically fetch vehicle details.</p>
                <ul className="text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Integrated camera for VIN scanning
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Automatic vehicle data lookup
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Photo documentation storage
                  </li>
                </ul>
              </div>
              
              {/* Feature 2 */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Real-Time GPS Tracking</h3>
                <p className="text-gray-600 mb-4">Track your fleet in real-time with detailed location history, route optimization, and status monitoring.</p>
                <ul className="text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Interactive map interface
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Route optimization algorithms
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Real-time ETA calculations
                  </li>
                </ul>
              </div>
              
              {/* Feature 3 */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Dispatch & Management</h3>
                <p className="text-gray-600 mb-4">Easily assign jobs, manage routes with multiple stops, and get real-time status updates from drivers.</p>
                <ul className="text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Drag-and-drop job assignments
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Multi-stop route planning
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Real-time status notifications
                  </li>
                </ul>
              </div>
              
              {/* Feature 4 */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Pre-Trip Inspections</h3>
                <p className="text-gray-600 mb-4">Document vehicle conditions with customizable inspection forms, photo uploads, and compliance reports.</p>
                <ul className="text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    FMCSA compliant reports
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Custom inspection templates
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Digital signature capture
                  </li>
                </ul>
              </div>
              
              {/* Feature 5 */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">QuickBooks Integration</h3>
                <p className="text-gray-600 mb-4">Automatically generate invoices and sync financial data with QuickBooks for seamless accounting.</p>
                <ul className="text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Auto-generated invoices
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Bi-directional sync
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Financial reporting integration
                  </li>
                </ul>
              </div>
              
              {/* Feature 6 */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Storage Tracking</h3>
                <p className="text-gray-600 mb-4">Monitor vehicles in temporary storage with repair status tracking and automated pickup reminders.</p>
                <ul className="text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Repair status tracking
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Automated pickup reminders
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Storage location management
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How TowTrace Works</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                A seamless workflow designed for transport businesses of all sizes
              </p>
            </div>
            
            <div className="relative">
              {/* Connecting line */}
              <div className="absolute left-1/2 top-8 bottom-0 w-0.5 bg-gray-200 -ml-0.5 hidden md:block"></div>
              
              <div className="space-y-16">
                {/* Step 1 */}
                <div className="relative">
                  <div className="relative md:grid md:grid-cols-2 md:gap-12 md:items-center">
                    <div className="md:col-start-2">
                      <div className="mb-4 flex md:hidden">
                        <span className="flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 text-primary-600 text-xl font-bold">1</span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">Job Assignment</h3>
                      <p className="text-lg text-gray-600 mb-6">Dispatchers create jobs and assign them to available drivers based on location, vehicle type, and schedule.</p>
                      <ul className="text-gray-600 space-y-3">
                        <li className="flex items-start">
                          <svg className="h-6 w-6 text-primary-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Easy job creation with detailed information
                        </li>
                        <li className="flex items-start">
                          <svg className="h-6 w-6 text-primary-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Smart driver recommendations based on location and availability
                        </li>
                      </ul>
                    </div>
                    <div className="mt-6 md:mt-0 md:col-start-1 md:row-start-1">
                      <div className="hidden md:flex md:justify-end">
                        <span className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-600 text-2xl font-bold ring-4 ring-white z-10">1</span>
                      </div>
                      <div className="bg-white rounded-xl shadow-lg p-6 md:mr-8 mt-4 md:mt-0">
                        <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400">Job assignment interface</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Step 2 */}
                <div className="relative">
                  <div className="relative md:grid md:grid-cols-2 md:gap-12 md:items-center">
                    <div className="md:col-start-1">
                      <div className="mb-4 flex md:hidden">
                        <span className="flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 text-primary-600 text-xl font-bold">2</span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">Driver Workflow</h3>
                      <p className="text-lg text-gray-600 mb-6">Drivers receive notifications about new jobs, perform vehicle inspections, and update status throughout the journey.</p>
                      <ul className="text-gray-600 space-y-3">
                        <li className="flex items-start">
                          <svg className="h-6 w-6 text-primary-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Real-time job notifications
                        </li>
                        <li className="flex items-start">
                          <svg className="h-6 w-6 text-primary-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Step-by-step guided workflow
                        </li>
                      </ul>
                    </div>
                    <div className="mt-6 md:mt-0 md:col-start-2 md:row-start-1">
                      <div className="hidden md:flex">
                        <span className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-600 text-2xl font-bold ring-4 ring-white z-10">2</span>
                      </div>
                      <div className="bg-white rounded-xl shadow-lg p-6 md:ml-8 mt-4 md:mt-0">
                        <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400">Driver mobile app interface</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Step 3 */}
                <div className="relative">
                  <div className="relative md:grid md:grid-cols-2 md:gap-12 md:items-center">
                    <div className="md:col-start-2">
                      <div className="mb-4 flex md:hidden">
                        <span className="flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 text-primary-600 text-xl font-bold">3</span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">Real-Time Tracking</h3>
                      <p className="text-lg text-gray-600 mb-6">Dispatchers and managers monitor vehicle locations, optimize routes, and communicate with drivers in real-time.</p>
                      <ul className="text-gray-600 space-y-3">
                        <li className="flex items-start">
                          <svg className="h-6 w-6 text-primary-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Live GPS tracking with minimal battery impact
                        </li>
                        <li className="flex items-start">
                          <svg className="h-6 w-6 text-primary-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Secure messaging platform for team communication
                        </li>
                      </ul>
                    </div>
                    <div className="mt-6 md:mt-0 md:col-start-1 md:row-start-1">
                      <div className="hidden md:flex md:justify-end">
                        <span className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-600 text-2xl font-bold ring-4 ring-white z-10">3</span>
                      </div>
                      <div className="bg-white rounded-xl shadow-lg p-6 md:mr-8 mt-4 md:mt-0">
                        <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400">Real-time tracking map</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Step 4 */}
                <div className="relative">
                  <div className="relative md:grid md:grid-cols-2 md:gap-12 md:items-center">
                    <div className="md:col-start-1">
                      <div className="mb-4 flex md:hidden">
                        <span className="flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 text-primary-600 text-xl font-bold">4</span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">Complete & Invoice</h3>
                      <p className="text-lg text-gray-600 mb-6">Jobs are completed with delivery confirmation, and invoices are automatically generated and synced with QuickBooks.</p>
                      <ul className="text-gray-600 space-y-3">
                        <li className="flex items-start">
                          <svg className="h-6 w-6 text-primary-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Digital proof of delivery with signatures
                        </li>
                        <li className="flex items-start">
                          <svg className="h-6 w-6 text-primary-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Automatic invoice generation and QuickBooks integration
                        </li>
                      </ul>
                    </div>
                    <div className="mt-6 md:mt-0 md:col-start-2 md:row-start-1">
                      <div className="hidden md:flex">
                        <span className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-600 text-2xl font-bold ring-4 ring-white z-10">4</span>
                      </div>
                      <div className="bg-white rounded-xl shadow-lg p-6 md:ml-8 mt-4 md:mt-0">
                        <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400">Invoicing and completion interface</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to streamline your transport operations?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
              Join transport companies across the country who trust TowTrace for their fleet management and dispatching needs.
            </p>
            {authenticated ? (
              <Link href="/dashboard">
                <a className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-lg font-medium rounded-md text-primary-700 bg-white hover:bg-gray-50 shadow-lg transform transition hover:-translate-y-0.5">
                  Go to Dashboard
                </a>
              </Link>
            ) : (
              <Link href="/login">
                <a className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-lg font-medium rounded-md text-primary-700 bg-white hover:bg-gray-50 shadow-lg transform transition hover:-translate-y-0.5">
                  Get Started Today
                </a>
              </Link>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer id="contact" className="bg-gray-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
              <div className="md:col-span-1">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                    TT
                  </div>
                  <span className="ml-2 text-xl font-semibold">TowTrace</span>
                </div>
                <p className="text-gray-400 mb-4">
                  Comprehensive transport management solution for towing companies and vehicle transport businesses.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-white transition">
                    <span className="sr-only">Twitter</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition">
                    <span className="sr-only">LinkedIn</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                    </svg>
                  </a>
                </div>
              </div>
              <div className="md:col-span-1">
                <h4 className="text-lg font-medium mb-4">Features</h4>
                <ul className="space-y-3 text-gray-400">
                  <li><a href="#features" className="hover:text-white transition">Multi-Vehicle VIN Scanning</a></li>
                  <li><a href="#features" className="hover:text-white transition">Real-Time GPS Tracking</a></li>
                  <li><a href="#features" className="hover:text-white transition">Driver Dispatch & Load Management</a></li>
                  <li><a href="#features" className="hover:text-white transition">Pre-Trip Inspections</a></li>
                  <li><a href="#features" className="hover:text-white transition">QuickBooks Integration</a></li>
                </ul>
              </div>
              <div className="md:col-span-1">
                <h4 className="text-lg font-medium mb-4">Company</h4>
                <ul className="space-y-3 text-gray-400">
                  <li><a href="#about" className="hover:text-white transition">About Us</a></li>
                  <li><a href="#" className="hover:text-white transition">Blog</a></li>
                  <li><a href="#" className="hover:text-white transition">Careers</a></li>
                  <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                </ul>
              </div>
              <div className="md:col-span-1">
                <h4 className="text-lg font-medium mb-4">Contact</h4>
                <ul className="space-y-3 text-gray-400">
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    info@towtrace.com
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    1-800-TOW-TRACE
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    123 Main Street, Suite 456<br />San Francisco, CA 94105
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">© 2025 TowTrace. All rights reserved.</p>
              <div className="mt-4 md:mt-0">
                <a href="#" className="text-sm text-gray-400 hover:text-white mr-4 transition">Privacy</a>
                <a href="#" className="text-sm text-gray-400 hover:text-white mr-4 transition">Terms</a>
                <a href="#" className="text-sm text-gray-400 hover:text-white transition">Cookies</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}