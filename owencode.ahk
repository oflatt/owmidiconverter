﻿FileRead, Encoding, encoding.txt
StringLen, Length, Encoding
Index := 0


Sleep 3000
Loop % Length
{
    Char := substr(Encoding, Index, 1)
    if (Char == "0") {
        SendInput {Space Down}{Space Up}
    } else if (Char == "1") {
        SendInput {Ctrl Down}{Ctrl Up}
    } else if (Char == ",") {
        SendInput {e Down}{e Up}
    } else if (Char == "`n") {
        Sleep, 1000
        ControlSend, ,!{PGUP}, OBS
        Sleep, 500
        SendInput {Shift Down}{Shift Up}
        Sleep, 100
    } else {
        throw Char
    }
    Sleep 120
    Index := Index + 1
}

Sleep 1000

Escape::
ExitApp
Return
