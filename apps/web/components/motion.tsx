"use client"

import type * as React from "react"
import { motion, type Variants } from "motion/react"

// Enter: arrive fast, settle gently. Spring with bounce 0, under 300ms.
const ENTER = { type: "spring", duration: 0.3, bounce: 0 } as const

const containerVariants: Variants = {
  hidden: {},
  // Stagger kept to 50ms/item (12-principles: no-excessive-stagger).
  visible: { transition: { staggerChildren: 0.05 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8, filter: "blur(4px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: ENTER },
}

export function MotionList({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <motion.ul
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.ul>
  )
}

export function MotionListItem({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <motion.li className={className} variants={itemVariants}>
      {children}
    </motion.li>
  )
}

export function MotionStack({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  )
}

export function MotionItem({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  )
}

export function MotionReveal({
  className,
  delay = 0,
  children,
}: {
  className?: string
  delay?: number
  children: React.ReactNode
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ ...ENTER, delay }}
    >
      {children}
    </motion.div>
  )
}

/** Animated success checkmark: fade + rotate-upright + Y-bob + stroke draw. */
export function SuccessCheck() {
  return (
    <motion.span
      className="inline-flex"
      initial={{ opacity: 0, rotate: 80, y: 36, filter: "blur(10px)" }}
      animate={{ opacity: 1, rotate: 0, y: 0, filter: "blur(0px)" }}
      transition={{
        default: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
        y: { duration: 0.45, ease: [0.34, 1.35, 0.64, 1] },
      }}
    >
      <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
        <circle
          cx="24"
          cy="24"
          r="22"
          className="stroke-foreground/15"
          strokeWidth="2"
        />
        <motion.path
          d="M15 24.5l6 6 12-13"
          className="stroke-foreground"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
    </motion.span>
  )
}

/** Form-level error that shakes briefly each time the message changes. */
export function FormError({ message }: { message: string }) {
  return (
    <motion.p
      key={message}
      initial={{ x: 0 }}
      animate={{ x: [0, -6, 5, -3, 0] }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="text-xs/relaxed text-destructive"
    >
      {message}
    </motion.p>
  )
}
