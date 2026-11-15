/**
 * DFRobot DFR0536 遊戲手把擴充積木 — 接收端 (廣播接收與事件處理)
 */

/**
 * 按鈕邊緣觸發列舉（接收端事件使用）
 */
enum GamepadButtonEdge {
    //% block="按下"
    Down = 0,
    //% block="放開"
    Up = 1
}

namespace Gamepad {
    const noop = () => { };
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
    let joystickReceivedHandler: (X_val: number, Y_val: number) => void;
    let buttonDownHandlers: (() => void)[] = [noop, noop, noop, noop, noop, noop, noop];
    let buttonUpHandlers: (() => void)[] = [noop, noop, noop, noop, noop, noop, noop];
    let radioListenerRegistered = false;

    function ensureRadioListener(): void {
        if (radioListenerRegistered) {
            return;
        }
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
            __setJoystick(x, y);
            for (let i = 0; i < __BUTTON_COUNT; i++) {
                __updateButton(i, buttonsStr.indexOf(__BUTTON_NAMES[i]) >= 0);
            }
            if (stateReceivedHandler) {
                stateReceivedHandler(
                    x,
                    y,
                    __isButtonIndexPressing(0),
                    __isButtonIndexPressing(1),
                    __isButtonIndexPressing(2),
                    __isButtonIndexPressing(3),
                    __isButtonIndexPressing(4),
                    __isButtonIndexPressing(5),
                    __isButtonIndexPressing(6)
                );
            }
            if (joystickReceivedHandler) {
                joystickReceivedHandler(x, y);
            }
            for (let i = 0; i < __BUTTON_COUNT; i++) {
                let curr = __isButtonIndexPressing(i);
                let prev = __wasButtonIndexPressed(i);
                if (curr && !prev) {
                    let downHandler = buttonDownHandlers[i];
                    if (downHandler !== noop) {
                        downHandler();
                    }
                } else if (!curr && prev) {
                    let upHandler = buttonUpHandlers[i];
                    if (upHandler !== noop) {
                        upHandler();
                    }
                }
            }
        });
    }

    /**
     * 當收到手把廣播狀態時執行（同時更新內部手把狀態，方便搭配其他積木使用）
     */
    //% blockId="gamepad_on_state_received"
    //% block="當收到手把狀態時"
    //% draggableParameters="reporter"
    //% subcategory="接收端"
    //% weight=100
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
        ensureRadioListener();
    }

    /**
     * 當收到手把搖桿 X/Y 數值時執行（每次收到廣播封包時觸發）
     */
    //% blockId="gamepad_on_joystick_received"
    //% block="當收到搖桿數值時"
    //% draggableParameters="reporter"
    //% subcategory="接收端"
    //% weight=90
    export function on_joystick_received(
        handler: (X_val: number, Y_val: number) => void
    ): void {
        joystickReceivedHandler = handler;
        ensureRadioListener();
    }

    /**
     * 當收到手把指定按鈕按下或放開（邊緣觸發）時執行
     * @param button 要監聽的按鈕
     * @param edge 按下或放開邊緣事件
     */
    //% blockId="gamepad_on_button_edge_received"
    //% block="當收到按鈕 %button %edge 時"
    //% subcategory="接收端"
    //% weight=80
    export function on_button_edge_received(
        button: GamepadButton,
        edge: GamepadButtonEdge,
        handler: () => void
    ): void {
        let idx = <number>button;
        if (idx < 0 || idx >= __BUTTON_COUNT) {
            return;
        }
        if (edge == GamepadButtonEdge.Down) {
            buttonDownHandlers[idx] = handler;
        } else if (edge == GamepadButtonEdge.Up) {
            buttonUpHandlers[idx] = handler;
        }
        ensureRadioListener();
    }
}
