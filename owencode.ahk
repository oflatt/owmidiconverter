FileRead, Encoding, encoding.txt
StringLen, Length, Encoding
Index := 0

#o::
Loop % Length
{
    Char := substr(Encoding, Index, 1)
    MsgBox % Char
    if (Char == "0") {
        SendInput {Space}
    } else {
        SendInput {1}
    }
    Sleep, 10
    Index := Index + 1
}

Escape::
ExitApp
Return
