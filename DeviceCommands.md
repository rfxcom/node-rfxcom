Device Commands
===============

A quick reference of the currently supported device types and subtypes, and the commands that can sent to each
(i.e. transmitted by the RFXtrx433). Note that not every device subtype in a given type will support
all the available commands. Invalid command/device combinations, address codes and parameters will throw an error.

For the full details see the RFXtrx433 user manual (in a few cases information from the SDK manual is also needed).
Some of these devices may only be supported by recent versions of
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
    BLINDS_T14
    BLINDS_T15
    BLINDS_T16
    BLINDS_T17
    BLINDS_T18

Commands:

    Blinds1.open()
    Blinds1.close()
    Blinds1.stop()
    Blinds1.confirm()
    Blinds1.intermediatePosition()
    Blinds1.setLimit()
    Blinds1.setLowerLimit()
    Blinds1.reverse()
    Blinds1.down()
    Blinds1.up()
    Blinds1.venetianIncreaseAngle()
    Blinds1.venetianDecreaseAngle()
    Blinds1.toggleLightOnOff()

Camera1
-------

Devices:

    X10_NINJA
    
Commands:

    Camera1.panLeft()
    Camera1.panRight()
    Camera1.tiltUp()
    Camera1.tiltDown()
    Camera1.goToPosition()
    Camera1.sweep()
    Camera1.programSweep()
    
Chime1
---------

Devices:
    BYRON_SX
    BYRON_MP001
    SELECT_PLUS
    BYRON_BY
    ENVIVO
    ALFAWISE
    
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

Edisio
------

Devices:

    EDISIO_CONTROLLER
    
Commands:

    Edisio.sitchOff()
    Edisio.switchOn()
    Edisio.toggleOnOff()
    Edisio.setLevel()
    Edisio.increaseLevel()
    Edisio.decreaseLevel()
    Edisio.toggleDimming()
    Edisio.stopDimming()
    Edisio.setColour()
    Edisio.program()
    Edisio.open()
    Edisio.stop()
    Edisio.close()
    Edisio.sendContactNormal()
    Edisio.sendContactAlert()
    
Fan
----

Devices:

    SIEMENS_SF01
    ITHO_CVE_RFT
    LUCCI_AIR
    SEAV_TXS4
    WESTINGHOUSE_7226640
    LUCCI_AIR_DC
    CASAFAN
    FT1211R
    FALMEC
    LUCCI_AIR_DCII
    ITHO_CVE_ECO_RFT
    NOVY
    
Commands:

    Fan.buttonPress()
    Fan.setSpeed()
    Fan.decreaseSpeed()
    Fan.increaseSpeed()
    Fan.switchOff()
    Fan.startTimer()
    Fan.toggleOnOff()
    Fan.toggleFanDirection()
    Fan.setFanDirection()
    Fan.toggleLightOnOff()
    Fan.switchLightOn()
    Fan.switchLightOff()
    Fan.program()
    Fan.confirm()
    Fan.eraseAll()
    Fan.standby()
    Fan.resetFilter()
    
The Fan button names (subtype SEAV_TXS4 only) are *T1*, *T2*, *T3*, and *T4*
    
Funkbus
-------
    
Devices:

    GIRA
    INSTA

Commands:

    Funkbus.buttonPress()
    Funkbus.switchOn()
    Funkbus.switchOff()
    Funkbus.increaseLevel()
    Funkbus.decreaseLevel()
    Funkbus.setScene()

The Funkbus button names are *Up*, *Down*, *All On*, *All Off*, *Scene*, *Master Up*, and *Master Down*

HomeConfort
-----------

Devices:

    TEL_010
    
Commands:

    HomeConfort.switchOn()
    HomeConfort.switchOff()

HunterFan
---------

Devices:

    HUNTER_FAN
    
Commands:

    HunterFan.switchOff()
    HunterFan.toggleLightOnOff()
    HunterFan.setSpeed()
    HunterFan.program()    
     
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
    HQ
    OASE_FM

Commands:

    Lighting1.switchOn()
    Lighting1.switchOff()
    Lighting1.increaseLevel()
    Lighting1.decreaseLevel()
    Lighting1.chime()
    Lighting1.program()
    
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
    TRC02_2
    EURODOMEST
    LIVOLO_APPLIANCE
    RGB432W
    MDREMOTE_107
    LEGRAND
    AVANTEK
    IT
    MDREMOTE_108
    KANGTAI
    
