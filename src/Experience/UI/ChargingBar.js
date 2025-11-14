import Experience from "../Experience"
import GameConfig from "../../../static/Configs/GameConfig"

export default class ChargingBar {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.eventEmitter = this.experience.eventEmitter

        this.maxCharge = GameConfig.car.maxCharge
        this.currentMaxCharge = GameConfig.car.currentMaxCharge
        this.currentCharge = GameConfig.car.startCharge

        this.getUIElements()
        this.registerEvents()
        this.updateChargingBar()
    }

    getUIElements() {
        this.container = document.querySelector('.energy-bar')
        if (!this.container) return

        this.currentChargeLayer = this.container.querySelector('.current-charge')
        this.currentMaxLayer = this.container.querySelector('.current-max')
        this.currentChargeText = this.container.querySelector('.current-charge-text')
        this.currentMaxText = this.container.querySelector('.current-max-text')
        this.currentMaxMask = this.container.querySelector('.current-max-mask')

        this.hide()
    }

    registerEvents() {
        this.eventEmitter.on('gameStart', () => {
            this.show()
        })
        this.eventEmitter.on('goHome', () => {
            this.hide()
        })
        this.eventEmitter.on('gameOver', () => {
            this.hide()
        })
    }

    setInitialCharge(maxCharge, currentCharge) {
        this.currentMaxCharge = maxCharge
        this.currentCharge = currentCharge
        this.updateChargingBar()
    }
    
    show() {
        if (this.container)
            this.container.style.display = 'flex'
    }

    hide() {
        if (this.container)
            this.container.style.display = 'none'
    }

    updateChargingBar() {
        if (!this.container) return

        this.currentChargeLayer.style.width = `${this.currentCharge}%`
        this.currentMaxMask.style.width = `100%`
        this.currentMaxLayer.style.left = `0%`
        this.currentMaxLayer.style.width = `${this.currentMaxCharge}%`

        const chargeVal = Math.round(this.currentCharge)
        const maxVal = Math.round(this.currentMaxCharge)
        const diffVal = Math.round(this.currentMaxCharge - this.currentCharge)

        if (chargeVal < 2) {
            this.currentChargeText.textContent = ""
        } else if (chargeVal < 30) {
            this.currentChargeText.textContent = `${chargeVal}`
        } else {
            this.currentChargeText.textContent = `Current Charge - ${chargeVal}`
        }

        if (diffVal < 4) {
            this.currentMaxText.textContent = ""
        } else if (diffVal < 70) {
            this.currentMaxText.textContent = `${maxVal}`
        } else {
            this.currentMaxText.textContent = `Current Maximum Capacity - ${maxVal}`
        }

        let midPointPercent = this.currentCharge + diffVal / 2
        this.currentMaxText.style.position = "absolute"
        this.currentMaxText.style.left = `${midPointPercent}%`
        this.currentMaxText.style.transform = "translateX(-50%)"
    }

    updateCharge(newCharge) {
        this.currentCharge = Math.max(0, Math.min(this.currentMaxCharge, newCharge))
        this.updateChargingBar()
    }

    decreaseCharge(amount) {
        this.currentCharge = Math.max(0, this.currentCharge - amount)
        this.updateChargingBar()
    }

    increaseCharge(amount) {
        this.currentCharge = Math.min(this.currentMaxCharge, this.currentCharge + amount)
        this.updateChargingBar()
    }

    decreaseMaxCharge(amount) {
        this.currentMaxCharge = Math.max(0, this.currentMaxCharge - amount)
        if (this.currentCharge > this.currentMaxCharge) {
            this.currentCharge = this.currentMaxCharge
        }
        this.updateChargingBar()
    }

    increaseMaxCharge(amount) {
        this.currentMaxCharge = Math.min(this.maxCharge, this.currentMaxCharge + amount)
        this.updateChargingBar()
    }
}
