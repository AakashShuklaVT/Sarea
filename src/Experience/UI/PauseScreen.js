import Experience from "../Experience"

export default class PauseScreen {
    constructor() {
        this.experience = new Experience()
        this.eventEmitter = this.experience.eventEmitter
        this.isPaused = this.experience.isPaused

        this.getElements()
        this.registerEvents()
        this.hide() 
    }

    getElements() {
        this.container = document.querySelector(".pause-screen")
        this.resumeButton = document.querySelector(".resume-btn")
        this.homeButton = document.querySelector(".home-btn-pause")
        
        this.pauseButton = document.querySelector(".pause-btn-gameplay")

        if (this.resumeButton) {
            this.resumeButton.addEventListener("click", () => {
                this.experience.isPaused = false
                this.hide()
                this.eventEmitter.trigger("resumeGame")
            })
        }

        if (this.homeButton) {
            this.homeButton.addEventListener("click", () => {
                this.experience.isPaused = true
                this.hide()
                this.eventEmitter.trigger("goHome")
            })
        }

        if (this.pauseButton) {
            this.pauseButton.addEventListener("click", () => {
                this.experience.isPaused = true

                if (this.experience.isPaused) {
                    this.show()
                    this.eventEmitter.trigger("gamePaused")
                }
            })
        }
    }

    registerEvents() {
        this.eventEmitter.on("gameStart", () => {
            this.hide()
            this.showPauseButton()
        })
        
        this.eventEmitter.on("gameOver", () => {
            this.hide()
            this.hidePauseButton()
        })
        
        this.eventEmitter.on("pauseToggled", (isPaused) => {
            this.isPaused = isPaused
            if (isPaused) this.show()
            else this.hide()
        })
    }

    show() {
        if (this.container)
            this.container.style.display = "flex"
    }

    hide() {
        if (this.container) 
            this.container.style.display = "none"
    }

    hidePauseButton() {
        if (this.pauseButton) 
            this.pauseButton.style.display = "none"
    }

    showPauseButton() {
        if (this.pauseButton) 
            this.pauseButton.style.display = "flex"
    }
}
