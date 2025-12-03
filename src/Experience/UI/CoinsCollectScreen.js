import Experience from "../Experience";

export default class CoinsCollectScreen {
    constructor(coinCounterUI) {
        this.experience = new Experience()
        this.eventEmitter = this.experience.eventEmitter
        this.coinCounterUI = coinCounterUI
        this.coinsScreen = document.querySelector(".coins-collect-screen")
        this.homeButton = null
        this.playAgainButton = null
        this.pauseButton = null
        this.totalCoins = 0
        this.coinsText = null

        this.getUIElements()
        this.registerEvents()
    }

    getUIElements() {
        if (!this.coinsScreen) return

        this.homeButton = this.coinsScreen.querySelector(".home-btn-coins")
        this.playAgainButton = this.coinsScreen.querySelector(".play-again-btn-coins")
        this.pauseButton = document.querySelector('.pause-btn-gameplay')
        this.coinsText = this.coinsScreen.querySelector(".coin-middle-lower-coin-text")
    }

    show() {
        if (this.coinsScreen){
            this.coinsScreen.style.display = "flex"
        }
    }

    hide() {
        if (this.coinsScreen)
            this.coinsScreen.style.display = "none"
    }

    setCoins(coins) {
        this.totalCoins = coins
        if (this.coinsText)
            this.coinsText.textContent = this.totalCoins
    }

    registerEvents() {
        this.eventEmitter.on("gameOver", () => {
            this.setCoins(this.coinCounterUI.coins)
            setTimeout(() => {
                this.show()
            }, 600)
        });

        if (this.homeButton) {
            this.homeButton.addEventListener("click", () => {
                this.hide()
                this.eventEmitter.trigger("goHome")
            });
        }

        if (this.playAgainButton) {
            this.playAgainButton.addEventListener("click", () => {
                this.hide()
                this.eventEmitter.trigger("gameStart")
            });
        }
    }
}
