'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const AccessDenied = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white overflow-hidden">
      {/* Glow background */}
      <div className="absolute w-[500px] h-[500px] bg-red-500 opacity-20 blur-3xl rounded-full animate-pulse"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center p-8 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl"
      >
        {/* Animated Icon */}
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
          transition={{ duration: 0.6 }}
          className="text-6xl mb-4"
        >
          🚫
        </motion.div>

        <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
        <p className="text-gray-400 mb-6">
          This area is restricted to admins only.
        </p>

        {/* Button */}
        <Link href="/">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-medium transition"
          >
            Go Back Home
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
};

export default AccessDenied;
