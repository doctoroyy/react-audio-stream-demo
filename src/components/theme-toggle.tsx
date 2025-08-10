import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="absolute top-6 right-6 w-14 h-14 rounded-2xl glass-card dark:glass-card-dark border-white/20 dark:border-white/10 hover:shadow-2xl transition-all duration-300 group z-50"
    >
      <Sun className="h-6 w-6 rotate-0 scale-100 transition-all duration-500 text-yellow-500 group-hover:rotate-180 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all duration-500 text-blue-400 group-hover:rotate-0 dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}