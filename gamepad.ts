
/**
 * DFRobot DFR0536 遊戲手把擴充積木（共用積木與狀態）
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
 * Gamepad 遊戲手把積木
 */
//% weight=100 color=#0fbc11 icon="\uf11b" block="Gamepad"
//% subcategories='["發送端", "接收端"]'
namespace Gamepad {
    export const __BUTTON_COUNT = 7;
    export const __BUTTON_NAMES = ["A", "B", "C", "D", "E", "F", "Z"];

    // LED 矩陣顯示座標：
    // 第1列 (row 0): A(0,0), B(1,0)
    // 第2列 (row 1): C(0,1), D(1,1), E(2,1), F(3,1)
    // 第3列 (row 2): Z(0,2)
    const LED_X = [0, 1, 0, 1, 2, 3, 0];
    const LED_Y = [0, 0, 1, 1, 1, 1, 2];

    let currentButtons: boolean[] = [false, false, false, false, false, false, false];
    let previousButtons: boolean[] = [false, false, false, false, false, false, false];
    let joystickX = 512;
    let joystickY = 512;

    //% blockHidden=true
    export function __updateButton(index: number, pressed: boolean): void {
        previousButtons[index] = currentButtons[index];
        currentButtons[index] = pressed;
    }

    //% blockHidden=true
    export function __setJoystick(x: number, y: number): void {
        joystickX = x;
        joystickY = y;
    }

    //% blockHidden=true
    export function __isButtonIndexPressing(index: number): boolean {
        return currentButtons[index];
    }

    //% blockHidden=true
    export function __wasButtonIndexPressed(index: number): boolean {
        return previousButtons[index];
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
     * 在 micro:bit LED 矩陣上顯示按鈕狀態
     * 第1列：A(0,0), B(1,0)
     * 第2列：C(0,1), D(1,1), E(2,1), F(3,1)
     * 第3列：Z(0,2)
     */
    //% blockId="gamepad_show_button_state"
    //% block="顯示按鈕狀態"
    //% weight=70
    export function show_button_state(): void {
        for (let i = 0; i < __BUTTON_COUNT; i++) {
            if (currentButtons[i]) {
                led.plot(LED_X[i], LED_Y[i]);
            } else {
                led.unplot(LED_X[i], LED_Y[i]);
            }
        }
    }
}
