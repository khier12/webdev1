
import React, { useState } from 'react';
import { 
  Smartphone, ChevronRight, ChevronLeft, Calendar, 
  CheckCircle, ArrowRight, User, Mail, Phone, Loader2, Search, AlertCircle
} from 'lucide-react';
import { BRANDS, MODELS, getIcon } from '../constants';
import { BookingState, RepairIssue, TimeSlot } from '../types';
import { AIDiagnosticModal } from './AIDiagnosticModal';

interface Props {
  onComplete: () => void;
  onCancel: () => void;
  onSubmitBooking: (bookingData: BookingState) => void;
  services: RepairIssue[];
  timeSlots: TimeSlot[];
  blockedDates: string[];
}

export const BookingWizard: React.FC<Props> = ({ 
  onComplete, onCancel, onSubmitBooking, services, timeSlots, blockedDates 
}) => {
  const [booking, setBooking] = useState<BookingState>({
    step: 'brand',
    selectedBrand: null,
    selectedModel: null,
    selectedIssue: null,
    appointmentDate: '',
    appointmentTime: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
  });

  const [showAI, setShowAI] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);

  const nextStep = (target?: BookingState['step']) => {
    let next: BookingState['step'] = booking.step;
    
    switch (booking.step) {
      case 'brand': next = 'model'; break;
      case 'model': next = 'issue'; break;
      case 'issue': next = 'schedule'; break;
      case 'schedule': next = 'confirm'; break;
      case 'confirm': next = 'success'; break;
    }
    
    if (target) next = target;
    setBooking(prev => ({ ...prev, step: next }));
  };

  const prevStep = () => {
    let previousStep: BookingState['step'] = booking.step;
    switch (booking.step) {
      case 'model': previousStep = 'brand'; break;
      case 'issue': previousStep = 'model'; break;
      case 'schedule': previousStep = 'issue'; break;
      case 'confirm': previousStep = 'schedule'; break;
    }
    setBooking(current => ({ ...current, step: previousStep }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    if (blockedDates.includes(selectedDate)) {
        setDateError("Sorry, we are closed on this date. Please select another day.");
        setBooking(prev => ({ ...prev, appointmentDate: '' }));
    } else {
        setDateError(null);
        setBooking(prev => ({ ...prev, appointmentDate: selectedDate }));
    }
  };

  const submitBooking = () => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      onSubmitBooking(booking);
      nextStep('success');
    }, 1500);
  };

  // --- Step Renderers ---

  const renderBrandSelection = () => (
    <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
      <h2 className="text-2xl font-bold text-slate-800 text-center">Select Your Device Brand</h2>
      <div className="grid grid-cols-2 gap-4">
        {BRANDS.map(brand => (
          <button
            key={brand.id}
            onClick={() => {
              setBooking(prev => ({ ...prev, selectedBrand: brand.id }));
              nextStep();
            }}
            className="group relative flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-2xl hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-200"
          >
            {brand.logo ? (
              <img src={brand.logo} alt={brand.name} className="h-12 w-auto mb-4 opacity-80 group-hover:opacity-100 transition-opacity" />
            ) : (
              <Smartphone className="h-12 w-12 text-slate-400 mb-4 group-hover:text-indigo-500" />
            )}
            <span className="font-semibold text-slate-700 group-hover:text-indigo-600">{brand.name}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderModelSelection = () => (
    <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
      <h2 className="text-2xl font-bold text-slate-800 text-center">Which {booking.selectedBrand} model?</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {booking.selectedBrand && MODELS[booking.selectedBrand].map(model => (
          <button
            key={model.id}
            onClick={() => {
              setBooking(prev => ({ ...prev, selectedModel: model }));
              nextStep();
            }}
            className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left"
          >
            <span className="font-medium text-slate-700">{model.name}</span>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        ))}
      </div>
      <button onClick={() => nextStep('issue')} className="w-full text-center text-indigo-600 text-sm hover:underline mt-4">
        Can't find your model? Skip this step
      </button>
    </div>
  );

  const renderIssueSelection = () => (
    <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
      <div className="flex flex-col items-center space-y-2 text-center">
        <h2 className="text-2xl font-bold text-slate-800">What's the problem?</h2>
        <p className="text-slate-500 text-sm">Select the issue you are experiencing.</p>
      </div>
      
      {/* AI Helper Banner */}
      <button 
        onClick={() => setShowAI(true)}
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-between group"
      >
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Search className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <p className="font-semibold">Not sure what's wrong?</p>
            <p className="text-indigo-100 text-xs">Let our AI Technician diagnose it for you.</p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {services.map(issue => (
          <button
            key={issue.id}
            onClick={() => {
              setBooking(prev => ({ ...prev, selectedIssue: issue }));
              nextStep();
            }}
            className="flex flex-col p-5 bg-white border border-slate-200 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all text-left"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 bg-slate-50 rounded-lg text-indigo-600">
                {getIcon(issue.iconName)}
              </div>
              <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full">
                {issue.priceRange}
              </span>
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">{issue.name}</h3>
            <p className="text-xs text-slate-500 line-clamp-2">{issue.description}</p>
          </button>
        ))}
      </div>
    </div>
  );

  const renderSchedule = () => (
    <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
      <h2 className="text-2xl font-bold text-slate-800 text-center">Select Appointment</h2>
      
      <div className="space-y-4">
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
            <input 
                type="date" 
                className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${dateError ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}
                min={new Date().toISOString().split('T')[0]}
                onChange={handleDateChange}
                value={booking.appointmentDate}
            />
            {dateError && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" /> {dateError}
                </p>
            )}
        </div>

        {booking.appointmentDate && (
             <div className="animate-in fade-in slide-in-from-top-2">
             <label className="block text-sm font-medium text-slate-700 mb-2">Available Times</label>
             <div className="grid grid-cols-3 gap-2">
                 {timeSlots.filter(t => t.available).map(slot => (
                     <button
                        key={slot.time}
                        onClick={() => setBooking(prev => ({ ...prev, appointmentTime: slot.time }))}
                        className={`py-2 px-3 text-sm rounded-lg border transition-all ${
                            booking.appointmentTime === slot.time
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                        }`}
                     >
                         {slot.time}
                     </button>
                 ))}
             </div>
             {timeSlots.filter(t => t.available).length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4 bg-slate-50 rounded-xl">No available times for this day.</p>
             )}
         </div>
        )}

        <div className="pt-6 border-t border-slate-100 space-y-4">
            <h3 className="font-semibold text-slate-800">Your Contact Details</h3>
            <div className="space-y-3">
                <div className="relative">
                    <User className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Full Name"
                        className="w-full pl-10 p-3 border border-slate-200 rounded-xl focus:ring-indigo-500 outline-none"
                        value={booking.customerName}
                        onChange={(e) => setBooking(prev => ({...prev, customerName: e.target.value}))}
                    />
                </div>
                <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                    <input 
                        type="email" 
                        placeholder="Email Address"
                        className="w-full pl-10 p-3 border border-slate-200 rounded-xl focus:ring-indigo-500 outline-none"
                        value={booking.customerEmail}
                        onChange={(e) => setBooking(prev => ({...prev, customerEmail: e.target.value}))}
                    />
                </div>
                <div className="relative">
                    <Phone className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                    <input 
                        type="tel" 
                        placeholder="Phone Number"
                        className="w-full pl-10 p-3 border border-slate-200 rounded-xl focus:ring-indigo-500 outline-none"
                        value={booking.customerPhone}
                        onChange={(e) => setBooking(prev => ({...prev, customerPhone: e.target.value}))}
                    />
                </div>
            </div>
        </div>

        <button
            disabled={!booking.appointmentDate || !booking.appointmentTime || !booking.customerName || !booking.customerPhone}
            onClick={() => nextStep()}
            className="w-full mt-4 bg-indigo-600 disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all"
        >
            Review Booking
        </button>
      </div>
    </div>
  );

  const renderConfirm = () => (
    <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
      <h2 className="text-2xl font-bold text-slate-800 text-center">Confirm Details</h2>
      
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Device</p>
                <p className="font-medium text-slate-800">{booking.selectedBrand} {booking.selectedModel?.name}</p>
            </div>
            <div className="text-right">
                <p className="text-xs text-slate-500 uppercase font-semibold">Service</p>
                <p className="font-medium text-indigo-600">{booking.selectedIssue?.name}</p>
            </div>
        </div>

        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Date & Time</p>
                <div className="flex items-center space-x-2 text-slate-800">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">{booking.appointmentDate} at {booking.appointmentTime}</span>
                </div>
            </div>
        </div>

        <div className="space-y-1">
             <p className="text-xs text-slate-500 uppercase font-semibold">Estimated Cost</p>
             <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-slate-900">{booking.selectedIssue?.priceRange}</span>
                <span className="text-sm text-slate-500 mb-1">Pay in-store</span>
             </div>
        </div>
      </div>

      <button
        onClick={submitBooking}
        disabled={isSubmitting}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all"
      >
        {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <span>Confirm Booking</span>}
      </button>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center space-y-6 animate-in zoom-in duration-300 py-10">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full text-green-600 mb-4">
        <CheckCircle className="w-10 h-10" />
      </div>
      <h2 className="text-3xl font-bold text-slate-900">Booking Confirmed!</h2>
      <p className="text-slate-600 max-w-sm mx-auto">
        Thanks {booking.customerName.split(' ')[0]}! We've sent a confirmation email to {booking.customerEmail}.
        See you on {booking.appointmentDate}.
      </p>
      <div className="pt-8">
        <button onClick={onComplete} className="bg-slate-900 text-white px-8 py-3 rounded-full hover:bg-slate-800 transition-colors">
            Return to Home
        </button>
      </div>
    </div>
  );

  // --- Main Render ---

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Funnel Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <button 
            onClick={booking.step === 'brand' || booking.step === 'success' ? onCancel : prevStep} 
            className="text-slate-500 hover:text-slate-800 flex items-center space-x-1"
        >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">{booking.step === 'brand' || booking.step === 'success' ? 'Cancel' : 'Back'}</span>
        </button>
        <div className="flex space-x-2">
            {['brand', 'model', 'issue', 'schedule', 'confirm'].map((s) => (
                <div 
                    key={s} 
                    className={`h-2 w-2 rounded-full transition-all ${
                        s === booking.step 
                        ? 'w-6 bg-indigo-600' 
                        : 'bg-slate-200'
                    }`}
                />
            ))}
        </div>
        <div className="w-16"></div> {/* Spacer for center alignment */}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-start p-6">
        <div className="w-full max-w-lg">
           {booking.step === 'brand' && renderBrandSelection()}
           {booking.step === 'model' && renderModelSelection()}
           {booking.step === 'issue' && renderIssueSelection()}
           {booking.step === 'schedule' && renderSchedule()}
           {booking.step === 'confirm' && renderConfirm()}
           {booking.step === 'success' && renderSuccess()}
        </div>
      </div>

      {/* AI Modal */}
      <AIDiagnosticModal 
        isOpen={showAI} 
        onClose={() => setShowAI(false)}
        onSelectService={(service) => {
            // Simplified logic: In a real app, map string result to ID more robustly
            // For now, if AI helps, we just forward them to the generic diagnosis or a specific one if implemented
            setShowAI(false);
            setBooking(prev => ({ ...prev, selectedIssue: services.find(i => i.id === 'diagnosis') || services[0] }));
            nextStep('schedule');
        }}
      />
    </div>
  );
};
