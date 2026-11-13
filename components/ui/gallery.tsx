"use client";

import { motion, useMotionValue, type Variants } from "framer-motion";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { photoSrc } from "@/lib/media";
import { useIsTouch, useViewportWidth } from "@/lib/hooks";

type Direction = "left" | "right";

// Ordered left to right; y is the vertical offset at full (220px) size.
const fanPhotos = [
  {
    id: 1,
    order: 0,
    y: 15,
    zIndex: 50,
    direction: "left" as Direction,
    src: photoSrc(5884),
    alt: "Nayana smiling in front of flowering vines",
  },
  {
    id: 2,
    order: 1,
    y: 32,
    zIndex: 40,
    direction: "left" as Direction,
    src: photoSrc(5865),
    alt: "Two friends by the beach holding sun hats",
  },
  {
    id: 3,
    order: 2,
    y: 8,
    zIndex: 30,
    direction: "right" as Direction,
    src: photoSrc(5813),
    alt: "Two friends in yellow outfits in a garden",
  },
  {
    id: 4,
    order: 3,
    y: 22,
    zIndex: 20,
    direction: "right" as Direction,
    src: photoSrc(5833),
    alt: "Photo strip of two friends hugging and laughing",
  },
  {
    id: 5,
    order: 4,
    y: 44,
    zIndex: 10,
    direction: "left" as Direction,
    src: photoSrc(5854),
    alt: "Black and white mirror selfie",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const photoVariants: Variants = {
  hidden: {
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,
  },
  visible: (custom: { x: number; y: number; order: number }) => ({
    x: custom.x,
    y: custom.y,
    rotate: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 70,
      damping: 12,
      mass: 1,
      delay: custom.order * 0.15,
    },
  }),
};

export const PhotoFan = () => {
  const viewportWidth = useViewportWidth();

  const photoSize = viewportWidth < 640 ? 150 : viewportWidth < 1024 ? 190 : 220;
  const photoScale = photoSize / 220;
  const photoStep = Math.min(
    160,
    Math.max(0, (Math.min(viewportWidth, 1100) - 32 - photoSize) / 4)
  );

  return (
    <div className="relative flex h-[350px] w-full items-center justify-center">
      <motion.div
        className="relative flex w-full justify-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div
          className="relative"
          style={{ width: photoSize, height: photoSize }}
        >
          {/* Render photos in reverse order so that higher z-index photos are rendered later in the DOM */}
          {[...fanPhotos].reverse().map((photo) => (
            <motion.div
              key={photo.id}
              className="absolute left-0 top-0"
              style={{ zIndex: photo.zIndex }}
              variants={photoVariants}
              custom={{
                x: (photo.order - 2) * photoStep,
                y: photo.y * photoScale,
                order: photo.order,
              }}
            >
              <Photo
                width={photoSize}
                height={photoSize}
                src={photo.src}
                alt={photo.alt}
                direction={photo.direction}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

const getStableRotation = (src: string, direction?: Direction) => {
  const hash = src
    .split("")
    .reduce((total, character) => total + character.charCodeAt(0), 0);
  const degrees = 1 + (hash % 300) / 100;
  return degrees * (direction === "left" ? -1 : 1);
};

export const Photo = ({
  src,
  alt,
  className,
  direction,
  width,
  height,
}: {
  src: string;
  alt: string;
  className?: string;
  direction?: Direction;
  width: number;
  height: number;
}) => {
  const isTouch = useIsTouch();
  const x = useMotionValue(200);
  const y = useMotionValue(200);
  const rotation = getStableRotation(src, direction);

  function handleMouse(event: {
    currentTarget: { getBoundingClientRect: () => any };
    clientX: number;
    clientY: number;
  }) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left);
    y.set(event.clientY - rect.top);
  }

  const resetMouse = () => {
    x.set(200);
    y.set(200);
  };

  return (
    <motion.div
      // Free dragging sets touch-action: none, which would stop vertical
      // swipes from scrolling the page on phones.
      drag={isTouch ? "x" : true}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      whileTap={{ scale: 1.2, zIndex: 9999 }}
      whileHover={{
        scale: 1.1,
        rotateZ: 2 * (direction === "left" ? -1 : 1),
        zIndex: 9999,
      }}
      whileDrag={{
        scale: 1.1,
        zIndex: 9999,
      }}
      initial={{ rotate: 0 }}
      animate={{ rotate: rotation }}
      style={{
        width,
        height,
        perspective: 400,
        transform: `rotate(0deg) rotateX(0deg) rotateY(0deg)`,
        zIndex: 1,
        WebkitTouchCallout: "none",
        WebkitUserSelect: "none",
        userSelect: "none",
      }}
      className={cn(
        className,
        "group relative mx-auto shrink-0 cursor-grab active:cursor-grabbing"
      )}
      onMouseMove={handleMouse}
      onMouseLeave={resetMouse}
      draggable={false}
      tabIndex={0}
    >
      <div className="relative h-full w-full overflow-hidden rounded-3xl bg-espresso/60 shadow-sm">
        <Image
          className={cn(
            "warm-tone h-full w-full rounded-3xl object-cover transition-[filter] duration-500 group-active:warm-tone-none [@media(hover:hover)]:group-hover:warm-tone-none"
          )}
          src={src}
          alt={alt}
          fill
          sizes={`${width}px`}
          loading="eager"
          draggable={false}
        />
      </div>
    </motion.div>
  );
};
