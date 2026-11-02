
/**
 * DFRobot DFR0536 遊戲手把擴充積木
 * 硬體規格：https://wiki.dfrobot.com/dfr0536/#tech_specs
 */

/**
 * 手把按鈕列舉
 */
enum GamepadButton {
    //% block="A"
    A = 0,
    //% block="B"
    B = 1,
    //% block="C"
    C = 2,
    //% block="D"
    D = 3,
    //% block="E"
    E = 4,
    //% block="F"
    F = 5,
    //% block="Z"
    Z = 6
}

/**
 * 按鈕狀態列舉
 */
enum GamepadButtonState {
    //% block="持續按下"
    IsPressing = 0,
    //% block="剛被按下"
    IsPressed = 1,
    //% block="剛放開"
    IsReleased = 2
}

/**
 * 搖桿軸向列舉
 */
enum GamepadJoystickAxis {
    //% block="X軸"
    X = 0,
    //% block="Y軸"
    Y = 1
}

/**
 * 震動馬達開關列舉
 */
enum GamepadVibrator {
    //% block="開啟"
    On = 1,
    //% block="關閉"
    Off = 0
}

/**
 * Gamepad 遊戲手把積木
 */
//% weight=100 color=#0fbc11 icon="\uf11b" block="Gamepad"
namespace Gamepad {
    const BUTTON_COUNT = 7;
    const BUTTON_NAMES = ["A", "B", "C", "D", "E", "F", "Z"];
    const BUTTON_PINS = [
        DigitalPin.P5,  // A
        DigitalPin.P11, // B
        DigitalPin.P13, // C
        DigitalPin.P14, // D
        DigitalPin.P15, // E
        DigitalPin.P16, // F
        DigitalPin.P8   // Z
    ];

    // LED 矩陣顯示座標：
    // 第1列 (row 0): A(0,0), B(1,0)
    // 第2列 (row 1): C(0,1), D(1,1), E(2,1), F(3,1)
    // 第3列 (row 2): Z(0,2)
    const LED_X = [0, 1, 0, 1, 2, 3, 0];
    const LED_Y = [0, 0, 1, 1, 1, 1, 2];

    let pinsInitialized = false;
    let currentButtons: boolean[] = [false, false, false, false, false, false, false];
    let previousButtons: boolean[] = [false, false, false, false, false, false, false];
    let joystickX = 512;
    let joystickY = 512;

    let stateReceivedHandler: (
        X_val: number,
        Y_val: number,
        A_is_pressed: boolean,
        B_is_pressed: boolean,
        C_is_pressed: boolean,
        D_is_pressed: boolean,
        E_is_pressed: boolean,
        F_is_pressed: boolean,
        Z_is_pressed: boolean
    ) => void;
    let radioListenerRegistered = false;

    function initPins(): void {
        if (pinsInitialized) {
            return;
        }
        pins.setPull(DigitalPin.P5, PinPullMode.PullUp);
        pins.setPull(DigitalPin.P11, PinPullMode.PullUp);
        pins.setPull(DigitalPin.P13, PinPullMode.PullNone);
        pins.setPull(DigitalPin.P14, PinPullMode.PullNone);
        pins.setPull(DigitalPin.P15, PinPullMode.PullNone);
        pins.setPull(DigitalPin.P16, PinPullMode.PullUp);
        pins.setPull(DigitalPin.P8, PinPullMode.PullNone);
        pinsInitialized = true;
    }

    /**
     * 更新手把狀態（讀取搖桿與所有按鈕的最新狀態）
     */
    //% blockId="gamepad_update"
    //% block="更新手把狀態"
    //% weight=100
    export function update(): void {
        initPins();
        for (let i = 0; i < BUTTON_COUNT; i++) {
            previousButtons[i] = currentButtons[i];
            currentButtons[i] = pins.digitalReadPin(BUTTON_PINS[i]) == 0;
        }
        joystickX = pins.analogReadPin(AnalogPin.P1);
        joystickY = pins.analogReadPin(AnalogPin.P2);
    }

    /**
     * 檢查按鈕是否處於指定狀態（持續按下 / 剛被按下 / 剛放開）
     * @param button 要檢查的按鈕
     * @param state 要檢查的按鈕狀態
     */
    //% blockId="gamepad_is_button_pressed"
    //% block="按鈕 %button %state"
    //% weight=90
    export function is_button_pressed(
        button: GamepadButton,
        state: GamepadButtonState = GamepadButtonState.IsPressing
    ): boolean {
        let idx = <number>button;
        if (state == GamepadButtonState.IsPressing) {
            return currentButtons[idx];
        } else if (state == GamepadButtonState.IsPressed) {
            return currentButtons[idx] && !previousButtons[idx];
        } else if (state == GamepadButtonState.IsReleased) {
            return !currentButtons[idx] && previousButtons[idx];
        }
        return false;
    }

