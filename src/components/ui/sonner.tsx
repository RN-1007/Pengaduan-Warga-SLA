"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group font-sans"
      richColors
      closeButton
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white/95 group-[.toaster]:backdrop-blur-xl group-[.toaster]:text-slate-900 group-[.toaster]:border-slate-200/60 group-[.toaster]:shadow-xl group-[.toaster]:shadow-slate-300/30 group-[.toaster]:rounded-2xl p-4 data-[type=success]:!bg-emerald-500 data-[type=success]:!text-white data-[type=error]:!bg-rose-500 data-[type=error]:!text-white data-[type=info]:!bg-blue-500 data-[type=info]:!text-white",
          description: "opacity-90 font-medium text-sm",
          actionButton:
            "group-[.toast]:bg-white/20 group-[.toast]:hover:bg-white/30 group-[.toast]:text-white transition-colors rounded-lg font-semibold",
          cancelButton:
            "group-[.toast]:bg-black/10 group-[.toast]:text-current rounded-lg font-semibold",
          closeButton: 
            "group-[.toast]:bg-white/10 group-[.toast]:text-current group-[.toast]:hover:bg-white/20 group-[.toast]:border-none transition-colors",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
