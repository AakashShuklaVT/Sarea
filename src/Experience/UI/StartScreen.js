import Experience from "../Experience";

export default class StartScreen {
    constructor() {
        this.experience = new Experience();
        this.eventEmitter = this.experience.eventEmitter;
        this.audioManager = this.experience.audioManager;
        this.resources = this.experience.resources;
        this.startScreen = document.querySelector(".start-screen");
        this.startButton = null;
        this.cartButton = null;
        this.coinsUI = null;
        this.newPlayer = false
        this.initCoins();
        this.getUIElements();
        this.updateCoinsDisplay();
        this.registerEvents();
    }

    initCoins() {
        const storedCoins = localStorage.getItem("totalCoins");
        if (storedCoins === null) {
            localStorage.setItem("totalCoins", "0");
            this.totalCoins = 0;
            this.newPlayer = true;
        }
        else {
            this.totalCoins = parseInt(storedCoins, 10);
        }
    }

    updateCoinsDisplay() {
        if (this.coinsUIText)
            this.coinsUIText.textContent = this.totalCoins;
    }

    getUIElements() {
        if (!this.startScreen) return;
        this.startButton = this.startScreen.querySelector(".start-btn");
        this.cartButton = this.startScreen.querySelector(".cart-btn-start");
        this.coinsUI = this.startScreen.querySelector(".coins-ui-start");
        this.coinsUIText = this.startScreen.querySelector(".coins-text");
        this.startCouponScreen = document.querySelector(".start-coupon-screen");
        this.backBtnCouponScreen = document.querySelector(".back-btn-start-coupon");
    }

    tryShowCouponScreen() {
        if (this.newPlayer) {
            setTimeout(() => {
                this.showCouponScreen()
                this.newPlayer = false
            }, 400)
        }
    }

    show() {
        if (this.startScreen)
            this.startScreen.style.display = "flex";
    }

    hide() {
        if (this.startScreen)
            this.startScreen.style.display = "none";
    }

    showCouponScreen() {
        if (this.startCouponScreen)
            this.startCouponScreen.style.display = "flex";
    }

    hideCouponScreen() {
        if (this.startCouponScreen)
            this.startCouponScreen.style.display = "none";
    }

    registerEvents() {
        this.eventEmitter.on("loadingCompleted", () => {
            this.show();
        });

        this.eventEmitter.on("goHome", () => {
            this.show();
        });

        this.eventEmitter.on("gameOver", () => {
            this.tryShowCouponScreen();
        });

        this.eventEmitter.on("updateTotalCoins", (coins) => {
            this.totalCoins += coins;
            localStorage.setItem("totalCoins", this.totalCoins.toString());
            this.updateCoinsDisplay();
        });

        if (this.startButton) {
            this.startButton.addEventListener("click", () => {
                this.hide();
                this.eventEmitter.trigger("gameStart");
            });
            this.startButton.addEventListener("click", () => {
                this.hide();
                this.eventEmitter.trigger("gameStart");
            });
        }

        if (this.backBtnCouponScreen) {
            this.backBtnCouponScreen.addEventListener("click", () => {
                this.hideCouponScreen();
            });
        }
    }
}
