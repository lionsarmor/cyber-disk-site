# External dock R1 — slim barrel-powered case

Revision 2026-11-07. R1 replaces the internal mains supply/C14 power bay with an external, regulated 5 V centre-positive adapter. R0 is retained as history, not the current build. This is a mechanical and power-input revision, **not an order-ready daughterboard**.

## Enclosure

168 W × 280 D × 54 H mm including 2 mm feet; body 52 mm. Depth excludes the proud eject button (288 mm from resting button tip to rear of case) and connected plugs. The old R0 was 248 × 284 × 76 mm. The unchanged R4 CD-ROM-bay drive sits at (10,8,6) mm. Its bezel remains at the front and its eject button remains 8 mm proud at rest, 2 mm proud at full travel. Its mechanism, disk, portal and bay mounting pattern have not been shrunk.

The new visual treatment is a long low chassis, recessed top label field, symmetric orange L-shaped shoulder panels and a narrow cyan diffuser wrapping around the base. The shoulders are solid separate prints, captured by lid screws; no repeated AMS colour switching is needed. No screws on the front face. Printed pieces fit a 256 × 256 mm bed in their modeled orientation. Fillets and shallow relief retain broad wall sections.

The drive carrier screws onto the original core side holes outside the case, then slides in from the rear. The rear PCB/port tray removes separately. A screwed underfloor bridge joins the two chassis sections; carrier/tray relief holes clear its nuts. Six M2 lid screws use heat-set inserts (exact insert SKU and printed-hole calibration still to be selected). Four M3×8 countersunk screws and M3 nuts join the underfloor bridge. Four M3 core side screws and the carrier/tray retention hardware need final length checks. Feet clear the joint bridge by 0.2 mm nominal; print flatness matters.

The opal diffuser sits in a dedicated recessed channel, clear of the carrier rails. The LED allocation is an envelope, not a validated strip assembly. Port bodies other than the PCB-mounted barrel jack remain provisional envelopes. USB-C uses the already proposed Adafruit 4056 panel extension into the Pico USB socket. DE9 serial, IEC DIN and custom accessory SPI remain.

## Power circuit

Input: regulated **5 V only**, centre positive, nominal 5.5 × 2.1 mm plug. A 12 V adapter would damage this design: Q1 protects reverse polarity, not overvoltage.

Proposed adapter: Triad **WSU050-2000**, Mouser **553-WSU050-2000**, 5 V / 2 A / 10 W, 11 mm plug. Mouser showed stock and $7.62 unit price when checked; this is not reserved stock. Its specified regulation is ±5%, ripple 150 mV peak-to-peak. Validate the voltage at the board under load, including cable and ripple; this is not an adequate worst-case rail guarantee by itself.

J5: Same Sky **PJ-102AH**, Mouser **490-PJ-102AH**, through-hole jack. Custom local footprint follows the current rectangular-lead drawing: 1.2 × 1.9 mm plated slots, third lead slot rotated, 3.2 mm pads. Pin 1 centre positive, pin 2 sleeve ground, pin 3 switched contact unused. The standard library's round holes were replaced. Barrel centre is 6.5 mm above the connector seating plane. Rear panel has a housing-sized opening with nominal clearance, rather than cutting through the jack body with a round hole.

F1: Littelfuse **0251002.MXL**, Mouser **576-0251002.MXL**, 2 A fast axial fuse. The axial footprint uses 12.7 mm pitch and a conservative 9 × 3.2 mm resistor-style envelope; its 3D body is generic. Final fuse pulse/inrush coordination and board trace rating still require validation. Removed the former three PTC allocation scheme. Core retains its own local fuse. LED and core harnesses must tolerate the input fuse's fault current until it clears; use suitably rated connectors/wire, not thin signal jumpers.

Q1: Vishay **SUP53P06-20-E3**, Mouser **781-SUP53P06-20-E3**, TO-220 P-channel MOSFET. G=1 at ground, D=2 at fused input, S=3 at V5: reverse-connected body diode permits initial charging and the channel then reduces voltage drop. RDS(on) specified at −4.5 V is 25 mΩ maximum at datasheet conditions. At 1.2 A this is 30 mV / 36 mW at 25 °C; hot resistance and all other drops must be included before release. Tab is live at fused input; keep it away from conductive hardware. No heat sink is allocated for this low current.

