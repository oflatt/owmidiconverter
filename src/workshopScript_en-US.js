const pianoHero = `D.Va`;
const botzpos = `13.72`;
const echozpos = `13.7`;
const playerscale = `1`;



// Custom game settings (lobby settings + workshop script) can only be imported 
// if their language matches the text language of the game.
// Only the English settings are needed, as OverPy can translate them to all other languages.
const playNote = `
    Global.currentKey = Global.pitchArrays[Round To Integer(
        Global.pitchArrayIndex / Global.maxArraySize, Down)][Global.pitchArrayIndex % Global.maxArraySize];
    Global.currentKeyPos = Global.notePositions[Global.pitchArrays[Round To Integer(
        Global.pitchArrayIndex / Global.maxArraySize, Down)][Global.pitchArrayIndex % Global.maxArraySize]];
    
    Teleport(Global.bots[Global.currentBotIndex], Global.currentKeyPos);
    Press Button(Global.bots[Global.currentBotIndex], Button(Primary Fire));
`;

const BASE_SETTINGS = `settings
{
    main
    {
        Description: "Overwatch MIDI Pianist mode by ScroogeD. Convert MIDI songs to Overwatch piano songs with this converter on GitHub: github.com/ScroogeD2/owmidiconverter"
    }

    lobby
    {
        Allow Players Who Are In Queue: Yes
        Match Voice Chat: Enabled
        Max Team 1 Players: 1
        Max Team 2 Players: 0
        Return To Lobby: Never
    }

    modes
    {
        Skirmish
        {
            enabled maps
            {
                Paris
            }
        }

        General
        {
            Game Mode Start: Manual
            Hero Limit: Off
            Respawn Time Scalar: 30%
        }
    }

    heroes
    {
        General
        {
            Ability Cooldown Time: 0%
            No Ammunition Requirement: On
            Ultimate Generation: 250%
        }
    }

    extensions
    {
        Play More Effects
        Spawn More Dummy Bots
    }
}

variables
{
    global:
        0: notePositions
        1: botSpawn
        2: bots
        3: speedPercent
        4: songPlayingState
        5: timeArrayIndex
        6: playerSpawn
        7: i
        8: pitchArrayIndex
        9: botScalar
        10: maxArraySize
        11: banTpLocation
        12: currentBotIndex
        13: targetTime
        14: timeArrays
        15: pitchArrays
        16: chordArrays
        17: maxBots
        18: defaultHorizontalFacingAngle
        28: hasDecompressionFinished
        29: decompressionPercentages
        30: isCompressionEnabled
        31: numberArray
        32: decompressedValue
        33: compressedArrayLength
        34: decompressedArray
        35: compressedElementLength
        36: songDataElementLength
        37: compressedArray
        38: compressionInfo
        39: finalCompressedElementLength
        40: I
        41: J
        42: L
        43: zarya
        44: tempi
        45: tempj
        46: tempk
        47: templ
        48: time
        49: nextFall
        50: nextFallChord
        51: nextCubePitch
        52: blockPos
        53: ccube
        54: currentKey
        55: currentKeyPos

    player:
        1: playNote
        2: currentPitchIndex
        3: playerToRemove
        4: currentKey
        5: currentKeyPos
}

subroutines
{
    0: endSong
    1: decompressArray
}

rule("Global init")
{
    event
    {
        Ongoing - Global;
    }

    actions
    {
        Disable Inspector Recording;
        Disable Built-In Game Mode Music;
        Global.botScalar = 0.15;
        Global.bots = Empty Array;
        Global.zarya = Empty Array;
        Global.speedPercent = 90;
        Global.hasDecompressionFinished = False;
        Create HUD Text(All Players(All Teams), Null, Null, Custom String(
            "Host player: Press Interact to start and stop the song, \\nand Crouch+Primary or Crouch+Secondary Fire to change speed"), Top,
            0, Color(White), Color(White), Color(White), Visible To and String, Default Visibility);
        Create HUD Text(All Players(All Teams), Null, Custom String("By ScroogeD"), Null, Left, 0, Color(White), Color(Yellow), Color(White),
            Visible To and String, Default Visibility);
        Create HUD Text(All Players(All Teams), Null, Custom String("Website: github.com/ScroogeD2/owmidiconverter"), Null, Left, 1, Color(White),
            Color(Yellow), Color(White), Visible To and String, Default Visibility);
        Create HUD Text(Filtered Array(All Players(All Teams), Has Status(Current Array Element, Frozen)), Custom String(
            "The host player has decided to remove you temporarily. Please wait a minute before rejoining."), Null, Null, Top, 1, Color(White),
            Color(White), Color(White), Visible To and String, Default Visibility);
        Create HUD Text(Global.hasDecompressionFinished ? Empty Array : Host Player, Null, Null, Custom String(
            " \\n\\n\\nDecompressing\\nPitch Arrays      {0}%\\nTime Arrays        {1}%\\nChord Arrays   {2}%", 
            Global.decompressionPercentages[0], Global.decompressionPercentages[1], Global.decompressionPercentages[2]), 
            Top, 10, Color(White), Color(White), Color(White), Visible To and String, Default Visibility);
        Global.decompressionPercentages = Array(0, 0, 0);
    }
}


rule("Player init")
{
    event
    {
        Ongoing - Each Player;
        All;
        All;
    }

    conditions
    {
        Is Dummy Bot(Event Player) != True;
        Has Spawned(Event Player) == True;
        Is Alive(Event Player) == True;
    }

    actions
    {
        //restrictAbilities
        Teleport(Event Player, Global.playerSpawn);
        Start Scaling Player(Event Player, ${playerscale}, True);
        Disable Movement Collision With Players(Event Player);
        Wait(0.016, Ignore Condition);
        Set Facing(Event Player, Direction From Angles(Global.defaultHorizontalFacingAngle, Vertical Facing Angle Of(Event Player)), To World);
        Preload Hero(Event Player, Hero(${pianoHero}));
        Preload Hero(Event Player, Hero(Zarya));
    }
}

rule("Dummy init zarya")
{
    event
    {
        Ongoing - Each Player;
        All;
        All;
    }

    conditions
    {
        Is Dummy Bot(Event Player) == True;
        Hero Of(Event Player) == Hero(Zarya);
    }

    actions
    {
        Set Max Health(Event Player, 20000);
        Disable Movement Collision With Environment(Event Player, False);
        Disable Movement Collision With Players(Event Player);
        Wait(0.016, Ignore Condition);
    }
}

rule("Primary fire: increase speed")
{
    event
    {
        Ongoing - Global;
    }

    conditions
    {
        Is Button Held(Host Player, Button(Crouch)) == True;
        Is Button Held(Host Player, Button(Primary Fire)) == True;
    }

    actions
    {
        Global.speedPercent += 5;
    }
}

rule("Secondary fire: decrease speed")
{
    event
    {
        Ongoing - Global;
    }

    conditions
    {
        Is Button Held(Host Player, Button(Crouch)) == True;
        Is Button Held(Host Player, Button(Secondary Fire)) == True;
        Global.speedPercent > 5;
    }

    actions
    {
        Global.speedPercent -= 5;
    }
}

rule("Interact: create dummy bots, start playing")
{
    event
    {
        Ongoing - Global;
    }

    conditions
    {
        Is Button Held(Host Player, Button(Interact)) == True;
        Global.songPlayingState == 0;
        (!Global.isCompressionEnabled || Global.hasDecompressionFinished) == True;
    }

    actions
    {
        "States:\\n0: song not playing\\n1: Preparing to play, creating bots\\n2: song playing" 
        Global.songPlayingState = 1;
        Global.i = 11;
        Global.ccube = 0;
        While(Count Of(Global.bots) < Global.maxBots);
            Create Dummy Bot(Hero(${pianoHero}), Team 1, -1, Global.botSpawn, Vector(0, 0, 0));

            Modify Global Variable(bots, Append To Array, Last Created Entity);
            Start Scaling Player(Last Created Entity, Global.botScalar, True);
            Teleport(Last Created Entity, Global.botSpawn);
            //invisibleBots
            Wait(0.016, Ignore Condition);
            Set Facing(Last Created Entity, Direction From Angles(Global.defaultHorizontalFacingAngle+180, 89), To World);

            Wait(0.1, Ignore Condition);
            Damage(Last Created Entity, Null, 800);
        End;
        Wait(3, Ignore Condition);

        Global.tempi = 0;
        While(Global.tempi < Count Of(Global.bots));
            Set Facing(Global.bots[Global.tempi], Direction From Angles(Global.defaultHorizontalFacingAngle+180, 89), To World);
            Set Gravity(Global.bots[Global.tempi], 0);
            Disable Movement Collision With Environment(Global.bots[Global.tempi], False);
            Disable Movement Collision With Players(Global.bots[Global.tempi]);
            Teleport(Global.bots[Global.tempi], Global.notePositions[Global.tempi * Round To Integer(64 / Count Of(Global.bots), Down)]);
            Press Button(Global.bots[Global.tempi], Button(Primary Fire));
            Global.tempi += 1;
        End;
        Wait(1, Ignore Condition);

        Create Dummy Bot(Hero(Zarya), Team 1, -1, Global.botSpawn, Vector(0, 0, 0));
        Modify Global Variable(zarya, Append To Array, Last Created Entity);
        Wait(0.016, Ignore Condition);
        Create Dummy Bot(Hero(Zarya), Team 1, -1, Global.botSpawn, Vector(0, 0, 0));
        Modify Global Variable(zarya, Append To Array, Last Created Entity);
        Wait(0.016, Ignore Condition);

        Teleport(Global.zarya[0], Global.notePositions[64]);
        Wait(0.016, Ignore Condition);
        Set Facing(Global.zarya[0], Direction From Angles(Global.defaultHorizontalFacingAngle, 89), To World);
        Wait(0.016, Ignore Condition);
        Teleport(Global.zarya[1], Global.notePositions[65]);
        Wait(0.016, Ignore Condition);
        Set Facing(Global.zarya[1], Direction From Angles(Global.defaultHorizontalFacingAngle, 89), To World);
        Wait(1, Ignore Condition);
        Global.songPlayingState = 2;

        Global.nextFall = 0;
        Global.nextFallChord = 0;
        Global.blockPos = Empty Array;
        For Global Variable(tempi, 0, //maxCubes, 1);
            Modify Global Variable(blockPos, Append To Array, 0.0);
        End;

        //cubesHere
    }
}

rule("Interact: stop playing")
{
    event
    {
        Ongoing - Global;
    }

    conditions
    {
        Is Button Held(Host Player, Button(Interact)) == True;
        Global.songPlayingState == 2;
    }

    actions
    {
        Call Subroutine(endSong);
    }
}

rule("Cube loop")
{
    event
    {
        Ongoing - Global;
    }

    conditions
    {
        Global.songPlayingState == 2;
    }

    actions
    {
        
        While(Global.songPlayingState == 2);
            If(Y Component Of(Global.blockPos[Global.ccube])-Global.time*1.5 < Y Component Of(Global.notePositions[0])+0.5);
                "note time: "
                Global.tempj = Global.timeArrays[Round To Integer(Global.nextFall / Global.maxArraySize, Down)][Global.nextFall % Global.maxArraySize];
                "pitch index: "
                Global.tempi = Global.pitchArrays[Round To Integer(Global.nextCubePitch / Global.maxArraySize, Down)][Global.nextCubePitch % Global.maxArraySize];
                Global.blockPos[Global.ccube] = Vector(0.0, Global.tempj*1.5+0.5, 0.0) + Global.notePositions[Global.tempi];

                Global.nextFallChord += 1;
                If(Global.nextFallChord >= Global.chordArrays[Round To Integer(Global.nextFallChord / Global.maxArraySize, Down)][Global.nextFall % Global.maxArraySize]);
                    Global.nextFallChord = 0;
                    Global.nextFall += 1;
                End;
                Global.nextCubePitch += 1;
            End;

            Global.ccube = (Global.ccube+1) % Count Of(Global.blockPos);
            If(Global.ccube % 5 == 0);
                Wait(0.016, Ignore Condition);
            End;
        End;
    }
}

rule("Time")
{
    event
    {
        Ongoing - Global;
    }

    actions
    {
        Global.time += 0.01667;
        Wait(0.016, Ignore Condition);
        Loop;
    }
}


rule("Play loop")
{
    event
    {
        Ongoing - Global;
    }

    conditions
    {
        Global.songPlayingState == 2;
    }

    actions
    {
        "Because the maximum size of overwatch arrays is 1000 per dimension, the song data arrays are split to several indexes of a 2d array. To get the correct index of the required value in these arrays, modulo and division are used instead of a second index:"
        disabled Continue;
        "value = songArray[math.floor(index / maxArraySize)][index % maxArraySize]"
        disabled Continue;
        "While((index < 2dArrayLength) && songPlayingState)"
        Global.time = -2;

        While(Global.timeArrayIndex < Global.maxArraySize * (Count Of(Global.timeArrays) - 1) + Count Of(Last Of(Global.timeArrays))
            && Global.songPlayingState);
            "Get the time interval (milliseconds) between chords from timeArrays, multiply by 1000 to get seconds, modify based on speed"
            Global.targetTime = (Global.timeArrays[Round To Integer(Global.timeArrayIndex / Global.maxArraySize, Down)
                ][Global.timeArrayIndex % Global.maxArraySize]);
            While(Global.time < Global.targetTime);
                Wait(0.016, Ignore Condition);
            End;
            "Loop as many times as there are pitches in the current chord, as indicated by the value in chordArrays. Assign the pitches to the bots."
            For Global Variable(i, 0, Global.chordArrays[Round To Integer(Global.timeArrayIndex / Global.maxArraySize, Down)
                ][Global.timeArrayIndex % Global.maxArraySize], 1);
                Global.bots[Global.currentBotIndex].currentPitchIndex = Global.pitchArrayIndex;
                Global.bots[Global.currentBotIndex].playNote = True;
                Global.currentBotIndex = (Global.currentBotIndex + 1) % Count Of(Global.bots);
                Global.pitchArrayIndex += 1;
            End;
            Global.timeArrayIndex += 1;
        End;
        Wait(0.250, Ignore Condition);
        Call Subroutine(endSong);
    }
}

rule("Play note")
{
    event
    {
        Ongoing - Each Player;
        All;
        All;
    }

    conditions
    {
        Is Dummy Bot(Event Player) == True;
        Event Player.playNote == True;
    }

    actions
    {
        Event Player.currentKey = Global.pitchArrays[Round To Integer(
            Event Player.currentPitchIndex / Global.maxArraySize, Down)][Event Player.currentPitchIndex % Global.maxArraySize];
        If(Event Player.currentKey > 63);
            Create Dummy Bot(Hero(Zarya), Team 1, -1, Global.notePositions[Event Player.currentKey - 64], Direction From Angles(Horizontal Facing Angle Of(Global.zarya[Event Player.currentKey-64])+90, Vertical Facing Angle Of(Global.zarya[Event Player.currentKey-64])));
            Destroy Dummy Bot(Team Of(Global.zarya[Event Player.currentKey - 64]), Slot Of(Global.zarya[Event Player.currentKey - 64]));
            Global.zarya[Event Player.currentKey - 64] = Last Created Entity;
            Wait(0.016, Ignore Condition);
            Set Facing(Global.zarya[Event Player.currentKey - 64], Direction From Angles(Horizontal Facing Angle Of(Global.zarya[Event Player.currentKey - 64]), 89), To World);
            Wait(0.016, Ignore Condition);
            Teleport(Global.zarya[Event Player.currentKey - 64], Global.notePositions[Event Player.currentKey]);
            Wait(0.032, Ignore Condition);

            Event Player.currentKeyPos = Global.notePositions[Event Player.currentKey];

            Start Holding Button(Global.zarya[Event Player.currentKey - 64], Button(Secondary Fire));
            Wait(0.064, Ignore Condition);
            Stop Holding Button(Global.zarya[Event Player.currentKey - 64], Button(Secondary Fire));
        Else If (0 == 0);
            Event Player.currentKeyPos = Global.notePositions[Global.pitchArrays[Round To Integer(
                Event Player.currentPitchIndex / Global.maxArraySize, Down)][Event Player.currentPitchIndex % Global.maxArraySize]];
            Teleport(Event Player, Event Player.currentKeyPos);
            Wait(0.032, Ignore Condition);
            Start Holding Button(Event Player, Button(Primary Fire));
            Wait(0.064, Ignore Condition);
            Stop Holding Button(Event Player, Button(Primary Fire));
        End;
        Event Player.playNote = False;
    }
}


rule("Stop playing")
{
    event
    {
        Subroutine;
        endSong;
    }

    actions
    {
        For Global Variable(i, 0, 12, 1);
            Destroy Dummy Bot(Team 1, Global.i);
        End;
        Global.bots = Empty Array;
        Wait(0.300, Ignore Condition);
        Global.songPlayingState = 0;
        Global.timeArrayIndex = 0;
        Global.pitchArrayIndex = 0;
    }
}



//includeBanSystem

rule("Decompress all arrays")
{
    event
    {
        Ongoing - Global;
    }

    actions
    {
        Wait(0.250, Ignore Condition);
        Abort If(!Global.isCompressionEnabled);
        "Decompress pitch arrays, time arrays and chord arrays"
        For Global Variable(i, 0, 3, 1);
            Global.compressedArray = Empty Array;
            For Global Variable(I, 0, Count Of(Array(Global.pitchArrays, Global.timeArrays, Global.chordArrays)[Global.i]), 1);
                Global.compressedArray[Global.I] = Array(Global.pitchArrays, Global.timeArrays, Global.chordArrays)[Global.i][Global.I];
            End;
            Global.finalCompressedElementLength = Global.compressionInfo[0][Global.i];
            Global.songDataElementLength = Global.compressionInfo[1][Global.i];
            Call Subroutine(decompressArray);
            For Global Variable(I, 0, Count Of(Global.decompressedArray), 1);
                If(Global.i == 0);
                    Global.pitchArrays[Global.I] = Global.decompressedArray[Global.I];
                Else If(Global.i == 1);
                    Global.timeArrays[Global.I] = Global.decompressedArray[Global.I];
                Else If(Global.i == 2);
                    Global.chordArrays[Global.I] = Global.decompressedArray[Global.I];
                End;
            End;
            Global.compressedArray = Empty Array;
            Global.decompressionPercentages[Global.i] = 100;
        End;
        Global.decompressedArray = Empty Array;

        Global.tempi = 0.0;
        For Global Variable(I, 0, CountOf(Global.timeArrays), 1);
            Global.tempk = Empty Array;
            For Global Variable(tempj, 0, Count Of(Global.timeArrays[Global.I]), 1);
                Global.tempi += (Global.timeArrays[Global.I][Global.tempj] / (1000.0) * (100.0 / Global.speedPercent));
                Global.tempk[Global.tempj] = Global.tempi;
                
                If(Global.tempj % 5 == 0);
                    Wait(0.016, Ignore Condition);
                End;
            End;
            Global.timeArrays[Global.I] = Global.tempk;
        End;


        Global.hasDecompressionFinished = True;
    }
}

rule("Decompress array")
{
    event
    {
        Subroutine;
        decompressArray;
    }

    actions
    {
        "Target array for the decompressed data"
        Global.decompressedArray = Empty Array;
        Global.decompressedArray[0] = Empty Array;
        "Current decompressedArray index being written to (max of 1000 elements per index)"
        Global.L = 0;
        "Array for saving individual digits of the element being decompressed"
        Global.numberArray = Empty Array;
        Global.compressedArrayLength = Global.maxArraySize * (Count Of(Global.compressedArray) - 1) + Count Of(Last Of(
            Global.compressedArray));
        For Global Variable(I, 0, Global.compressedArrayLength, 1);
            "Read the compressed element from left to right, append individual digits to numberArray. If this is the last array value, use a different variable to check its length."
            For Global Variable(J, 0,
                Global.I == Global.compressedArrayLength - 1 ? Global.finalCompressedElementLength : Global.compressedElementLength, 1);
                Modify Global Variable(numberArray, Append To Array, Round To Integer(Global.compressedArray[Round To Integer(
                    Global.I / Global.maxArraySize, Down)][Global.I % Global.maxArraySize] / 10 ^ ((
                    Global.I == Global.compressedArrayLength - 1 ? Global.finalCompressedElementLength : Global.compressedElementLength)
                    - 1 - Global.J), Down) % 10);
            End;
            While(Count Of(Global.numberArray) >= Global.songDataElementLength);
                Global.decompressedValue = 0;
                "Construct the original numbers by reading numberArray x elements at a time"
                For Global Variable(J, 0, Global.songDataElementLength, 1);
                    Global.decompressedValue += First Of(Global.numberArray) * 10 ^ (Global.songDataElementLength - 1 - Global.J);
                    Modify Global Variable(numberArray, Remove From Array By Index, 0);
                End;
                Modify Global Variable At Index(decompressedArray, Global.L, Append To Array, Global.decompressedValue);
                If(Count Of(Global.decompressedArray[Global.L]) >= Global.maxArraySize);
                    Global.L += 1;
                    Global.decompressedArray[Global.L] = Empty Array;
                End;
            End;
            "Wait a frame every 25th element to avoid high server load"
            If(Global.I % 5 == 0);
                Wait(0.016, Ignore Condition);
                "Update decomrpession progress HUD"
                Global.decompressionPercentages[Global.i] = 100 * Global.I / Global.compressedArrayLength;
            End;
        End;
    }
}

`;

