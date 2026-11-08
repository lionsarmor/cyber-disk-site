# Electrical R2 — controller R1, dock R3 and first firmware

**Engineering prototype; not approved to order as a working universal drive.** R0/R2 boards remain historical references. Use only the matching new schematic, PCB, BOM and firmware together. No hardware was powered or mechanically cycled in this review.

## 1. Sliding-contact interlock

Controller R1 J3 is now a **seven-pin isolated output**, matching contact-cartridge wire order: 1 GND, 2 switched media supply, 3 CS, 4 clock, 5 MOSI, 6 MISO, 7 NC. Do not use the old controller R0 ten-pin J3 harness.

U6 LP2951ACN/NOPB generates nominal 3.0875 V from V5, using 15 kΩ/10 kΩ feedback. C6 is 22 µF with a 1 Ω series return resistor; this gives additional startup-overshoot allowance and deliberate ESR. U4 SN74LVC245AN runs from the switched rail and buffers all four directed SPI signals. Its output-enable and U6 shutdown share MEDIA_OFF. The MISO contact connects to a high-impedance input, not a driven MCU pin.

R7 pulls MEDIA_OFF up from **V5**, so loss of the Pico's 3.3 V rail does not leave the regulator enabled. Q2/Q3 are two series TN0702 logic-level MOSFETs. Both firmware ARM and the mechanical permission loop must be high to enable media. RN3 gives both controls a 1 kΩ default to ground. Q1 discharges the media rail through 47 Ω when disabled; R6 is a passive 1 kΩ bleed.

J5 pin1 feeds 3.3 V through **seat switch NO → eject switch NC → J5 pin2**. Open wire, unseated disk, pressed eject, firmware reset or loss of 3.3 V means off. Two Omron D2F-01L switches are provisional Mouser candidates. Their brackets and cam actuation are **not yet integrated or qualified in the mechanical CAD**.

The eject switch must open before the latch releases. The electrical discharge calculation is roughly 2 ms at component corners, **excluding the regulator's unbounded shutdown delay and mechanical bounce**. Use a 5 ms pre-release design target, then measure it at the fastest credible manual press, cold/hot and with the MCU stopped. Do not equate a drawing of a switch with a proven interlock. The contacts must not cross onto a wrong pad until the media rail is below 0.9 V, and it must stay below that level at least 300 µs before re-enabling. Signal isolation must precede movement too.

## 2. Write recovery and eject

The new C journal keeps the old committed sector until a replacement has been programmed, committed last and read back. Garbage collection copies each live record before erasing its old block. Interrupted operations invalidate the current mount; reinsertion scans CRC-valid committed records. The host tests deliberately cut program/erase operations at byte boundaries and reboot the journal.

USB writes return success only after journal verification. Physical eject is not blocked by firmware. The last interrupted sector can be old or new; already committed unrelated sectors must survive in the fault model. Multi-sector filesystem consistency and unflushed host caches remain the OS/application's responsibility. Generation-tagged requests and USB UNIT ATTENTION prevent stale operations silently targeting a replacement disk.

The PC ribbon implementation is deliberately **write-protected** until WRITE DATA capture and its buffering are implemented and tested. There is no claim of working PC write/format or Commodore emulation yet.

## 3. Voltage margins and disconnected inputs

The former SN74LS06 parts are removed from **both** new boards. Core Q4–Q8 and dock Q2–Q4 use TN0702 open-drain outputs. Their gate drive is 3.3 V, with 1 kΩ gate defaults; their drain outputs can be pulled up by a 5 V host. Unlike a 5 V TTL chip, they do not require a 4.75 V local logic rail. TN0702 has specified on-resistance at 2 V, 3 V and 5 V gate drive; do not substitute a MOSFET based only on its threshold voltage. The core uses fast slew/12 mA GPIO drive for short read-data pulses; pulse shape under real cable/termination capacitance remains a bench gate.

The dock's MAX232 and AHCT125 still require at least **4.5 V at their supply pins**. Main power routes use a 1.2 mm class, ground 0.75 mm and logic rails 0.5 mm, with short neckdowns where necessary. The core's high-resistance resettable fuse is replaced by a 2 A axial fuse, matching the dock candidate. This is wiring/board protection, not a precise 100 mA media current limit; U6 provides the media current limit.

Prototype budget: 0.35 A core, 0.15 A dock and **0.20 A maximum lighting**, 0.70 A total. The firmware currently leaves LEDs off. A 2 A adapter is capacity headroom, not expected consumption. With a 4.70 V instantaneous input (5 V −5%, less 50 mV ripple allowance), provisional hot-resistance budgets of 75 mΩ per fuse, 50 mΩ reverse MOSFET, 40 mΩ core harness loop and 25 mV PCB allowance give about **4.55 V at the core**. These are allocated/measured limits to verify, not manufacturer-guaranteed hot resistances or a completed thermal qualification. Test the selected Triad WSU050-2000 adapter at its plug; never assume “5 V” alone is sufficient. Check startup and load-step peaks stay within downstream 5.5 V limits.

