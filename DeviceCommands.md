Device Commands
===============

A quick reference of the currently supported device types and subtypes, and the commands that can sent to each
(i.e. transmitted by the RFXtrx433). Note that not every device subtype in a given type will support
all the available commands. Invalid command/device combinations, address codes and parameters will throw an error.

For the full details see the RFXtrx433 user manual. Some of these devices may only be supported by recent versions of
the RFXCOM firmware, and in some cases, the E version hardware is required.

Blinds1
--------

Devices:

    BLINDS_T0
    BLINDS_T1
    BLINDS_T2
    BLINDS_T3
    BLINDS_T4
    BLINDS_T5
    BLINDS_T6
    BLINDS_T7
    BLINDS_T8
    BLINDS_T9
    BLINDS_T10
    BLINDS_T11
    BLINDS_T12
    BLINDS_T13

Commands:

    Blinds1.open()
    Blinds1.close()
    Blinds1.stop()
    Blinds1.confirm()
    Blinds1.setLimit()
    Blinds1.setLowerLimit()
    Blinds1.reverse()
    Blinds1.down()
    Blinds1.up()

Chime1
---------

Devices:

    BYRON_SX
    BYRON_MP001
    SELECT_PLUS
    ENVIVO
    
Commands:

    Chime1.chime()
    
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
    AOKE
    
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

Rfy
---

Devices:

    RFY
    RFYEXT
    ASA
    
Commands:

    Rfy.up()
    Rfy.down()
    Rfy.stop()
    Rfy.venetianOpenUS()
    Rfy.venetianCloseUS()
    Rfy.venetianIncreaseAngleUS()
    Rfy.venetianDecreaseAngleUS()
    Rfy.venetianOpenEU()
    Rfy.venetianCloseEU()
    Rfy.venetianIncreaseAngleEU()
    Rfy.venetianDecreaseAngleEU()
    Rfy.enableSunSensor()
    Rfy.disableSunSensor()
    
    Rfy.erase()
    Rfy.eraseAll()
    Rfy.listRemotes()
    Rfy.program()
    
    Rfy.do()
