import Experience from "../Experience.js"

export default class InputHandler {
    constructor() {
        this.experience = new Experience()
        this.eventEmitter = this.experience.eventEmitter
        this.touchStartX = 0
        this.touchEndX = 0
        this.threshold = 30
        this.init()
    }   

    init() {
        // Keyboard
        window.addEventListener("keydown", (e) => {
            switch (e.code) {
                case "ArrowLeft":
                    this.eventEmitter.trigger("left"); 
                    break
                case "ArrowRight":
                    this.eventEmitter.trigger("right");
                    break
            }
        })

        // Touch events (iOS-safe)
        const target = document.querySelector(".webgl") || window

        target.addEventListener("touchstart", (e) => {
            this.touchStartX = e.changedTouches[0].clientX
        }, { passive: false })

        target.addEventListener("touchend", (e) => {
            this.touchEndX = e.changedTouches[0].clientX
            this.handleSwipe()
        }, { passive: false })
    }

    handleSwipe() {
        const diffX = this.touchEndX - this.touchStartX
        
        if (Math.abs(diffX) > this.threshold) {
            if (diffX > 0) {
                this.eventEmitter.trigger("right")
            } else {
                this.eventEmitter.trigger("left")
            }
        }
    }
}
