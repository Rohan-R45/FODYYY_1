import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView, useSpring, useMotionValue } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

// Floating Food Icons Component
const FloatingIcon = ({ emoji, delay = 0, duration = 3 }) => (
  <motion.div
    className="absolute text-4xl md:text-6xl opacity-20 pointer-events-none"
    initial={{ y: 0, rotate: 0 }}
    animate={{
      y: [-20, 20, -20],
      rotate: [-5, 5, -5],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  >
    {emoji}
  </motion.div>
);

// Animated Counter Component - Using Framer Motion (Modern & Actively Maintained)
const AnimatedCounter = ({ end, suffix = '', prefix = '', duration = 2 }) => {
  const counterRef = useRef(null);
  const isInView = useInView(counterRef, { once: true });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { 
    duration: duration * 1000,
    bounce: 0 
  });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      motionValue.set(end);
    }
  }, [isInView, end, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      setDisplayValue(Math.floor(latest));
    });
    return () => unsubscribe();
  }, [springValue]);

  // Format number with commas
  const formattedValue = displayValue.toLocaleString('en-US');

  return <span ref={counterRef}>{prefix}{formattedValue}{suffix}</span>;
};

// Feature Card with Hover Effects
const FeatureCard = ({ icon, title, description, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ y: -8, transition: { duration: 0.3 } }}
    className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden"
  >
    {/* Gradient overlay on hover */}
    <div className="absolute inset-0 bg-gradient-to-br from-foody-primary/5 to-foody-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    
    <div className="relative z-10">
      {/* Icon with gradient background */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-foody-primary to-foody-secondary flex items-center justify-center text-3xl mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-lg">
        {icon}
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-foody-primary transition-colors duration-300">
        {title}
      </h3>
      
      <p className="text-gray-600 leading-relaxed">
        {description}
      </p>
    </div>
  </motion.div>
);

// Restaurant Card Component
const RestaurantCard = ({ name, cuisine, rating, deliveryTime, image, isClosed = false, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ y: -10 }}
    className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
  >
    {/* Image with gradient overlay */}
    <div className="relative h-48 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-br from-foody-primary/20 to-foody-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />
      <img
        src={image}
        alt={name}
        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
      />
      
      {/* Delivery time badge */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-semibold text-gray-800 shadow-lg z-30 flex items-center gap-1">
        <span>⚡</span>
        <span>{deliveryTime}</span>
      </div>

      {/* Closed overlay */}
      {isClosed && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40">
          <div className="bg-red-500 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
            CLOSED
          </div>
        </div>
      )}
    </div>
    
    {/* Content */}
    <div className="p-5">
      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-foody-primary transition-colors duration-300">
        {name}
      </h3>
      
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-foody-cream rounded-full text-sm font-medium text-foody-primary">
          {cuisine}
        </span>
        
        <div className="flex items-center gap-1">
          <span className="text-yellow-500 text-lg">★</span>
          <span className="font-bold text-gray-900">{rating}</span>
        </div>
      </div>
    </div>
  </motion.div>
);

