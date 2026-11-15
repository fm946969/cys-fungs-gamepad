/**
 * DFRobot DFR0536 遊戲手把擴充積木 — 發送端 (手把硬體讀取、震動馬達、廣播發送)
 */

/**
 * 震動馬達開關列舉
 */
enum GamepadVibrator {
    //% block="開啟"
    On = 1,
    //% block="關閉"
    Off = 0
}

namespace Gamepad {
    const BUTTON_PINS = [
        DigitalPin.P5,  // A
        DigitalPin.P11, // B
        DigitalPin.P13, // C
        DigitalPin.P14, // D
        DigitalPin.P15, // E
        DigitalPin.P16, // F
        DigitalPin.P8   // Z
    ];

    let pinsInitialized = false;

    function initPins(): void {
        if (pinsInitialized) {
            return;
        }
        pins.setPull(DigitalPin.P5, PinPullMode.PullUp);
        pins.setPull(DigitalPin.P11, PinPullMode.PullUp);
        pins.setPull(DigitalPin.P13, PinPullMode.PullNone);
        pins.setPull(DigitalPin.P14, PinPullMode.PullNone);
        pins.setPull(DigitalPin.P15, PinPullMode.PullNone);
        pins.setPull(DigitalPin.P16, PinPullMode.PullNone);
        pins.setPull(DigitalPin.P8, PinPullMode.PullNone);
        pinsInitialized = true;
    }

    /**
     * 更新手把狀態（讀取搖桿與所有按鈕的最新狀態）
     */
    //% blockId="gamepad_update"
    //% block="更新手把狀態"
    //% subcategory="發送端"
    //% weight=100
    export function update(): void {
        initPins();
        for (let i = 0; i < __BUTTON_COUNT; i++) {
            __updateButton(i, pins.digitalReadPin(BUTTON_PINS[i]) == 0);
        }
        __setJoystick(
            pins.analogReadPin(AnalogPin.P1),
            pins.analogReadPin(AnalogPin.P2)
        );
    }

    /**
     * 透過廣播 (Radio) 發送手把狀態：X軸,Y軸,<按下的按鈕>
     */
    //% blockId="gamepad_send_button_state"
    //% block="廣播手把狀態"
    //% subcategory="發送端"
    //% weight=90
    export function send_button_state(): void {
        let pressed = "";
        for (let i = 0; i < __BUTTON_COUNT; i++) {
            if (__isButtonIndexPressing(i)) {
                pressed += __BUTTON_NAMES[i];
            }
        }
        let x = get_joystick(GamepadJoystickAxis.X);
        let y = get_joystick(GamepadJoystickAxis.Y);
        radio.sendString("" + x + "," + y + "," + pressed);
    }

    /**
     * 控制震動馬達與指示燈開關 (P12 類比輸出)
     * @param state 開啟或關閉
     */
    //% blockId="gamepad_vibrator"
    //% block="震動馬達 %state"
    //% subcategory="發送端"
    //% weight=80
    export function vibrator(state: GamepadVibrator): void {
        initPins();
        pins.analogWritePin(AnalogPin.P12, state == GamepadVibrator.On ? 1023 : 0);
    }

    /**
     * 設定震動馬達強度 (P12 類比輸出 0~1023)
     * @param intensity 震動強度 (0~1023), eg: 1023
     */
    //% blockId="gamepad_vibrator_intensity"
    //% block="震動馬達強度 %intensity"
    //% intensity.min=0 intensity.max=1023 intensity.defl=1023
    //% subcategory="發送端"
    //% weight=75
    export function vibrator_intensity(intensity: number): void {
        initPins();
        let val = Math.clamp(0, 1023, intensity);
        pins.analogWritePin(AnalogPin.P12, val);
    }
}
