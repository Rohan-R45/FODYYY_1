import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/*
  Modern, mobile-first food ordering homepage.
  - Polished, gradient headline for hero section
  - Responsive, with accent colors
  - App-like, clear visual hierarchy
  - Icons, categories, stats, testimonials for trust and engagement
*/

const StatChip = ({ icon, label, sublabel }) => (
  <div className="flex items-center gap-2 rounded-xl px-3 py-2 bg-white border border-orange-100 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
    <span className="text-[18px]" aria-hidden>{icon}</span>
    <div className="leading-tight">
      <p className="text-[13px] font-semibold text-gray-900">{label}</p>
      {sublabel ? (
        <p className="text-[11px] text-gray-500">{sublabel}</p>
      ) : null}
    </div>
  </div>
);

const FeatureCard = ({ icon, title, text, delay = 0 }) => (
  <div
    className="rounded-2xl bg-white border border-orange-100 shadow-sm p-4 transition-transform duration-200 hover:-translate-y-0.5"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#FF6B35] to-[#F7931E] grid place-items-center text-white shadow-sm">
      <span className="text-[18px]" aria-hidden>{icon}</span>
    </div>
    <h3 className="mt-3 text-base font-semibold text-gray-900">{title}</h3>
    <p className="mt-1 text-sm text-gray-600">{text}</p>
  </div>
);

const CategoryChip = ({ icon, name }) => (
  <Link
    to="/restaurants"
    className="flex items-center gap-2 rounded-full px-3 py-2 bg-white border border-orange-100 shadow-[0_1px_4px_rgba(0,0,0,0.04)] active:scale-[0.98] transition"
  >
    <span className="text-[16px]" aria-hidden>{icon}</span>
    <span className="text-[13px] font-medium text-gray-800">{name}</span>
  </Link>
);

const testimonialsSeed = [
  {
    id: 1,
    name: 'Priya Sharma',
    role: 'B.Tech CSE, 3rd Year',
    avatar: '👩‍🎓',
    text:
      'FODYYY has been a lifesaver during exam season! Fresh, hot meals delivered right to my dorm. The biryani from Spice Garden is my absolute favorite!',
    rating: 5,
  },
  {
    id: 2,
    name: 'Arjun Reddy',
    role: 'M.Tech ECE, 1st Year',
    avatar: '👨‍🎓',
    text:
      'Amazing service! Quick delivery and authentic taste. The South Indian meals remind me of home. Highly recommend the sambar rice combo!',
    rating: 5,
  },
  {
    id: 3,
    name: 'Sneha Patel',
    role: 'B.Tech ME, 2nd Year',
    avatar: '👩‍💻',
    text:
      "Love the variety of options available. From North Indian to South Indian to Chinese - there's something for every craving. Great app interface too!",
    rating: 5,
  },
];

const categoriesSeed = [
  { name: 'North Indian', icon: '🍛' },
  { name: 'South Indian', icon: '🥘' },
  { name: 'Chinese', icon: '🍜' },
  { name: 'Fast Food', icon: '🍔' },
  { name: 'Beverages', icon: '🥤' },
  { name: 'Desserts', icon: '🍰' },
];

