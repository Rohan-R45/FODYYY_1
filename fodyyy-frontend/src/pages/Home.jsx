import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/*
  Mobile-first redesign notes:
  - Compact, app-like layout inspired by leading food apps
  - Smaller accent icons (16–32px) used sparingly
  - Tight spacing and clear visual hierarchy
  - Subtle shadows, gentle gradients from brand colors
  - Minimal animations for polish
*/

const ACCENT = {
  from: '#FF6B35',
  to: '#F7931E',
};

const DecorativeEmoji = ({ emoji, className = '' }) => (
  <span
    className={`pointer-events-none select-none opacity-30 text-[18px] ${className}`}
    aria-hidden
  >
    {emoji}
  </span>
);

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
      {/* Tiny subtle floating accents */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <DecorativeEmoji emoji="🍕" className="absolute top-20 left-4" />
        <DecorativeEmoji emoji="🍔" className="absolute top-[140px] right-6" />
        <DecorativeEmoji emoji="🍜" className="absolute bottom-24 left-6 hidden sm:block" />
      </div>

      {/* Content container */}
      <main className="relative z-10 px-4 pt-3 pb-20 max-w-screen-sm mx-auto">
        {/* Availability chip */}
        <div className="mt-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium text-white bg-gradient-to-r from-[#FF6B35] to-[#F7931E] shadow-sm">
            <span className="text-[14px]" aria-hidden>📍</span>
            Now Available at IIT & IISER Tirupati
          </span>
        </div>

        {/* Hero */}
        <section className="mt-3">
          <h1 className="heading-display text-3xl sm:text-4xl font-[800] leading-[1.15] text-gray-900">
            Delicious Food,
            <br />
            <span className="bg-gradient-to-r from-[#FF6B35] to-[#F7931E] bg-clip-text text-transparent">Delivered Fast</span>
            <br />
            to IIT & IISER Tirupati
          </h1>
          <p className="mt-2 text-[15px] text-gray-600 font-[500]">
            Craving your favorite meal? Get authentic, delicious food from local restaurants delivered right to your hostel room in just 30 minutes!
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

        {/* Secondary CTA - keep close to bottom nav without huge gaps */}
        <section className="mt-6">
          <Link
            to="/restaurants"
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-[15px] font-semibold text-[#FF6B35] border border-[#FF6B35]/30 bg-white shadow-sm active:scale-[0.99]"
          >
            Browse Menu 📋
          </Link>
        </section>
      </main>
    </div>
  );
};

export default Home;