# Overwatch MIDI converter
A tool for converting MIDI files into Overwatch workshop arrays, allowing you to play them ingame [with this gamemode.](https://workshop.elohell.gg/UyppVEAxuslMuna/Overwatch+MIDI+Pianist/)  
All Overwatch text languages are supported. (See [Known issues](#known-issues) for a note about Japanese and Chinese)  

If you have any feedback, bug reports, or if you just want to say hello, you can contact me on Discord: ScroogeD#5147

# MIDI converter webpage
[Click here!](https://scrooged2.github.io/owmidiconverter/converter)

# Features

- Play up to a few minutes of any MIDI file
- Simultaneously play up to 11 pitches
- Percussion instruments are automatically ignored
- Notes outside the range of the Overwatch piano are automatically transposed up or down

# How to use
- Open the [MIDI converter webpage.](https://scrooged2.github.io/owmidiconverter/converter)
- Upload a MIDI (.mid) file to the webpage, choose your settings (hover over the texts and read the tooltips for more information), and click Convert MIDI.
  - Make sure to select a language that matches the text language of your Overwatch. If you don't, the generated script can't be pasted into the game.
  - If you get a warning about a type 0 file, keep in mind that percussion may still exist in the converted data, causing the bots to play wrong notes. See [#1](https://github.com/ScroogeD2/owmidiconverter/issues/1) for more information.

If all goes well, you will get some info about the conversion, and a long string containing the custom game settings of the mode. Copy the string by pressing Copy to Clipboard, then open the Overwatch custom game settings screen.![gameSettingsImage](https://i.imgur.com/OqkaGqe.png)  

- Click on *Import Settings* to paste in the copied overwatch custom game settings. In case of an error, make sure that the text language of Overwatch and the language selected in the MIDI converter match. If your text language is Japanese (日本語) or Chinese (简体中文), [read this.](#known-issues)
- Start the custom game.


# Ingame controls

- Interact (F): start and stop playing the song

You can control the speed at which the song is played:
- Crouch + Primary Fire: Speed up by 5 %-points
- Crouch + Secondary Fire: Slow down by 5 %-points  

Note: the minimum time between two notes/chords is 0.064 seconds. If there are delays smaller than that, they are increased to 0.064s. Additionally, a negative speed value will make delays between *all* chords 0.064s.

You can easily remove all game sounds except the piano:
- **Host player only:** Open the custom game lobby with L, then enter the custom game settings screen. (Optional: if you also want to see the bots playing, you can hide your HUD with Alt+Z)
- **Any player:** Open the custom game lobby with L. Right click your player icon on the top right corner of the screen, and press Career Profile. (Optional: hide HUD with Alt+Z. Note that Esc -> Career profile also works, but doesn't allow you to hide your HUD.)


# Known issues

### Import issues with Japanese (日本語) and Chinese (简体中文)
(Note: Taiwanese Mandarin (繁體中文) works as intended.)  

Due to certain localization bugs, the full gamemode settings generated by the converter can't be imported to Japanese or Chinese Overwatch. As a workaround:
  - Import the following code (live servers only): 7ZB2N
  - In the MIDI converter, uncheck "Generate Full Gamemode Settings"
  - Choose the language that matches the text language of your Overwatch, then click Convert MIDI and then copy + paste the generated script to the workshop screen: https://i.imgur.com/Dfkc0gk.png
  - Start the game.

### Other issues
See [issues on Github.](https://github.com/ScroogeD2/owmidiconverter/issues)  


# Workshop array structure

The data read by the Overwatch workshop contains only the necessary information to play a song: pitches and timings of notes, saved in workshop arrays. Each chord can have between 1 and 11 pitches, and consists of the following elements:

```
array[i] = Time
array[i+1] = Pitches
array[i+2] = pitch1
array[i+3] = pitch2
array[i+4] = pitch3
array[i+5] = pitch4
...
array[i+N] = pitchN
```

Time is the time interval between the current chord and the previous chord, and Pitches is the amount of notes in the current chord.

The elements following the first two are the pitches in the chord. Similar to the pitches of MIDI files, one integer is one semitone. The scale starts at 0 (C1) and ends at 63 (E6). For example, C4 (262hz) has a pitch of 36.

The data is divided into several workshop rules to avoid hitting the workshop rule size limit, with each rule containing around 990 array elements. At the end of each rule, the generated array is saved into its own index of the SongData array: SongData = [array0, array1, array2, ...]. The maximum amount of voices needed in any chord is saved in the first element of the first array.

### EXAMPLE
The following array contains a song that plays the note G4 (pitch 43) at time 0, followed by a C minor chord (pitches 48, 51, 55) at time 0.5, followed by another G4 note at time 2.0. The maximum amount of voices needed is 3, which is saved as the first element of the whole array:

```
tempArray = []
tempArray.append(3)
tempArray.append(0)
tempArray.append(1)
tempArray.append(43)
tempArray.append(0.5)
tempArray.append(3)
tempArray.append(48)
tempArray.append(51)
tempArray.append(55)
tempArray.append(1.5)
tempArray.append(1)
tempArray.append(43)
SongData[0] = tempArray
```

The array above as a workshop script would be:

```
rule("Song Data")
{
	event
	{
		Ongoing - Global;
	}

	actions
	{
		Set Global Variable(tempArray, Empty Array);
		Modify Global Variable(tempArray, Append To Array, 3);
		Modify Global Variable(tempArray, Append To Array, 0);
		Modify Global Variable(tempArray, Append To Array, 1);
		Modify Global Variable(tempArray, Append To Array, 43);
		Modify Global Variable(tempArray, Append To Array, 0.5);
		Modify Global Variable(tempArray, Append To Array, 3);
		Modify Global Variable(tempArray, Append To Array, 48);
		Modify Global Variable(tempArray, Append To Array, 51);
		Modify Global Variable(tempArray, Append To Array, 55);
		Modify Global Variable(tempArray, Append To Array, 1.5);
		Modify Global Variable(tempArray, Append To Array, 1);
		Modify Global Variable(tempArray, Append To Array, 43);
		Set Global Variable At Index(songData, 0, Global Variable(tempArray));
	}
}
```

# Special thanks
(In no particular order)
- Mark Benis, for [the best transcriptions of Pokemon Red/Blue music I've seen](https://youtu.be/2WG9V6C1Aew), which allowed me to test the limits of the workshop script
- LazyLion and Zezombye, for help with optimizing and debugging
- Zezombye's OverPy, for its comprehensive language docs
- The workshop team at Blizzard, for being awesome in general
