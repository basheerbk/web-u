"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";

import { cn } from "@/lib/utils";
import { photos, videos, type Photo } from "@/lib/media";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const MemoryPhoto = ({ photo }: { photo: Photo }) => {
  const [inColor, setInColor] = useState(false);

  return (
    <motion.button
      type="button"
      aria-pressed={inColor}
      aria-label="Show in color"
      onClick={() => setInColor((value) => !value)}
      className="group mb-4 block w-full break-inside-avoid overflow-hidden rounded-3xl bg-espresso/60 shadow-lg"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
    >
      <img
        src={photo.src}
        width={photo.width}
        height={photo.height}
        alt=""
        loading="lazy"
        decoding="async"
        draggable={false}
        className={cn(
          "h-auto w-full transition duration-700 [@media(hover:hover)]:group-hover:scale-105 [@media(hover:hover)]:group-hover:warm-tone-none",
          inColor ? "warm-tone-none" : "warm-tone"
        )}
      />
    </motion.button>
  );
};

export const Memories = () => {
  return (
    <section className="relative bg-roast px-4 py-20 text-crema">
      <div className="mx-auto max-w-7xl">
        <motion.h2
          className="mb-10 text-center font-display text-4xl font-light italic tracking-tight md:text-6xl"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          Moments
        </motion.h2>

        <div className="mb-24 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {videos.map((video) => (
            <motion.div
              key={video.src}
              className="mb-4 break-inside-avoid overflow-hidden rounded-3xl bg-espresso/60 shadow-lg"
              style={{ aspectRatio: `${video.width} / ${video.height}` }}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              <video
                src={video.src}
                poster={video.poster}
                controls
                playsInline
                preload="none"
                className="h-full w-full object-cover"
              />
            </motion.div>
          ))}
        </div>

        <motion.h2
          className="mb-10 text-center font-display text-4xl font-light italic tracking-tight md:text-6xl"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          Memories
        </motion.h2>

        <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
          {photos.map((photo) => (
            <MemoryPhoto key={photo.src} photo={photo} />
          ))}
        </div>
      </div>
    </section>
  );
};
