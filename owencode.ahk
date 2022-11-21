FileRead, Encoding, encoding.txt
StringLen, Length, Encoding
Index := 0

Sleep 3000
Loop % Length
{
    Char := substr(Encoding, Index, 1)
    if (Char == "0") {
        SendInput {Space}
    } else if (Char == "1") {
        SendInput {Ctrl}
    } else if (Char == ",") {
        SendInput {e}
    } else if (Char == "`n") {
        SendInput {Shift}
    } else {
        throw Char
    }
    Sleep 100
    Index := Index + 1
}

Sleep 1000
SendInput {f}

Escape::
ExitApp
Return