Media feedback corners using TI's reference limits and 1% resistors give about **2.94–3.215 V**, within the flash's 2.65–3.6 V operating range. Shutdown, enable overshoot, output-capacitor stability, contact voltage drop and programming current must still be scoped. Bench prototype temperature target is 0–40 °C.

Dock RN3 biases disconnected SPI inputs, core link inputs, accessory driver inputs and LED data. R7/R8 set serial TX/CTS-driver inputs to inactive mark; R9/R10 define receiver levels when MAX232 lacks power. POWER_SENSE now enters a spare 5 V-tolerant U1 channel; GPIO28 receives a buffered **POWER_PRESENT digital signal**, not a divider voltage during a 3.3 V power ramp. This signal is not a precision undervoltage monitor.

Dock IEC pullups to its own V5 are removed. RN1 is five 47 kΩ **pulldowns**; an absent host reads reset asserted and the future IEC firmware must release every sink. Attached hosts must provide normal IEC pullups. This avoids sourcing local power into an unpowered peer through our pullup network. Check actual C64, X16 and Ultimate hardware/revision pullups before enabling those profiles. The standard internal PC FDD cable is not a hot-plug interface; power down the PC before connection or removal. Do not externally power the core while its ribbon is attached to an unpowered PC.

## 4. Routing and firmware

The new PCB sources, routing inputs and saved-session outputs accompany this review. Fresh KiCad ERC/DRC and independent physical-pin checks are recorded in `hardware/reviews/electrical-r2/verification.json`; consult those saved results rather than a screenshot. 0.18 mm is the minimum track constraint, allowing approximately 0.1875 mm signal breakouts while using wider main routes. This is over 7 mil; confirm the selected PCB fabrication process. No DRC exclusion is a substitute for correcting an electrical short.

The USB-B to internal USB-A route is manually defined before routing, with no signal vias, a reserved bottom return corridor and ground fills on both layers. Selected crowded ground pads use direct fill connections; most retain thermal relief. Return continuity still needs physical signal review. It is USB **full-speed only**; it has not been qualified as a controlled-impedance or compliant USB interconnect. J10 was rotated and the nearby bulk capacitor moved to allow that route. Mechanical case drawings from earlier revisions are not a fit approval for the moved internal connector.

Two executable Pico 2 builds now exist. The core generates real MFM read pulses for the PC profile using PIO/DMA. The dock implements USB MSC/SCSI removable storage and CDC maintenance over a CRC-framed UART link to the core. That USB mode is not UFI floppy emulation. IEC/DOS, serial clients, ESP32/Next, USB UFI and 34-pin write capture remain separate unfinished firmware work.

## Required bench results before a sample/build release

1. Power up with a current-limited bench supply, no retro host and no disk; confirm all rails, polarities and default outputs. Sweep input, reset each Pico independently, disconnect either board, and test USB-only/barrel-only/both and peer-off conditions.
2. Scope MEDIA_OFF, media voltage, CS/SCK/MOSI and the actual latch movement. Include bounce, fastest eject, stopped firmware and brownout. Validate the interlock mounts, repairable harness and seven-wire ordering.
3. Scope FDD output low levels and pulse widths using realistic pullups/cable loads. Check selection release, step/head changes, index period and FIFO underrun. Then read known 720 KiB and 1.44 MiB images on a sacrificial PC/controller.
4. Verify USB enumeration and read/write/format/eject/reinsert on Windows and Linux, including a same-capacity replacement disk and stale commands. Run long writes, GC and physical power cuts on actual flash.
5. Independently review power traces/vias, USB return continuity, regulator loop, connector footprints, ESD strategy and assembly clearances. No IEC/Next compatibility claim until the actual protocol and host tests pass.

## Primary references

- TI LP2951-N, pinout, reference limits, shutdown and capacitor/overshoot requirements: https://www.ti.com/lit/ds/symlink/lp2951-n.pdf
- TI SN74LVC245A, 5.5 V-tolerant inputs and partial-power-down behavior: https://www.ti.com/lit/ds/symlink/sn74lvc245a.pdf
- Microchip TN0702, source/gate/drain pin order and low-gate-voltage on-resistance: https://ww1.microchip.com/downloads/en/DeviceDoc/TN0702-N-Channel-Enhancement-Mode-Vertical-DMOS-FET-Data-Sheet-20005941A.pdf
- Macronix MX25L3233F, NOR operations and power-up/down requirements: https://www.macronix.com/Lists/Datasheet/Attachments/8933/MX25L3233F,%203V,%2032Mb,%20v1.7.pdf
- Raspberry Pi RP2350 datasheet, GPIO and E9 erratum: https://datasheets.raspberrypi.com/rp2350/rp2350-datasheet.pdf
- TEAC FD-235HF interface specification (manufacturer document mirrored by HxC): https://hxc2001.com/download/datasheet/floppy/thirdparty/Teac/TEAC-FD235HF-A291.PDF
- Triad WSU series regulation/ripple and adapter specification: https://www.triadmagnetics.com/Asset/triad-magnetics-ws-series.pdf
- Pico SDK 2.2.0: https://github.com/raspberrypi/pico-sdk/tree/2.2.0
