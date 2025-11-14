import * as THREE from "three";
import GameConfig from "../../../../static/Configs/GameConfig";
import Experience from "../../Experience";

const TYPES = GameConfig.types;

export default class SpawnManager {
    constructor(car) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.car = car;
        this.entities = [];
        this.managers = [];

        const { laneData, spawnValues } = GameConfig;
        this.laneCount = laneData.laneCount;
        this.laneWidth = laneData.laneWidth; 

        this.minSpacing = spawnValues.minSpacing;
        this.maxSpacing = spawnValues.maxSpacing;
        this.cleanupDistance = spawnValues.cleanupDistance;
        this.startOffset = spawnValues.startOffset;
        this.nextSpawnZ = -this.startOffset;

        this.startTime = performance.now();
        this.phase = "easy";

        this.obstacleManagers = [];
        this.collectableManagers = [];

        // Track last spawn Z per lane
        this.laneLastZ = new Array(this.laneCount).fill(-Infinity);

        this.segmentEntitiesCount = 0;
        this.segmentSoftwareBoostSpawned = false;

        // Obstacle patterns
        this.obstaclePatterns = {
            type2Line: (laneIndex) => [
                { type: "type2", laneIndex : laneIndex },
                { type: "type2", laneIndex: laneIndex },
                { type: "type2", laneIndex: laneIndex },
                { type: "type2", laneIndex: laneIndex },
            ],
            type2LineWithType3: (laneIndex) => [
                { type: "type3", laneIndex : laneIndex },
                { type: "type2", laneIndex : laneIndex },
                { type: "type2", laneIndex: laneIndex },
            ],
            type4Line: (laneIndex) => [
                { type: "type4", laneIndex : laneIndex },
                { type: "type4", laneIndex: laneIndex },
                { type: "type4", laneIndex: laneIndex },
                { type: "type4", laneIndex: laneIndex },
            ],
            type4LineWithType3: (laneIndex) => [
                { type: "type3", laneIndex : laneIndex },
                { type: "type4", laneIndex : laneIndex },
                { type: "type4", laneIndex: laneIndex },
            ],
        };

