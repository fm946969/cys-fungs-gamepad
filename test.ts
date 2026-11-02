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

