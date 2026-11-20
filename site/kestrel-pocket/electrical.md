# Kestrel Pocket · Carrier A0

Kestrel Pocket starts with a socketed ESP32-C6-DevKitC-1-N8, a 3.3 V SPI display, removable microSD, and two independent input assemblies. The first carrier takes power from the development kit's USB-C sockets. A USB power bank can supply the prototype. Battery charging and power-path selection for an internal cell are future circuit work.

## Processor and connectors

The original RP2350 rendering establishes the enclosure style. For the carrier we chose the official ESP32-C6-DevKitC-1 v1.2 with 8 MB flash, a 160 MHz RISC-V application core, and 512 KB HP SRAM. A 320 × 240 indexed framebuffer takes 75 KiB of this memory. Reserve space for the interpreter, sprites, SD transfers, RTOS, and any radio stack when profiling game firmware. The N8 has no PSRAM. [DevKit guide](https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32c6/esp32-c6-devkitc-1/user_guide.html) · [C6 datasheet](https://documentation.espressif.com/esp32-c6_datasheet_en.html)

Two female 1×16 through-hole headers accept the module pins. Row pitch is 2.54 mm with 22.86 mm between rows. The devkit PCB is 25.40 × 51.80 mm. Its antenna projects another 6.35 mm. With the antenna at the top, the devkit J1 row is on the left and J3 on the right, with pin 1 at the antenna end of both rows. The onboard USB-C sockets face away from the antenna. Allow room for both plugs, Boot, Reset, and the antenna in the shell. [Espressif mechanical drawing](https://dl.espressif.com/dl/schematics/esp32-c6-devkitc-1-dimensions_v1.2.pdf)

Both USB-C ports are ordinary USB device connections to a PC. One connects to the USB-to-UART bridge and the other to the C6 USB Serial/JTAG controller. Neither port can act as a USB keyboard, gamepad, or flash-drive host on this board. A USB-A peripheral port would need a host controller and a switched 5 V output. The two existing USB-C sockets also accept power. Espressif documents USB input and external header power as separate, mutually exclusive supply methods. [DevKit USB and supply options](https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32c6/esp32-c6-devkitc-1/user_guide.html)

## Carrier interfaces

GPIO numbers below are chip GPIOs. DEV-J1 and DEV-J3 identify the development kit's silkscreen header numbers, independent of the carrier's connector designators.

| Carrier connection | Signal order from pin 1 | DevKit assignment |
|---|---|---|
| EXP 8, keyed 3.3 V accessory port | GND, 3V3, SDA, SCL, IO0, IO1, IO2, IO3 | SDA/SCL = GPIO22/23 (DEV-J3.6/.5). IO0–3 = GPIO18/19/20/21 (DEV-J3.10/.9/.8/.7). IO0/1 can carry UART1 TX/RX via the GPIO matrix. |
| J3 microSD, direct 1×9 socket | 3V3, GND, CLK, DO, DI, CS, DAT1, DAT2, CD | CLK = GPIO6 (DEV-J1.5), DO/MISO = GPIO2 (.12), DI/MOSI = GPIO7 (.6), CS = GPIO10 (.10). The last three pads are unused in this SPI design. |
| J4 display harness | GND, 3V3, SCK, MOSI, LCD_CS, LCD_DC, LCD_RST | Shares SCK/MOSI with SD. LCD_CS = GPIO11 (DEV-J1.11), DC = GPIO3 (.13), RESET uses a local RC network. Panel-side circuitry provides backlight current limiting. Match the harness to the chosen 3.3 V panel pinout. |
| J5 keyboard harness | GND, 3V3, SDA, SCL | Shares the 3.3 V I²C bus with the gamepad and expansion port. |
| J6 audio harness | GND, 3V3, PWM | PWM = GPIO1 (DEV-J1.8). Feed a filter and powered amplifier module before the speaker. |
| J7 gamepad harness | GND, 3V3, SDA, SCL | Independent controller expander at 7-bit address 0x20. See daughterboard wiring below. |

## Gamepad and keyboard

A small button daughterboard can use one MCP23008-E/P (18-pin DIP), one 100 nF bypass capacitor, and eight normally open switches. Run J7 pin 1 to VSS (DIP pin 9) and the button common. Run J7 pin 2 to VDD (18) and RESET (6), pin 3 to SDA (2), and pin 4 to SCL (1). Tie address pins A2/A1/A0 (3, 4, 5) to ground, giving 7-bit address 0x20. Place the capacitor across VDD and VSS. Leave NC (7) and INT (8) open for polling. [Microchip MCP23008 datasheet](https://ww1.microchip.com/downloads/aemDocuments/documents/APID/ProductDocuments/DataSheets/MCP23008-and-MCP23008-Data-Sheet-DS20001919.pdf)

| MCP23008 input | DIP pin | Button |
|---|---|---|
| GP0 | 10 | Up |
| GP1 | 11 | Down |
| GP2 | 12 | Left |
| GP3 | 13 | Right |
| GP4 | 14 | A |
| GP5 | 15 | B |
| GP6 | 16 | Start |
| GP7 | 17 | Select |

Connect each switch from its input to GND. Set IODIR (0x00) to 0xFF and GPPU (0x06) to 0xFF on startup. Read GPIO (0x09) as a byte and invert the eight bits to get pressed = 1. Debounce each button across samples. Each direction and action button has its own input, so diagonals plus A/B work together. The PCB provides the connection for this daughterboard. The eight physical switches and expander belong to the separate assembly.

For typing, the assembled KeebDeck Basic exposes I²C via test pads or an unpopulated Qwiic footprint. Flash Solder Party's alternative I²C firmware first. The bare silicone KeebDeck keypad needs a scanner and PCB contacts; it cannot plug into J5 alone. Check the assembled module's 3.3 V input/test points and wire by signal, since J5 is a Kestrel pin order. [KeebDeck Basic documentation](https://www.solder.party/docs/keebdeck/basic/)

## Storage, power and expansion

The microSD socket is already soldered to the Adafruit #4682 module. Solder a nine-pin male header to that module and a matching female socket to the Kestrel carrier. This makes the SD assembly through-hole at the carrier and replaceable. The module accepts 3.3 V signals and power. Its PCB is 25.40 × 22.86 mm. Match orientation to pad 1 before applying power. [Adafruit pinout](https://learn.adafruit.com/adafruit-microsd-spi-sdio/pinouts) · [Original Eagle board file](https://github.com/adafruit/Adafruit-MicroSD-SPI-or-SDIO-card-breakout-PCB)

External accessories share the keyboard/gamepad I²C bus and must use compatible addresses and pull-ups. Use a short cable for bench tests. IEC and RS-232 require adapters with the corresponding electrical interfaces. Establish a 3.3 V accessory current budget from measured regulator headroom with the LCD backlight on, the SD card writing, the speaker sounding, and wireless in its intended state. Choose connector protection and battery circuitry before a field unit.

The carrier is a development layout. Verify assembled stack heights, socket orientation, RF clearance, the LCD reset pulse and backlight demand, slot and cable clearance, and rail voltage during SD writes on the first article.
