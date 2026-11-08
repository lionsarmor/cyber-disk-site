# Hardware R3 — saved design review

This revision finishes the five current PCB layouts and their assembly silkscreen, and updates the R5 drive / R4 external enclosure around the purchased hardware. It is a **prototype design release**, not a report of a working physical drive. Firmware is unchanged in this revision. Fabrication files are supplied separately for each board; do not order the archived R0 boards.

## What changed

- Original RODDY artwork is actual silkscreen geometry, with reference designators, connector identifiers, polarity and pin-one markings. Local footprint libraries are included in each KiCad download.
- Core media power has a hardware series cutoff, active discharge, a passive bleed, and independently biased signal isolation. The earlier shared shutdown/OE node was unsafe during upstream power collapse.
- Dock audio has a 1 kΩ series resistor. The internal USB-A faces into the enclosure, with an A-to-micro-B cable to the socketed Pico. External USB is **USB-B**, never an A-to-A host cable.
- Actual Pico socket height, switch bodies, plug housings, wire paths, retaining screws, inserts and catalog springs replace the older allocation-only mechanism.
- Both carrier boards use through-hole assembly and factory-assembled Pico 2 H modules. The small media PCBs retain their intentionally reflow-assembled flash/passives; the leaf-contact board retains its solderable spring contacts.

## Contact power and signal isolation

U6 LP2951 generates approximately 3.09 V from 15 kΩ / 10 kΩ feedback, leaving tolerance/overshoot allowance below the flash's 3.6 V maximum. C6 is 22 µF with a 1 Ω series return resistor for deliberate ESR. U4 LVC245 handles three outbound SPI signals and inbound MISO; it is powered by the media rail and supports partial-power-down isolation at zero supply.

**Both conditions are necessary:** firmware MEDIA_ARM high, and the series seat-NO/eject-NC loop closed. RN3 pulls ARM and INTERLOCK_OK low with 1 kΩ defaults. A disconnected switch harness therefore disables the medium.

- Q2/Q3 sink MEDIA_OFF only with both permissions. R7 is now 680 Ω to V5.
- Q9 SUP53P06 is a high-side P-channel switch: gate MEDIA_OFF, drain V5_MEDIA, source V5. It disconnects U6's input when permission is withdrawn, including when V5 is below the regulator shutdown threshold. This differs from the dock's intentionally reverse-connected polarity-protection MOSFET.
- Q10/Q11 form a separate permission chain for U4 OE. R13 pulls OE up to **MEDIA_3V3**, not V5. Loss of the upstream supply therefore cannot by itself pull OE low while the output capacitor remains charged.
- Q1 IRLZ44N discharges through R8 = 2.2 Ω while V5 is available. R6 = 68 Ω provides discharge even if upstream power vanishes. The passive bleed draws approximately 45 mA nominal and dissipates approximately 0.14 W; use the specified 0.25 W resistor with ventilation.
- J3 pin 7 is unconnected. Do not assign it to a future rail or protocol without revisiting moving-contact isolation.

A low supply with both permissions still asserted is not a valid write condition. MEDIA_ERROR_N must be honored by firmware; partial-power-down specifications do not guarantee normal logic operation at intermediate undervoltage. On eject, the physical loop removes permission before the latch releases. The design does **not** promise arbitrary hot-plugging of PC floppy cables.

### Timing and load assumptions to verify on the first sample

C6 at +20% is 26.4 µF. A 68 Ω resistor at +1% gives an RC decay from 3.215 V to 0.9 V of approximately **2.31 ms**, ignoring other loads that accelerate decay. Budget additional time for switch transfer, input-capacitor energy, MOSFET switching and tolerances; this is a calculation, not an oscilloscope result. The active path is faster when V5 remains present.

The switch mount must be adjusted to open the eject NC contact by **1.25 mm of button travel**. The modeled latch begins moving at 3.74 mm and reaches full withdrawal at approximately 5.42 mm. The button stops at 6 mm and remains 2 mm proud of the face. Confirm these positions, switch bounce, fastest permitted actuation and the voltage on every contact before allowing powered insertion/ejection.

Media load allocation: up to 48 mA bleed, 25 mA selected flash, and 15 mA buffer / switching / feedback allowance, below U6's 100 mA guaranteed output rating. Start SPI at a conservative rate and measure actual dynamic current. This is **one active flash bank**, including reversible A/B disks; it is not permission to power both banks or future high-capacity media simultaneously.

