"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { Container, Section, SectionHeading } from "@/components/ui";
import {
  desktopVideoLayout,
  videoReviews,
} from "@/data/video-reviews";
import "./video-reviews.css";

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function MuteIcon({ muted }: { muted: boolean }) {
  if (muted) {
    return (
      <svg viewBox="0 0 24 24">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <line x1="23" y1="9" x2="17" y2="15" />
        <line x1="17" y1="9" x2="23" y2="15" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}

type TileMode = "center" | "hover" | "mobile";

type VideoTileProps = {
  index: number;
  src: string;
  title: string;
  className?: string;
  mode: TileMode;
  active?: boolean;
  suspended?: boolean;
  onOpen: (index: number) => void;
};

function unloadVideo(video: HTMLVideoElement) {
  video.pause();
  video.removeAttribute("src");
  video.preload = "none";
  try {
    video.load();
  } catch {
    /* ignore */
  }
}

function pauseAtPoster(video: HTMLVideoElement) {
  const freeze = () => {
    video.pause();
    if (video.currentTime < 0.05) {
      try {
        video.currentTime = 0.05;
      } catch {
        /* ignore seek */
      }
    }
  };
  if (video.readyState >= 2) freeze();
  else video.addEventListener("loadeddata", freeze, { once: true });
}

function VideoTile({
  index,
  src,
  title,
  className = "",
  mode,
  active = false,
  suspended = false,
  onOpen,
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hoverPlaying, setHoverPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.loop = true;
    video.playsInline = true;

    if (suspended) {
      unloadVideo(video);
      setHoverPlaying(false);
      return;
    }

    if (mode === "center") {
      if (!video.getAttribute("src")) {
        video.src = src;
      }
      video.preload = "auto";
      const play = () => {
        video.play().catch(() => {});
      };
      if (video.readyState >= 2) play();
      else video.addEventListener("loadeddata", play, { once: true });
      return () => video.removeEventListener("loadeddata", play);
    }

    if (mode === "mobile") {
      if (suspended) {
        unloadVideo(video);
        return;
      }
      if (video.getAttribute("src") !== src) {
        video.src = src;
      }
      if (active) {
        video.preload = "auto";
        video.play().catch(() => {});
      } else {
        video.preload = "metadata";
        pauseAtPoster(video);
      }
      return;
    }

    // hover: metadata poster always; play muted on hover only
    if (video.getAttribute("src") !== src) {
      video.src = src;
    }

    if (hoverPlaying) {
      video.preload = "auto";
      video.play().catch(() => {});
    } else {
      video.preload = "metadata";
      pauseAtPoster(video);
    }
  }, [active, hoverPlaying, mode, src, suspended]);

  const startHoverPreview = () => {
    if (mode !== "hover" || suspended) return;
    setHoverPlaying(true);
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.preload = "auto";
    video.play().catch(() => {});
  };

  const stopHoverPreview = () => {
    if (mode !== "hover") return;
    setHoverPlaying(false);
    const video = videoRef.current;
    if (video) pauseAtPoster(video);
  };

  const handleKey = (e: ReactKeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen(index);
    }
  };

  const itemClass = [
    "video-reviews__item",
    mode === "center" ? "is-autoplay" : "",
    mode === "hover" ? "video-reviews__item--hover" : "",
    hoverPlaying || mode === "center" ? "is-playing" : "",
    mode === "hover" && !hoverPlaying ? "has-poster" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const label =
    mode === "hover" && !hoverPlaying
      ? "Hover to play"
      : "Tap for sound";

  return (
    <div
      className={itemClass}
      data-index={index}
      role="button"
      tabIndex={0}
      aria-label={`Play ${title}`}
      onKeyDown={handleKey}
      onClick={() => onOpen(index)}
      onMouseEnter={startHoverPreview}
      onMouseLeave={stopHoverPreview}
      onFocus={startHoverPreview}
      onBlur={stopHoverPreview}
    >
      <video
        ref={videoRef}
        className="video-reviews__stream"
        muted
        playsInline
        loop
        preload={
          mode === "center"
            ? "auto"
            : mode === "hover"
              ? "metadata"
              : "none"
        }
        aria-hidden
      />
      <div className="video-reviews__shade" aria-hidden />
      <div className="video-reviews__play">
        <PlayIcon />
      </div>
      <div className="video-reviews__label">
        <span>{label}</span>
      </div>
    </div>
  );
}

export default function VideoReviews() {
  const sectionId = useId().replace(/:/g, "");
  const mobileTrackRef = useRef<HTMLDivElement>(null);
  const modalSliderRef = useRef<HTMLDivElement>(null);
  const modalVideoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const [ready, setReady] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [mobileIndex, setMobileIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  const dragRef = useRef({
    active: false,
    moved: false,
    startX: 0,
    scrollStart: 0,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const section = document.getElementById("video-reviews");
    if (!section || ready) return;

    const start = () => {
      setReady(true);
      section.classList.remove("is-pending");
    };

    if (!("IntersectionObserver" in window)) {
      start();
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          start();
        }
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(section);
    return () => io.disconnect();
  }, [ready]);

  const getMobileSlideWidth = useCallback(() => {
    const track = mobileTrackRef.current;
    if (!track) return 0;
    const item = track.querySelector<HTMLElement>(".video-reviews__item");
    if (!item) return track.clientWidth;
    const gap = parseInt(getComputedStyle(track).gap, 10) || 0;
    return item.offsetWidth + gap;
  }, []);

  const scrollMobileTo = useCallback(
    (index: number) => {
      const track = mobileTrackRef.current;
      if (!track) return;
      const width = getMobileSlideWidth();
      track.scrollTo({ left: width * index, behavior: "smooth" });
      setMobileIndex(index);
    },
    [getMobileSlideWidth],
  );

  useEffect(() => {
    if (!ready) return;
    const track = mobileTrackRef.current;
    if (!track) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const width = getMobileSlideWidth() || 1;
        const index = Math.round(track.scrollLeft / width);
        const clamped = Math.max(0, Math.min(videoReviews.length - 1, index));
        setMobileIndex((prev) => (prev === clamped ? prev : clamped));
      });
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, [ready, getMobileSlideWidth]);

  const openModal = useCallback((index: number) => {
    setModalIndex(index);
    setIsMuted(false);
    setModalOpen(true);
  }, []);

  const openModalRef = useRef(openModal);
  openModalRef.current = openModal;

  useEffect(() => {
    if (!ready) return;
    const track = mobileTrackRef.current;
    if (!track) return;

    const onTouchEnd = (e: TouchEvent) => {
      if (dragRef.current.moved) return;
      const item = (e.target as HTMLElement).closest(
        ".video-reviews__item",
      ) as HTMLElement | null;
      if (item?.dataset.index != null) {
        openModalRef.current(parseInt(item.dataset.index, 10));
      }
    };

    const onPointerDown = (clientX: number) => {
      dragRef.current = {
        active: true,
        moved: false,
        startX: clientX,
        scrollStart: track.scrollLeft,
      };
      track.style.scrollBehavior = "auto";
    };

    const onPointerMove = (clientX: number, prevent?: () => void) => {
      if (!dragRef.current.active) return;
      const walk = dragRef.current.startX - clientX;
      if (Math.abs(walk) > 5) {
        dragRef.current.moved = true;
        prevent?.();
      }
      track.scrollLeft = dragRef.current.scrollStart + walk;
    };

    const onPointerUp = (clientX: number) => {
      if (!dragRef.current.active) return;
      dragRef.current.active = false;
      const width = getMobileSlideWidth();
      const targetIndex = Math.round(track.scrollLeft / (width || 1));
      track.style.scrollBehavior = "smooth";
      track.scrollTo({
        left: targetIndex * width,
        behavior: "smooth",
      });
    };

    const onTouchStart = (e: TouchEvent) =>
      onPointerDown(e.touches[0].clientX);
    const onTouchMove = (e: TouchEvent) =>
      onPointerMove(e.touches[0].clientX, () => e.preventDefault());

    track.addEventListener("touchstart", onTouchStart, { passive: true });
    track.addEventListener("touchmove", onTouchMove, { passive: false });
    track.addEventListener("touchend", onTouchEnd);

    return () => {
      track.removeEventListener("touchstart", onTouchStart);
      track.removeEventListener("touchmove", onTouchMove);
      track.removeEventListener("touchend", onTouchEnd);
    };
  }, [ready, getMobileSlideWidth]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    modalVideoRefs.current.forEach((video) => {
      if (!video) return;
      video.pause();
      video.removeAttribute("src");
      video.preload = "none";
      try {
        video.load();
      } catch {
        /* ignore */
      }
    });
  }, []);

  useEffect(() => {
    if (!modalOpen || !mounted) return;

    const slider = modalSliderRef.current;
    if (!slider) return;

    const scrollToIndex = (index: number) => {
      const slide = slider.children[index] as HTMLElement | undefined;
      if (!slide) return;
      slider.style.scrollBehavior = "auto";
      slider.scrollTop = slide.offsetTop;
      setTimeout(() => {
        slider.style.scrollBehavior = "smooth";
      }, 50);
    };

    scrollToIndex(modalIndex);

    const playSlideVideo = (slide: Element | null) => {
      const video = slide?.querySelector<HTMLVideoElement>("video");
      if (!video) return;
      const src = video.dataset.src;
      if (src && video.getAttribute("src") !== src) {
        video.src = src;
        video.preload = "auto";
      }
      video.muted = isMuted;
      video.volume = isMuted ? 0 : 1;
      const tryPlay = () => video.play().catch(() => {
        video.muted = true;
        video.volume = 0;
        setIsMuted(true);
        video.play().catch(() => {});
      });
      tryPlay();
    };

    requestAnimationFrame(() => {
      const slide = slider.children[modalIndex] ?? null;
      playSlideVideo(slide);
      const video = slide?.querySelector<HTMLVideoElement>("video");
      if (video && !isMuted) {
        video.muted = false;
        video.volume = 1;
        video.play().catch(() => {});
      }
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target.querySelector<HTMLVideoElement>("video");
          if (!video) return;
          if (entry.isIntersecting) {
            const src = video.dataset.src;
            if (src) {
              video.src = src;
              video.preload = "auto";
            }
            video.muted = isMuted;
            video.play().catch(() => {});
          } else {
            video.pause();
            video.removeAttribute("src");
            video.preload = "none";
            try {
              video.load();
            } catch {
              /* ignore */
            }
          }
        });
      },
      { threshold: 0.6 },
    );

    slider.querySelectorAll(".video-reviews-modal__slide").forEach((slide) => {
      io.observe(slide);
    });

    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      io.disconnect();
      document.removeEventListener("keydown", onKey);
    };
  }, [modalOpen, modalIndex, mounted, isMuted, closeModal]);

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      modalVideoRefs.current.forEach((v) => {
        if (v) v.muted = next;
      });
      return next;
    });
  };

  const scrollModal = (direction: -1 | 1) => {
    const slider = modalSliderRef.current;
    if (!slider) return;
    slider.scrollBy({
      top: direction * slider.clientHeight,
      behavior: "smooth",
    });
  };

  const renderTile = (reviewIndex: number, className?: string) => {
    const review = videoReviews[reviewIndex];
    const isCenter = reviewIndex === desktopVideoLayout.center;
    return (
      <VideoTile
        key={review.id}
        index={reviewIndex}
        src={review.src}
        title={review.title}
        className={className}
        mode={isCenter ? "center" : "hover"}
        suspended={modalOpen || !ready}
        onOpen={openModal}
      />
    );
  };

  const modal =
    mounted && modalOpen
      ? createPortal(
          <div
            className="video-reviews-modal is-active"
            role="dialog"
            aria-modal="true"
            aria-label="Video reviews"
          >
            <div className="video-reviews-modal__box">
              <div
                ref={modalSliderRef}
                className="video-reviews-modal__slider"
              >
                {videoReviews.map((review, index) => (
                  <div
                    key={review.id}
                    className="video-reviews-modal__slide"
                    data-index={index}
                  >
                    <video
                      ref={(el) => {
                        modalVideoRefs.current[index] = el;
                      }}
                      data-src={review.src}
                      playsInline
                      loop
                      muted={isMuted}
                      preload="none"
                      onClick={(e) => {
                        const v = e.currentTarget;
                        if (v.paused) void v.play();
                        else v.pause();
                      }}
                    />
                    <div className="video-reviews-modal__ui">
                      <div className="video-reviews-modal__close-wrap">
                        <button
                          type="button"
                          className="video-reviews-modal__icon-btn"
                          aria-label="Close"
                          onClick={closeModal}
                        >
                          <CloseIcon />
                        </button>
                      </div>
                      <div className="video-reviews-modal__nav-stack">
                        <button
                          type="button"
                          className="video-reviews-modal__icon-btn"
                          aria-label="Previous video"
                          onClick={() => scrollModal(-1)}
                        >
                          <svg viewBox="0 0 24 24">
                            <polyline points="18 15 12 9 6 15" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="video-reviews-modal__icon-btn"
                          aria-label="Next video"
                          onClick={() => scrollModal(1)}
                        >
                          <svg viewBox="0 0 24 24">
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>
                      </div>
                      <div className="video-reviews-modal__bottom">
                        <button
                          type="button"
                          className="video-reviews-modal__icon-btn"
                          aria-label={isMuted ? "Unmute" : "Mute"}
                          onClick={toggleMute}
                        >
                          <MuteIcon muted={isMuted} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <Section
        id="video-reviews"
        className="section-bg-grey video-reviews is-pending"
      >
        <Container>
          <div className="max-w-3xl">
            <SectionHeading
              caption="CLIENT STORIES"
              title={
                <span id={`video-reviews-heading-${sectionId}`}>
                  Real brands,{" "}
                  <span className="text-primary">real results</span>
                </span>
              }
              description="Hear directly from founders and teams we’ve helped on Shopify — short video reviews from stores we’ve designed, built, and scaled."
              align="left"
            />
          </div>

          <div
            className="video-reviews__mosaic"
            aria-labelledby={`video-reviews-heading-${sectionId}`}
          >
            <div className="video-reviews__col video-reviews__col--left">
              {desktopVideoLayout.left.map((i) => renderTile(i))}
            </div>

            <div className="video-reviews__center">
              {renderTile(
                desktopVideoLayout.center,
                "video-reviews__item--center",
              )}
            </div>

            <div className="video-reviews__col video-reviews__col--right">
              {desktopVideoLayout.right.map((i) => renderTile(i))}
            </div>
          </div>

          <div className="video-reviews__mobile">
            <div ref={mobileTrackRef} className="video-reviews__mobile-track">
              {videoReviews.map((review, index) => (
                <VideoTile
                  key={review.id}
                  index={index}
                  src={review.src}
                  title={review.title}
                  mode="mobile"
                  active={mobileIndex === index}
                  suspended={modalOpen || !ready}
                  onOpen={openModal}
                />
              ))}
            </div>

            <div className="video-reviews__mobile-controls">
              <button
                type="button"
                className="video-reviews__mobile-nav"
                aria-label="Previous review"
                onClick={() => scrollMobileTo(Math.max(0, mobileIndex - 1))}
                disabled={mobileIndex === 0}
              >
                <ChevronLeft />
              </button>

              <div className="video-reviews__dots" role="tablist">
                {videoReviews.map((review, index) => (
                  <button
                    key={review.id}
                    type="button"
                    role="tab"
                    aria-selected={mobileIndex === index}
                    aria-label={`Go to review ${index + 1}`}
                    className={`video-reviews__dot ${
                      mobileIndex === index ? "is-active" : ""
                    }`}
                    onClick={() => scrollMobileTo(index)}
                  />
                ))}
              </div>

              <button
                type="button"
                className="video-reviews__mobile-nav"
                aria-label="Next review"
                onClick={() =>
                  scrollMobileTo(
                    Math.min(videoReviews.length - 1, mobileIndex + 1),
                  )
                }
                disabled={mobileIndex === videoReviews.length - 1}
              >
                <ChevronRight />
              </button>
            </div>
          </div>
        </Container>
      </Section>
      {modal}
    </>
  );
}
