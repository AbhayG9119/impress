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
    // 🖱 Desktop: Mouse Events
    paper.addEventListener("mousedown", (e) => this.onMouseDown(e, paper));
    document.addEventListener("mousemove", (e) => this.onMouseMove(e, paper));
    window.addEventListener("mouseup", () => this.onMouseUp());

    // 📱 Mobile: Touch Events
    paper.addEventListener("touchstart", (e) => this.onTouchStart(e, paper), { passive: false });
    document.addEventListener("touchmove", (e) => this.onTouchMove(e, paper), { passive: false });
    window.addEventListener("touchend", () => this.onTouchEnd());
  }

  // ============================
  // 🖱 DESKTOP EVENTS (Mouse)
  // ============================
  onMouseDown(e, paper) {
    if (this.holdingPaper) return;
    this.holdingPaper = true;

    // Bring to front
    paper.style.zIndex = highestZ++;
    paper.offsetHeight; // Force reflow for z-index update

    if (e.button === 0) {
      // Left click → Drag
      this.prevTouchX = e.clientX;
      this.prevTouchY = e.clientY;
    }
    if (e.button === 2) {
      // Right click → Rotate
      this.rotating = true;
    }
  }

  onMouseMove(e, paper) {
    if (this.holdingPaper) {
      if (this.rotating) {
        this.updateRotation(e, paper);
      } else {
        this.updatePosition(e, paper);
      }
    }
  }

  onMouseUp() {
    this.holdingPaper = false;
    this.rotating = false;
  }

  // ============================
  // 📱 MOBILE EVENTS (Touch)
  // ============================
  onTouchStart(e, paper) {
    if (this.holdingPaper) return;
    this.holdingPaper = true;

    // Bring to front
    paper.style.zIndex = highestZ++;
    paper.offsetHeight; // Force reflow

    if (e.touches.length === 1) {
      // One-finger touch → Drag
      this.prevTouchX = e.touches[0].clientX;
      this.prevTouchY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      // Two-finger touch → Rotate
      this.rotating = true;
      this.startRotation(e);
    }
  }

  onTouchMove(e, paper) {
    e.preventDefault(); // Prevent scrolling while moving the paper

    if (this.holdingPaper) {
      if (this.rotating && e.touches.length === 2) {
        this.updateRotation(e, paper);
      } else if (!this.rotating && e.touches.length === 1) {
        this.updatePosition(e.touches[0], paper);
      }
    }
  }

  onTouchEnd() {
    this.holdingPaper = false;
    this.rotating = false;
  }

  // ============================
  // 🔄 Rotation Handling
  // ============================
  startRotation(e) {
    let x1 = e.touches[0].clientX;
    let y1 = e.touches[0].clientY;
    let x2 = e.touches[1].clientX;
    let y2 = e.touches[1].clientY;

    this.initialAngle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
  }

  updateRotation(e, paper) {
    let x1, y1, x2, y2;
    
    if (e.touches) {
      // Touch Rotation
      x1 = e.touches[0].clientX;
      y1 = e.touches[0].clientY;
      x2 = e.touches[1].clientX;
      y2 = e.touches[1].clientY;
    } else {
      // Mouse Rotation (Right Click)
      x1 = this.prevTouchX;
      y1 = this.prevTouchY;
      x2 = e.clientX;
      y2 = e.clientY;
    }

    let newAngle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
    let angleDiff = newAngle - this.initialAngle;

    this.rotation += angleDiff;
    this.initialAngle = newAngle; // Update reference angle for smooth rotation

    requestAnimationFrame(() => {
      paper.style.transform = `translate(${this.currentPaperX}px, ${this.currentPaperY}px) rotate(${this.rotation}deg)`;
    });
  }

  // ============================
  // 📍 Position Handling
  // ============================
  updatePosition(event, paper) {
    this.velX = event.clientX - this.prevTouchX;
    this.velY = event.clientY - this.prevTouchY;

    this.currentPaperX += this.velX;
    this.currentPaperY += this.velY;

    this.prevTouchX = event.clientX;
    this.prevTouchY = event.clientY;

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

// ✅ Right-click menu fix (Prevents right-click context menu from interfering)
document.addEventListener("contextmenu", (e) => e.preventDefault());
