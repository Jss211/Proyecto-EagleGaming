"use client"

import { Avatar, AvatarFallback, AvatarImage } from "./avatar"
import { Button } from "./button"
import { Card, CardContent } from "./card"
import { Separator } from "./separator"
import { cn } from "../../lib/utils"
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react'
import { motion, useAnimation, useInView } from "framer-motion"
import { useEffect, useRef, useState } from "react"

export interface Testimonial {
  id: string
  name: string
  role?: string
  company?: string
  content: string
  rating: number
  avatar?: string
  createdAt?: Date
}

export interface TestimonialsSectionProps {
  title?: string
  subtitle?: string
  testimonials?: Testimonial[]
  autoRotateInterval?: number
  showVerifiedBadge?: boolean
  trustedCompanies?: string[]
  trustedCompaniesTitle?: string
  className?: string
}

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'hace un momento';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `hace ${days} día${days > 1 ? 's' : ''}`;
  const months = Math.floor(days / 30);
  if (months < 12) return `hace ${months} mes${months > 1 ? 'es' : ''}`;
  const years = Math.floor(days / 365);
  return `hace ${years} año${years > 1 ? 's' : ''}`;
};

export function TestimonialsSection({
  testimonials = [],
  autoRotateInterval = 6000,
  className,
}: TestimonialsSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 })
  const controls = useAnimation()

  useEffect(() => {
    if (autoRotateInterval <= 0 || testimonials.length <= 1) return

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length)
    }, autoRotateInterval)

    return () => clearInterval(interval)
  }, [testimonials.length, autoRotateInterval])

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [isInView, controls])

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
      },
    },
  }

  if (testimonials.length === 0) {
    return (
      <div style={{ padding: "2rem", background: "#f9fafb", borderRadius: "8px", textAlign: "center", border: "1px dashed #ddd", marginTop: "3.5rem" }}>
        <p style={{ color: "#777", marginBottom: "0" }}>No hay reseñas todavía. ¡Sé el primero en opinar!</p>
      </div>
    )
  }

  return (
    <section
      ref={sectionRef}
      className={cn("relative flex items-center justify-between gap-6 pt-6 w-full", className)}
    >
      <motion.div
        initial="hidden"
        animate={controls}
        variants={containerVariants}
        className="w-full relative z-10"
      >
        <motion.div variants={itemVariants} className="relative w-full">
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.id}
              className={cn(
                "transition-all duration-500 border border-gray-800 bg-[#0c0c0c] text-white rounded-xl",
                index === activeIndex
                  ? "opacity-100 translate-x-0 shadow-2xl z-10 relative"
                  : "opacity-0 translate-x-[50px] pointer-events-none -z-10 absolute inset-0",
              )}
            >
              {/* Huge quote icon behind everything, positioned top-left overlapping border */}
              <div className="absolute -top-5 -left-5 z-0">
                <Quote className="h-10 w-10 text-gray-700 opacity-40" fill="currentColor" />
              </div>

              <CardContent className="p-8 relative z-10">
                <div className="flex flex-col h-full">
                  
                  {/* Top section with Avatar and Stars */}
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border border-gray-700 bg-gray-800">
                        {testimonial.avatar ? (
                          <AvatarImage src={testimonial.avatar} alt={testimonial.name} className="object-cover" />
                        ) : (
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${testimonial.name}`} alt={testimonial.name} />
                        )}
                        <AvatarFallback className="bg-gray-800 text-white">{testimonial.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <h4 className="font-bold text-[1.1rem] text-gray-100">{testimonial.name}</h4>
                        {testimonial.role && (
                          <p className="text-sm text-gray-400 mt-0.5">
                            {testimonial.role}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < testimonial.rating ? "fill-yellow-400 text-yellow-400" : "fill-transparent text-gray-600"}`} 
                        />
                      ))}
                    </div>
                  </div>

                  <Separator className="bg-gray-800 mb-6" />

                  <div className="flex-1 min-h-[80px]">
                    <p className="italic text-[1.05rem] text-gray-300 leading-relaxed">"{testimonial.content}"</p>
                  </div>

                  <div className="flex justify-between items-center mt-6">
                    <span className="text-[0.75rem] text-gray-500">
                      {testimonial.createdAt && formatTimeAgo(testimonial.createdAt)}
                    </span>
                    <span className="text-[0.75rem] uppercase tracking-wider font-semibold text-gray-500">
                      Cliente Verificado
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </motion.div>

      {testimonials.length > 1 && (
        <motion.div variants={itemVariants} className="flex flex-col gap-3 justify-center items-center z-10 shrink-0 ml-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrev}
            className="rounded-full h-10 w-10 border-gray-800 bg-[#111] hover:bg-[#222] text-gray-400 shadow-sm transition-all hover:scale-105"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div className="flex flex-col gap-2 items-center justify-center py-2">
            {testimonials.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all cursor-pointer",
                  index === activeIndex ? "bg-[#e81950] scale-110" : "bg-gray-700 hover:bg-gray-600",
                )}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            className="rounded-full h-10 w-10 border-gray-800 bg-[#111] hover:bg-[#222] text-gray-400 shadow-sm transition-all hover:scale-105"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </motion.div>
      )}
    </section>
  )
}
