import React from 'react'
import {
  Pencil, BookOpen, Ruler, Calculator, Globe, Palette,
  Music, FlaskConical, Home, Car, Compass, Lightbulb,
  GraduationCap, Apple, Scissors, MapPin, Sun, Cloud,
  TreePine, Bird,
} from 'lucide-react'

// Decorative floating school icons for the background
const icons = [
  { Icon: Pencil, x: '5%', y: '8%', size: 32, rotate: -15, color: '#3B82F6' },
  { Icon: BookOpen, x: '88%', y: '12%', size: 36, rotate: 10, color: '#F97316' },
  { Icon: Ruler, x: '15%', y: '75%', size: 28, rotate: 45, color: '#8B5CF6' },
  { Icon: Calculator, x: '78%', y: '65%', size: 30, rotate: -8, color: '#22C55E' },
  { Icon: Globe, x: '92%', y: '42%', size: 34, rotate: 5, color: '#3B82F6' },
  { Icon: Palette, x: '8%', y: '45%', size: 30, rotate: 20, color: '#F43F5E' },
  { Icon: Music, x: '72%', y: '85%', size: 26, rotate: -12, color: '#EAB308' },
  { Icon: FlaskConical, x: '35%', y: '90%', size: 28, rotate: 15, color: '#14B8A6' },
  { Icon: Home, x: '50%', y: '5%', size: 32, rotate: 0, color: '#F97316' },
  { Icon: Car, x: '62%', y: '25%', size: 28, rotate: -5, color: '#8B5CF6' },
  { Icon: Compass, x: '25%', y: '30%', size: 26, rotate: 30, color: '#22C55E' },
  { Icon: Lightbulb, x: '42%', y: '55%', size: 30, rotate: -20, color: '#EAB308' },
  { Icon: GraduationCap, x: '82%', y: '78%', size: 34, rotate: 8, color: '#3B82F6' },
  { Icon: Apple, x: '18%', y: '58%', size: 24, rotate: -10, color: '#F43F5E' },
  { Icon: Scissors, x: '55%', y: '72%', size: 24, rotate: 25, color: '#14B8A6' },
  { Icon: MapPin, x: '95%', y: '30%', size: 24, rotate: 0, color: '#F97316' },
  { Icon: Sun, x: '38%', y: '15%', size: 28, rotate: 0, color: '#EAB308' },
  { Icon: TreePine, x: '70%', y: '48%', size: 26, rotate: 0, color: '#22C55E' },
  { Icon: Bird, x: '48%', y: '38%', size: 22, rotate: -5, color: '#8B5CF6' },
]

export default function DecoIcons() {
  return (
    <div className="deco-icons" aria-hidden="true">
      {icons.map((item, i) => (
        <item.Icon
          key={i}
          size={item.size}
          color={item.color}
          style={{
            left: item.x,
            top: item.y,
            transform: `rotate(${item.rotate}deg)`,
          }}
          strokeWidth={1.5}
        />
      ))}
    </div>
  )
}
