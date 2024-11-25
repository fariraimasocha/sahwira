'use client'

import { motion } from 'framer-motion'

export default function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-slate-50 py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
            See How It Works
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Watch how Sahwira AI helps you stay productive
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="rounded-xl overflow-hidden shadow-lg"
        >
          <div style={{ position: 'relative', paddingBottom: 'calc(54.02777777777777% + 41px)', height: 0, width: '100%' }}>
            <iframe 
              src="https://demo.arcade.software/Kt9QzjRnNGcmdIWRkfXb?embed&embed_mobile=tab&embed_desktop=inline&show_copy_link=true" 
              title="Sahwira AI" 
              frameBorder="0" 
              loading="lazy" 
              allowFullScreen 
              allow="clipboard-write" 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                colorScheme: 'light'
              }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
