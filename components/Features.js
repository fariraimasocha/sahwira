'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Trophy, ListTodo } from 'lucide-react';

const benefits = [
  {
    icon: ListTodo,
    title: 'Track Your Tasks',
    description: 'Stay organized with smart task tracking. Set priorities, deadlines, and never miss an important task again.'
  },
  {
    icon: MessageSquare,
    title: 'AI Assistant Chat',
    description: 'Your personal AI companion available 24/7. Get help, advice, and friendly conversation whenever you need it.'
  },
  {
    icon: Trophy,
    title: 'Earn & Achieve',
    description: 'Collect badges as you complete tasks and reach milestones. Watch your progress grow over time.'
  }
];

const BenefitCard = ({ icon: Icon, title, description }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{
        scale: 1.02,
        rotateX: 5,
        rotateY: 5,
        transition: { duration: 0.2 }
      }}
      transition={{
        duration: 0.5,
        type: 'spring',
        stiffness: 100
      }}
      viewport={{ once: true }}
      className="group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-md p-8 border border-gray-200/50 hover:border-primary/20 transition-all transform-gpu will-change-transform"
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center mb-4">
          <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mr-4">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent">
            {title}
          </h3>
        </div>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </motion.div>
    </motion.div>
  );
};

const Features = () => {
  return (
    <section className="relative overflow-hidden bg-slate-50/50 py-20">
      <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-primary/5 to-white/0 pointer-events-none" />
      <div className="container mx-auto px-4 relative">
        <div className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              type: 'spring',
              stiffness: 100
            }}
            viewport={{ once: true }}
          >
            <h2 className="bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl mb-4">
              Built for Myself, Used by Many
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              From a personal project to a growing community of productive individuals
            </p>
          </motion.div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16">
          {benefits.map((benefit, index) => (
            <BenefitCard key={benefit.title} {...benefit} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="rounded-2xl bg-white/80 backdrop-blur-md p-8 md:p-12 border border-gray-200/50 hover:border-primary/20 transition-all transform-gpu"
        >
          <div className="grid gap-8 md:grid-cols-2 items-center">
            <div>
              <motion.h3
                className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent mb-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Track Your Journey
              </motion.h3>
              <motion.p
                className="text-gray-600 mb-8 leading-relaxed"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                Every task you complete, every badge you earn, and every interaction with your AI assistant is recorded. Watch your productivity soar as you build better habits and achieve your goals.
              </motion.p>
              <motion.div
                className="flex gap-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">100+</div>
                  <div className="text-sm text-gray-600">Tasks Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">10+</div>
                  <div className="text-sm text-gray-600">Badges Available</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">24/7</div>
                  <div className="text-sm text-gray-600">AI Support</div>
                </div>
              </motion.div>
            </div>
            <motion.div
              className="relative h-64 md:h-full"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ duration: 0.5 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-2xl" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Trophy className="h-32 w-32 text-primary/40" />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;