// Testimonial Card Component
const TestimonialCard = ({ name, role, avatar, text, rating, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x: -30 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="bg-white rounded-2xl p-6 shadow-lg border-2 border-transparent hover:border-foody-primary/20 transition-all duration-300"
  >
    <div className="flex items-center gap-4 mb-4">
      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-foody-primary to-foody-secondary flex items-center justify-center text-2xl shadow-lg">
        {avatar}
      </div>
      <div>
        <h4 className="font-bold text-gray-900">{name}</h4>
        <p className="text-sm text-gray-600">{role}</p>
      </div>
    </div>
    
    <p className="text-gray-700 leading-relaxed mb-4 italic">
      "{text}"
    </p>
    
    <div className="flex gap-1">
      {[...Array(rating)].map((_, i) => (
        <span key={i} className="text-yellow-500 text-lg">★</span>
      ))}
    </div>
  </motion.div>
);

// How It Works Step Component
const HowItWorksStep = ({ number, title, description, icon, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="relative flex flex-col items-center text-center"
  >
    {/* Connecting line (hidden on last item) */}
    <div className="hidden md:block absolute top-12 left-1/2 w-full h-1 bg-gradient-to-r from-foody-primary to-foody-secondary -z-10" 
         style={{ display: number === 3 ? 'none' : 'block' }} />
    
    {/* Number circle with pulse animation */}
    <motion.div
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="w-24 h-24 rounded-full bg-gradient-to-br from-foody-primary to-foody-secondary flex items-center justify-center text-4xl text-white shadow-2xl mb-6 relative z-10"
    >
      {icon}
    </motion.div>
    
    <div className="bg-white rounded-2xl p-6 shadow-lg max-w-xs">
      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-foody-cream text-foody-primary font-bold text-sm mb-3">
        {number}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  </motion.div>
);

const Home = () => {
  const { isAuthenticated, user, isStudent, isRestaurantOwner } = useAuth();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);

  // Sample data
  const testimonials = [
    {
      id: 1,
      name: 'V. Sai Akhil',
      role: 'B.Tech CSE, 3rd Year',
      avatar: '👩‍🎓',
      text: 'Absolutely love FOODY! The ordering process is smooth and quick, and I always get my food delivered fresh and on time. It’s made campus life so much easier',
      rating: 5,
    },
    {
      id: 2,
      name: 'P.Ganesh Sai',
      role: 'B.TECH, 3rd Year',
      avatar: '👨‍🎓',
      text: '"FOODY is the best thing that happened to Tirupati campus foodies. Tons of restaurant choices, accurate tracking, and friendly support. I use it every week, and the experience just keeps getting better!',
      rating: 5,
    },
    {
      id: 3,
      name: 'E.Rishikesh',
      role: 'B.Tech , 3rd Year',
      avatar: '👩‍💻',
      text: "The interface is modern and easy to use, and I appreciate how delivery charges and order management are handled so transparently",
      rating: 5,
    },
  ];

  const featuredRestaurants = [
    {
      name: 'Convienio Cafe',
      cuisine: '🍛 North Indian',
      rating: 4.8,
      deliveryTime: '25-30 min',
      image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&h=300&fit=crop',
    },
    {
      name: 'Tasty Tales',
      cuisine: '🥘 South Indian',
      rating: 4.5,
      deliveryTime: '20-25 min',
      image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=500&h=300&fit=crop',
    },
    {
      name: 'Cake House',
      cuisine: '🍜 Bakery',
      rating: 4.7,
      deliveryTime: '30-35 min',
      image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMTEhUSEBMVFRUVFRUVFRUYFRgVFRYVFRUWFhUVFRUYHSggGBolGxUVITEhJSkrLi4uFyAzODMtNygtLisBCgoKDg0OGhAQGy0lICUtLS0vKy0tLS4vLS0tLS0tKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rLS0tLS0tLS0tLf/AABEIALcBEwMBIgACEQEDEQH/xAAbAAAABwEAAAAAAAAAAAAAAAAAAQIDBAUGB//EAEAQAAIBAgQEBAMFBgQFBQAAAAECEQADBBIhMQUGQVETImFxMoGRI0JSobEHFDPB0fBigqLxFRZDcuEkNFOS4v/EABoBAQADAQEBAAAAAAAAAAAAAAABAgMEBQb/xAAwEQACAgECBAQEBQUAAAAAAAAAAQIRAxIhBDFBkRNRgaEiMlLBFCNhcfAFQrHR4f/aAAwDAQACEQMRAD8A6+1Ik9qWRRVAETSTRmkmgCNHrRUCaADU0Wo2pIFQAp9KE0ZFJoAjSJpT0gUAc0lqM0kmgEE0CaMURoAqIUo0ioAnWhQmhQBGm2NKpLUAU0KEUDUgSaMGkkUFoBYNANRGgooBaGngaaVaeUUAAKDGlgUCKAa1ozS6I0A3lFFSooVALtvegKI0QNWAZFNFfWnJpJoBIojQY0JqAJoAUqiJoBDUg0otS7KyaAjsKIVMNkE6VFvjLpQCDSStBWmlOpFANUdE1ANQAakb0tqQagAApJo81JoAEUWWgTRg0ARFVi8RzXjbXZdz3PYUvj2M8OyxHxHyr7nrWe5cbz/T9a8/iuJcMkccfUhs1rCgKZv8RtL8VxQe0yfoKinjVj8f+lv6V1yz447OS7k2iwmjU0xbvK2qkH++1Pqa1TT3QHrdPA0wjUsvQC4oUVA1IElqICjFKoBNClFaFVJLc0UUnNRzVyAUKBNJzelAJdaIClE0gVADmkNQmkk0AWlOWHANNCjNALGIAmo1/wAxpTLRqaAGHw5qauGnemEePak3ccdlFAIxiANApL2COlJtasJqdEt7UBWtTZNWuIGlVxt+9ANhaML3qQlj1qBicaVvC0bZykTn6envvSiVFvkLakOQoliAO5ortwzopge2vYelY/mLjBa5kU6LpHSetc3F5/AhaVvoS1Rb8xWvFszaIYocxA3jrWc4XdYFsvxZdB1n+tRsNxd7J8ZmypJXKQCbnoPT1p2xxVbh8RfDBHxDaB79RtXi5m8zU6p9f+GLabHFwjz5oB3I3NPeFlifr0qC3GvveSTp8RP+9V+KuNiItzJJ0A0Heufwt6K2i7tYkycjR/iB0Hz61a8F4sufwwGcsfimT856Vlr+FuWpt3YULpofi00g9q0nJmCgNeI38q/zNdfCY5xypRf86kxk26NYopaimVep2HTTTevfNRuDRQaW4PY03mqQKVKWKSrUrPUAQWo6Vl9DQpRNlpSaM0gzViBdExolagagDTUSmjakCaAcpBNLpthQCQKOKQZowaADmmHpx6aagJd1/IoFRYpbkwKRFQAZ42pT4lpmmiKOgHjiSRrRrv6UwtOWmkwKmwQcfxbwi5uqRaEAXFEwdZkdR8qoXxahgFuBgbkjylSsqMwyn3UjbpVtx3CAJcYqbjsIFss2SVEgZAYOo61lmu3kNxG/hykXGWHL3CNJAA2XYARpU2duOKcbReYh7ivnDTnBAGoAJOmbvuPpWGwdh3uujb+Iwkf9x2jea0d/NaRmuHMACVmY9mM+bSajYC2hLTmzOGe3kYqQwZYggg7nTcGK4uMxvJpj+plkg5UkQMNwI4t3N0XECXFt2reirkDHxCWgiSAdu/Wp68qYZFa29p2U+d7mY5lGmULETE/masW4m6WyLQyKEJLvo1wH4iDEk5pnSNRUROYfENtlhwq5ozEMrTJ0GnSN+vXauiGHHBJUarh0lyKbjPCkS6wtWG8MKuVUJkiIJIOsyDNDg1uwzHzeAyaedoOYyIynsf1p7jOPus6tbIOVM05ipIYmUaBBIUEdRqZNQeM2FQC8oLMGlnGXyljpmI1MGIJmuLPwkW3NdjnzYFDdGn4vwxGRLl64Rl8jKBOYjovarrheKtOoW1plHwkQQP51z2xxfxz9ozgiPiaVJAiYAG/erixfZSGEgjWdhXHLi/Ay/DHbr5nNq0y2Ns1WtpTGlYvFc3WbeUXgwLDoJG4B/WtPwziSXbaujSp2P/ivaxzU4qUeTNLTJoU6CaPE25O+2lN+IJ3oy3atAEtg9DTzWyIo7XeadQE7mlAja0KmQPSjoDJ8d54tWAMoNwnosTTnGeZ8mHW7aWSwB1MZQe9cw4Zy9efNfdL2YMTbtZCu20yBU3iHC+J4sBHsraQfiePyWZqaj5ldzX8vc+Ldtq15CpLlCd1BmAZ7HT61uFYESNZ1rk3BeRxaUfvF03Nc2RdEnpp1rpXBli3LfL2FUtN7FqfUmsKQVpu9xC2ukyaZ/wCJTsKNoEtQaBU1FXEE08j1Fk0AoaSFPanw4G5p9bYNTYogOKbiatThAaYu2culSQQypgUPDNKuJOx2pJU0oA8E026kVJtE9adIpQK0tSuHtDk9talPYBpnwBJA7UoDDXZM96p+P4y0qlXXN8LFZy6KRJmDBitDgrGXMSM0DT39K5px65fvtdu2vhkJcBBABG+UASWH0FFzom2t0Z3nPmBMS82bjIFIC24AWVMhs3Xf8qRyTdxAxNq64d0Qm3nADZVY5mzdSJPT07VoOSuF4S8ly2+W9cFyXWBCqs5CD96TrNdAwPB1gCBA2A0A9gKxlkp0ly8zWN82zL8c4fbALXMzeYBW6KpIyqq+oOulVAORvDM25OdsipAtOFhQQOmU6H5a1uuN8Ob4bQVWgZSew0IHYa/nUX/l5vDLLDPp5ZnQAAxPWBUSyrojuWSOlWYPnC0gtBPEeSZQKMxYgGEIEyNe43qo4bwe9eg4h8i6kj75Jj7uw2G9awcJv5ySoSJVd5yzpK9DAHbatNgOEFVh1UjTSIj+dYZZSbpHPlSfUwGF5YCgLauliNs/btmAqzwVm8vlZJ9ZEfWtxYwYU+UaVIxllAksonpoJPpXLPhte7ZzSxxbOZ8ycIuYpALLi2bVxtWB1YCCAR026dKiPgcdbthghYCZNpy0ADcgCZPeuu8Nsqk5VAzGTpuTvTDAC8wSI0OnQncf33rpwKWGKiQoKjDYLi2JWyqhgWB+JxJ2BIE7gT3n2q/wHNCZltXlKuwHnCnwzO2v3faTFWPNGFH7uvhhFIuK0mADMhjtvG/oKwnE8KMw8NwHQ/AG8twRrcmNOulehB61dGUvhOoW2G/Sje+33R8zWZ5EuOcOc8wHKrO+gAb/AFT+daMiposmRXtXCZLGhUmKFRpRNib14wp7b1GcyT61cYvCCNKprjFWB9aoyUO4bA5iJ0ApPHWcAImix0q5zggGo+KyxFxZU9RuKlqkDJ2kIq0sIeulTrHDkzZkcEdjvU9sICpBqiRNlcCqiS1ODGINjJ7VHfAXFPlysCdZ7UMRhNJiCO1AVXEMcbtxsiuPDEa6Ak9u9SOBccuKhW8vmB0G5K96axGIVBJnsPKSZqFd4l4ahmGZp1JhTBqE9yaOiWLgYAioHEsYoIWdT0rD3OfP+lh1zv8A4dQPc0vAXXLhrpzOd+w9BV9RWjWWby9TRG7UNMQvanBc7Vcgk27lPC4Kr87dKcR2oCZNI60hb3elZtaAkYZ1IIkSDmjrGwP5GsNzpwTEEEYZAyXDJEhSrMxZiCd5Jp/mO+zXWRfu29IOraFiAOtFwXnFkSL0XFUwpGZWCiN805oOk1wS4lLI17nYuFk4JrsZm3wdcLZZX+zvHzsM2rASVQsp8yxuJ39qe/Zzxq4t64HnwSCcusBpHmA6Ekx6zW3xl7A4rW6R0G5VhpOpHTWpNrgVhsO6YUqqv99dTmB0JbXNBrZZlPZGDxuHNFHjOdwrhb9hcviZPLczOqnQXCI16aD9dK1GijMHEDXX+tYzjP7O1uX/ABPHMNEqVzERvDSB7aaRWpxfDc2HNu0TK5Y1gkoQQCT7UlpckkQrS3KXFc9YXOouIWU3DbLwujISDoSCdQdp2rTXLqMAUIKwCPwkETIPauT8yWsTcuKhtOcokgKx80mDER8+xq+tWMTbwdpLwhLcBtSWgDQt6A/yqZxjaSZCbptmmTjFhnCW71sMwOSNc0aHKdmPoKb4ndSyoZznfpJjTqev5CuU8dv57hYMQoMIZkz/AII283atk9vF37SXEVs6oFafvEgSwDdDrRwhGatjVJxdEpeb9crhAC+UC2+Zip2Yg679NInrVfjObGtjxLIRlJAAJUgnuSDmOx0MVVYflHEG94otureac3ktiRoR+kRUrB/s6tWi1xr7q05yAVKqJJaCwET+InStH4aZRamJ4hzUMRcCOGV1hwgJygFT2IkdDM0jAcHv4i54lllS1lUEknQjQlABr7TFWmLGEw9rMHw11lAABa3duS0wY0md4EH+VNiuZLlxVS0PCUDRbbFNJkbEQNazlxOlUjWPDObtmzwF3LfuWVjJbS2AQD8REuWO0mR9PeLZblZ7kcKbLkGT4hzbzOURJO8gz860otitcPyIrkVSaE56FHkFCtTMt8QdKoMfVhhcdnBzR7U61sHpVGiUyBg2YqJqwtscu1MqIaBtUtKgEC7hkOsFfVdR9KjPYP3L310qwugbwfdTBqO9wfjP+ZQaq4lrK26l/pcQ/wCaod63if8A5LY92NWtx0/En0qHevWhu9sfKq0TZn8Xgb53xVtf+1ZP61WPy6jGbj3r3+la0eI4tYX/AKgPoqj+VVmI4zm/hWnf1bQVGkWJw+FW0IRVQdl1Pzam7PEFLFUMnqRrHzqLiMFib+jnIv4V0Hzqw4PwHw6skLJtnGkSTMDqdqsOG8RW7/DdSRuJrIc38ayI9kAQRlJ6z6VM5M5ca0/jm6GzoNI2G9ackUNwrEb06mutR+IMy2ma2MzBTA7ms3ydxnEO9xb6EKPhJBBnWR+lSiLNW9GjHpppRXDNFbM6VBJnOYXFu+twHzBVOh1GUkj+/Son7tZxOYPntuxnxNDbbzA+dQJGw201p3FqlzFXUuMUBJRCdVUiILDtofrNVnEeH3bDgXAV18jDVSCSfKwEHppXj5G3OUlys9jFFaYq96G+Jcu4iy8kNBmHTzJto2YdYkfOotnH3rZBV7iyQBJBPl+GSZ0O2vp8p2A5ju2iAknQxlMNmEyDPlaf8Q9fa+wfOtgp9tYtmSAfKoDNGbzaRNQlF89vS/8AH+i7lNdL/nkZZ+OYglWI185LBBPqJUSNTG8GDTuB5tvqAZJA1KnXQb77Cc0mtdbx/CboM27SGTPkgzqCAye3TtWfxnCMCxK2cQVJOYZl8S2oI67NGvetNCirTXcy1qTpxa9Bq3zjdzElmnMBBUZBpvopIHUyevtKv+fnjVV67qdRr1kDUxULFcuxm8PEWIkEasDuTqMun3fkKhry7cdyBds/dGUuRr1MsBO49NPcVVSvq+5Zwx+S7Gkw3OuEDKzYaCVnOLaAk9SNZAkgdz2FJ4n+0dY/9NbMyYLrC5QNTodNY+WtV+F5KkDxcRYQyGbK5dmOwLbbHYbCl3OVsMmhxYMLHltk6KZESx1Gm/pWuuXX7GHh4r2+5U4/nHGXmKi4EIhTlQKASDPxEnr/ALQZoWdmAzsWYmcxYsx80ZY7bn3/AC1v/DMBbgM124I3kW1BG4J0O2p32p6xxzBWcxsYe3MwSSbhEekfp6VTUn1+5ok18sfsZZOHXDae+qkWrcnMVgEGAd9W8xER2qutY5jItZtY1K66xMAHaRWn4vzS18EHzW5/hqAq6QwJ3LD0ncbVTtfGUkwAGkAdgwgAbt0P096m109xUuvsbn9nODyWHYnV327ZR/8AqtYUboax/IXEswawREeYAxpPTT2rZia9HD8iPOzfOxnz+lCn4NCtTIzdniCWSSboI6iI/U1GxfOCalWk+hmPpWVscCOc+NeQjoTmk+mU6fnU+9wjD9LWb1Dqo9djNbUilmp5f5mS6+S4+pjKTpqfuk1qjoJnSuU4TGWEOTwQoBnUsSO253rXXeJNcSGMDT009e9UcNyyY5xPi7AzbaCJnaPQVDs80kkC4invl3/OoHEsDcgsjZj0U6D6/wBapuDm493wskPMQRsOpqXFUQmdMt4S3cUOFEMJGnembnBLR+4PpU2wyqqqDsAPpSvEmsS5XDg9sbKPpSxgEGwFT5ojUCyGMMO1GMOKkxR5aAouIcr4e82e4gJ71YYPhi2xCaAVPilCpA1HekraFPmm2Ee1AKAostAEUcetAZnmzhjqxxVkSG/iCYytET7bUjl7jSHyX/OjHKyHXLl+8BsI9PSK1du6RIIlTuNx9KoOK8oo5z4VvDJMlDopPcEbfnt0riy8O1LXDmduLPFx0ZO47i+UsJeGbD3Mg3GUhhOvQ69TpP6VR4zkjEJ/Da2407qRHUJt369ar8ZhsVh5N0OIA8w1XVoMEaEwZpNjmW4o+N9NW8xPmicpDTGkVzylH+6FfsdMY5K+Cd/uQ8fwPEW2g2mMMCcoJMQNsu2oH1qsbCmGXw3RhszKZIO0g7HuOmlaa9zS7jMbrrBMkIpE7CYST7d9PSrXhvOIA+2yuSJJIytA0jLrP85qqnG63XoX/MStpP1MAiMQJmSFzRIAMggbnqB17+1LHigSM4JEaTGms79Z3noa6KvMeG1JtD0jIJ9dTpTN3mewYy2d5EZrehHQ+b0P0qfy/qXYrryfQ+5zvx7gIlm1mANtNdfyH9Y1CJcYbsxBjfNqVJgeoJP9itq/MVojMlhc0kasIPzUGaZu84KolLSKwHxZSyjpvoAen1qHo6PsiVLL9PdmVs8IuuQQCdZIALGSRvHtVmnJV5o8qqOpY999AZ79acxnN19vKCqKRPkCiAVJgk7H29Npms+OIX2thczhYgL4hKqMwEszE5juev61dV+vsijU35L3JvG8FYwogOLzhgMkEW1UAHzGfM2gEA9aocTi/MXYKI0AAhFkEeUT+fpVrw7geIvt9kjEA6XG8qANB+IgKdDsJ26mtThOV8Phgb2JYXXABiItAjrl3c++mkxOtXjG92tjKc1DrbKjk0mwv7zfUqbuiLsSApMx0Hv0rQYjmh1sWGUg3XC3HEaBWkhD7gj6VmVxNzG3bmQEnKy200HlMBjqQMxBj/amkwF7xBbW00r90CYjvHTaqPiJpPSv2PLyZJSbaOgrzTZgZgwMCQADBjUTOtCsM1pwYdXDDcEGhXG/6lxCdOuxz+Nk8iHi+KAfEY9J1qHZxj3Wy2wSO/QU+uGwa+YWwx7uS8+5JosZxEhIthUUH4QIj2j3r6qzcf4xeRfDUHM9seY9JJ29YNW/CMWbjqD0jr06SPeudY7EsTlB2Mk+vb5VruTWO5/v3NVstRvL2JQHKSPbehZUSXQDNET1IqoCGSW000A7+pqz4M8Ajtqep+tGiCzwbFhP9+oqztLWMwXMJt3Wtlcy5mYkbrsD8q2Fi+GAZTIOoPpWDVF0ySKUBSFenFNQSHloxQqp49xQ2gFSM7AlZ2hYn33olYbLehFYHhHPNxr62ryKVYhSV0YEmJjqJjSt6rSYHWjVEJ2HUS/xC2uhcT2GprLc3cfYM1q2coGhPUms3g3usrPbIlSJLHTU7T3I96qnbos1Ss2FrnHCtc8M50bNlGYAAnt3Hzq9t462YGxO2ok+1cZxfLt4XEbE3VRC5LkMS4liVGq5QTEZif6Gzs469iLjphoFq0sO5kxMwF6s+hgyBpOlaOJRSOvIyExmg9jE/SnGwx6Qf77Vx3j9+4HBtX4uaZDKt5yA0N+F4233HuNdgOcHeyLttUYyqsGbKQSB0H6VVxZKZr/EI0O3UESPpVdi+EYS7OayFJ1LWybbT3lSJ+dV/AedreKueC6ZHjyurZ0J/CTAINaE21bWP61RxT2ZdSa3Rl8XyTaYHw8Q6k/jRXAPQ+XKe4361XX+Q7v/AE71oggAyWWY2jRorbXsNGxPzFRHuEb1k8MPI1WfIuphzyLjMsFrRMsdLpI1MiJQGBAEdhTB5BxefMTbIylR5xA1kMNJmfWt02NA3ptuIp+L8jVfBgafiMhik5ExQgFrUAASb7yIEECLZka/kKcP7P7jfxL9pNZ8ud9dNNcumg/skVqrvFLY+8fof6VX3uYbYMAOx9AP5mixwRDy5GQrfJOHGXxL118vRVVQYmM2YMTGY9aILg8K8HDAMSSty4TeB9i85DtpAp3HcauKwAtrB6sxneNIXTpWa43jb1wuGtghcpylgpAaSro2x06n20mrSwyr4OZWSySXM1OJ467D7FBcPQB0Cj310H51ExWAa8gF85WmWytmGvQSAAPkT6muc8RwoZouF1UEAArmUMRMErMt6Vf4I3sMqsl1mDfcZiyneRDfCdOmtcv5jW6fY52p3TRp+H8EtWZNsGSIJJmRMxG1TMBghbL3UBlfMywIZCPMFO4OgMbeUDSqjAcyrcRmFvzKPgDiWgTpIEfOqXiXFb91S6yiXFyR0KAyQCN9Z10n2rOpYWpS5EOLirLrHcQt3HZ8jCY9DoANR30oUxwvhN97SNmt6j7xM6aa+Q9u9CuSXB55tyrnvyMNLe9ew2nK8jW4s/D5Rv8AMn86K9yzIKy0dwEB27lu1ItcdXQdBt8waYfjR6SdIP0ivq6LhJybZBkl+5l0/QCrnC4G1ZU5WWRA79J9KpsRinKqxk55gTrAaJNSLc+EA6rJJbu0aRJ+REbVFAtbuJtjzM8iYgKoPzJJIFHc4yMnkAQa5B1JOkk9apsPZyyfxZXXsCJ2+vWjuNJ+n5CKAiNeI0UxO8CNdjPetnynix4CidQWHtrMVmbWAd/gtsfXYfnWi5f4FcQkvpMaCs5tF4mpsPNSlpuxZgU+FrMsACq7jnCVxCZSSrCcrDcTuParMA0qKkNWYPBclsl0XC6krtpB+dbDAWWUgsZgg1Ly0eQ1D3ISow/PvLNwM1+wpdG8zBRLKepgake1ZrBNctolsS7lvE8NApOhBhmLADTc9IrtGHcx7VCxPB8O7+I1pBciM6jK5B6Ejf51EaTJlbVHGudrN9lLm2rKPihgRBgFV6EbSKreRziLC3bRtE5/MIZTCEZX12BEDQ/irqPFOQcNcLEXLyZpkBlIJbcwRvTHBOSrWFDBL9xsxkllUnaBtV9SK6djm/HmRWfw2U3HVPs+ge2qqSpgCSoEz2EbUnBWUsWvNddmchmVYGXT4lzLJE+25rfvybhQ5dnvuSZIzIoJ2/DP51L4dwqxZ/8Ab2FUgk52m44kyYZycu52qNY0lDyVwS6jriL8BFZntLlK3LjFSqZ12yiZnqQsenSbEgAHeNffrVThkJaWM9STVj4lULIm3mkVWYhacuXagYi+w6T7b/Q1VoumM3rNRLlmpAxwO4Yf5GP6Ckvi7fc//Rv6VnRdMrMRaqkxasIZRHhtmLCJg6ZYOh9q0eKxCZGeGhemRgT7SNagfvqW7gVrZzTDfe9QQIiSNI31q8Iu7OjGnz6DWM4XfZ1urdbwgPEOZQSAXUqpBKsBo510EelN4riVq8n2JtgPcbxTMtnGqx+KVUiOsimec+KZbS2LZvFi2Zvihs5g2u7DzdNNAJ6VFs8Atfu820+0drZCMYNsB1N2OhMKes+bWIitG+dESbfMtr/C7VuwLqJmnMQ4JEGMkdixkgSPnWH5hvpksy7teInLAgMxZQEG+YEx6hhBrQNi4lCTlO4nSRtI/uKp+KcDW4S9lvtANFOo0gjKd1bTf/euOHGxkvi2fsc8c6aqRHtIlsfxGYajwyMptvsM2u8ZpHatPgOC38tl7QzK6h8pVfLcQkFiM0feB+vtS+C8FteEbpTV3N0FwuhVgchUbE+YGPwn5zLXGXvI1kL4Vu5mVXzG2gAI+E/eJJG20H2roeGNW/Q3ljbW3IhtzReBIe4AwJBEAQQYIgChS8NwqwygqixqBo+sEidNOn+1Cuf8JxHTIzP8G/rItvgIA0jsBB6ydZ7U/b4PqCNvvaQekx+db1eGp1UUa4BV2GlejrOTSY88GuHRQQo0UHtv+tTLHLbmCxFa5LdOAVGtk6UZizysv3iTVhh+BW12UVcZaPJUNtlqIlvCAbCn0tU9loRUAILRxQy0oCoAIoRRgUeWgABRgUAlOAUALehpVxdaGWlGzIo0CFjBtFRMWsKSKsMVb09qh4oeWqgqwumtIC1IuKANarbmNBMDYUFFhbeBSvFqvW7NOqCagkkNdphrlLXDk0/bwdBYzZSakLbPvUi3YApwW6mhZS8bVvDi22V99gZGgO5A61irk3GuFQFCFEZ2YEjxGOY7AwFWfYV0HjGGm22VAzEFZYSFB1JImY0G3pWHxFpVtziTkuPca6WOyoDCyFGxADRqND7025M7sDUoaSRYurcJGZSbWdy0gBiQyznGojxFMT90VX4TEratriLjMBcDRayIzCCAWJJkKSRHsahcf4g+Dw3g2Vh7xZluaE+GSpHQhtIH0PpWSwuCxeIZfEZyFMjNsJObQe+sVTLnjjT1Mrl4iMdupY8Y4oiCA23rqapuH8zOraAkfP61fjlFH8qW3vufifMcqn0y9foKt8B+zi4qNlAVipAzHNBIjWBXnYoRePaLfscD3XIewGOZibV77Rb1gXLQBOQsnmhQdGcZun8tI5w+UJ+8WWyAlWGYGM8sEWPhacpYdMw1nWtB+4PZvkurLbUWxZ2FtfxLmkiektqQdNalcxWFKslhVbO5fO5UkEKASskRGQyR3Ar08cY6dK6Hq4nHSoLcn8Lwb+EuVbcaxoe516fpQrPXeYHn7LFXbawISLYjQToUMazQrTxoeZR43fNHRlcGlUKFDzxJ0pYYUKFALApVFQoATRg0KFAHFCaFCgBmFKFHQqAKowwoqFAOKacU0KFSAnYVBxCTtH1/8UKFQ0CrxXDmbTPlHpqfqdvpTdrg6KKFCq0CQmDQU8tgdKFCpA4LdKihQoA4FHloUKAJlHWqy7wDCtGaxbaNgy5gPYNMUKFKQsZvcr4RiGNi2SoAXTYDYAdBT1ngthPhtIP8oP60KFR4cfJEUiT+7r009tP0o1QjrPvQoVYkJwrAo6yCIIOoINZXmvCIzJbAYuzLB8pKrnUMVLaAwxk9YG9ChUpKzq4VtTKO5ympJLXcpk+XUx2EwZ09aOhQquqtj0FFPc//2Q==',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const ctaLink = isAuthenticated
    ? isStudent()
      ? '/restaurants'
      : isRestaurantOwner()
        ? '/restaurant'
        : '/'
    : '/register';

  return (
    <div className="min-h-screen bg-foody-cream overflow-hidden">
      {/* Hero Section */}
      <motion.section 
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-foody-cream via-white to-foody-cream"
      >
        {/* Floating food icons */}
        <div className="absolute top-20 left-10">
          <FloatingIcon emoji="🍔" delay={0} duration={3} />
        </div>
        <div className="absolute top-40 right-20">
          <FloatingIcon emoji="🍕" delay={0.5} duration={3.5} />
        </div>
        <div className="absolute bottom-40 left-20">
          <FloatingIcon emoji="🍜" delay={1} duration={4} />
        </div>
        <div className="absolute bottom-20 right-10">
          <FloatingIcon emoji="🍰" delay={1.5} duration={3.2} />
        </div>
        
        {/* Animated background gradient blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-foody-primary/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-foody-secondary/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 text-center">
          {/* Campus badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg mb-8 border border-foody-primary/20"
          >
            <span className="text-2xl">📍</span>
            <span className="text-sm font-semibold text-gray-800">
              Now Available at IIT & IISER Tirupati
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-7xl font-extrabold leading-tight mb-6 font-display"
          >
            <span className="block text-gray-900">Crave It.</span>
            <span className="block bg-gradient-to-r from-foody-primary via-foody-secondary to-foody-accent bg-clip-text text-transparent">
              Tap It.
            </span>
            <span className="block text-gray-900">Devour It.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Delicious food from your favorite campus restaurants, delivered fresh to your hostel room in just{' '}
            <span className="font-bold text-foody-primary">30 minutes</span>! 🚀
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <Link
              to={ctaLink}
              className="group relative px-8 py-4 bg-gradient-to-r from-foody-primary to-foody-secondary text-white text-lg font-bold rounded-2xl shadow-2xl hover:shadow-foody-primary/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 flex items-center gap-3"
            >
              <span>Order Now</span>
              <span className="text-2xl group-hover:animate-bounce">🍽️</span>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-foody-secondary to-foody-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
            </Link>

            <Link
              to="/restaurants"
              className="px-8 py-4 bg-white text-foody-primary text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl border-2 border-foody-primary/20 hover:border-foody-primary transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
            >
              <span>View Menu</span>
              <span className="text-2xl">📋</span>
            </Link>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 10, 0] }}
            transition={{ 
              opacity: { duration: 0.8, delay: 1.2 },
              y: { duration: 2, repeat: Infinity, delay: 1.5 }
            }}
            className="flex flex-col items-center gap-2 text-gray-400"
          >
            <span className="text-sm font-medium">Scroll to explore</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 font-display">
              Why Students <span className="bg-gradient-to-r from-foody-primary to-foody-secondary bg-clip-text text-transparent">Love Us</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Fast, fresh, and hassle-free food delivery designed for campus life
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon="⚡"
              title="Lightning Fast"
              description="30-min delivery guarantee. Your food arrives hot and fresh, every single time."
              delay={0}
            />
            <FeatureCard
              icon="✨"
              title="Zero Hassle"
              description="Order in just 3 taps. Simple, intuitive interface designed for busy students."
              delay={0.1}
            />
            <FeatureCard
              icon="🔥"
              title="Always Fresh"
              description="Made fresh, delivered hot. We partner only with trusted, hygienic restaurants."
              delay={0.2}
            />
            <FeatureCard
              icon="📍"
              title="Smart Tracking"
              description="Track every bite's journey. Real-time updates from kitchen to your door."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-foody-cream to-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="absolute top-10 left-10 text-9xl">🍕</div>
          <div className="absolute bottom-10 right-10 text-9xl">🍔</div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 font-display">
              How It <span className="bg-gradient-to-r from-foody-primary to-foody-secondary bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to satisfy your cravings
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            <HowItWorksStep
              number={1}
              icon="🔍"
              title="Explore"
              description="Browse menus from top campus restaurants and discover your next favorite meal"
              delay={0}
            />
            <HowItWorksStep
              number={2}
              icon="🎨"
              title="Customize"
              description="Personalize your order exactly how you like it with easy customization options"
              delay={0.2}
            />
            <HowItWorksStep
              number={3}
              icon="😋"
              title="Enjoy"
              description="Sit back and relax while we deliver hot, delicious food right to your door"
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* Restaurant Showcase Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 font-display relative inline-block">
              Campus <span className="bg-gradient-to-r from-foody-primary to-foody-secondary bg-clip-text text-transparent">Favorites</span>
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: '100%' }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-foody-primary to-foody-secondary rounded-full"
              />
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mt-6">
              Some of them are coming soon!
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredRestaurants.map((restaurant, index) => (
              <RestaurantCard
                key={restaurant.name}
                {...restaurant}
                delay={index * 0.1}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-12"
          >
            <Link
              to="/restaurants"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-foody-primary to-foody-secondary text-white text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <span>View All Restaurants</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-foody-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 font-display">
              What Students <span className="bg-gradient-to-r from-foody-primary to-foody-secondary bg-clip-text text-transparent">Say</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Real reviews from real students
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={testimonial.id}
                {...testimonial}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-gradient-to-br from-foody-dark to-gray-900 text-white relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-foody-primary rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-foody-secondary rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center"
            >
              <div className="text-6xl mb-4">🎓</div>
              <div className="text-5xl font-extrabold mb-2 bg-gradient-to-r from-foody-accent to-foody-secondary bg-clip-text text-transparent">
                <AnimatedCounter end={450} suffix="+" />
              </div>
              <div className="text-xl text-gray-300">Students Registered</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col items-center"
            >
              <div className="text-6xl mb-4">🍽️</div>
              <div className="text-5xl font-extrabold mb-2 bg-gradient-to-r from-foody-accent to-foody-secondary bg-clip-text text-transparent">
                <AnimatedCounter end={50} suffix="+" />
              </div>
              <div className="text-xl text-gray-300">Orders Delivered</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col items-center"
            >
              <div className="text-6xl mb-4">⭐</div>
              <div className="text-5xl font-extrabold mb-2 bg-gradient-to-r from-foody-accent to-foody-secondary bg-clip-text text-transparent">
                <AnimatedCounter end={4.8} suffix="/5" />
              </div>
              <div className="text-xl text-gray-300">Average Rating</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-br from-foody-primary via-foody-secondary to-foody-accent relative overflow-hidden">
        {/* Decorative food pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-8xl">🍕</div>
          <div className="absolute top-20 right-20 text-7xl">🍔</div>
          <div className="absolute bottom-10 left-20 text-9xl">🍜</div>
          <div className="absolute bottom-20 right-10 text-6xl">🍰</div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 font-display leading-tight">
              Ready to Satisfy Your Cravings?
            </h2>
            <p className="text-xl sm:text-2xl text-white/90 mb-12 leading-relaxed">
              Join hundreds of students enjoying fast delivery from trusted local restaurants. 
              Simple checkout, UPI/COD options, and real-time order tracking.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link
                to="/register?role=student"
                className="group px-8 py-4 bg-white text-foody-primary text-lg font-bold rounded-2xl shadow-2xl hover:shadow-white/50 transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
              >
                <span>🍽️ Order Food Now</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <Link
                to="/register?role=restaurant"
                className="group px-8 py-4 bg-transparent text-white text-lg font-bold rounded-2xl border-2 border-white hover:bg-white hover:text-foody-primary transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
              >
                <span>🤝 Partner With Us</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-foody-success" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">Secure Payment</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-foody-success" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">Fast Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-foody-success" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">24/7 Support</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer with Wave Divider */}
      <footer className="relative bg-foody-dark text-white">
        {/* Wave Divider */}
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-none">
          <svg
            className="relative block w-full h-12 sm:h-16"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
              className="fill-foody-cream"
            />
          </svg>
        </div>

        <div className="relative pt-20 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
              {/* Brand Column */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-3xl">🍽️</span>
                  <span className="text-2xl font-extrabold bg-gradient-to-r from-foody-primary to-foody-secondary bg-clip-text text-transparent">
                    FOODY
                  </span>
                </div>
                <p className="text-gray-400 mb-4 leading-relaxed">
                  Delicious food from your favorite campus restaurants, delivered fresh to your door.
                </p>
                <div className="flex gap-4">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-foody-primary flex items-center justify-center transition-all duration-300 hover:scale-110"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-foody-primary flex items-center justify-center transition-all duration-300 hover:scale-110"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-foody-primary flex items-center justify-center transition-all duration-300 hover:scale-110"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-lg font-bold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li>
                    <Link to="/restaurants" className="text-gray-400 hover:text-foody-primary transition-colors duration-200">
                      Browse Restaurants
                    </Link>
                  </li>
                  <li>
                    <Link to="/how-it-works" className="text-gray-400 hover:text-foody-primary transition-colors duration-200">
                      How It Works
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="text-gray-400 hover:text-foody-primary transition-colors duration-200">
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link to="/register?role=restaurant" className="text-gray-400 hover:text-foody-primary transition-colors duration-200">
                      Partner With Us
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h3 className="text-lg font-bold mb-4">Support</h3>
                <ul className="space-y-2">
                  <li>
                    <Link to="/terms" className="text-gray-400 hover:text-foody-primary transition-colors duration-200">
                      Terms & Conditions
                    </Link>
                  </li>
                  <li>
                    <Link to="/privacy" className="text-gray-400 hover:text-foody-primary transition-colors duration-200">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <a href="mailto:fodyyy1@gmail.com" className="text-gray-400 hover:text-foody-primary transition-colors duration-200">
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a href="tel:+919989671246" className="text-gray-400 hover:text-foody-primary transition-colors duration-200">
                      Call Support
                    </a>
                  </li>
                </ul>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="text-lg font-bold mb-4">Get In Touch</h3>
                <ul className="space-y-3 text-gray-400">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 mt-0.5 text-foody-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>IIT & IISER Tirupati Campuses</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-foody-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <a href="mailto:support@foody.com" className="hover:text-foody-primary transition-colors">
                      fodyyy1@gmail.com
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-foody-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <a href="tel:+919989671246" className="hover:text-foody-primary transition-colors">
                      +91 9989671246
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-700 pt-8 mt-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-gray-400 text-sm text-center md:text-left">
                  © {new Date().getFullYear()} FOODY. All rights reserved.
                </p>
                <p className="text-gray-400 text-sm text-center md:text-right">
                  Made with <span className="text-red-500 animate-pulse">❤️</span> for IIT & IISER Tirupati
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;