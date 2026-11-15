/**
 * Maqueen Lite V4.2 (接收端) 測試程式
 * 需在 MakeCode 專案中加入擴充積木：maqueen (github:dfrobot/pxt-maqueen)
 *
 * 操作對應 (DFR0536 手把)：
 * - 搖桿 X軸 / Y軸：控制 Maqueen 前進、後退、左轉、右轉與速度
 * - 按鈕 E (P15, 上)：伺服馬達 S1 夾爪張開 (角度減少)
 * - 按鈕 C (P13, 下)：伺服馬達 S1 夾爪閉合 (角度增加)
 * - 按鈕 F (P16, 左)：切換左車頭燈 (LEDLeft)
 * - 按鈕 D (P14, 右)：切換右車頭燈 (LEDRight)
 * - 按鈕 Z (P8, 搖桿按壓)：鳴按喇叭 (蜂鳴器)
 */

let servoAngle = 90
let leftLedOn = false
let rightLedOn = false

radio.setGroup(1)
maqueen.servoRun(maqueen.Servos.S1, servoAngle)

// 1. 接收搖桿 X/Y 數值與持續按壓狀態
Gamepad.on_joystick_received(function (X_val, Y_val) {
    // 在車載 micro:bit LED 矩陣同步顯示收到的按鈕狀態
    Gamepad.show_button_state()

    // 搖桿控制馬達移動與速度 (類比比例控制)
    if (Y_val > 550 && (X_val > 400 && X_val < 600)) {
        // 前進
        let speed = Math.round(Math.map(Y_val, 550, 1023, 30, 255))
        maqueen.motorRun(maqueen.Motors.All, maqueen.Dir.CW, speed)
    } else if (Y_val < 450 && (X_val > 400 && X_val < 600)) {
        // 後退
        let speed = Math.round(Math.map(Y_val, 450, 0, 30, 255))
        maqueen.motorRun(maqueen.Motors.All, maqueen.Dir.CCW, speed)
    } else if (X_val < 450 && (Y_val > 400 && Y_val < 600)) {
        // 左轉
        let speed = Math.round(Math.map(X_val, 450, 0, 40, 255))
        maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, 20)
        maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, speed)
    } else if (X_val > 550 && (Y_val > 400 && Y_val < 600)) {
        // 右轉
        let speed = Math.round(Math.map(X_val, 550, 1023, 40, 255))
        maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, speed)
        maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, 20)
    } else {
        // 搖桿置中時停止馬達
        maqueen.motorStop(maqueen.Motors.All)
    }

    // 按鈕 E / C 持續按下：控制 S1 伺服馬達角度 (0~180度)
    if (Gamepad.is_pressing(GamepadButton.E) && servoAngle > 0) {
        servoAngle = Math.max(0, servoAngle - 5)
        maqueen.servoRun(maqueen.Servos.S1, servoAngle)
    } else if (Gamepad.is_pressing(GamepadButton.C) && servoAngle < 180) {
        servoAngle = Math.min(180, servoAngle + 5)
        maqueen.servoRun(maqueen.Servos.S1, servoAngle)
    }
})

// 2. 按鈕 F / D 按下 (邊緣觸發)：切換左右車頭燈
Gamepad.on_button_edge_received(GamepadButton.F, GamepadButtonEdge.Down, function () {
    leftLedOn = !leftLedOn
    maqueen.writeLED(
        maqueen.LED.LEDLeft,
        leftLedOn ? maqueen.LEDswitch.turnOn : maqueen.LEDswitch.turnOff
    )
})

Gamepad.on_button_edge_received(GamepadButton.D, GamepadButtonEdge.Down, function () {
    rightLedOn = !rightLedOn
    maqueen.writeLED(
        maqueen.LED.LEDRight,
        rightLedOn ? maqueen.LEDswitch.turnOn : maqueen.LEDswitch.turnOff
    )
})

// 3. 按鈕 Z 按下 / 放開 (邊緣觸發)：控制喇叭音效
Gamepad.on_button_edge_received(GamepadButton.Z, GamepadButtonEdge.Down, function () {
    music.ringTone(523)
})

Gamepad.on_button_edge_received(GamepadButton.Z, GamepadButtonEdge.Up, function () {
    music.stopAllSounds()
})