    /**
     * 檢查按鈕在上一次狀態是否被按下
     * @param button 要檢查的按鈕
     */
    export function was_button_pressed(button: GamepadButton): boolean {
        return previousButtons[<number>button];
    }

    /**
     * 檢查按鈕是否持續按下
     * @param button 要檢查的按鈕
     */
    export function is_pressing(button: GamepadButton): boolean {
        return currentButtons[<number>button];
    }

    /**
     * 檢查按鈕是否剛被按下（邊緣觸發）
     * @param button 要檢查的按鈕
     */
    export function is_pressed(button: GamepadButton): boolean {
        let idx = <number>button;
        return currentButtons[idx] && !previousButtons[idx];
    }

    /**
     * 檢查按鈕是否剛放開（邊緣觸發）
     * @param button 要檢查的按鈕
     */
    export function is_released(button: GamepadButton): boolean {
        let idx = <number>button;
        return !currentButtons[idx] && previousButtons[idx];
    }

    /**
     * 取得搖桿指定軸向的數值 (0~1023)
     * @param axis 搖桿軸向 (X軸 或 Y軸)
     */
    //% blockId="gamepad_get_joystick"
    //% block="搖桿 %axis 數值"
    //% weight=85
    export function get_joystick(axis: GamepadJoystickAxis): number {
        if (axis == GamepadJoystickAxis.X) {
            return joystickX;
        }
        return joystickY;
    }

    /**
     * 控制震動馬達與指示燈開關 (P12)
     * @param state 開啟或關閉
     */
    //% blockId="gamepad_vibrator"
    //% block="震動馬達 %state"
    //% weight=80
    export function vibrator(state: GamepadVibrator): void {
        initPins();
        pins.digitalWritePin(DigitalPin.P12, state == GamepadVibrator.On ? 1 : 0);
    }

    /**
     * 在 micro:bit LED 矩陣上顯示按鈕狀態
     * 第1列：A(0,0), B(1,0)
     * 第2列：C(0,1), D(1,1), E(2,1), F(3,1)
     * 第3列：Z(0,2)
     */
    //% blockId="gamepad_show_button_state"
    //% block="顯示按鈕狀態"
    //% weight=70
    export function show_button_state(): void {
        for (let i = 0; i < BUTTON_COUNT; i++) {
            if (currentButtons[i]) {
                led.plot(LED_X[i], LED_Y[i]);
            } else {
                led.unplot(LED_X[i], LED_Y[i]);
            }
        }
    }

    /**
     * 透過廣播 (Radio) 發送手把狀態：X軸,Y軸,<按下的按鈕>
     */
    //% blockId="gamepad_send_button_state"
    //% block="廣播手把狀態"
    //% weight=60
    export function send_button_state(): void {
        let pressed = "";
        for (let i = 0; i < BUTTON_COUNT; i++) {
            if (currentButtons[i]) {
                pressed += BUTTON_NAMES[i];
            }
        }
        radio.sendString("" + joystickX + "," + joystickY + "," + pressed);
    }

    /**
     * 當收到手把廣播狀態時執行（同時更新內部手把狀態，方便搭配其他積木使用）
     */
    //% blockId="gamepad_on_state_received"
    //% block="當收到手把狀態時"
    //% draggableParameters="reporter"
    //% weight=50
    export function on_gamepad_state_received(
        handler: (
            X_val: number,
            Y_val: number,
            A_is_pressed: boolean,
            B_is_pressed: boolean,
            C_is_pressed: boolean,
            D_is_pressed: boolean,
            E_is_pressed: boolean,
            F_is_pressed: boolean,
            Z_is_pressed: boolean
        ) => void
    ): void {
        stateReceivedHandler = handler;
        if (!radioListenerRegistered) {
            radioListenerRegistered = true;
            radio.onReceivedString(function (receivedString: string) {
                let parts = receivedString.split(",");
                if (parts.length < 3) {
                    return;
                }
                let x = parseInt(parts[0]);
                let y = parseInt(parts[1]);
                if (isNaN(x) || isNaN(y)) {
                    return;
                }
                let buttonsStr = parts[2];
                joystickX = x;
                joystickY = y;
                for (let i = 0; i < BUTTON_COUNT; i++) {
                    previousButtons[i] = currentButtons[i];
                    currentButtons[i] = buttonsStr.indexOf(BUTTON_NAMES[i]) >= 0;
                }
                if (stateReceivedHandler) {
                    stateReceivedHandler(
                        joystickX,
                        joystickY,
                        currentButtons[0],
                        currentButtons[1],
                        currentButtons[2],
                        currentButtons[3],
                        currentButtons[4],
                        currentButtons[5],
                        currentButtons[6]
                    );
                }
            });
        }
    }
}