Commands:

    Lighting5.switchOn()
    Lighting5.switchOff()
    Lighting5.setLevel()
    Lighting5.setMood()
    Lighting5.increaseLevel()
    Lighting5.decreaseLevel()
    Lighting5.toggleOnOff()
    Lighting5.program()
    Lighting5.relayClose()
    Lighting5.relayStop()
    Lighting5.relayOpen()
    Lighting5.lock()
    Lighting5.unlock()
    Lighting5.increaseColour()
    Lighting5.decreaseColour()
    Lighting5.setColour()
    Lighting5.setScene()

Lighting6
---------

Devices:

    BLYSS
    CUVEO
    
Commands:

    Lighting6.switchOn()
    Lighting6.switchOff()

Radiator1
---------

Devices:

    SMARTWARES

Commands:

    Radiator1.setNightMode()
    Radiator1.setDayMode()
    Radiator1.setTemperature()

Remote
------

Devices:

    ATI_REMOTE_WONDER
    ATI_REMOTE_WONDER_PLUS
    MEDION
    X10_PC_REMOTE
    ATI_REMOTE_WONDER_2
    
Commands:

    Remote.buttonPress()
    
Refer to the RFXCOM user guide section 7.1 for the supported Remote button names for each subtype. Either the button number
or the button name may be used. If using names, you should use the same letter case as appears in the user guide, as
case-insensitive matching, although it is supported, gives ambiguous results for some button names.
    
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
    Rfy.venetianOpen()
    Rfy.venetianClose()
    Rfy.venetianIncreaseAngle()
    Rfy.venetianDecreaseAngle()
    Rfy.enableSunSensor()
    Rfy.disableSunSensor()
    
    Rfy.erase()
    Rfy.eraseAll()
    Rfy.listRemotes()
    Rfy.program()
    
    Rfy.doCommand()

Security1
---------

Devices:

    X10_SECURITY
    KD101
    POWERCODE_DOOR
    POWERCODE_PIR
    CODE_SECURE
    POWERCODE_AUX
    MEIANTECH
    SA30
    RM174RF
    
Commands:

    Security1.sendStatus()
    Security1.sendPanic()
    Security1.cancelPanic()
    Security1.armSystemAway()
    Security1.armSystemAwayWithDelay()
    Security1.armSystemHome()
    Security1.armSystemHomeWithDelay()
    Security1.disarmSystem()
    Security1.switchLightOn()
    Security1.switchLightOff()
    Security1.switchOnLight() -- DEPRECATED!
    Security1.switchOffLight() -- DEPRECATED!

Thermostat1
---------

Devices:

    DIGIMAX_TLX7506
    DIGIMAX_SHORT
    
Commands:

    Thermostat1.sendMessage(deviceId, params)

Send the message with the specified parameters, given by the fields of the `params` object:

    {
        temperature:[0.0 .. 50.0]   Mandatory (degrees C)
        setpoint:[5.0 .. 45.0]      Mandatory (optional for subtype DIGIMAX_SHORT)
        status:<0, 1, 2, 3>, or
               <"N/A", "Demand", "No Demand", "Initializing"> (case-insensitive)
                                    Optional
        mode:<0, 1>, or
             <"Heating", "Cooling"> (case-insensitive)
                                    Optional
    }

Thermostat2
---------

Devices:

    HE105
    RTS10_RFS10_TLX1206
    
Commands:

    Thermostat2.switchOn()
    Thermostat2.switchOff()
    Thermostat2.program()

Thermostat3
---------

Devices:

    G6R_H4T1
    G6R_H4TB
    G6R_H4TD
    G6R_H4S
    G6R_H3T1
    
Commands:

    Thermostat3.switchOn()
    Thermostat3.switchOff()
    Thermostat3.switchOn2()
    Thermostat3.switchOff2()
    Thermostat3.up()
    Thermostat3.down()
    Thermostat3.runUp()
    Thermostat3.runDown()
    Thermostat3.stop()

Thermostat4
---------

Devices:

    MCZ_PELLET_STOVE_1_FAN
    MCZ_PELLET_STOVE_2_FAN
    MCZ_PELLET_STOVE_3_FAN
    
Commands:

    Thermostat4.sendMessage(deviceId, params)
    
Send the message with the specified parameters, given by the fields of the `params` object:

    {
        beep:<truthy, falsy>        Optional, defaults to true
        fanSpeed:[0-6, 0-6, 0-6]    Optional, one speed for each fan, defaults to 6 (auto), excess ignored, "auto" --> 6
        flamePower:<1, 2, 3, 4, 5>  Mandatory
        mode:<0, 1, 2, 3>, or
             <"Off", "Manual", "Auto", "Eco"> (case-insensitive, 3 characters needed)
                                    Mandatory
    }

