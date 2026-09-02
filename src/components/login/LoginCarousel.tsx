import gamerChair from '@/assets/gamer-chair-with-multicolored-neon-lights.jpg'
import monitor from '@/assets/modern-monitor-elegant-table.jpg'
import tech from '@/assets/technology-integrated-everyday-life.jpg'
import gamer1 from '@/assets/pexels-sulimansallehi-758532.jpg'
import gamer2 from '@/assets/pexels-umudicreative-31862215.jpg'
import { useCarousel } from '../../context/CarouselContext'

const IMAGES = [
  {
    src: gamerChair,
    alt: 'Silla gaming con luces neon multicolores'
  },
  {
    src: monitor,
    alt: 'Monitor gaming moderno en escritorio elegante'
  },
  {
    src: tech,
    alt: 'Tecnología integrada en la vida cotidiana'
  },
  {
    src: gamer1,
    alt: 'Jugador concentrado en acción'
  },
  {
    src: gamer2,
    alt: 'Equipo gaming profesional'
  }
]

export function LoginCarousel() {
  const { current, setCurrent } = useCarousel()

  return (
    <div className="flex-1 relative overflow-hidden">
      {/* Slides */}
      {IMAGES.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === current ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={image.src}
            alt={image.alt}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Degradado inferior */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

      {/* Dots de navegación */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {IMAGES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            aria-label={`Ir a imagen ${index + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === current
                ? 'w-6 bg-white'
                : 'w-2 bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
