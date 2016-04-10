Device Commands
===============

A quick reference of the currently supported device types and subtypes, and the commands that can sent to each
(i.e. transmitted by the RFXtrx433). Note that not every device subtype in a given type will support
all the available commands. Invalid command/device combinations, address codes and parameters will throw an error.

For the full details see the RFXtrx433 user manual. Some of these devices may only be supported by recent versions of
the RFXCOM firmware.

Curtain1
--------

Devices:
    
    HARRISON

Commands:

    Curtain1.open()
    Curtain1.close()
    Curtain1.stop()
    Curtain1.program()

Lighting1
---------

Devices:

    X10
    ARC
    ELRO
    WAVEMAN
    CHACON
    IMPULS
    RISING_SUN
    PHILIPS_SBC
    ENERGENIE_ENER010
    ENERGENIE_5_GANG
    COCO

Commands:

    Lighting1.switchOn()
    Lighting1.switchOff()
    Lighting1.increaseLevel()
    Lighting1.decreaseLevel()
    Lighting1.chime()
    
Lighting2
---------

Devices:

    AC
    HOMEEASY_EU
    ANSLUT
    KAMBROOK

Commands:

    Lighting2.switchOn()
    Lighting2.switchOff()
    Lighting2.setLevel()

Lighting3
---------

Devices:

    KOPPLA

Commands:

    Lighting3.switchOn()
    Lighting3.switchOff()
    Lighting3.setLevel()
    Lighting3.increaseLevel()
    Lighting3.decreaseLevel()
    Lighting3.program()
    
Lighting4
---------

Devices:

    PT2262

Commands:

    Lighting4.sendData()

Lighting5
---------

Devices:

    LIGHTWAVERF
    EMW100
    BBSB
    MDREMOTE
    CONRAD
    LIVOLO
    TRC02
    
Commands:

    Lighting5.switchOn()
    Lighting5.switchOff()
    Lighting5.setLevel()
    Lighting5.setMood()
    Lighting5.increaseLevel()
    Lighting5.decreaseLevel()
    Lighting5.toggleOnOff()
    Lighting5.program()

Lighting6
---------

Devices:

    BLYSS
    
Commands:

    Lighting6.switchOn()
    Lighting6.switchOff()

    