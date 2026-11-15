// 在這裡測試；當此封包作為擴充功能時，將不會編譯此內容。

radio.setGroup(1)

// 遠端接收端測試
Gamepad.on_gamepad_state_received(function (
    X_val,
    Y_val,
    A_is_pressed,
    B_is_pressed,
    C_is_pressed,
    D_is_pressed,
    E_is_pressed,
    F_is_pressed,
    Z_is_pressed
) {
    Gamepad.show_button_state()
    if (Gamepad.is_button_pressed(GamepadButton.A, GamepadButtonState.IsPressed)) {
        // A 剛被按下
    }
})

// 接收端：搖桿 X/Y 數值處理測試
Gamepad.on_joystick_received(function (X_val, Y_val) {
    let sum = X_val + Y_val
})

// 接收端：按鈕邊緣觸發 (按下 / 放開) 測試
Gamepad.on_button_edge_received(GamepadButton.A, GamepadButtonEdge.Down, function () {
    // A 按下邊緣觸發
})

Gamepad.on_button_edge_received(GamepadButton.A, GamepadButtonEdge.Up, function () {
    // A 放開邊緣觸發
})

Gamepad.on_button_edge_received(GamepadButton.Z, GamepadButtonEdge.Down, function () {
    // Z 按下邊緣觸發
})

Gamepad.on_button_edge_received(GamepadButton.Z, GamepadButtonEdge.Up, function () {
    // Z 放開邊緣觸發
})

// 手把發送端測試
basic.forever(function () {
    Gamepad.update()
    Gamepad.show_button_state()
    Gamepad.send_button_state()

    if (Gamepad.is_button_pressed(GamepadButton.Z, GamepadButtonState.IsPressed)) {
        Gamepad.vibrator(GamepadVibrator.On)
    } else if (Gamepad.is_button_pressed(GamepadButton.Z, GamepadButtonState.IsReleased)) {
        Gamepad.vibrator(GamepadVibrator.Off)
    }
    basic.pause(50)
})

