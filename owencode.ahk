FileRead, Encoding, encoding.txt
StringLen, Length, Encoding
Index := 0

Sleep 3000
Loop % Length
{
    Char := substr(Encoding, Index, 1)
    if (Char == "0") {
        SendInput {Ctrl}
    } else if (Char == "1") {
        SendInput {Space}
    } else if (Char == "`n") {
        Sleep 0
    } else {
        throw Char
    }
    Sleep 100
    Index := Index + 1
}

Escape::
ExitApp
Return
