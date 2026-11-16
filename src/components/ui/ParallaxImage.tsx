import Image from "next/image";

export function ParallaxImage({
  src,
  alt,
  fill = true,
  className = "",
  containerClassName = "",
  sizes,
  priority = false,
  aspectRatio = "aspect-[4/3]",
}: {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  containerClassName?: string;
  sizes?: string;
  priority?: boolean;
  aspectRatio?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden w-full ${aspectRatio} ${containerClassName}`}
    >
      <div
        className="parallax-media absolute -inset-y-[15%] inset-x-0 w-full h-[130%]"
      >
        <Image
          src={src}
          alt={alt}
          fill={fill}
          sizes={sizes ?? "(max-width: 1024px) 100vw, 45vw"}
          priority={priority}
          className={`object-cover ${className}`}
        />
      </div>
    </div>
  );
}