D1 still feeds the dock Pico VSYS through its own diode, while the Pico's on-board USB power path remains separate. VBUS is not tied to the drive's 5 V rail. USB power alone is for the Pico, not an approved power mode for the full drive.

The preliminary allocation is 0.25 A core + 0.25 A dock + 0.60 A lighting + 0.10 A reserve = **1.20 A / 6 W**. These are design allocations, not measurements. LED firmware must enforce the cap. Start-up/inrush, flash writes, serial and IEC activity, adapter low-line/ripple, USB attach/detach and full-brightness demand need bench tests. A bigger wattage rating alone does not fix a voltage-margin problem.

U6's two unused AHCT buffer channels now drive MAX232 TX/RTS, instead of connecting Pico outputs directly to those 5 V IC inputs. No extra IC was added. R5/R6 changed from 100 kΩ to 10 kΩ for the 5 V sense divider. Further power-state analysis remains necessary; these changes do not by themselves establish power-off safety.

## Honest validation boundary / blockers before ordering

- R1 has 39 populated positions, all carrier solder joints through-hole. The socketed Pico is a factory-assembled module containing SMD parts. Port cable/module assemblies are bought finished. Exact sockets, mating harnesses and all inherited candidate supplier packages are not yet a released purchasing BOM.
- Native schematic is still an explicit physical-pin map with passive symbol pins. ERC is a consistency check only, **not functional electrical sign-off**.
- PCB is **unrouted**. Gerbers are reference exports and must not be ordered. No prototype firmware is supplied by this revision.
- Finish power sequencing: IEC pull-ups to the off 5 V rail, dock TX driving an unpowered core, accessory output drive/pull-ups into an unpowered host, and hardware versus firmware gating of accessory MISO.
- Confirm module socket height and every component/port mechanical drawing; several KiCad 3D models are generic or missing. Mounting envelopes cannot qualify a purchased connector.
- Finish direction-aware schematic review, ESD/connector protection, fault-current protection, power traces/plane, routing and ERC/DRC. Check the core R0 controller too; it is also unrouted and needs its own interface/boot-state review.
- Prove Next/ESP32 adapter electrical contracts and firmware. This is custom SPI, not a directly pluggable Spectrum expansion port. Modern USB, Commodore IEC, RS232 and adapter support remain targets, not implemented compatibility claims.
- Bench-test regulated 5 V rail at the minimum adapter voltage/ripple and maximum actual load. Require every 5 V IC to stay within its operating range. The adapter candidate can change if measurements or worst-case analysis fail.
- Print a fit sample, check carrier travel, port plug insertion, LED diffusion, thermal behaviour and screw/insert strength. CAD intersections do not prove wear life or manufacturing tolerances.

## Sources checked

- [Triad adapter at Mouser](https://www.mouser.com/en/ProductDetail/Triad-Magnetics/WSU050-2000?qs=B4sXYbYweUrLCvb6OyMLMA%3D%3D) and [Triad specification](https://www.mouser.com/datasheet/3/236/1/WSU050_2000.pdf).
- [PJ-102AH current manufacturer drawing](https://www.sameskydevices.com/product/resource/pj-102ah.pdf) and [Mouser listing](https://www.mouser.com/en/ProductDetail/Same-Sky/PJ-102AH?qs=WyjlAZoYn50Yq4CrVLCXLw%3D%3D). Listing body was not readable during this check; stock is unconfirmed.
- [MOSFET specification](https://www.vishay.com/docs/68633/sup53p06-20.pdf), [Mouser stock listing](https://www.mouser.com/en/ProductDetail/Vishay-Semiconductors/SUP53P06-20-E3?qs=ru2xu5lizsADXHLEpSNjJA%3D%3D).
- [Littelfuse 2 A fuse listing](https://www.mouser.com/en/ProductDetail/Littelfuse/0251002.MXL?qs=bpnLQM2ZShzafpYR%2Fng7qQ%3D%3D).
- [TI AHCT125](https://www.ti.com/lit/ds/symlink/sn74ahct125.pdf), [TI MAX232](https://www.ti.com/lit/ds/symlink/max232.pdf), [TI LVC245](https://www.ti.com/lit/gpn/SN74LVC245A).
