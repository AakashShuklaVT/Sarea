import * as THREE from 'three'
import Experience from '../../Experience.js'
import Bubble from '../../Utils/Bubble.js'

export default class Carplay {
    constructor(position) {
        this.experience = new Experience()
        this.audioManager = this.experience.audioManager
        this.scene = this.experience.scene

        this.position = position
        this.type = 'carplay'
        this.rotationSpeed = 0.03
        this.active = true
        this.yOffset = 0.3

        this.setModel()
        this.createBubble()
        this.boundingSphere = new THREE.Sphere(this.bubble.position.clone(), 0.35)
    }

    setModel() {
        this.model = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.3, 0.3),
            new THREE.MeshStandardMaterial({ color: 0xff44ff })
        )
        this.model.position.copy(this.position)
        this.model.position.y = this.yOffset
        this.model.castShadow = true
        this.model.receiveShadow = true
        this.scene.add(this.model)
    }

    createBubble() {
        const bubbleClass = new Bubble(0.35)
        this.bubble = bubbleClass.create(
            this.position.x,
            this.position.y + 0.6,
            this.position.z
        )
    }

    onCollision() {
        this.experience.eventEmitter.trigger('carplayPickup')
        this.playAudio()
        this.model.visible = false
        this.bubble.visible = false
        this.active = false
    }

    update() {
        if (this.active) this.model.rotation.y += this.rotationSpeed
    }

    playAudio() {
        this.audioManager.create('slowChargerAudio', {
            buffer: this.experience.resources.items['slowChargerAudio'],
            type: 'global',
            loop: false,
            volume: 0.2,
        })
        this.audioManager.play('slowChargerAudio')
    }
}
