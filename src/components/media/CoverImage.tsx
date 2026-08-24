import Image from "next/image";
import { shouldUnoptimizeImage } from "@/lib/images";

type CoverImageProps = {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  /**
   * fill (default): absolute inset image for fixed aspect boxes.
   * natural: full image visible, width 100%, height auto — no crop.
   */
  fit?: "fill" | "natural";
};

export default function CoverImage({
  src,
  alt,
  sizes,
  className,
  priority = false,
  fit = "fill",
}: CoverImageProps) {
  if (fit === "natural") {
    if (shouldUnoptimizeImage(src)) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className={className ?? "h-auto w-full"}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
        />
      );
    }

    return (
      <Image
        src={src}
        alt={alt}
        width={1200}
        height={675}
        sizes={sizes}
        className={className ?? "h-auto w-full"}
        priority={priority}
      />
    );
  }

  const fillClass = className ?? "object-contain";

  if (shouldUnoptimizeImage(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={`absolute inset-0 h-full w-full ${fillClass}`}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={fillClass}
      priority={priority}
    />
  );
}
