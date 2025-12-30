import { Roles } from "./assignRoles";
/**
 * CountDown will decrement the timer property in the reference object and pass the result to the callback including 0.
 * This class has four methods. start, stop, countdown, and newCountDown
 * Only call start, stop, and newCountDown.
 * @param {object} objectReference This should be gameState. Otherwise object must have timer and initTimer properties with int values.
 * @param {function} cb Will be passed the new decremented timer value.
 * Example: timer === 90 -> cb(89). cb will never recieve 90 but will recieve 0
 * cb is not provided then default behavior will return timer value and update object.
 * @return {object} Returns new instance of CountDown.
 */
export class CountDown {
    constructor(objectReference = gameState, cb = (time) => time) {
        this.gameState = objectReference;
        this.countDownReference;
        this.cb = cb;
        this.isCounting = false;
        this.countdown = this.countdown.bind(this);
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
    }


    /**
     * Do not call this function directly. It will create erratic behavior. Use start(), stop(), or newCountDown().
     * @param {boolean} isNewCountDown true will reset and continue countdown. false will generate a new countdown instance
     */
    countdown(isNewCountDown) {
        if (isNewCountDown) {
            this.stop();
            this.gameState.timer = this.gameState.initTimer;
        }
        if (this.gameState.timer > -Infinity) {
            this.isCounting = true;
            this.countDownReference = setTimeout(this.countdown, 1000);
        }
        this.cb(--this.gameState.timer);
    }



    /**
     * Start() does not take any params. Will continue counting down or start new countdown based on object timer/initTimer properties.
     * Will not add an additional timer if called while actively counting down.
     * If you need a new countdown then call newCountDown()
     */
    async start() {
        if (gameState.gameStatus === 'setup') {
            const playersWithRoles = await Roles.assignRoles(gameState)
            gameState.playerInfo = playersWithRoles
            gameState.gameStatus = 'playing';
            io.emit('gameState-feed', this.gameState);
        }
        if (this.isCounting) return;
        if (this.gameState.timer > 0) {
            this.countdown(false);
        } else {
            this.countdown(true);
        }
    }



    /**
     * Stops and clears countdown instance. Does not take params.
     */
    stop() {
        //TODO
        this.isCounting = false;
        clearTimeout(this.countDownReference);
    }




    /**
     * Creates a new countdown. Does not take any params
     * It will reset current countdown. This does not stop the countdown. Call stop() first before calling newCountDown().
     */
    newCountDown() {
        this.stop();
        this.gameState.timer = this.gameState.initTimer;
        this.start();
    }
}
