"use client";

import React from "react";
import { motion } from "framer-motion";

interface ShinyTextProps {
  text: string;
  className?: string;
  shimmerWidth?: number;
}

export function ShinyText({
  text,
  className = "",
  shimmerWidth = 100,
}: ShinyTextProps) {
  return (
    <span className={`relative inline-block ${className}`}>
      {/* Base Text */}
      <span className="opacity-90">{text}</span>
      
      {/* Animated Shine Overlay */}
      <motion.span
        className="absolute left-0 top-0 w-full h-full text-transparent bg-clip-text pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(120deg, transparent 40%, rgba(255, 255, 255, 0.9) 50%, transparent 60%)`,
          backgroundSize: `${shimmerWidth}px 100%`,
          backgroundRepeat: "no-repeat",
        }}
        animate={{
          backgroundPosition: ["-100% 0", "200% 0"],
        }}
        transition={{
          repeat: Infinity,
          duration: 2.5,
          ease: "linear",
        }}
        aria-hidden="true"
      >
        {text}
      </motion.span>
    </span>
  );
}