## Supply and interfaces

Use the specified regulated 5 V centre-positive adapter and 5.5/2.1 mm barrel socket. No mains wiring remains inside the printed enclosure. Target budget remains 0.35 A core, 0.15 A dock, 0.20 A lighting, total 0.70 A. Three fitted 5 mm NeoPixels consume up to 0.18 A. Fit one 100 nF capacitor directly at each pixel. The passive piezo is driven through 1 kΩ; it is not a magnetic speaker driver.

Maintain at least **4.55 V at the core V5 rail** and at least 4.5 V at dock MAX232/AHCT supply pins under maximum intended load; never exceed 5.5 V at the 5 V logic. The original 4.70 V minimum adapter-output allocation leaves only about 0.15 V for cable, fuses, PCB and connector losses. Measure the selected adapter and actual cable, rather than assuming a nominal 5 V label guarantees this. Temperature/load qualification remains necessary. The core's new media input switch has very low loss at the specified gate drive; verify its drive and dropout at the minimum supply corner.

Fuses protect the power wiring/board; they are not precision 100 mA media current limits. The regulator provides media current limiting. The core's diode prevents its VSYS feed from backfeeding V5 when powered over its own USB connector. External USB VBUS is kept separate from the dock's external 5 V power rail.

PC FDD inputs pass through 5 V-tolerant LVC receivers; outputs use open-drain TN0702 sinks. All odd 34-pin contacts are grounded. This is the documented IBM-PC profile, not every historical Shugart pinout. Connect/disconnect with the PC off; do not power the core externally while its floppy ribbon is attached to an unpowered PC.

Commodore IEC outputs are open drain. The dock does not add pullups to its own supply; disconnected inputs have defined pulldowns. Host/revision pullups and unpowered-peer behavior need actual host testing. The accessory port is a documented 3.3 V SPI/control interface; it is not a direct Spectrum Next expansion-edge connection. ESP32/Next host adapters remain separate hardware products.

The dock USB pair is short, routed together with a ground return corridor. It is full-speed USB, not a certified controlled-impedance/high-speed interface. Cable/ESD/USB enumeration testing is required.

## Static evidence and remaining physical work

`hardware/reviews/electrical-r3/verification.json` records hashes, fresh ERC/DRC, unrouted counts, schematic/PCB pin parity and independent critical pin assertions for all five boards. Controller and dock schematic symbols are physical pin-map blocks with passive pins; ERC alone cannot prove electrical function. No DRC exclusions were added to hide electrical shorts or missing routes.

The saved, routed `.kicad_pcb` files are authoritative. Placement generators deliberately rebuild placements; routing, local footprint finishing, manual clearance corrections and a fresh audit must follow any regeneration. Router sessions alone do not contain every final copper/silk edit.

Before calling this a working product, assemble and measure a sample: supply corners and load steps, regulator startup/decay, interlock timing, switch bounce, contact pressure/wear, rapid eject, retention strength, USB, cable-loaded open-drain edges and the actual named hosts. These are **validation tasks**, not claims already established by CAD. Do not skip them because the static checks are clean.

## Software boundary

No new firmware is delivered with Hardware R3. Previous firmware remains experimental: PC MFM read-only output and USB MSC/journal work are not full floppy emulation. PC write capture, IEC drive/DOS behavior, host profiles and production recovery tests remain software work. Safe power removal cannot preserve unflushed host caches or make unfinished emulation work.

## Manufacturer references

- [TI LP2951](https://www.ti.com/lit/ds/symlink/lp2951-n.pdf)
- [TI LVC245A](https://www.ti.com/lit/ds/symlink/sn74lvc245a.pdf)
- [Microchip TN0702](https://ww1.microchip.com/downloads/en/DeviceDoc/TN0702-N-Channel-Enhancement-Mode-Vertical-DMOS-FET-Data-Sheet-20005941A.pdf)
- [Vishay SUP53P06](https://www.vishay.com/docs/68633/sup53p06-20.pdf)
- [Infineon IRLZ44N](https://www.infineon.com/assets/row/public/documents/24/49/infineon-irlz44n-datasheet-en.pdf)
- [Omron D2F](https://omronfs.omron.com/en_US/ecb/products/pdf/en-d2f.pdf)
