import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated, user, isStudent, isRestaurantOwner } = useAuth();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "Priya Sharma",
      role: "B.Tech CSE, 3rd Year",
      avatar: "👩‍🎓",
      text: "FODYYY has been a lifesaver during exam season! Fresh, hot meals delivered right to my dorm. The biryani from Spice Garden is my absolute favorite!",
      rating: 5
    },
    {
      id: 2,
      name: "Arjun Reddy",
      role: "M.Tech ECE, 1st Year",
      avatar: "👨‍🎓",
      text: "Amazing service! Quick delivery and authentic taste. The South Indian meals remind me of home. Highly recommend the sambar rice combo!",
      rating: 5
    },
    {
      id: 3,
      name: "Sneha Patel",
      role: "B.Tech ME, 2nd Year",
      avatar: "👩‍💻",
      text: "Love the variety of options available. From North Indian to South Indian to Chinese - there's something for every craving. Great app interface too!",
      rating: 5
    }
  ];

  const foodCategories = [
    { name: "North Indian", icon: "🍛", color: "bg-red-100 text-red-600" },
    { name: "South Indian", icon: "🥘", color: "bg-yellow-100 text-yellow-600" },
    { name: "Chinese", icon: "🍜", color: "bg-green-100 text-green-600" },
    { name: "Fast Food", icon: "🍔", color: "bg-blue-100 text-blue-600" },
    { name: "Beverages", icon: "🥤", color: "bg-purple-100 text-purple-600" },
    { name: "Desserts", icon: "🍰", color: "bg-pink-100 text-pink-600" }
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Floating Food Icons */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 left-10 text-4xl animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>🍕</div>
        <div className="absolute top-40 right-20 text-3xl animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}>🍔</div>
        <div className="absolute bottom-40 left-20 text-3xl animate-bounce" style={{ animationDelay: '2s', animationDuration: '3.5s' }}>🍜</div>
        <div className="absolute bottom-20 right-10 text-4xl animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '4.5s' }}>🍛</div>
        <div className="absolute top-60 left-1/4 text-2xl animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '3.8s' }}>🥘</div>
        <div className="absolute bottom-60 right-1/3 text-3xl animate-bounce" style={{ animationDelay: '2.5s', animationDuration: '4.2s' }}>🍰</div>
      </div>

      {/* Hero Section - Mobile First */}
      <div className="relative z-10 min-h-screen flex items-center">
        <div className="container mx-auto px-4 mobile-safe-area">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Content - Mobile First */}
            <div className="space-y-6 md:space-y-8 animate-fade-in order-2 lg:order-1">
              <div className="space-y-4 md:space-y-6">
                <div className="inline-block">
                  <span className="bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-semibold animate-pulse">
                    🔥 Now Available at IIT & IISER Tirupati
                  </span>
                </div>
                
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight animate-slide-up">
                  <span className="text-gray-900">Delicious Food,</span>
                  <br />
                  <span className="bg-gradient-to-r from-[#FF6B35] to-[#F7931E] bg-clip-text text-transparent">
                    Delivered Fast
                  </span>
                  <br />
                  <span className="text-gray-700">to IIT & IISER Tirupati</span>
                </h1>
                
                <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed max-w-full lg:max-w-lg animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  Craving your favorite meal? Get authentic, delicious food from local restaurants delivered right to your hostel room in just 30 minutes!
                </p>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-[#FF6B35] to-[#F7931E] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm sm:text-base">500+</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">Happy Students</p>
                    <p className="text-xs sm:text-sm text-gray-500">Satisfied customers</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-[#F7931E] to-[#FF6B35] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm sm:text-base">5+</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">Partner Restaurants</p>
                    <p className="text-xs sm:text-sm text-gray-500">Quality guaranteed</p>
                  </div>
                </div>
              </div>

              {/* CTA Buttons - Mobile First */}
              <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '0.6s' }}>
                {!isAuthenticated ? (
                  <>
                    <Link
                      to="/register"
                      className="group relative overflow-hidden bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 min-h-touch text-center"
                    >
                      <span className="relative z-10">Order Now 🍽️</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#F7931E] to-[#FF6B35] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </Link>
                    <Link
                      to="/restaurants"
                      className="bg-white text-[#FF6B35] border-2 border-[#FF6B35] px-6 py-3 sm:px-8 sm:py-4 rounded-full font-semibold text-base sm:text-lg hover:bg-[#FF6B35] hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 min-h-touch text-center"
                    >
                      Browse Menu 📋
                    </Link>
                  </>
                ) : (
                  <div className="space-y-4">
                    <p className="text-base sm:text-lg text-gray-700">
                      Welcome back, <span className="font-semibold text-[#FF6B35]">{user?.name}</span>! 👋
                    </p>
                    <Link
                      to={isStudent() ? '/restaurants' : isRestaurantOwner() ? '/restaurant' : '/'}
                      className="group relative overflow-hidden bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 inline-block min-h-touch text-center"
                    >
                      <span className="relative z-10">
                        {isStudent() ? 'Order Food Now 🍽️' : 'Go to Dashboard 📊'}
                      </span>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Food Image - Desktop Only */}
            <div className="relative animate-fade-in order-1 lg:order-2 hidden lg:block" style={{ animationDelay: '0.8s' }}>
              <div className="relative">
                {/* Main Food Image Container */}
                <div className="relative rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl transform rotate-1 lg:rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="aspect-square bg-gradient-to-br from-[#FF6B35]/20 to-[#F7931E]/20 p-4 lg:p-8">
                    <div className="w-full h-full bg-white rounded-xl lg:rounded-2xl shadow-lg flex items-center justify-center">
                      <div className="text-center space-y-2 lg:space-y-4">
                        <div className="text-4xl sm:text-6xl lg:text-8xl animate-pulse">🍛</div>
                        <div className="text-3xl sm:text-4xl lg:text-6xl">🍕</div>
                        <div className="flex justify-center space-x-2 lg:space-x-4 text-2xl sm:text-3xl lg:text-4xl">
                          <span className="animate-bounce">🍔</span>
                          <span className="animate-bounce" style={{ animationDelay: '0.5s' }}>🍜</span>
                          <span className="animate-bounce" style={{ animationDelay: '1s' }}>🥘</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-2 -right-2 lg:-top-4 lg:-right-4 w-14 h-14 lg:w-20 lg:h-20 bg-gradient-to-r from-[#FF6B35] to-[#F7931E] rounded-full flex items-center justify-center text-white font-bold text-sm lg:text-xl shadow-lg animate-pulse">
                  30min
                </div>
                
                <div className="absolute -bottom-2 -left-2 lg:-bottom-4 lg:-left-4 w-12 h-12 lg:w-16 lg:h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-lg lg:text-2xl shadow-lg animate-bounce">
                  ✅
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Food Icon Square - Positioned below Browse Menu */}
      <div className="lg:hidden py-6 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 mobile-safe-area">
          <div className="flex justify-center">
            <div className="mobile-food-square animate-fade-in" style={{ animationDelay: '0.8s' }}>
              <div className="relative">
                {/* Mobile Food Icon Square */}
                <div className="relative rounded-2xl overflow-hidden shadow-xl transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
                  <div className="aspect-square bg-gradient-to-br from-[#FF6B35]/12 to-[#F7931E]/12 p-6 sm:p-8">
                    <div className="w-full h-full bg-white rounded-xl shadow-lg flex items-center justify-center border border-gray-100">
                      <div className="text-center space-y-3 sm:space-y-4">
                        <div className="text-5xl sm:text-6xl animate-pulse">🍛</div>
                        <div className="text-4xl sm:text-5xl animate-food-bounce">🍕</div>
                        <div className="flex justify-center space-x-3 sm:space-x-4 text-3xl sm:text-4xl">
                          <span className="animate-bounce hover:scale-110 transition-transform cursor-pointer">🍔</span>
                          <span className="animate-bounce hover:scale-110 transition-transform cursor-pointer" style={{ animationDelay: '0.5s' }}>🍜</span>
                          <span className="animate-bounce hover:scale-110 transition-transform cursor-pointer" style={{ animationDelay: '1s' }}>🥘</span>
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 font-medium mt-2">
                          Delicious food awaits! 😋
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Mobile Floating Elements */}
                <div className="absolute -top-2 -right-2 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-[#FF6B35] to-[#F7931E] rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-lg animate-pulse hover:animate-bounce">
                  30min
                </div>
                
                <div className="absolute -bottom-2 -left-2 w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-lg sm:text-xl shadow-lg animate-bounce hover:bg-green-600 transition-colors">
                  ✅
                </div>
                
                {/* Subtle glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#FF6B35]/5 to-[#F7931E]/5 pointer-events-none"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Food Categories Section - Mobile Optimized */}
      <div className="py-12 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4 mobile-safe-area">
          <div className="text-center mb-8 lg:mb-16 animate-fade-in">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 lg:mb-4">
              What's Your <span className="text-[#FF6B35]">Craving</span> Today?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              From traditional Indian dishes to international favorites - we've got something delicious for every taste bud!
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
            {foodCategories.map((category, index) => (
              <div 
                key={category.name}
                className="group bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 text-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-slide-up touch-target"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 ${category.color} rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4 text-2xl sm:text-2xl lg:text-3xl group-hover:scale-110 transition-transform duration-300`}>
                  {category.icon}
                </div>
                <h3 className="font-semibold text-sm sm:text-base text-gray-900 group-hover:text-[#FF6B35] transition-colors duration-300">
                  {category.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-slide-up border-2 border-transparent hover:border-[#FF6B35]/20">
              <div className="w-20 h-20 bg-gradient-to-r from-[#FF6B35] to-[#F7931E] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-[#FF6B35] transition-colors duration-300">Lightning Fast</h3>
              <p className="text-gray-600 leading-relaxed">
                Get your favorite meals delivered to your hostel room in just 30 minutes or your money back!
              </p>
            </div>

            <div className="group bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-slide-up border-2 border-transparent hover:border-[#FF6B35]/20" style={{ animationDelay: '0.2s' }}>
              <div className="w-20 h-20 bg-gradient-to-r from-[#F7931E] to-[#FF6B35] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-[#FF6B35] transition-colors duration-300">Huge Variety</h3>
              <p className="text-gray-600 leading-relaxed">
                From spicy biryanis to cheesy pizzas - choose from 100+ dishes across multiple cuisines.
              </p>
            </div>

            <div className="group bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-slide-up border-2 border-transparent hover:border-[#FF6B35]/20" style={{ animationDelay: '0.4s' }}>
              <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-[#FF6B35] transition-colors duration-300">Super Easy</h3>
              <p className="text-gray-600 leading-relaxed">
                Order in just 3 taps! Our intuitive app makes food ordering as easy as sending a message.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-gradient-to-r from-[#FF6B35] to-[#F7931E] relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              What Our <span className="text-yellow-200">Students</span> Say
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Don't just take our word for it - hear from the students who love FODYYY!
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl">
              <div className="text-center">
                <div className="text-6xl mb-6 animate-pulse">
                  {testimonials[currentTestimonial].avatar}
                </div>
                
                <div className="flex justify-center mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className="w-8 h-8 text-yellow-400 fill-current"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14L2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                
                <blockquote className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-8 italic">
                  "{testimonials[currentTestimonial].text}"
                </blockquote>
                
                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-gray-900">
                    {testimonials[currentTestimonial].name}
                  </h4>
                  <p className="text-gray-600">
                    {testimonials[currentTestimonial].role}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Testimonial Dots */}
            <div className="flex justify-center mt-8 space-x-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial
                      ? 'bg-white scale-125'
                      : 'bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Trusted by <span className="text-[#FF6B35]">Students</span> Across Campus
              </h2>
              <p className="text-xl text-gray-600">
                Join thousands of happy students who choose FODYYY for their daily meals
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center group">
                <div className="text-5xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#F7931E] bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                  500+
                </div>
                <div className="text-gray-600 font-medium">Happy Students</div>
                <div className="text-sm text-gray-400 mt-1">Daily orders</div>
              </div>
              <div className="text-center group">
                <div className="text-5xl font-bold bg-gradient-to-r from-[#F7931E] to-[#FF6B35] bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                  5+
                </div>
                <div className="text-gray-600 font-medium">Partner Restaurants</div>
                <div className="text-sm text-gray-400 mt-1">Quality assured</div>
              </div>
              <div className="text-center group">
                <div className="text-5xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                  100+
                </div>
                <div className="text-gray-600 font-medium">Menu Items</div>
                <div className="text-sm text-gray-400 mt-1">Variety guaranteed</div>
              </div>
              <div className="text-center group">
                <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                  30
                </div>
                <div className="text-gray-600 font-medium">Minutes Average</div>
                <div className="text-sm text-gray-400 mt-1">Delivery time</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How <span className="text-[#FF6B35]">FODYYY</span> Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Getting your favorite food delivered is as easy as 1-2-3! Here's how simple it is:
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group text-center animate-slide-up">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white rounded-full flex items-center justify-center mx-auto text-3xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                  1
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full animate-ping"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-[#FF6B35] transition-colors duration-300">
                Browse & Choose 🍽️
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Browse through our amazing selection of restaurants and mouth-watering dishes. Add your favorites to cart!
              </p>
            </div>
            
            <div className="group text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-r from-[#F7931E] to-[#FF6B35] text-white rounded-full flex items-center justify-center mx-auto text-3xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                  2
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-[#FF6B35] transition-colors duration-300">
                Pay Securely 💳
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Choose from UPI, cards, or cash on delivery. All payments are secure and hassle-free!
              </p>
            </div>
            
            <div className="group text-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-full flex items-center justify-center mx-auto text-3xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                  3
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-[#FF6B35] transition-colors duration-300">
                Enjoy Your Meal 😋
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Sit back and relax! We'll deliver your hot, delicious meal right to your hostel room in 30 minutes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      {!isAuthenticated && (
        <div className="py-20 bg-gradient-to-r from-gray-900 to-gray-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B35]/10 to-[#F7931E]/10"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="animate-fade-in">
                <h2 className="text-5xl font-bold text-white mb-6">
                  Ready to Satisfy Your <span className="text-[#FF6B35]">Cravings</span>?
                </h2>
                <p className="text-2xl text-gray-300 mb-12 leading-relaxed">
                  Join thousands of students who are already enjoying delicious meals delivered fresh to their dorms. 
                  Your next favorite meal is just a tap away! 🚀
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  <Link
                    to="/register?role=student"
                    className="group relative overflow-hidden bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white px-10 py-5 rounded-full font-bold text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
                  >
                    <span className="relative z-10 flex items-center">
                      Order Food Now 🍽️
                      <svg className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </Link>
                  
                  <Link
                    to="/register?role=restaurant"
                    className="group bg-transparent border-3 border-white text-white px-10 py-5 rounded-full font-bold text-xl hover:bg-white hover:text-gray-900 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <span className="flex items-center">
                      Partner With Us 🤝
                      <svg className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </Link>
                </div>
                
                <div className="mt-12 flex items-center justify-center space-x-8 text-gray-400">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Free Registration</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>30-Min Delivery</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14L2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span>5-Star Service</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;