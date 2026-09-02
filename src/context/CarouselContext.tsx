import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

interface CarouselContextType {
  current: number
  setCurrent: (index: number) => void
}

const CarouselContext = createContext<CarouselContextType | undefined>(undefined)

const AUTOPLAY_INTERVAL = 4000
const IMAGES_COUNT = 5 // Número de imágenes en el carrusel

export function CarouselProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % IMAGES_COUNT)
    }, AUTOPLAY_INTERVAL)
    return () => clearInterval(timer)
  }, [])

  return (
    <CarouselContext.Provider value={{ current, setCurrent }}>
      {children}
    </CarouselContext.Provider>
  )
}

export function useCarousel() {
  const context = useContext(CarouselContext)
  if (context === undefined) {
    throw new Error('useCarousel must be used within CarouselProvider')
  }
  return context
}
