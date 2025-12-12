import React, { useState } from 'react';
import { 
  Wrench, ShieldCheck, Clock, Star, MapPin, 
  Menu, X, Facebook, Twitter, Instagram, ArrowRight, Check, Lock, PenTool, User as UserIcon, LogOut
} from 'lucide-react';
import { BookingWizard } from './components/BookingWizard';
import { AdminDashboard } from './components/AdminDashboard';
import { FeedbackModal } from './components/FeedbackModal';
import { AuthModal } from './components/AuthModal';
import { INITIAL_ISSUES, REVIEWS, getIcon, INITIAL_TIMESLOTS } from './constants';
import { Booking, BookingState, BookingStatus, RepairIssue, TimeSlot, Review, User } from './types';

const App = () => {
  const [view, setView] = useState<'landing' | 'booking' | 'admin'>('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // --- Centralized State ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<RepairIssue[]>(INITIAL_ISSUES);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(INITIAL_TIMESLOTS);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [reviews, setReviews] = useState<Review[]>(REVIEWS);

  const scrollToSection = (id: string) => {
    // If not on landing page, go there first
    if (view !== 'landing') {
        setView('landing');
        // Small delay to allow render before scrolling
        setTimeout(() => {
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    } else {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }
    setMobileMenuOpen(false);
  };

  // --- Handlers ---

  const handleNewBooking = (bookingData: BookingState) => {
    const newBooking: Booking = {
      id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Pending',
      dateCreated: new Date().toISOString().split('T')[0],
      selectedBrand: bookingData.selectedBrand || 'Other',
      selectedModel: bookingData.selectedModel?.name || 'Unknown Device',
      selectedIssue: bookingData.selectedIssue?.name || 'General Inquiry',
      price: bookingData.selectedIssue?.priceRange || 'TBD',
      appointmentDate: bookingData.appointmentDate,
      appointmentTime: bookingData.appointmentTime,
      customerName: bookingData.customerName,
      customerEmail: bookingData.customerEmail,
      customerPhone: bookingData.customerPhone,
    };
    
    setBookings(prev => [newBooking, ...prev]);
  };

  const handleUpdateStatus = (id: string, status: BookingStatus) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const handleUpdateService = (updatedService: RepairIssue) => {
    setServices(prev => prev.map(s => s.id === updatedService.id ? updatedService : s));
  };

  const handleUpdateTimeSlot = (time: string, available: boolean) => {
    setTimeSlots(prev => prev.map(t => t.time === time ? { ...t, available } : t));
  };

  const handleAddTimeSlot = (timeString: string) => {
    // Input comes as "14:30" (24h), convert to "02:30 PM"
    if (!timeString) return;
    
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    const formattedTime = `${hour12.toString().padStart(2, '0')}:${minutes} ${ampm}`;

    // Prevent duplicates
    if (!timeSlots.some(slot => slot.time === formattedTime)) {
        setTimeSlots(prev => {
            const newSlots = [...prev, { time: formattedTime, available: true }];
            // Sort chronologically
            return newSlots.sort((a, b) => {
                return new Date('1970/01/01 ' + a.time).getTime() - new Date('1970/01/01 ' + b.time).getTime();
            });
        });
    }
  };

  const handleDeleteTimeSlot = (time: string) => {
    setTimeSlots(prev => prev.filter(t => t.time !== time));
  };

  const handleBlockDate = (date: string) => {
    if (!blockedDates.includes(date)) {
        setBlockedDates(prev => [...prev, date].sort());
    }
  };

  const handleUnblockDate = (date: string) => {
    setBlockedDates(prev => prev.filter(d => d !== date));
  };

  const handleNewReview = (reviewData: Omit<Review, 'id' | 'date'>) => {
    const newReview: Review = {
      id: Date.now(),
      date: 'Just now',
      ...reviewData
    };
    setReviews(prev => [newReview, ...prev]);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleWriteReviewClick = () => {
    if (currentUser) {
      setShowFeedbackModal(true);
    } else {
      setShowAuthModal(true);
    }
  };

  // --- Render ---

  // If in booking mode
  if (view === 'booking') {
    return (
      <BookingWizard 
        onComplete={() => setView('landing')} 
        onCancel={() => setView('landing')} 
        onSubmitBooking={handleNewBooking}
        services={services}
        timeSlots={timeSlots}
        blockedDates={blockedDates}
        currentUser={currentUser}
      />
    );
  }

  // If in admin mode
  if (view === 'admin') {
      return (
          <AdminDashboard 
            bookings={bookings} 
            services={services}
            timeSlots={timeSlots}
            blockedDates={blockedDates}
            onUpdateStatus={handleUpdateStatus} 
            onUpdateService={handleUpdateService}
            onUpdateTimeSlot={handleUpdateTimeSlot}
            onAddTimeSlot={handleAddTimeSlot}
            onDeleteTimeSlot={handleDeleteTimeSlot}
            onBlockDate={handleBlockDate}
            onUnblockDate={handleUnblockDate}
            onLogout={() => setView('landing')} 
          />
      );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-800">
      
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <button onClick={() => { setView('landing'); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="flex items-center space-x-2 outline-none">
              {/* LOGO SECTION - Replace src with your URL */}
              <img 
                src="img/logo.jpg" alt="Description of image" 
                alt="SwiftFix Logo" 
                className="h-10 w-auto object-contain" 
              />
              <span className="text-xl font-bold tracking-tight text-slate-900">SwiftFix</span>
            </button>
            
            <div className="hidden md:flex space-x-8">
              <button onClick={() => scrollToSection('services')} className="text-slate-500 hover:text-indigo-600 font-medium transition-colors">Services</button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-slate-500 hover:text-indigo-600 font-medium transition-colors">How it Works</button>
              <button onClick={() => scrollToSection('reviews')} className="text-slate-500 hover:text-indigo-600 font-medium transition-colors">Reviews</button>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {currentUser ? (
                <div className="flex items-center space-x-4">
                   <div className="flex items-center space-x-2 text-slate-700">
                      <div className="bg-slate-100 p-1.5 rounded-full">
                        <UserIcon className="w-5 h-5 text-indigo-600" />
                      </div>
                      <span className="font-medium text-sm">{currentUser.name}</span>
                   </div>
                   <button 
                      onClick={handleLogout}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                      title="Log Out"
                   >
                      <LogOut className="w-5 h-5" />
                   </button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
                >
                  Log In
                </button>
              )}

              <button 
                onClick={() => setView('booking')}
                className="bg-slate-900 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300"
              >
                Book Repair
              </button>
            </div>

            <div className="md:hidden">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-500">
                {mobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 p-4 space-y-4 shadow-lg absolute w-full">
            <button onClick={() => scrollToSection('services')} className="block w-full text-left text-slate-600 font-medium">Services</button>
            <button onClick={() => scrollToSection('how-it-works')} className="block w-full text-left text-slate-600 font-medium">How it Works</button>
            <button onClick={() => scrollToSection('reviews')} className="block w-full text-left text-slate-600 font-medium">Reviews</button>
            <div className="pt-2 border-t border-slate-100">
                {currentUser ? (
                    <div className="flex justify-between items-center py-2">
                        <span className="font-medium text-slate-800">Hi, {currentUser.name}</span>
                        <button onClick={handleLogout} className="text-red-500 text-sm">Log Out</button>
                    </div>
                ) : (
                    <button onClick={() => { setShowAuthModal(true); setMobileMenuOpen(false); }} className="block w-full text-left text-indigo-600 font-medium py-2">Log In</button>
                )}
            </div>
            <button 
                onClick={() => { setView('booking'); setMobileMenuOpen(false); }}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold mt-4"
            >
                Book Repair
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-white to-white"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <span className="flex h-2 w-2 rounded-full bg-indigo-600"></span>
                <span className="text-sm font-medium text-indigo-800">Available for same-day repairs</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 max-w-4xl mx-auto leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                We bring your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">devices back to life.</span>
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                Professional mobile repairs for iPhone, Samsung, and Google devices. Expert technicians, premium parts, and a lifetime warranty.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
                <button 
                    onClick={() => setView('booking')}
                    className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-full font-bold text-lg hover:bg-indigo-600 hover:scale-105 transition-all duration-300 shadow-xl shadow-indigo-200 flex items-center justify-center space-x-2"
                >
                    <span>Start Repair</span>
                    <ArrowRight className="w-5 h-5" />
                </button>
                <button 
                    onClick={() => scrollToSection('services')}
                    className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-full font-bold text-lg hover:border-slate-400 hover:bg-slate-50 transition-all duration-300"
                >
                    Check Prices
                </button>
            </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-3xl">
                    <div className="bg-indigo-100 p-4 rounded-2xl mb-6">
                        <Clock className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Fast Turnaround</h3>
                    <p className="text-slate-500">Most repairs are completed within 45 minutes while you wait.</p>
                </div>
                <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-3xl">
                    <div className="bg-purple-100 p-4 rounded-2xl mb-6">
                        <ShieldCheck className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Lifetime Warranty</h3>
                    <p className="text-slate-500">We stand by our work. All screen replacements come with a warranty.</p>
                </div>
                <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-3xl">
                    <div className="bg-green-100 p-4 rounded-2xl mb-6">
                        <Star className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Expert Technicians</h3>
                    <p className="text-slate-500">Certified professionals with years of experience fixing all major brands.</p>
                </div>
            </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-indigo-600 font-semibold tracking-wide uppercase text-sm">Our Services</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-2 text-slate-900">Pricing & Repairs</h2>
            <p className="text-slate-500 mt-4 max-w-2xl mx-auto">
              Transparent pricing for all common issues. Select a service to see specific model pricing in the next step.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((issue) => (
              <div key={issue.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                    {getIcon(issue.iconName, "w-6 h-6")}
                  </div>
                  <span className="text-sm font-semibold text-slate-900 bg-slate-100 px-3 py-1 rounded-full">
                    {issue.duration}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{issue.name}</h3>
                <p className="text-slate-500 text-sm mb-6 flex-1">{issue.description}</p>
                <div className="pt-6 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-400 text-sm">Starting from</span>
                    <span className="text-2xl font-bold text-slate-900">{issue.priceRange.split(' ')[0]}</span>
                  </div>
                  <button 
                    onClick={() => setView('booking')}
                    className="w-full py-3 bg-white border border-indigo-200 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-600 hover:text-white transition-colors"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold mb-6">Repairing made simple.</h2>
                <p className="text-slate-400 text-lg">Three easy steps to get your device back in shape.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                {/* Connecting Line (Desktop) */}
                <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-slate-700 -z-0"></div>

                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-slate-800 rounded-full border-4 border-slate-900 flex items-center justify-center mb-6 text-2xl font-bold">1</div>
                    <h3 className="text-xl font-bold mb-2">Select Device</h3>
                    <p className="text-slate-400">Tell us what you have and what needs fixing.</p>
                </div>
                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-slate-800 rounded-full border-4 border-slate-900 flex items-center justify-center mb-6 text-2xl font-bold">2</div>
                    <h3 className="text-xl font-bold mb-2">Book Slot</h3>
                    <p className="text-slate-400">Choose a convenient time to drop off your device.</p>
                </div>
                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-indigo-600 rounded-full border-4 border-slate-900 flex items-center justify-center mb-6 text-2xl font-bold shadow-lg shadow-indigo-900/50">3</div>
                    <h3 className="text-xl font-bold mb-2">We Fix It</h3>
                    <p className="text-slate-400">Pick up your like-new device in under an hour.</p>
                </div>
            </div>

            <div className="mt-16 text-center">
                <button 
                    onClick={() => setView('booking')}
                    className="px-10 py-4 bg-white text-slate-900 rounded-full font-bold text-lg hover:bg-indigo-50 transition-colors"
                >
                    Book Now
                </button>
            </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div className="text-center md:text-left mb-6 md:mb-0">
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900">Customer Stories</h2>
              <p className="text-slate-500 mt-4 text-lg">Join thousands of satisfied customers who trusted us.</p>
            </div>
            <button 
              onClick={handleWriteReviewClick}
              className="px-6 py-3 bg-indigo-50 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-100 transition-colors flex items-center space-x-2"
            >
              <PenTool className="w-5 h-5" />
              <span>Write a Review</span>
            </button>
          </div>

          <div className="flex overflow-x-auto space-x-6 pb-8 snap-x snap-mandatory hide-scrollbar">
            {reviews.map((review) => (
              <div key={review.id} className="min-w-[300px] md:min-w-[400px] bg-slate-50 p-8 rounded-3xl relative animate-in fade-in slide-in-from-right duration-500 snap-center">
                <div className="flex space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} 
                    />
                  ))}
                </div>
                <p className="text-slate-700 italic mb-6">"{review.text}"</p>
                <div className="flex items-center justify-between mt-auto">
                  <div>
                    <h4 className="font-bold text-slate-900">{review.name}</h4>
                    <span className="text-slate-400 text-sm">{review.date}</span>
                  </div>
                  <div className="bg-white p-2 rounded-full">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="col-span-1 md:col-span-1">
                    <div className="flex items-center space-x-2 mb-4">
                        {/* Footer Logo */}
                        <div className="bg-indigo-600 p-1.5 rounded-lg">
                            <Wrench className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-lg font-bold text-slate-900">SwiftFix</span>
                    </div>
                    <p className="text-slate-500 text-sm">
                        The trusted name in mobile device repair. Quick, reliable, and guaranteed.
                    </p>
                </div>
                
                <div>
                    <h4 className="font-bold text-slate-900 mb-4">Services</h4>
                    <ul className="space-y-2 text-sm text-slate-500">
                        <li><button onClick={() => scrollToSection('services')} className="hover:text-indigo-600">Screen Repair</button></li>
                        <li><button onClick={() => scrollToSection('services')} className="hover:text-indigo-600">Battery Replacement</button></li>
                        <li><button onClick={() => scrollToSection('services')} className="hover:text-indigo-600">Water Damage</button></li>
                        <li><button onClick={() => scrollToSection('services')} className="hover:text-indigo-600">Data Recovery</button></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-slate-900 mb-4">Company</h4>
                    <ul className="space-y-2 text-sm text-slate-500">
                        <li><a href="#" className="hover:text-indigo-600">About Us</a></li>
                        <li><a href="#" className="hover:text-indigo-600">Careers</a></li>
                        <li><a href="#" className="hover:text-indigo-600">Privacy Policy</a></li>
                        <li><a href="#" className="hover:text-indigo-600">Terms of Service</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-slate-900 mb-4">Contact</h4>
                    <ul className="space-y-2 text-sm text-slate-500">
                        <li className="flex items-center space-x-2"><MapPin className="w-4 h-4"/> <span>123 Tech Avenue, NY</span></li>
                        <li className="flex items-center space-x-2"><Clock className="w-4 h-4"/> <span>Mon-Sat: 9am - 7pm</span></li>
                    </ul>
                    <div className="flex space-x-4 mt-4">
                        <Facebook className="w-5 h-5 text-slate-400 hover:text-indigo-600 cursor-pointer"/>
                        <Twitter className="w-5 h-5 text-slate-400 hover:text-indigo-600 cursor-pointer"/>
                        <Instagram className="w-5 h-5 text-slate-400 hover:text-indigo-600 cursor-pointer"/>
                    </div>
                </div>
            </div>
            <div className="border-t border-slate-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-slate-400 text-sm">
                <p>&copy; 2024 SwiftFix Repair Shop. All rights reserved.</p>
                <button onClick={() => setView('admin')} className="mt-4 md:mt-0 flex items-center hover:text-indigo-600 transition-colors">
                    <Lock className="w-3 h-3 mr-1" /> Admin Access
                </button>
            </div>
        </div>
      </footer>

      {/* Feedback Modal */}
      <FeedbackModal 
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onSubmit={handleNewReview}
        user={currentUser}
      />

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
      />
    </div>
  );
};

export default App;