        // Coin pattern
        this.coinPattern = (laneIndex) => [
            { type: TYPES.COLLECTABLE.COIN, laneIndex },
            { type: TYPES.COLLECTABLE.COIN, laneIndex },
            { type: TYPES.COLLECTABLE.COIN, laneIndex },
        ];
    }

    registerManager(manager, type) {
        manager.spawnType = type;
        this.managers.push(manager);
        if (type === TYPES.SPAWN.OBSTACLE) this.obstacleManagers.push(manager);
        else if (type === TYPES.SPAWN.COLLECTABLE) this.collectableManagers.push(manager);
    }

    updatePhase() {
        const elapsed = (performance.now() - this.startTime) / 1000;
        const phases = GameConfig.phaseConfig;
        if (elapsed < phases.easy.duration) this.phase = "easy";
        else if (elapsed < phases.medium.duration) this.phase = "medium";
        else this.phase = "hard";
    }

    getPhaseConfig() {
        return GameConfig.phaseConfig[this.phase];
    }

    laneIndexToX(laneIndex) {
        const half = Math.floor(this.laneCount / 2);
        return (laneIndex - half) * this.laneWidth;
    }

    getFreeLaneIndex(baseZ, requiredSpacing = 6) {
        const candidates = [];
        for (let i = 0; i < this.laneCount; i++) {
            if (Math.abs(this.laneLastZ[i] - baseZ) > requiredSpacing) candidates.push(i);
        }
        if (!candidates.length) return null;
        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    chooseObstaclePattern() {
        const patternNames = Object.keys(this.obstaclePatterns);
        const randomIndex = Math.floor(Math.random() * patternNames.length);
        return patternNames[randomIndex];
    }

    spawnObstaclePattern(baseZ) {
        if (!this.obstacleManagers.length) return 0;
        const manager = this.obstacleManagers[0];
        const laneIndex = this.getFreeLaneIndex(baseZ);
        if (laneIndex === null) return 0;

        const patternName = this.chooseObstaclePattern();
        const items = this.obstaclePatterns[patternName](laneIndex);
        const spacing = 2.5
        items.forEach((it, i) => {
            const x = this.laneIndexToX(it.laneIndex);
            const zOffset = i * spacing;
            const obstacle = manager.factory.create(it.type);
            obstacle.spawn(x, baseZ - zOffset);
            this.scene.add(obstacle.model);
            this.entities.push(obstacle);
            this.laneLastZ[it.laneIndex] = baseZ - zOffset;
            this.segmentEntitiesCount++;
        });

        return items.length;
    }

    spawnCollectable(baseZ) {
        if (!this.collectableManagers.length) return 0;
        const manager = this.collectableManagers[0];
        const laneIndex = this.getFreeLaneIndex(baseZ);
        if (laneIndex === null) return 0;

        const rates = GameConfig.collectableSpawnRates[this.phase];
        const r = Math.random() * 100;
        let type = null

        if (r < rates.softwareBoost) type = TYPES.COLLECTABLE.SOFTWARE_BOOST;
        // 5
        else if (r < rates.softwareBoost + rates.slowCharger) type = TYPES.COLLECTABLE.SLOW_CHARGER;
        // 15
        else  type = TYPES.COLLECTABLE.FAST_CHARGER;

        const x = this.laneIndexToX(laneIndex);
        const collectable = manager.factory.create(type, new THREE.Vector3(x, 0, baseZ));
        this.scene.add(collectable.model);
        this.entities.push(collectable);
        if (type === TYPES.COLLECTABLE.SOFTWARE_BOOST) this.segmentSoftwareBoostSpawned = true;

        this.segmentEntitiesCount++;
        this.laneLastZ[laneIndex] = baseZ;
        return 1;
    }

    spawnCoinPattern(baseZ) {
        if (!this.collectableManagers.length) return 0;
        const manager = this.collectableManagers[0];
        const laneIndex = this.getFreeLaneIndex(baseZ);
        if (laneIndex === null) return 0;

        const items = this.coinPattern(laneIndex);
        items.forEach((it, i) => {
            const x = this.laneIndexToX(it.laneIndex);
            const z = baseZ - i * 1.5;
            const collectable = manager.factory.create(it.type, new THREE.Vector3(x, 0, z));
            this.scene.add(collectable.model);
            this.entities.push(collectable);
            this.segmentEntitiesCount++;
            this.laneLastZ[it.laneIndex] = z;
        });
        return items.length;
    }

    update(delta) {
        this.updatePhase();
        const carZ = this.car.model.position.z;
        const visibleDistance = GameConfig.spawnValues.visibleDistance;
        const phaseConfig = this.getPhaseConfig();
        const totalPatternPercentage = phaseConfig.obstaclePatternPercentage + phaseConfig.collectablePatternPercentage;
        const obstacleChance = phaseConfig.obstaclePatternPercentage / totalPatternPercentage;
        const collectablePatternChance = phaseConfig.collectablePatternPercentage / totalPatternPercentage;

        while (this.nextSpawnZ > carZ - visibleDistance) {
            const r = Math.random();

            if (r < obstacleChance) {
                // 50
                this.spawnObstaclePattern(this.nextSpawnZ);
            }
            else if (r < obstacleChance + collectablePatternChance * 0.7) {
                // 85 - 50 = 35
                this.spawnCoinPattern(this.nextSpawnZ);
            }
            else {
                // 15
                this.spawnCollectable(this.nextSpawnZ);
            }
            this.nextSpawnZ -= this.minSpacing + Math.random() * (this.maxSpacing - this.minSpacing);
        }

        const carBB = new THREE.Box3().setFromObject(this.car.model);
        for (let i = this.entities.length - 1; i >= 0; i--) {
            const e = this.entities[i];
            e.update?.(delta);

            let collided = false;
            if (e.boundingSphere) collided = carBB.intersectsSphere(e.boundingSphere);
            else if (e.boundingBox) collided = carBB.intersectsBox(e.boundingBox);

            if (collided) {
                e.onCollect?.(this.car);
                e.onCollision?.(this.car);
                this.scene.remove(e.model);
                if (e.bubble) this.scene.remove(e.bubble);
                this.entities.splice(i, 1);
                continue;
            }

            if (e.model.position.z > carZ + this.cleanupDistance) {
                this.scene.remove(e.model);
                if (e.bubble) this.scene.remove(e.bubble);
                this.entities.splice(i, 1);
            }
        }
    }

}
