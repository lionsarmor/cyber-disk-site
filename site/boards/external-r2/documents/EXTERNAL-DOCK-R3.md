# External case R3 / daughterboard R2 — board-mounted ports

2026-11-07. Inspection prototype, **not ready to order or fabricate**.

The Basic enclosure keeps its 168 × 280 × 54 mm envelope, rounded shell, recessed top label, wraparound diffuser and unchanged R4 drive mechanism. The five rear connectors now solder directly to the daughterboard and leave the case with the removable rear tray. Six M3 PCB supports include two added near the connector row. Openings follow the connector envelopes with 0.3 mm nominal clearance per side. The IEC socket sits 4 mm further inward than the other ports to keep its front solder tabs on the PCB. Its front face is recessed 5 mm from the outer panel; verify the selected cable grip fits through the opening. Trim protruding soldered leads to at most 1.5 mm below the board, including Pico header tails. Assembly and web STEP previews show this installed lead length; raw KiCad library models retain stock untrimmed leads. Physical printed fit has not been tested.

## Selected through-hole connectors

| Ref | Function | Manufacturer part | Mouser SKU |
| --- | --- | --- | --- |
| J9 | Rear USB-B device socket | Amphenol 61729-0010BLF | 649-61729-0010BLF |
| J10 | Internal USB-A socket, jumper only | Molex 67643-0910 | 538-67643-0910 |
| J1 | Commodore IEC six-contact DIN | Switchcraft 61PC6F | 502-61PC6F |
| J2 | RS-232 DE9 female, 4-40 flange threads | HARTING 09661527612 | 617-09-66-152-7612 |
| J3 | Custom keyed accessory header, right angle | Wurth 61202021721 | 710-61202021721 |
| J5 | Regulated 5V input, centre positive | Same Sky PJ-102AH | 490-PJ-102AH |
| Cable | Purchased internal USB-A/micro-B jumper | Adafruit 898 | 485-898 |

These are Mouser catalogue selections; stock is not reserved. All solder joints on this carrier are through-hole. The purchased Pico module contains surface-mount parts. Mechanical STEP bodies for USB-B, DIN and DE9 are simplified models derived from supplier drawings, not vendor manufacturing models. C315 capacitors and some headers still lack detailed 3D bodies.

## USB and power

Normal external USB-A-to-B cable connects the computer to J9. J9 connects to internal J10, then the purchased micro-B jumper plugs into the Pico. No soldering to Pico test pads. J10 is inside the enclosure and is **not a USB host port**. USB VBUS remains separate from the barrel-fed V5 rail; the original Pico power arrangement and VSYS diode are retained. Connector shells currently connect to GND; EMC/ESD design remains to be completed.

The barrel input remains **regulated 5V only**, 5.5/2.1 mm centre positive. No internal mains supply. Reverse-polarity protection does not protect against a 12V adapter. USB self-powered behaviour, power-off current paths and source sequencing still need review and measurement.

## IEC numbering matters

Switchcraft uses sequential contact numbers, which differ from standard Commodore DIN numbering. PCB J1 uses the manufacturer's numbers: 1 SRQ, 2 CLK, 3 GND, 4 DATA, 5 ATN, 6 RESET. Mapping follows the front-face and PCB-pattern drawings. Confirm orientation and continuity with a physical socket and known IEC cable before prototype power-up.

J2 remains DCE: pin2 TX out, pin3 RX in, pin5 GND, pin7 RTS in, pin8 CTS out. J3 is a custom 3.3V SPI accessory connection, not a direct Spectrum Next expansion connector or RS-232 port. The Next adapter and ESP32 accessory firmware remain separate work.

## Validation and remaining work

Saved PCB and schematic agree on 238 connected pin assignments. The carrier has 41 populated positions, all through-hole pads, a rounded 156 × 68 mm outline and six mounting holes. DRC reports zero geometry errors but 25 silkscreen warnings and **177 unconnected items**. There are zero copper tracks. ERC has zero violations using passive pin-map symbols; this does not verify electrical operation.

Do not send the reference Gerbers to PCBWay as a finished board. Routing, USB signal integrity, ESD, power sequencing, firmware, cable retention, connector samples and an assembled mechanical prototype remain required. Harness paths and plug bodies in CAD are service-space envelopes rather than exact purchased cable geometry. Case collision results are in mechanical/external-dock-r3/checks.json.

## Drawing and supplier references

- [Amphenol USB-B drawing](https://cdn.amphenol-cs.com/media/wysiwyg/files/drawing/61729.pdf)
- [Switchcraft part](https://www.switchcraft.com/female-din-right-angle-pc-mount-6-contacts-at-240-contact-arrangement-g/61pc6f/) and [drawing](https://www.mouser.co.uk/datasheet/3/144/1/61PC6F_CD.pdf)
- [HARTING part](https://www.harting.com/09661527612) and [family drawing](https://docs.rs-online.com/d551/0900766b802b98aa.pdf)
- [Wurth angled header drawing](https://www.we-online.com/components/products/datasheet/61202021721.pdf): 33.06 mm length, 1.10 mm holes, 2.54 mm pitch; local footprint changes the stock drill size accordingly.
- [Molex internal socket drawing](https://www.molex.com/content/dam/molex/molex-dot-com/products/automated/en-us/salesdrawingpdf/676/67643/676430910_sd.pdf)
- [Adafruit internal cable](https://www.adafruit.com/product/898)

R1 board and R2 case sources remain archived in the private project. Current public previews and downloads use R2 board / R3 case.
