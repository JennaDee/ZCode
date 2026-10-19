import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CodeXml,
  Flame,
  Sparkles,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Eyebrow } from "../ui/Eyebrow";
import type { KeyboardEvent } from "react";

const slides = [
  {
    title: "Learn Code, Your Way",
    description:
      "Explore programming concepts through clear, structured lessons at your own pace.",
    theme: "learn",
    eyebrow: "A SPACE FOR YOUR CURIOSITY",
  },
  {
    title: "Built from What You Learn",
    description:
      "Discover thoughtfully organized lessons, concepts, and coding exercises created from real learning experiences.",
    theme: "build",
    eyebrow: "SMALL IDEAS. NEW POSSIBILITIES.",
  },
  {
    title: "Progress, Practice, Repeat",
    description:
      "Track streaks, complete lessons, and unlock more as you learn.",
    theme: "progress",
    eyebrow: "ONE STEP CLOSER, EVERY DAY",
  },
] as const;

function SlideArtwork({ theme }: { theme: (typeof slides)[number]["theme"] }) {
  return (
    <div className={`slide-art art-${theme}`} aria-hidden="true">
      <div className="art-halo" />
      <div className="art-orbit orbit-one" />
      <div className="art-orbit orbit-two" />
      <span className="art-star star-one">✦</span>
      <span className="art-star star-two">✧</span>
      <span className="art-star star-three">✦</span>
      {theme === "learn" && (
        <>
          <div className="code-planet">
            <CodeXml aria-hidden="true" strokeWidth={1.2} />
          </div>
          <span className="satellite satellite-blue" />
          <span className="satellite satellite-pink" />
          <div className="art-code glass">
            <span className="window-dots">● ● ●</span>
            <code>
              <span>print</span>("Hello, possibility.")
            </code>
          </div>
          <span className="symbol symbol-left">{"{ }"}</span>
          <span className="symbol symbol-right">&lt;/&gt;</span>
        </>
      )}
      {theme === "build" && (
        <>
          <svg className="knowledge-lines" viewBox="0 0 500 280">
            <path d="M110 80 Q240 30 350 90 M110 80 Q130 230 280 215 M350 90 Q430 200 280 215" />
            <circle cx="225" cy="55" r="4" />
            <circle cx="170" cy="185" r="4" />
            <circle cx="365" cy="182" r="4" />
          </svg>
          <div className="knowledge-card knowledge-lesson glass">
            <BookOpen aria-hidden="true" size={19} />
            <span>01 / UNDERSTAND</span>
            <strong>A spark of an idea.</strong>
            <div className="abstract-line" />
            <div className="abstract-line short" />
          </div>
          <div className="knowledge-card knowledge-code glass">
            <CodeXml aria-hidden="true" size={19} />
            <span>02 / EXPLORE</span>
            <code>
              <b>def</b> grow():
              <br />
              &nbsp; learn()
              <br />
              &nbsp; practice()
            </code>
          </div>
          <div className="knowledge-chip glass">
            <Sparkles aria-hidden="true" size={16} /> Make it your own.
          </div>
        </>
      )}
      {theme === "progress" && (
        <>
          <svg className="milestone-path" viewBox="0 0 500 280">
            <path
              className="path-base"
              d="M65 210 C65 110 200 225 225 140 S340 40 430 70"
            />
            <path
              className="path-complete"
              d="M65 210 C65 110 200 225 225 140"
            />
          </svg>
          <span className="milestone milestone-one">
            <Check aria-hidden="true" />
          </span>
          <span className="milestone milestone-two">
            <Check aria-hidden="true" />
          </span>
          <span className="milestone milestone-three">
            <Sparkles aria-hidden="true" />
          </span>
          <span className="milestone milestone-four">
            <BookOpen aria-hidden="true" />
          </span>
          <div className="streak-chip glass">
            <Flame aria-hidden="true" size={19} />
            <div>
              <strong>A little, every day.</strong>
              <span>SMALL STEPS ADD UP</span>
            </div>
          </div>
          <span className="milestone-caption">YOUR NEXT CHAPTER ↗</span>
        </>
      )}
    </div>
  );
}

export function IntroCarousel() {
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  function move(direction: number) {
    setIndex(
      (current) => (current + direction + slides.length) % slides.length,
    );
  }
  function handleKey(event: KeyboardEvent<HTMLElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
      return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      move(event.key === "ArrowRight" ? 1 : -1);
    }
  }
  return (
    <section
      className="introduction"
      aria-label="Introducing ZCode"
      aria-roledescription="carousel"
      onKeyDown={handleKey}
    >
      <div
        className="slide-stage"
        id="introduction-slide"
        aria-live="polite"
        aria-atomic="true"
      >
        <div
          key={index}
          className="intro-slide"
          role="group"
          aria-roledescription="slide"
          aria-label={`${index + 1} of ${slides.length}`}
        >
          <SlideArtwork theme={slide.theme} />
          <div className="slide-copy">
            <Eyebrow>{slide.eyebrow}</Eyebrow>
            <h1>{slide.title}</h1>
            <p>{slide.description}</p>
          </div>
        </div>
      </div>
      <div className="carousel-controls">
        <div
          className="carousel-pagination"
          aria-label="Choose an introduction slide"
        >
          {slides.map((item, position) => (
            <button
              key={item.theme}
              type="button"
              aria-label={`Go to slide ${position + 1}: ${item.title}`}
              aria-current={index === position ? "true" : undefined}
              aria-controls="introduction-slide"
              onClick={() => setIndex(position)}
            >
              <span />
            </button>
          ))}
        </div>
        <span className="slide-counter" aria-hidden="true">
          {String(index + 1).padStart(2, "0")} <span>/ 03</span>
        </span>
        <div className="carousel-arrows">
          <Button
            secondary
            className="carousel-arrow"
            aria-label="Previous slide"
            aria-controls="introduction-slide"
            onClick={() => move(-1)}
          >
            <ArrowLeft aria-hidden="true" size={18} />
          </Button>
          <Button
            secondary
            className="carousel-arrow"
            aria-label="Next slide"
            aria-controls="introduction-slide"
            onClick={() => move(1)}
          >
            <ArrowRight aria-hidden="true" size={18} />
          </Button>
        </div>
      </div>
      <p className="intro-roadmap">
        A glimpse of ZCode. Learning features are coming in future milestones.
      </p>
    </section>
  );
}