const Home = () => {
  const { isAuthenticated, user, isStudent, isRestaurantOwner } = useAuth();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = useMemo(() => testimonialsSeed, []);
  const categories = useMemo(() => categoriesSeed, []);
  useEffect(() => {
    const id = setInterval(() => {
      setCurrentTestimonial((p) => (p + 1) % testimonials.length);
    }, 5500);
    return () => clearInterval(id);
  }, [testimonials.length]);

  const ctaLink = isAuthenticated
    ? isStudent()
      ? '/restaurants'
      : isRestaurantOwner()
        ? '/restaurant'
        : '/'
    : '/register';

  const ctaLabel = isAuthenticated ? (isStudent() ? 'Order Food Now 🍽️' : 'Go to Dashboard 📊') : 'Order Now 🍽️';

  return (
    <div className="min-h-screen bg-white">
      {/* Content container */}
      <main className="relative z-10 px-4 pt-3 pb-20 max-w-screen-sm mx-auto">

        {/* Availability chip */}
        <div className="mt-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium text-white bg-gradient-to-r from-[#FF6B35] to-[#F7931E] shadow-sm">
            <span className="text-[14px]" aria-hidden>📍</span>
            Now Available at IIT &amp; IISER Tirupati
          </span>
        </div>

        {/* HERO SECTION: visually improved headline */}
        <section className="mt-3">
          <h1
            className="text-4xl sm:text-5xl font-extrabold leading-tight mb-2"
            style={{
              fontFamily: "'Plus Jakarta Sans', Inter, sans-serif"
            }}
          >
            <span className="block">
              Delicious Food,
            </span>
            <span
              className="block bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-transparent bg-clip-text"
              style={{ letterSpacing: '0.02em' }}
            >
              Delivered Fast
            </span>
            <span className="block text-gray-800 font-bold mt-1">
              to IIT &amp; IISER Tirupati
            </span>
          </h1>
          <p className="mt-2 text-base sm:text-lg text-gray-500 font-medium max-w-md">
            Craving your favorite meal? Get authentic, delicious food from top local restaurants delivered <b>right to your hostel room in just 30 minutes!</b>
          </p>
          {/* Stats chips */}
          <div className="mt-4 flex items-center gap-2">
            <StatChip icon="✨" label="500+ Happy Students" sublabel="Satisfied customers" />
            <StatChip icon="🏪" label="5+ Partners" sublabel="Quality guaranteed" />
          </div>
          {/* CTA */}
          <div className="mt-4">
            <Link
              to={ctaLink}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl py-3 px-4 text-lg font-semibold text-white shadow-[0_6px_18px_rgba(247,147,30,0.35)] active:scale-[0.99] transition bg-gradient-to-r from-[#FF6B35] to-[#F7931E]"
            >
              {ctaLabel}
            </Link>
            {isAuthenticated ? (
              <p className="mt-2 text-sm text-gray-700">
                Welcome back, <span className="font-semibold text-[#FF6B35]">{user?.name}</span>! 👋
              </p>
            ) : null}
          </div>
        </section>

        {/* Quick categories */}
        <section className="mt-6">
          <h2 className="sr-only">Popular categories</h2>
          <div className="grid grid-cols-3 gap-2">
            {categories.slice(0, 6).map((c) => (
              <CategoryChip key={c.name} icon={c.icon} name={c.name} />
            ))}
          </div>
        </section>

        {/* Features - compact cards */}
        <section className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FeatureCard
            icon="⏱️"
            title="Lightning Fast"
            text="Meals to your hostel room in ~30 min."
            delay={0}
          />
          <FeatureCard
            icon="🛡️"
            title="Trusted"
            text="Verified restaurants with hygienic practices."
            delay={80}
          />
          <FeatureCard
            icon="💳"
            title="Easy Payments"
            text="Simple checkout with COD & UPI options."
            delay={120}
          />
        </section>

        {/* Testimonials - minimal slider */}
        <section className="mt-6">
          <div className="rounded-2xl bg-white border border-orange-100 shadow-sm p-4">
            <div className="flex items-center gap-2">
              <span className="text-[18px]" aria-hidden>{testimonials[currentTestimonial].avatar}</span>
              <div>
                <p className="text-sm font-semibold text-gray-900">{testimonials[currentTestimonial].name}</p>
                <p className="text-[11px] text-gray-500">{testimonials[currentTestimonial].role}</p>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-700">
              {testimonials[currentTestimonial].text}
            </p>
            <div className="mt-3 flex items-center gap-1 text-[#F7931E]">
              {Array.from({ length: testimonials[currentTestimonial].rating }).map((_, i) => (
                <span key={i}>★</span>
              ))}
            </div>
          </div>
        </section>

        {/* Secondary CTA */}
        <section className="mt-6">
          <Link
            to="/restaurants"
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-[15px] font-semibold text-[#FF6B35] border border-[#FF6B35]/30 bg-white shadow-sm active:scale-[0.99]"
          >
            Browse Menu 📋
          </Link>
        </section>

        {/* Final CTA Section - placed right above the footer */}
        <section className="mt-10 mb-8 animate-fade-in">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#111827] to-[#1F2937] text-white shadow-lg">
            <div className="px-5 py-8 sm:px-8 sm:py-10 text-center">
              <h2
                className="text-3xl sm:text-4xl font-extrabold tracking-tight"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.25)' }}
              >
                Ready to Satisfy Your <span className="bg-gradient-to-r from-[#FF6B35] to-[#F7931E] bg-clip-text text-transparent">Cravings</span>?
              </h2>
              <p className="mt-3 text-sm sm:text-base text-gray-300 max-w-2xl mx-auto">
                Join hundreds of students enjoying fast delivery from trusted local restaurants. Simple checkout, UPI/COD options, and real-time order tracking.
              </p>

              {/* Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/register?role=student"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-base font-semibold text-white bg-gradient-to-r from-[#FF6B35] to-[#F7931E] shadow-[0_6px_18px_rgba(247,147,30,0.35)] focus-ring"
                >
                  <span className="inline-flex items-center gap-2">
                    🍽️ Order Food Now
                  </span>
                  <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                <Link
                  to="/register?role=restaurant"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-base font-semibold text-white border border-white/30 bg-transparent hover:bg-white/10 focus-ring"
                >
                  <span className="inline-flex items-center gap-2">
                    🤝 Partner With Us
                  </span>
                  <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {/* Trust badge */}
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-300">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Free Registration</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
