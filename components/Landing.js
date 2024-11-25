'use client'

import React, { useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mic } from 'lucide-react'
import { Inter, Outfit } from 'next/font/google'

const outfit = Outfit({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

const AnimatedHero = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    let particles = []

    const createParticles = () => {
      particles = []
      for (let i = 0; i < 100; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 3 + 1,
          speedX: (Math.random() * 3 - 1.5) * 0.8,
          speedY: (Math.random() * 3 - 1.5) * 0.8,
        })
      }
    }

    const animate = () => {
      // Create trailing effect by using semi-transparent white
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        ctx.beginPath()
        // Add glow effect
        ctx.shadowBlur = 15
        ctx.shadowColor = 'rgba(59, 130, 246, 0.5)'
        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.radius
        )
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)')
        gradient.addColorStop(0.6, 'rgba(59, 130, 246, 0.3)')
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0.1)')
        ctx.fillStyle = gradient
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0  // Reset shadow for next frame

        particle.x += particle.speedX
        particle.y += particle.speedY

        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1
      })

      requestAnimationFrame(animate)
    }

    createParticles()
    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      createParticles()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full opacity-30"
        style={{ filter: 'blur(0.5px)' }}
      />
      <div className={`relative z-10 ${outfit.className}`}>
        <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl md:text-7xl">
              Transform Your Productivity
              <br />
              in <span className="text-blue-600">Seconds</span>, Not Hours
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`${inter.className} mt-6 max-w-2xl text-lg leading-relaxed text-gray-600`}
          >
            Join thousands of professionals who&apos;ve eliminated task overwhelm and saved 
            10+ hours per week. Our AI assistant handles your tasks while you focus 
            on what truly matters.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.4
            }}
            className="mt-10 mb-8"
          >
            <div className="relative flex flex-col items-center">
              <div className="relative h-16 w-16">
                <motion.div
                  className="absolute inset-0 rounded-full bg-blue-100/30"
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <Mic className="relative h-full w-full p-4 text-blue-600" />
              </div>
              <span className="mt-2 text-sm text-blue-600">Give it a try!</span>
              <span className="mt-1 text-xs text-gray-500">No credit card required</span>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col gap-4 sm:flex-row sm:gap-6"
          >
            <Link
              href="#"
              className="group inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-3 text-sm font-medium text-white shadow-lg transition-all hover:scale-105 hover:shadow-blue-500/30"
            >
              Get Started
              <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="#"
              className="inline-flex items-center justify-center rounded-full border border-blue-200 bg-white px-8 py-3 text-sm font-medium text-blue-600 shadow-lg transition-all hover:scale-105 hover:border-blue-300 hover:bg-blue-50"
            >
              Watch Demo
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default AnimatedHero