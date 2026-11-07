# Electrical review R1 — 7 November 2026

**NOT READY TO ORDER AS A WORKING DRIVE.** This review covers the R4 single/A–B media, R1 passive contact board, R0 core and R2 external daughterboard. The core and dock remain unrouted. No functioning firmware or powered hardware test establishes floppy compatibility. Static results are in `hardware/reviews/electrical-r1/verification.json`; reproduce them with `tools/audit_electrical_r1.py` in the KiCad Python environment.

## Corrections and receiver hardening

1. **Core floppy outputs could assert during reset.** RN3 was 10 kΩ. TI specifies SN74LS06 input LOW current of up to 0.2 mA; that resistor cannot guarantee a LOW input. RN3 is now Bourns **4609X-101-102LF**, eight bussed 1 kΩ resistors, same SIP9 footprint. Bias-only calculation including 2% tolerance is 0.204 V. The five asserted-HIGH control signals now have substantially stronger LOW defaults. This is not a guarantee for every supply ramp or powered-off condition. [TI LS06 data](https://www.ti.com/lit/ds/symlink/sn74ls06.pdf), [Bourns network data](https://www.bourns.com/docs/product-datasheets/4600x.pdf), [Mouser replacement](https://www.mouser.com/en/ProductDetail/Bourns/4609X-101-102LF?qs=nFt9sTYf7TAKYPPrg1sLvw%3D%3D).

2. **UART receiver hardening, not a confirmed Pico 2 backfeed defect.** RP2350 GPIO1 is a digital FT pin specified as 3.3 V failsafe when unpowered. The earlier suspicion of inevitable backfeeding was therefore not supported by its datasheet. Core J4 pin 4 now feeds `DOCK_RX_RAW` into spare U2 A3/pin 4, then B3/pin 16 feeds `DOCK_RX` at the Pico. U2 remains powered by core 3.3 V, DIR high, OE low. Its specified Ioff behavior gives the receiver an explicit partial-power-down buffer boundary. No new IC or changed cable pin order. This is optional hardening rather than a requirement to correct the Pico 2 pin rating. RN3 pin 7 pulls the disconnected input LOW; firmware must ignore UART break/noise when the dock is absent and establish a handshake before accepting commands. [TI LVC245 data](https://www.ti.com/lit/ds/symlink/sn74lvc245a.pdf).

3. **MEDIA_ARM had a weak 100 kΩ default.** Former R3 is removed; RN3 pin 8 now supplies a 1 kΩ pulldown. This also addresses the low-impedance workaround for RP2350 A2 E9. The manufacturer's 120 µA leakage figure is typical, not a guaranteed maximum; the combined LS06-plus-typical-leakage example is 0.3264 V. Each HIGH on a 1 kΩ leg draws roughly 3.3 mA. Core's six driven legs add about 20 mA; dock TX supplies the separate receiver pulldown. Configure suitable GPIO drive strength and verify VOH under load. **20 core component positions, down from 21.** [RP2350 datasheet, GPIO characteristics and E9](https://datasheets.raspberrypi.com/rp2350/rp2350-datasheet.pdf).

## Findings that still block a sample-ready drive

| Priority | Finding | Required closure |
|---|---|---|
| Critical | Sliding contacts are not safe to energize while moving. The disk's lengthwise pads pass under the wrong contacts during insertion/ejection. | Add switched media power, discharge and isolation of SPI signals, with a hardware seating/eject interlock. Deassert isolation before motion, including reset, stuck firmware and partial insertion. Qualify whether contacts must lift mechanically. |
| Critical | Passive spring-board J1 is **7 wires**, core J3 is **10 pins** with control/sense signals. There is no completed active interface between them. | Design that interface explicitly. Never connect these headers pin-for-pin. Core J3 power is currently unswitched 3.3 V. |
| Critical | Spring eject is mechanical; software cannot guarantee it finishes a flash write before contact loss. | Define mechanical release sequencing and write-ahead recovery. Sudden power loss must preserve previously committed data; an incomplete latest write may be reported lost. Do not claim zero loss just because an LED shows busy. |
| High | Core and dock have zero routed tracks. | Route power/ground and high-speed paths, repeat DRC/net checks, inspect return paths, then review Gerbers. A placement preview is not an electrically connected PCB. |
| High | 5 V supply budget is not closed. LS06 requires 4.75–5.25 V at its pins; upstream cable/fuse/MOSFET losses reduce this. | Select brick/cable tolerances and budget worst-case drops, temperature and LED load. A nominal 5 V ±5% brick leaves no lower-end margin for the LS06. Measure startup/brownout/inrush and core PTC drop. |
| High | Some dock CMOS inputs can float with core/accessory unplugged or during reset: U4 raw clock/data/core signals, U5 drive inputs and U6 control inputs need a complete bias audit. | Provide hardware idle defaults with economical resistor networks as appropriate; check all combinations of USB-only, barrel-only, both, and disconnected peers. Do not rely solely on uninitialized GPIO pulls. |
| High | External powered/off-state behavior is not qualified. IEC/FDD pullups and sinks interact with powered-off hosts; an enabled accessory output could feed an unpowered adapter. | Prove power-off loading and fail-safe output disable. Add host-power detection/isolation if required. Ioff on an input buffer does not protect a powered output driving someone else's unpowered GPIO. |
| High | Accessible ports and exposed disk contacts lack a completed ESD/transient design. | Choose protection and grounding with acceptable signal capacitance; review USB shield, cable grounds and contact discharge paths. IC HBM ratings are not enclosure/system ESD qualification. |
| High | Connector outlines are provisional, particularly core Berg and 34-pin header. | Match selected manufacturer pin numbering, hole/slotted-pad dimensions, keys and cable exit; verify continuity with physical harness samples before assembly. |
| High | Firmware, media transaction format and host ownership are not implemented. | One writer at a time, explicit disk-change state, checksummed core/dock protocol, bounded buffers, retry/error reporting and durable commit behavior. Never mount the same writable image independently on two hosts. |

## What the review did establish

- Media SOIC8 wiring matches MX25L3233F single-bit SPI: pins 1–8 are CS, MISO, WP, GND, MOSI, clock, HOLD, VCC. Each bank has a decoupler and CS/WP/HOLD pullups. A/B banks are electrically independent; the seventh contact is unused. This is 4 MiB per bank, not a promise of larger-chip interchangeability. The 256-byte programming pages and 4 KiB erase sectors require translation for floppy sectors, plus wear management and recovery. [Macronix datasheet](https://www.macronix.com/Lists/Datasheet/Attachments/8933/MX25L3233F,%203V,%2032Mb,%20v1.7.pdf).
- The seven contact-board nets are passive independent paths. That board does not switch power, detect seating or make sliding safe. Contact compression specifications do not demonstrate sliding cycle life.
- Core LVC245 inputs have appropriate 5 V tolerance at 3.3 V supply; LS06 outputs are open collector. Firmware must gate responses by drive selection. Confirm actual termination/current and rise times on real controllers. No universal Shugart claim: initial pin 34 is DISK CHANGE, not READY.
- Core-to-dock J4 signal pairing is consistent. Dock J4 pins 2 and 7 are NC, blocking the core's power pins from joining dock rails; ground pins 1/8 are shared. The separate J6-to-Berg harness supplies core 5 V. The 12 V Berg position stays NC. The external dock does not consume the 34-pin floppy connector.
- Dock Q1 SUP53P06-20 is specified at −4.5 V gate drive (25 mΩ maximum at the stated test conditions). Its reverse-connected drain/source arrangement is intentional for reverse-polarity protection. It is **not** overvoltage protection or a regulated supply. No substitute is needed merely because the drive uses 5 V. [Vishay datasheet](https://www.vishay.com/docs/68633/sup53p06-20.pdf).
- MAX232 has the four 1 µF nonpolar charge-pump capacitors and 5 V supply. AHCT buffer thresholds accept 3.3 V GPIO; LVC buffers receive the 5 V logic outputs. Female DE9 is DCE: pin 2 TX out, 3 RX in, 5 ground, 7 RTS in, 8 CTS out. MAX232 is specified to 120 kbit/s, so a 115200-baud link is about 11.5 kB/s before protocol overhead; it is not a raw 500 kbit/s floppy channel. [TI MAX232](https://www.ti.com/lit/ds/symlink/max232.pdf), [TI AHCT125](https://www.ti.com/lit/ds/symlink/sn74ahct125.pdf).
- USB-B and internal USB-A have matching VBUS/D−/D+/GND assignments. USB VBUS is separate from external V5. USB differential routing, shield handling, cable quality and enumeration still need validation. USB-only power does not power the whole external drive.

## The product must emulate drives, not merely store files

| Host | Required device behavior | What these boards currently provide |
|---|---|---|
| Legacy PC with FDC | 720 KiB/1.44 MiB profiles; MFM read/write timing, index, stepping, select/motor, disk change, write protect, format and boot | Electrical pin-map and buffering proposal; no working emulation |
| C64 / selected Ultimate / X16 | IEC peripheral responding as a selected Commodore drive model, with DOS commands, disk images and block operations | IEC line receivers/sinks. Standard LOAD/SAVE is an initial test, not proof of fast-loader or full 1541 compatibility |
| Modern Windows/Linux | USB floppy profile with correct command responses, geometry, media-change/eject and errors; verify OS driver behavior | USB connection to dock Pico. UFI is a candidate protocol, not an implemented feature or guarantee of A: or BIOS boot support |
| Spectrum Next | Selected active storage/expansion adapter plus matching software/core behavior | Custom 3.3 V SPI connector only; no completed adapter or native floppy emulation |
| ESP32 | Selected board adapter and block/image API; emulate a specific controller only if the application requires it | Custom 3.3 V SPI connector only; no universal ESP32 floppy standard |
| RS-232 hosts | Explicit image-transfer/block-access protocol and host software | Serial transceiver only; plugging in a serial cable cannot create a native floppy drive |

USB removable-storage/image-management mode may coexist as a separate mode, but cannot substitute for the requested floppy profile. The USB-IF UFI specification defines floppy commands; actual Windows/Linux driver and transport support must be proved on selected OS versions. X16 documentation supports IEC disk-drive use alongside SD. Full Commodore fast-loader compatibility may require drive CPU/VIA/timing emulation rather than a file server. [USB-IF UFI specification](https://www.usb.org/sites/default/files/usbmass-ufi10.pdf), [X16 hardware reference](https://github.com/X16Community/x16-docs/blob/master/X16%20Reference%20-%2014%20-%20Hardware.md).

Core/dock transport needs a measured throughput budget. Raw floppy timing belongs on the core, with local track buffering; do not wait for USB, IEC, serial, animation or sound processing to generate each read pulse. Standard sector images cannot preserve every copy-protected track. Define the supported image/timing formats before promising all software.

## Next engineering sequence

1. Close media interlock/isolation and eject/write durability first.
2. Close reset/disconnected-input states, 5 V tolerance, ESD and off-state loading; qualify connector footprints and exact harnesses.
3. Prove a PC floppy profile and IEC/USB command prototypes on development hardware, including write/format and power-loss recovery. Use checksummed disk images; keep enlarged native storage a separate mode.
4. Route the carrier boards, re-run saved-file audits and do an independent pin/footprint review. Only then release clearly identified prototype Gerbers.
5. Bench-test with current-limited power: every power-source combination, contact movement, cable insertion, worst LED load, waveform timing, write interruptions, repeated eject cycles and selected real hosts.

Clean ERC/DRC and matching nets are useful evidence, but they are not a substitute for these tests. The current source and download library remain marked provisional/reference-only where appropriate.
