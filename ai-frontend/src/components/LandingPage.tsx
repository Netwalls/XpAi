'use client';

import React, { useState } from 'react';
import { WalletConnect } from './WalletConnect';
import ChatWrapper from './ChatWrapper';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon }) => {
  return (
    <div className="group bg-black p-8 rounded-2xl border border-[#2c1810] hover:border-[#D2691E] transition-all duration-300">
      <div className="text-[#D2691E] text-3xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
};

const LandingPage: React.FC = () => {
  const [showChat, setShowChat] = useState(false);
  const [email, setEmail] = useState('');

  const handleShowChat = () => {
    setShowChat(true);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Subscribed:', email);
    setEmail('');
  };

  if (showChat) {
    return <ChatWrapper />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-[#2c1810] py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <Image src="/logo.png" alt="Logo" width={40} height={40} className="mr-2" />
            <span className="text-2xl font-bold">AI DApp</span>
          </div>
          <div className="flex items-center gap-8">
            <a href="#features" className="hover:text-[#D2691E] transition-colors">Features</a>
            <a href="#pricing" className="hover:text-[#D2691E] transition-colors">Pricing</a>
            <a href="#about" className="hover:text-[#D2691E] transition-colors">About</a>
            <button className="bg-[#D2691E] px-6 py-2 rounded-lg hover:bg-[#8B4513] transition-colors">
              Get started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.1, scale: 1 }}
            transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
            className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-radial from-[#D2691E] via-transparent to-transparent rounded-full blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.1, scale: 1 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", delay: 0.5 }}
            className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-radial from-[#8B4513] via-transparent to-transparent rounded-full blur-3xl"
          />
        </div>

        <div className="flex items-center justify-between relative">
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <div className="mb-6 inline-block">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-r from-[#D2691E] to-[#8B4513] px-4 py-1 rounded-full text-sm font-medium inline-block mb-4"
              >
                Espresso Innovation
              </motion.span>
            </div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-7xl font-bold mb-6 leading-tight"
            >
              Experience Next-Gen
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#D2691E] to-[#8B4513] mt-2">
                AI-Powered DApps
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-400 mb-8 leading-relaxed"
            >
              Empowering users to interact with decentralized AI applications. 
              Connect your wallet and explore the future of Web3 technology.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-4"
            >
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#D2691E] to-[#8B4513] rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                <WalletConnect />
              </div>
              
              <button
                onClick={handleShowChat}
                className="group bg-gradient-to-r from-[#8B4513] to-[#D2691E] px-8 py-3 rounded-lg hover:opacity-90 transition-all duration-300 flex items-center gap-2 relative overflow-hidden"
              >
                <span className="relative z-10">Launch AI Chat</span>
                <motion.svg 
                  className="w-4 h-4 relative z-10"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </motion.svg>
                <div className="absolute inset-0 bg-gradient-to-r from-[#D2691E] to-[#8B4513] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </motion.div>
          </motion.div>

          {/* Right Content - Hero Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative w-[600px] h-[600px]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#D2691E] to-[#8B4513] rounded-full blur-3xl opacity-20 animate-pulse"></div>
            <motion.div
              animate={{ 
                y: [0, -20, 0],
                rotate: [0, 2, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="relative w-full h-full"
            >
              <Image 
                src="/hero-image.png" 
                alt="AI Platform" 
                fill 
                className="object-contain drop-shadow-2xl"
              />
            </motion.div>
            
            {/* Floating elements */}
            <motion.div
              animate={{ 
                y: [-10, 10, -10],
                x: [-5, 5, -5]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="absolute top-20 -left-10 bg-[#D2691E] p-4 rounded-xl shadow-xl"
            >
              <span className="text-2xl">🤖</span>
            </motion.div>
            
            <motion.div
              animate={{ 
                y: [10, -10, 10],
                x: [5, -5, 5]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="absolute bottom-20 -right-10 bg-[#8B4513] p-4 rounded-xl shadow-xl"
            >
              <span className="text-2xl">⚡</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-[#111] py-20 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ 
              rotate: [0, 360],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-[#D2691E] rounded-full"
          />
          <motion.div
            animate={{ 
              rotate: [360, 0],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] border border-[#8B4513] rounded-full"
          />
        </div>

        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl font-bold text-center mb-4">Become a trendsetter</h2>
            <p className="text-gray-400 text-center mb-16 max-w-2xl mx-auto">
              Join the future of content creation and monetization with our cutting-edge Web3 platform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <AnimatedFeatureCard
              icon="📱"
              title="Content creation"
              description="Start monetizing your content in new ways and take full advantage of the blockchain. We help you with adapting your content to new platforms."
              delay={0.2}
            />
            <AnimatedFeatureCard
              icon="📊"
              title="Data tracking"
              description="Blockchain technology allows for transparent and traceable attribution of content, giving credit where it is due."
              delay={0.4}
            />
            <AnimatedFeatureCard
              icon="🚀"
              title="Publishing software"
              description="Effortlessly schedule and publish your content across all your social media accounts, save time and grow your online presence on web3."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-4">They talk about us</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Hear from our community of successful content creators
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <div className="relative">
              {/* Decorative elements */}
              <div className="absolute -top-6 -left-6 text-6xl opacity-20">❝</div>
              <div className="absolute -bottom-6 -right-6 text-6xl opacity-20">❞</div>

              <div className="bg-[#111] rounded-2xl p-12 border border-[#2c1810]">
                <p className="text-2xl text-center mb-8 leading-relaxed">
                  "AI DApp has been an absolute game-changer for my career. They helped me successfully
                  transition to Web3 and monetize in ways I never thought possible. I highly recommend
                  their platform to anyone looking to take control of their online presence."
                </p>
                <div className="flex items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#D2691E] flex items-center justify-center text-2xl">
                    MT
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#D2691E]">Mike Travis</h4>
                    <p className="text-gray-400">1.3M+ Followers</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-[#111]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto bg-black rounded-2xl p-12 border border-[#2c1810] relative overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.png')] bg-repeat"></div>
            </div>

            <div className="relative">
              <h2 className="text-4xl font-bold text-center mb-4">Stay Updated</h2>
              <p className="text-gray-400 text-center mb-8">
                Get the latest updates about new features and releases
              </p>

              <form onSubmit={handleSubscribe} className="flex gap-4 max-w-xl mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="bg-black border border-[#2c1810] rounded-lg px-6 py-3 flex-grow focus:outline-none focus:border-[#D2691E] transition-colors"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#D2691E] to-[#8B4513] px-8 py-3 rounded-lg hover:opacity-90 transition-all duration-300"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#111] pt-20 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="text-xl font-bold mb-6">Join our newsletter</h3>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="bg-black border border-[#2c1810] rounded px-4 py-2 flex-grow"
                />
                <button
                  type="submit"
                  className="bg-[#D2691E] px-6 py-2 rounded hover:bg-[#8B4513] transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-6">Platform</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-[#D2691E]">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#D2691E]">Security</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#D2691E]">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-6">Resources</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-[#D2691E]">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#D2691E]">API Reference</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#D2691E]">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-6">Follow us</h3>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-[#D2691E]">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-[#2c1810] pt-8 text-center text-gray-400">
            <p>&copy; 2024 AI DApp. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 

const AnimatedFeatureCard: React.FC<FeatureCardProps & { delay: number }> = ({ title, description, icon, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="group bg-black p-8 rounded-2xl border border-[#2c1810] hover:border-[#D2691E] transition-all duration-300 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#D2691E] to-transparent opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
      <div className="relative">
        <div className="text-[#D2691E] text-3xl mb-4 transform group-hover:scale-110 transition-transform duration-300">{icon}</div>
        <h3 className="text-xl font-semibold mb-3">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </div>
    </motion.div>
  );
};