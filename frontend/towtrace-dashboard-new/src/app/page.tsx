import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      {/* Header Section */}
      <header className="w-full bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-primary-800 rounded-full flex items-center justify-center text-white font-bold mr-2 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
              TT
            </div>
            <span className="text-xl font-semibold group-hover:text-primary-600 transition-colors duration-300">TowTrace</span>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-600 hover:text-primary-600 transition-colors relative group">
              Features
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-primary-600 transition-colors relative group">
              Pricing
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#about" className="text-gray-600 hover:text-primary-600 transition-colors relative group">
              About
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#contact" className="text-gray-600 hover:text-primary-600 transition-colors relative group">
              Contact
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
            </a>
          </nav>
          <div>
            <Link href="./login" className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-4 py-2 rounded-md font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 inline-block">
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Streamline Your Towing & Transport Operations
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            TowTrace helps towing professionals manage vehicles, drivers, and jobs with real-time tracking and seamless dispatch.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Link href="./login" className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 py-3 rounded-lg font-medium text-lg transition-all duration-300 hover:shadow-lg hover:scale-105 hover:-translate-y-1 inline-block">
              Get Started
            </Link>
            <a href="#features" className="bg-white text-primary-700 border border-primary-600 px-6 py-3 rounded-lg font-medium text-lg hover:bg-gray-50 transition-all duration-300 hover:shadow-md hover:scale-105 hover:-translate-y-1 inline-block">
              Learn More
            </a>
          </div>
          <div className="relative h-64 md:h-96 w-full max-w-5xl mx-auto rounded-lg overflow-hidden shadow-xl bg-white hover:shadow-2xl transition-shadow duration-300">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-full p-4">
                <div className="relative w-full h-full rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center transition-transform duration-500 hover:scale-[1.02]">
                  {/* Car Transport Image */}
                  <div className="w-full h-full flex items-center justify-center">
                    <Image 
                      src="https://indianapoliscartransport.com/wp-content/uploads/2018/08/Indianapolis-Car-Transport-2.jpg" 
                      alt="Car Transport" 
                      width={800} 
                      height={400}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" 
                      priority
                    />
                  </div>
                  
                  {/* Dashboard overlay UI elements */}
                  <div className="absolute top-4 left-4 right-4 h-12 bg-white bg-opacity-80 backdrop-blur-sm rounded-lg shadow-sm flex items-center px-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-xs">
                      TT
                    </div>
                    <div className="w-px h-6 bg-gray-200 mx-4"></div>
                    <div className="flex space-x-4">
                      <div className="h-2 w-16 bg-primary-600 rounded-full"></div>
                      <div className="h-2 w-16 bg-gray-200 rounded-full"></div>
                      <div className="h-2 w-16 bg-gray-200 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Key Features</h2>
          <p className="text-gray-600 text-center max-w-3xl mx-auto mb-12">
            Designed specifically for towing professionals, our comprehensive solution includes everything you need
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 mb-4 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.115 5.19l.319 1.913A6 6 0 008.11 10.36L9.75 12l-.387.775c-.217.433-.132.956.21 1.298l1.348 1.348c.21.21.329.497.329.795v1.089c0 .426.24.815.622 1.006l.153.076c.433.217.956.132 1.298-.21l.723-.723a8.7 8.7 0 002.288-4.042 1.087 1.087 0 00-.358-1.099l-1.33-1.108c-.251-.21-.582-.299-.905-.245l-1.17.195a1.125 1.125 0 01-.98-.314l-.295-.295a1.125 1.125 0 010-1.591l.13-.132a1.125 1.125 0 011.3-.21l.603.302a.809.809 0 001.086-1.086L14.25 7.5l1.256-.837a4.5 4.5 0 001.528-1.732l.146-.292M6.115 5.19A9 9 0 1017.18 4.64M6.115 5.19A8.965 8.965 0 0112 3c1.929 0 3.716.607 5.18 1.64" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary-600 transition-colors">Real-Time GPS Tracking</h3>
              <p className="text-gray-600">Monitor your fleet with live location updates and route optimization for every driver and vehicle.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 mb-4 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary-600 transition-colors">Multi-Vehicle VIN Scanning</h3>
              <p className="text-gray-600">Quickly scan and log multiple vehicle VINs with our advanced scanning technology and photo uploads.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 mb-4 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary-600 transition-colors">Driver Dispatch</h3>
              <p className="text-gray-600">Assign jobs, manage driver schedules, and optimize workloads with our intuitive dispatch system.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 mb-4 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary-600 transition-colors">Pre-Trip Inspections</h3>
              <p className="text-gray-600">Document vehicle conditions with automated inspection logs, including tire pressure, brakes, and lighting systems.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 mb-4 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary-600 transition-colors">Vehicle Photo Documentation</h3>
              <p className="text-gray-600">Capture and store vehicle photos directly through our app, with quick camera access for damage documentation.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 mb-4 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary-600 transition-colors">Geolocation Dropoff Tracking</h3>
              <p className="text-gray-600">Record precise vehicle dropoff locations with geotags or manual address entry to maintain full delivery transparency.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="w-full py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Pricing Plans</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 text-center">
            Choose the plan that best fits your towing operation size and needs
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Basic Plan */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
              <div className="px-6 py-8 bg-gray-50 border-b border-gray-200 relative">
                <h3 className="text-2xl font-bold text-center text-gray-900">Basic</h3>
                <div className="mt-4 flex justify-center transition-all duration-300 hover:scale-110">
                  <span className="text-5xl font-extrabold">$49</span>
                  <span className="text-xl text-gray-500 self-end mb-1 ml-1">/month</span>
                </div>
                <p className="mt-4 text-center text-gray-600">
                  Perfect for small towing businesses just getting started
                </p>
              </div>
              <div className="p-6">
                <ul className="space-y-4">
                  <li className="flex items-start group">
                    <svg className="h-6 w-6 text-green-500 mr-2 transition-transform duration-300 group-hover:scale-125" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="group-hover:font-medium transition-all duration-300"><strong>Up to 5 trucks</strong></span>
                  </li>
                  <li className="flex items-start group">
                    <svg className="h-6 w-6 text-green-500 mr-2 transition-transform duration-300 group-hover:scale-125" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="group-hover:font-medium transition-all duration-300">Real-time GPS tracking</span>
                  </li>
                  <li className="flex items-start group">
                    <svg className="h-6 w-6 text-green-500 mr-2 transition-transform duration-300 group-hover:scale-125" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="group-hover:font-medium transition-all duration-300">Job management</span>
                  </li>
                  <li className="flex items-start group">
                    <svg className="h-6 w-6 text-green-500 mr-2 transition-transform duration-300 group-hover:scale-125" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="group-hover:font-medium transition-all duration-300">Basic VIN scanning</span>
                  </li>
                  <li className="flex items-start group">
                    <svg className="h-6 w-6 text-green-500 mr-2 transition-transform duration-300 group-hover:scale-125" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="group-hover:font-medium transition-all duration-300">QuickBooks integration</span>
                  </li>
                  <li className="flex items-start text-gray-400 group">
                    <svg className="h-6 w-6 text-gray-300 mr-2 transition-transform duration-300 group-hover:scale-125" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="group-hover:font-medium transition-all duration-300">No fleet pre-trip inspection logging</span>
                  </li>
                  <li className="flex items-start text-gray-400 group">
                    <svg className="h-6 w-6 text-gray-300 mr-2 transition-transform duration-300 group-hover:scale-125" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="group-hover:font-medium transition-all duration-300">No ELD integration</span>
                  </li>
                </ul>
                <div className="mt-8">
                  <Link href="./login" className="block w-full bg-primary-600 hover:bg-primary-700 text-white text-center py-3 rounded-md font-medium transition-all duration-300 hover:shadow-lg hover:scale-105">
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Premium Plan */}
            <div className="bg-white rounded-lg shadow-xl overflow-hidden border-2 border-primary-500 transform scale-105 z-10 hover:-translate-y-2 transition-all duration-300">
              <div className="px-6 py-8 bg-primary-50 border-b border-primary-100 relative">
                <div className="absolute top-0 right-0 bg-primary-500 text-white px-4 py-1 rounded-bl-lg font-medium text-sm">
                  POPULAR
                </div>
                <h3 className="text-2xl font-bold text-center text-gray-900">Premium</h3>
                <div className="mt-4 flex justify-center transition-all duration-300 hover:scale-110">
                  <span className="text-5xl font-extrabold">$99</span>
                  <span className="text-xl text-gray-500 self-end mb-1 ml-1">/month</span>
                </div>
                <p className="mt-4 text-center text-gray-600">
                  Ideal for growing towing businesses with multiple vehicles
                </p>
              </div>
              <div className="p-6">
                <ul className="space-y-4">
                  <li className="flex items-start group">
                    <svg className="h-6 w-6 text-green-500 mr-2 transition-transform duration-300 group-hover:scale-125" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="group-hover:font-medium transition-all duration-300"><strong>Everything in Basic, PLUS:</strong></span>
                  </li>
                  <li className="flex items-start group">
                    <svg className="h-6 w-6 text-green-500 mr-2 transition-transform duration-300 group-hover:scale-125" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="group-hover:font-medium transition-all duration-300"><strong>Up to 10 trucks</strong> (instead of 5)</span>
                  </li>
                  <li className="flex items-start group">
                    <svg className="h-6 w-6 text-green-500 mr-2 transition-transform duration-300 group-hover:scale-125" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="group-hover:font-medium transition-all duration-300">Advanced GPS tracking with history</span>
                  </li>
                  <li className="flex items-start group">
                    <svg className="h-6 w-6 text-green-500 mr-2 transition-transform duration-300 group-hover:scale-125" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="group-hover:font-medium transition-all duration-300">Multi-vehicle VIN scanning</span>
                  </li>
                  <li className="flex items-start group">
                    <svg className="h-6 w-6 text-green-500 mr-2 transition-transform duration-300 group-hover:scale-125" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="group-hover:font-medium transition-all duration-300">Fleet pre-trip inspection logging</span>
                  </li>
                  <li className="flex items-start text-gray-400 group">
                    <svg className="h-6 w-6 text-gray-300 mr-2 transition-transform duration-300 group-hover:scale-125" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="group-hover:font-medium transition-all duration-300">No ELD integration</span>
                  </li>
                </ul>
                <div className="mt-8">
                  <Link href="./login" className="block w-full bg-primary-600 hover:bg-primary-700 text-white text-center py-3 rounded-md font-medium transition-all duration-300 hover:shadow-lg hover:scale-105">
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Enterprise Plan */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
              <div className="px-6 py-8 bg-gray-50 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-center text-gray-900">Enterprise</h3>
                <div className="mt-4 flex justify-center transition-all duration-300 hover:scale-110">
                  <span className="text-5xl font-extrabold">$249</span>
                  <span className="text-xl text-gray-500 self-end mb-1 ml-1">/month</span>
                </div>
                <p className="mt-4 text-center text-gray-600">
                  Complete solution for large towing and transport fleets
                </p>
              </div>
              <div className="p-6">
                <ul className="space-y-4">
                  <li className="flex items-start group">
                    <svg className="h-6 w-6 text-green-500 mr-2 transition-transform duration-300 group-hover:scale-125" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="group-hover:font-medium transition-all duration-300"><strong>Everything in Premium, PLUS:</strong></span>
                  </li>
                  <li className="flex items-start group">
                    <svg className="h-6 w-6 text-green-500 mr-2 transition-transform duration-300 group-hover:scale-125" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="group-hover:font-medium transition-all duration-300"><strong>Unlimited trucks</strong></span>
                  </li>
                  <li className="flex items-start group">
                    <svg className="h-6 w-6 text-green-500 mr-2 transition-transform duration-300 group-hover:scale-125" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="group-hover:font-medium transition-all duration-300">Enterprise GPS with geofencing</span>
                  </li>
                  <li className="flex items-start group">
                    <svg className="h-6 w-6 text-green-500 mr-2 transition-transform duration-300 group-hover:scale-125" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="group-hover:font-medium transition-all duration-300">AI-powered VIN scanning</span>
                  </li>
                  <li className="flex items-start group">
                    <svg className="h-6 w-6 text-green-500 mr-2 transition-transform duration-300 group-hover:scale-125" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="group-hover:font-medium transition-all duration-300">Enterprise ELD integration</span>
                  </li>
                  <li className="flex items-start group">
                    <svg className="h-6 w-6 text-green-500 mr-2 transition-transform duration-300 group-hover:scale-125" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="group-hover:font-medium transition-all duration-300">24/7 priority support</span>
                  </li>
                </ul>
                <div className="mt-8">
                  <Link href="./login" className="block w-full bg-primary-600 hover:bg-primary-700 text-white text-center py-3 rounded-md font-medium transition-all duration-300 hover:shadow-lg hover:scale-105">
                    Contact Sales
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="w-full py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">About TowTrace</h2>
            <p className="text-lg text-gray-600 mb-6">
              TowTrace was created by towing professionals, for towing professionals. We understand the unique challenges faced by the towing and transport industry and have designed a comprehensive solution to address them.
            </p>
            <p className="text-lg text-gray-600 mb-6">
              Our platform combines cutting-edge technology with user-friendly interfaces to streamline operations, increase efficiency, and improve customer satisfaction. Whether you're managing a small fleet or a large towing operation, TowTrace scales to meet your needs.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="w-full py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Contact Us</h2>
          <p className="text-gray-600 text-center max-w-3xl mx-auto mb-12">
            Have questions or ready to get started? Our team is here to help you find the perfect solution for your towing operation.
          </p>
          
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
            <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Get In Touch</h3>
              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="Your name"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="your.email@example.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <input 
                    type="text" 
                    id="company" 
                    name="company" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="Your company"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea 
                    id="message" 
                    name="message" 
                    rows={4} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="Tell us about your towing operation and what you're looking for..."
                  ></textarea>
                </div>
                
                <button type="submit" className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 py-3 rounded-md font-medium transition-all duration-300 hover:shadow-lg hover:scale-105">
                  Send Message
                </button>
              </form>
            </div>
            
            <div className="flex flex-col justify-center">
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
                <p className="text-gray-600 mb-4">
                  Our team is available Monday through Friday, 9am to 5pm EST to answer your questions and provide personalized demos.
                </p>
                
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <span className="text-gray-700">support@towtrace.com</span>
                </div>
                
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                  </div>
                  <span className="text-gray-700">(555) 123-4567</span>
                </div>
                
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                  </div>
                  <span className="text-gray-700">123 Towing Avenue, Suite 100<br />Phoenix, AZ 85001</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                  <a href="#" className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 hover:bg-primary-600 hover:text-white transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-facebook" viewBox="0 0 16 16">
                      <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
                    </svg>
                  </a>
                  <a href="#" className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 hover:bg-primary-600 hover:text-white transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-twitter" viewBox="0 0 16 16">
                      <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
                    </svg>
                  </a>
                  <a href="#" className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 hover:bg-primary-600 hover:text-white transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-linkedin" viewBox="0 0 16 16">
                      <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
                    </svg>
                  </a>
                  <a href="#" className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 hover:bg-primary-600 hover:text-white transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-instagram" viewBox="0 0 16 16">
                      <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center mb-4 group">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold mr-2 transition-transform duration-300 group-hover:scale-110">
                  TT
                </div>
                <span className="text-xl font-semibold group-hover:text-primary-400 transition-colors duration-300">TowTrace</span>
              </div>
              <p className="text-gray-400 text-sm">
                The comprehensive management system for towing and transport operations.
              </p>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} TowTrace. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}