// Used in case the user chooses to not generate the full gamemode settings.
const CONVERTED_MIDI_VARS = `variables
{
    global:
        10: maxArraySize
        14: timeArrays
        15: pitchArrays
        16: chordArrays
        17: maxBots
        30: isCompressionEnabled
        35: compressedElementLength
        38: compressionInfo
}`;


// Coordinates of player and bot spawns, 
// as well as directions for all 64 keys on the two pianos in Paris (point A and point B)
const PIANO_POSITION_SCRIPTS = {
    pointA: `rule("Note positions array init, Point A")
{
    event
    {
        Ongoing - Global;
    }

    actions
    {
        Global.notePositions = Array(
            Vector(-41.168, ${botzpos}, 34.061), Vector(-41.223, ${botzpos}, 34.038), 
            Vector(-41.168, ${botzpos}, 34.017), Vector(-41.223, ${botzpos}, 33.997), 
            Vector(-41.164, ${botzpos}, 33.982), Vector(-41.161, ${botzpos}, 33.937), 
            Vector(-41.226, ${botzpos}, 33.913), Vector(-41.162, ${botzpos}, 33.898), 
            Vector(-41.217, ${botzpos}, 33.877), Vector(-41.163, ${botzpos}, 33.859), 
            Vector(-41.222, ${botzpos}, 33.834), Vector(-41.153, ${botzpos}, 33.816), 
            Vector(-41.148, ${botzpos}, 33.774), Vector(-41.217, ${botzpos}, 33.753), 
            Vector(-41.153, ${botzpos}, 33.731), Vector(-41.210, ${botzpos}, 33.715), 
            Vector(-41.157, ${botzpos}, 33.696), Vector(-41.143, ${botzpos}, 33.655), 
            Vector(-41.212, ${botzpos}, 33.626), Vector(-41.153, ${botzpos}, 33.610), 
            Vector(-41.205, ${botzpos}, 33.595), Vector(-41.151, ${botzpos}, 33.577), 
            Vector(-41.208, ${botzpos}, 33.551), Vector(-41.154, ${botzpos}, 33.539), 
            Vector(-41.132, ${botzpos}, 33.492), Vector(-41.215, ${botzpos}, 33.465), 
            Vector(-41.151, ${botzpos}, 33.444), Vector(-41.203, ${botzpos}, 33.430), 
            Vector(-41.149, ${botzpos}, 33.415), Vector(-41.146, ${botzpos}, 33.371), 
            Vector(-41.203, ${botzpos}, 33.348), Vector(-41.130, ${botzpos}, 33.326), 
            Vector(-41.202, ${botzpos}, 33.309), Vector(-41.129, ${botzpos}, 33.290), 
            Vector(-41.201, ${botzpos}, 33.271), Vector(-41.143, ${botzpos}, 33.250), 
            Vector(-41.122, ${botzpos}, 33.210), Vector(-41.185, ${botzpos}, 33.184), 
            Vector(-41.139, ${botzpos}, 33.163), Vector(-41.192, ${botzpos}, 33.152), 
            Vector(-41.136, ${botzpos}, 33.126), Vector(-41.132, ${botzpos}, 33.086), 
            Vector(-41.186, ${botzpos}, 33.061), Vector(-41.118, ${botzpos}, 33.046), 
            Vector(-41.190, ${botzpos}, 33.027), Vector(-41.112, ${botzpos}, 33.010), 
            Vector(-41.184, ${botzpos}, 32.986), Vector(-41.126, ${botzpos}, 32.961),
            Vector(-41.116, ${botzpos}, 32.921), Vector(-41.185, ${botzpos}, 32.902), 
            Vector(-41.116, ${botzpos}, 32.886), Vector(-41.192, ${botzpos}, 32.865), 
            Vector(-41.129, ${botzpos}, 32.844), Vector(-41.120, ${botzpos}, 32.802), 
            Vector(-41.180, ${botzpos}, 32.778), Vector(-41.124, ${botzpos}, 32.765), 
            Vector(-41.187, ${botzpos}, 32.745), Vector(-41.108, ${botzpos}, 32.729), 
            Vector(-41.181, ${botzpos}, 32.704), Vector(-41.107, ${botzpos}, 32.686), 
            Vector(-41.112, ${botzpos}, 32.643), Vector(-41.172, ${botzpos}, 32.620), 
            Vector(-41.108, ${botzpos}, 32.604), Vector(-41.167, ${botzpos}, 32.581),
            Vector(-41.104, 12.88, 32.562),
            Vector(-41.167, 12.887, 35),
            Vector(-41.167, 12.887, 31)
            );
        Set Global Variable(botSpawn, Vector(-41.016, 13.158, 33.314));
        Set Global Variable(playerSpawn, Vector(-34.5, 12, 32.3));
        Set Global Variable(banTpLocation, Vector(-10.008, 15.802, -40.435));
        Set Global Variable(defaultHorizontalFacingAngle, 120.554);
    }
}

`,
    pointB: `rule("Note positions array init, Point B")
{
    event
    {
        Ongoing - Global;
    }

    actions
    {
        Global.notePositions = Array(
            Vector(-85.410, ${botzpos}, -108.012), Vector(-85.364, ${botzpos}, -108.079), 
            Vector(-85.368, ${botzpos}, -108.007), Vector(-85.328, ${botzpos}, -108.078), 
            Vector(-85.325, ${botzpos}, -108.008), Vector(-85.290, ${botzpos}, -107.989), 
            Vector(-85.247, ${botzpos}, -108.050), Vector(-85.256, ${botzpos}, -107.965), 
            Vector(-85.217, ${botzpos}, -108.021), Vector(-85.210, ${botzpos}, -107.968), 
            Vector(-85.180, ${botzpos}, -108.007), Vector(-85.184, ${botzpos}, -107.928), 
            Vector(-85.147, ${botzpos}, -107.916), Vector(-85.095, ${botzpos}, -107.977), 
            Vector(-85.107, ${botzpos}, -107.910), Vector(-85.063, ${botzpos}, -107.973), 
            Vector(-85.066, ${botzpos}, -107.902), Vector(-85.017, ${botzpos}, -107.891), 
            Vector(-84.979, ${botzpos}, -107.954), Vector(-84.987, ${botzpos}, -107.866), 
            Vector(-84.943, ${botzpos}, -107.938), Vector(-84.952, ${botzpos}, -107.854), 
            Vector(-84.908, ${botzpos}, -107.922), Vector(-84.902, ${botzpos}, -107.851), 
            Vector(-84.871, ${botzpos}, -107.836), Vector(-84.826, ${botzpos}, -107.887), 
            Vector(-84.832, ${botzpos}, -107.822), Vector(-84.787, ${botzpos}, -107.894), 
            Vector(-84.795, ${botzpos}, -107.812), Vector(-84.751, ${botzpos}, -107.815), 
            Vector(-84.711, ${botzpos}, -107.857), Vector(-84.720, ${botzpos}, -107.769), 
            Vector(-84.681, ${botzpos}, -107.835), Vector(-84.683, ${botzpos}, -107.759), 
            Vector(-84.643, ${botzpos}, -107.822), Vector(-84.637, ${botzpos}, -107.770), 
            Vector(-84.604, ${botzpos}, -107.745), Vector(-84.563, ${botzpos}, -107.793), 
            Vector(-84.561, ${botzpos}, -107.750), Vector(-84.523, ${botzpos}, -107.791), 
            Vector(-84.524, ${botzpos}, -107.729), Vector(-84.485, ${botzpos}, -107.697), 
            Vector(-84.444, ${botzpos}, -107.759), Vector(-84.445, ${botzpos}, -107.711), 
            Vector(-84.415, ${botzpos}, -107.750), Vector(-84.403, ${botzpos}, -107.694), 
            Vector(-84.373, ${botzpos}, -107.742), Vector(-84.375, ${botzpos}, -107.661), 
            Vector(-84.339, ${botzpos}, -107.649), Vector(-84.292, ${botzpos}, -107.713), 
            Vector(-84.298, ${botzpos}, -107.644), Vector(-84.256, ${botzpos}, -107.715), 
            Vector(-84.262, ${botzpos}, -107.613), Vector(-84.227, ${botzpos}, -107.603), 
            Vector(-84.172, ${botzpos}, -107.684), Vector(-84.183, ${botzpos}, -107.606), 
            Vector(-84.146, ${botzpos}, -107.657), Vector(-84.144, ${botzpos}, -107.592), 
            Vector(-84.103, ${botzpos}, -107.652), Vector(-84.104, ${botzpos}, -107.571), 
            Vector(-84.068, ${botzpos}, -107.560), Vector(-84.021, ${botzpos}, -107.626), 
            Vector(-84.023, ${botzpos}, -107.553), Vector(-83.985, ${botzpos}, -107.598), 
            Vector(-83, 12.5, -108.021),
            Vector(-86.217, 13, -109.021));
        Set Global Variable(botSpawn, Vector(-84.693, ${botzpos}, -107.681));
        Set Global Variable(playerSpawn, Vector(-85.624, 14.349, -104.397));
        Set Global Variable(banTpLocation, Vector(-83.340, 13.248, -58.608));
        Set Global Variable(defaultHorizontalFacingAngle, 161.2);
    }
}

`}

