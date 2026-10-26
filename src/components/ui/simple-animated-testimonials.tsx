"use client"

import { Avatar, AvatarFallback, AvatarImage } from "./avatar"
import { Button } from "./button"
import { Card, CardContent } from "./card"
import { Separator } from "./separator"
import { cn } from "../../lib/utils"
import { ChevronLeft, ChevronRight, Quote, Star, ShieldCheck } from 'lucide-react'
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
                "transition-all duration-500 border border-slate-200/90 bg-white text-slate-800 rounded-2xl shadow-sm hover:shadow-md",
                index === activeIndex
                  ? "opacity-100 translate-x-0 shadow-lg z-10 relative"
                  : "opacity-0 translate-x-[50px] pointer-events-none -z-10 absolute inset-0",
              )}
            >
              {/* Subtle quote icon behind top-left */}
              <div className="absolute -top-4 -left-3 z-0 pointer-events-none">
                <Quote className="h-10 w-10 text-slate-200 opacity-60" fill="currentColor" />
              </div>

              <CardContent className="p-7 relative z-10">
                <div className="flex flex-col h-full">
                  
                  {/* Top section with Avatar and Stars */}
                  <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center gap-3.5">
                      <Avatar className="h-12 w-12 border-2 border-slate-100 shadow-sm bg-slate-50">
                        {testimonial.avatar ? (
                          <AvatarImage src={testimonial.avatar} alt={testimonial.name} className="object-cover" />
                        ) : (
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${testimonial.name}`} alt={testimonial.name} />
                        )}
                        <AvatarFallback className="bg-gradient-to-tr from-[#e81950] to-rose-500 text-white font-bold">{testimonial.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <h4 className="font-bold text-[1.05rem] text-slate-900 leading-snug">{testimonial.name}</h4>
                        {testimonial.role && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            {testimonial.role}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < testimonial.rating ? "fill-amber-400 text-amber-400" : "fill-transparent text-slate-200"}`} 
                        />
                      ))}
                    </div>
                  </div>

                  <Separator className="bg-slate-100 mb-5" />

                  <div className="flex-1 min-h-[70px]">
                    <p className="italic text-[1.02rem] text-slate-700 leading-relaxed font-normal">"{testimonial.content}"</p>
                  </div>

                  <div className="flex justify-between items-center mt-5 pt-2">
                    <span className="text-[0.78rem] text-slate-400 font-medium">
                      {testimonial.createdAt && formatTimeAgo(testimonial.createdAt)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-[0.72rem] uppercase tracking-wider font-bold">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
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
            className="rounded-full h-10 w-10 border-slate-200 bg-white hover:bg-slate-50 hover:border-[#e81950] text-slate-600 hover:text-[#e81950] shadow-sm transition-all hover:scale-105"
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
                  index === activeIndex ? "bg-[#e81950] scale-110" : "bg-slate-200 hover:bg-slate-300",
                )}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            className="rounded-full h-10 w-10 border-slate-200 bg-white hover:bg-slate-50 hover:border-[#e81950] text-slate-600 hover:text-[#e81950] shadow-sm transition-all hover:scale-105"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </motion.div>
      )}
    </section>
  )
}
