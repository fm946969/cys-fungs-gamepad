/**
 * 遊戲手把端 (發送端) 測試程式
 * 搭配 DFRobot DFR0536 micro:bit Gamepad 使用
 */

radio.setGroup(1)

basic.forever(function () {
    // 1. 讀取手把最新狀態 (按鈕 A~F, Z 與 搖桿 X, Y)
    Gamepad.update()

    // 2. 在 LED 矩陣上顯示按鈕狀態
    // 第1列: A(0,0), B(1,0)
    // 第2列: C(0,1), D(1,1), E(2,1), F(3,1)
    // 第3列: Z(0,2)
    Gamepad.show_button_state()

    // 3. 透過廣播發送手把狀態: "X,Y,按下的按鈕"
    Gamepad.send_button_state()

    // 4. 當搖桿按鈕 Z 剛被按下時開啟震動馬達，剛放開時關閉震動馬達
    if (Gamepad.is_button_pressed(GamepadButton.Z, GamepadButtonState.IsPressed)) {
        Gamepad.vibrator(GamepadVibrator.On)
    } else if (Gamepad.is_button_pressed(GamepadButton.Z, GamepadButtonState.IsReleased)) {
        Gamepad.vibrator(GamepadVibrator.Off)
    }

    basic.pause(50)
})
