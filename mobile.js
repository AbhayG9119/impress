let highestZ = 1;

class Paper {
  holdingPaper = false;
  rotating = false;
  touchStartX = 0;
  touchStartY = 0;
  prevTouchX = 0;
  prevTouchY = 0;
  velX = 0;
  velY = 0;
  rotation = Math.random() * 30 - 15;
  currentPaperX = 0;
  currentPaperY = 0;

  init(paper) {
    paper.addEventListener("touchstart", (e) => this.onTouchStart(e, paper));
    paper.addEventListener("touchmove", (e) => this.onTouchMove(e, paper), { passive: false });
    paper.addEventListener("touchend", () => this.onTouchEnd());
  }

  onTouchStart(e, paper) {
    if (this.holdingPaper) return;
    this.holdingPaper = true;

    // Update z-index
    paper.style.zIndex = highestZ;
    paper.offsetHeight; // Force reflow for proper z-index updates
    highestZ++;

    if (e.touches.length === 1) {
      // Single finger (dragging)
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
      this.prevTouchX = this.touchStartX;
      this.prevTouchY = this.touchStartY;
    } else if (e.touches.length === 2) {
      // Two fingers (rotation)
      this.rotating = true;
      this.startRotation(e);
    }
  }

  onTouchMove(e, paper) {
    e.preventDefault(); // Prevent scrolling when interacting with a paper

    if (this.holdingPaper) {
      if (this.rotating && e.touches.length === 2) {
        this.updateRotation(e, paper);
      } else if (!this.rotating && e.touches.length === 1) {
        this.updatePosition(e, paper);
      }
    }
  }

  onTouchEnd() {
    this.holdingPaper = false;
    this.rotating = false;
  }

  updatePosition(e, paper) {
    this.velX = e.touches[0].clientX - this.prevTouchX;
    this.velY = e.touches[0].clientY - this.prevTouchY;

    this.currentPaperX += this.velX;
    this.currentPaperY += this.velY;

    this.prevTouchX = e.touches[0].clientX;
    this.prevTouchY = e.touches[0].clientY;

    requestAnimationFrame(() => {
      paper.style.transform = `translate(${this.currentPaperX}px, ${this.currentPaperY}px) rotate(${this.rotation}deg)`;
    });
  }

  startRotation(e) {
    let x1 = e.touches[0].clientX;
    let y1 = e.touches[0].clientY;
    let x2 = e.touches[1].clientX;
    let y2 = e.touches[1].clientY;

    this.initialAngle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
  }

  updateRotation(e, paper) {
    let x1 = e.touches[0].clientX;
    let y1 = e.touches[0].clientY;
    let x2 = e.touches[1].clientX;
    let y2 = e.touches[1].clientY;

    let newAngle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
    let angleDiff = newAngle - this.initialAngle;

    this.rotation += angleDiff;
    this.initialAngle = newAngle; // Update reference angle for smooth rotation

    requestAnimationFrame(() => {
      paper.style.transform = `translate(${this.currentPaperX}px, ${this.currentPaperY}px) rotate(${this.rotation}deg)`;
    });
  }
}

// Initialize papers
const papers = Array.from(document.querySelectorAll(".paper"));
papers.forEach((paper) => {
  const p = new Paper();
  p.init(paper);
});
