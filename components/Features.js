'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Trophy, ListTodo } from 'lucide-react'

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
]

const BenefitCard = ({ icon: Icon, title, description }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="relative overflow-hidden rounded-xl bg-slate-50 p-6 shadow-lg hover:shadow-xl transition-shadow"
    >
      <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-primary/10" />
      <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-24 w-24 rounded-full bg-primary/5" />
      <div className="relative">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <h3 className="mb-2 text-xl font-semibold text-gray-900">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </motion.div>
  )
}

export default function Features() {
  return (
    <section className="relative overflow-hidden bg-slate-50 py-24">
      <div className="container mx-auto px-4">
        <div className="mb-20 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl"
          >
            Built for Myself, Used by Many
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="mt-4 text-lg text-gray-600"
          >
            From a personal project to a growing community of productive individuals
          </motion.p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-20">
          {benefits.map((benefit, index) => (
            <BenefitCard key={benefit.title} {...benefit} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="rounded-2xl bg-white/60 p-8 md:p-12 backdrop-blur-sm"
        >
          <div className="grid gap-8 md:grid-cols-2 items-center">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Track Your Journey
              </h3>
              <p className="text-gray-600 mb-6">
                Every task you complete, every badge you earn, and every interaction with your AI assistant is recorded. Watch your productivity soar as you build better habits and achieve your goals.
              </p>
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">100+</div>
                  <div className="text-sm text-gray-600">Tasks Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">10+</div>
                  <div className="text-sm text-gray-600">Badges Available</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">24/7</div>
                  <div className="text-sm text-gray-600">AI Support</div>
                </div>
              </div>
            </div>
            <div className="relative h-64 md:h-full">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/0 rounded-xl" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Trophy className="h-24 w-24 text-primary/40" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
