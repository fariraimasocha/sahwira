'use client'

import React, { useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { 
  Target, 
  Lightbulb, 
  BarChart3, 
  Users2, 
  Trophy, 
  Clock,
  PhoneOutgoing, 
  Radio, 
  Wifi 
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const Tilt = ({ children }) => {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x)
  const mouseYSpring = useSpring(y)

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"])

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5
    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
      }}
      className="relative"
    >
      {children}
    </motion.div>
  )
}

export default function AssistantFeatures() {
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { 
      opacity: 0,
      y: 20,
      rotateX: -20,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    }
  }

  const glowVariants = {
    idle: { opacity: 0 },
    hover: { 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-white relative overflow-hidden perspective-1000">
      {/* 3D Grid Background */}
      <div className="absolute inset-0" style={{ transform: 'rotateX(60deg) scale(2)', transformStyle: 'preserve-3d' }}>
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-full h-[1px] bg-blue-200/20"
            style={{
              top: `${i * 5}%`,
              transformStyle: 'preserve-3d',
              transform: 'translateZ(0px)'
            }}
            animate={{
              translateZ: [-20, 20],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: 3 + i * 0.2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i + 'vertical'}
            className="absolute h-full w-[1px] bg-blue-200/20"
            style={{
              left: `${i * 5}%`,
              transformStyle: 'preserve-3d',
              transform: 'translateZ(0px)'
            }}
            animate={{
              translateZ: [-20, 20],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: 3 + i * 0.2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 blur-3xl transform -skew-y-12" />
          <Button 
            variant="outline" 
            className="relative mb-8 bg-white/80 backdrop-blur-sm border-blue-200 hover:border-blue-300 hover:bg-blue-50 hover:scale-105 transition-all shadow-lg"
          >
            Assistant Features
          </Button>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative text-4xl md:text-6xl font-extrabold tracking-tight mb-6"
        >
          <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Your Productivity Assistant
          </span>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-3xl"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.7, 0.5]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-gray-600 max-w-3xl mx-auto mb-12 text-lg leading-relaxed"
        >
          Intelligent task management, personalized advice, seamless delegation, 
          and motivational tracking to elevate your daily productivity.
        </motion.p>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap justify-center gap-4 mb-16 perspective-1000"
        >
          {[
            {
              icon: <PhoneOutgoing className="mr-2 h-4 w-4" />,
              text: "Task Creation",
              variant: "default"
            },
            {
              icon: <Radio className="mr-2 h-4 w-4" />,
              text: "Voice Commands",
              variant: "outline"
            },
            {
              icon: <Wifi className="mr-2 h-4 w-4" />,
              text: "Smart Integration",
              variant: "outline"
            }
          ].map((button, index) => (
            <Tilt key={index}>
              <Button 
                variant={button.variant}
                className={`${
                  button.variant === "default" 
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-blue-500/30" 
                    : "border-blue-200 text-blue-600 hover:border-blue-300 hover:bg-blue-50"
                } relative shadow-lg hover:scale-105 transition-all transform-gpu`}
                style={{ transform: "translateZ(20px)" }}
              >
                {button.icon}
                {button.text}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                  initial={{ x: '-100%', opacity: 0 }}
                  whileHover={{ x: '100%', opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />
              </Button>
            </Tilt>
          ))}
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible" 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 perspective-1000"
        >
          {[
            {
              icon: <Target className="w-8 h-8" />,
              title: "Task Tracking",
              description: "Comprehensive task management with intelligent prioritization"
            },
            {
              icon: <Lightbulb className="w-8 h-8" />,
              title: "Personal Advice",
              description: "AI-powered insights and personalized recommendations"
            },
            {
              icon: <BarChart3 className="w-8 h-8" />,
              title: "Progress Monitoring",
              description: "Real-time tracking of goals and productivity metrics"
            },
            {
              icon: <Users2 className="w-8 h-8" />,
              title: "Task Delegation",
              description: "Seamless workflow distribution and team coordination"
            },
            {
              icon: <Trophy className="w-8 h-8" />,
              title: "Gamification",
              description: "Earn badges and points for completing tasks"
            },
            {
              icon: <Clock className="w-8 h-8" />,
              title: "Time Optimization",
              description: "Intelligent scheduling and time management"
            }
          ].map((card, index) => (
            <Tilt key={index}>
              <motion.div
                variants={itemVariants}
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
                style={{ perspective: 1000 }}
              >
                <Card 
                  className="p-6 bg-white/90 backdrop-blur-sm border-blue-200 shadow-lg transition-all duration-300 group relative overflow-hidden transform-gpu"
                  style={{ transform: "translateZ(20px)" }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-cyan-600/5 to-blue-600/5"
                    variants={glowVariants}
                    initial="idle"
                    animate={hoveredIndex === index ? "hover" : "idle"}
                  />
                  
                  <div className="relative">
                    <motion.div 
                      className="mb-4 inline-block"
                      animate={hoveredIndex === index ? {
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0],
                        color: ["#2563eb", "#06b6d4", "#2563eb"]
                      } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      {card.icon}
                    </motion.div>
                    <motion.h3 
                      className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2"
                      animate={hoveredIndex === index ? {
                        scale: [1, 1.05, 1],
                      } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      {card.title}
                    </motion.h3>
                    <p className="text-gray-600">
                      {card.description}
                    </p>
                  </div>

                  {/* 3D Edge Highlight */}
                  <motion.div
                    className="absolute inset-0 border-2 border-transparent"
                    style={{ transform: "translateZ(40px)" }}
                    variants={glowVariants}
                    initial="idle"
                    animate={hoveredIndex === index ? "hover" : "idle"}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-blue-500/20 blur" />
                  </motion.div>
                </Card>
              </motion.div>
            </Tilt>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