// Various scripts corresponding to the options on the converter webpage
const SCRIPTS = {
    restrictAbilities: "Disallow Button(Event Player, Button(Melee));Set Ability 1 Enabled(Event Player, False);Set Ability 2 Enabled(Event Player, False);If(Compare(Event Player, !=, Host Player));Set Primary Fire Enabled(Event Player, False);Set Secondary Fire Enabled(Event Player, False);End;If(Compare(Hero Of(Event Player), ==, Hero(Wrecking Ball)));Disallow Button(Event Player, Button(Crouch));End;",
    invisibleBots: "Set Invisible(Event Player, All);",
    includeBanSystem: 'rule("Bans for host player"){event{Ongoing - Global;}conditions{Is Button Held(Host Player, Button(Reload)) == True;Is Button Held(Host Player, Button(Crouch)) == True;}actions{Host Player.playerToRemove = Ray Cast Hit Player(Eye Position(Host Player), Eye Position(Host Player) + Facing Direction Of(Host Player) * 30, Filtered Array(All Players(All Teams), !Is Dummy Bot(Current Array Element)), Host Player, True);Teleport(Host Player.playerToRemove, Global.banTpLocation);Set Status(Host Player.playerToRemove, Null, Frozen, 30);Host Player.playerToRemove = Null;}}'
}
