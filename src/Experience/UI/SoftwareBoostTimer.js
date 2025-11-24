import GameConfig from "../../../static/Configs/GameConfig"
import Experience from "../Experience"

export default class SoftwareBoostTimer {
    constructor() {
        this.experience = new Experience()
        this.eventEmitter = this.experience.eventEmitter
        this.time = this.experience.time

        this.duration = GameConfig.timerConfig.maxTime
        this.elapsed = 0
        this.running = false

        this.container = document.querySelector(".boostTimerContainer")
        this.segments = this.container.querySelectorAll(".segment")

        this.hide()
        
        this.eventEmitter.on("chargeSavePickup", () => {
            this.start()
        })
        
        this.eventEmitter.on("gameOver", () => {
            this.hide()
            this.running = false
        })

        this.eventEmitter.on("goHome", () => {
            this.hide()
            this.running = false
        })
    }

    start() {
        this.elapsed = 0
        this.running = true
        this.show()
    }

    update() {
        if (!this.running) return
        this.elapsed += this.time.delta / 1000
        const t = Math.min(this.elapsed / this.duration, 1)
        const segmentsToShow = Math.ceil((1 - t) * this.segments.length)

        this.segments.forEach((segment, index) => {
            segment.style.opacity = index < segmentsToShow ? 1 : 0.2
        })

        if (this.elapsed >= this.duration) {
            this.running = false
            this.hide()
            this.resetSegments()
            this.eventEmitter.trigger("rareItemTimerEnd")
        }
    }

    resetSegments() {
        this.segments.forEach(s => s.style.opacity = 1)
    }

    show() {
        this.container.style.display = "flex"
    }

    hide() {
        this.container.style.display = "none"
    }
}
