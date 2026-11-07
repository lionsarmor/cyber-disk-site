# External dock R0 — provisional engineering pass

The user chose a standard desktop computer cord directly into the external enclosure: C14 inlet with internal AC/DC supply. This is a mechanical allocation and low-voltage daughterboard placement study, not a mains wiring/fabrication release.

Current core drive remains unchanged: 146.05 × 180 × 41.2 mm body; 148 × 42.3 mm bezel. The external shell has a separate side power compartment, removable core carrier and rear daughterboard tray. Existing 34-pin floppy connector remains a PC floppy interface. Power and digital dock traffic use separate harnesses; the floppy connector is not repurposed.

Rear interfaces: USB-C via a replaceable panel extension into the dock Pico; DE-9 RS-232 serial; standard 6-pin DIN Commodore IEC; keyed custom accessory SPI connector for a selected ESP32 breakout and a future active Spectrum Next expansion-edge adapter. A serial cable alone does not provide Next floppy emulation. USB, IEC, RS-232 and accessory software are not implemented; only one writable media owner is permitted.

The daughterboard is low-voltage only. No L/N/PE mains conductors are part of this PCB. A purchased enclosed Mean Well RS-25-5 supply and a switched/fused C14 power-entry module have reserved space. The separate terminal guard, metal mounting/bonding and ventilation are allocations requiring qualified mains review and thermal/first-article testing; printed plastic is not claimed to be an approved electrical barrier. Mains fuse selection and the final inlet remain open.

USB-C uses Adafruit 4056 panel cable to avoid custom fine-pitch USB soldering. The core and dock both use a socketed Pico 2; the dock processor handles external host interfaces and lighting. Existing core J4 UART transport is a provisional service/data link, not a proven high-throughput storage bus. J4 power pins are not connected between boards; core power goes through its standard floppy power input with +12 V position unconnected.

Status: schematic, footprint and mechanical fit studies only. Routing, interface ESD/isolation, safe boot/power-off behavior, firmware, host arbitration, Next adapter, EMC and physical fit remain acceptance gates.

## Mechanical arrangement and assembly

Nominal envelope: 248 × 284 × 76 mm including feet. The core is translated to X14/Y8/Z18 mm. Its standard side mounting holes remain unchanged. Front/rear shell sections split at Y190 mm; each printed section fits within a nominal 256 mm square bed, subject to brim and printer exclusion zones. Corners and the orange wrap accent soften the desktop enclosure while retaining the original core bezel.

1. Join the front/rear lower shell with three splice plates. M3 hardware lengths and insert details remain provisional.
2. Fit the lightwell, replaceable opal diffuser and 5 V lighting strip. The strip, diffuser capture and optical mixing need a sample before release.
3. Screw the existing core drive to its carrier outside the enclosure. Slide that assembly in from the rear with the rear PCB tray removed. Two accessible screws retain the carrier.
4. Fit the daughterboard to its four supports. The rear port panel and PCB tray are one printed part; fit purchased panel connectors and removable harnesses before inserting it.
5. Connect the signal-only core J4 harness and separate 5 V floppy-power harness. Plug the USB-C panel extension into the daughterboard Pico. The colored cable shapes are routing reservations, not harness manufacturing drawings.
6. Close the two lids. The internal power cartridge is a separate engineering task: its metal guard, supply mount, strain relief, protective earth, fuse and inlet details are not released for construction.

## Inspection and verification

The site includes closed, lids-off, exploded and empty-case views; it reuses the actual existing core and KiCad board meshes rather than duplicating them. STEP, printable-part studies, native KiCad files, schematic and board previews are downloadable. The reference Gerbers are explicitly NOT FOR ORDER.

Saved schematic and PCB agree on 225 connected pin assignments. ERC has no messages, but uses passive pin-map symbols and does not validate circuit function. PCB has zero geometric DRC errors, 14 silkscreen warnings and 164 unrouted connections. No copper routing is provided. The four mounting holes and existing core/carrier fit are checked geometrically; the sliding samples and printed-part intersections are recorded in `mechanical/external-dock-r0/checks.json`. These are geometric checks, not insertion-force, spring-life, electrical or safety tests.

## Primary references

- [Mean Well RS-25 specification](https://www.meanwell.com/Upload/PDF/RS-25/RS-25-SPEC.PDF): RS-25-5 envelope and output rating.
- [Adafruit 4056](https://www.adafruit.com/product/4056): USB-C panel extension to micro-B.
- [TI MAX232](https://www.ti.com/lit/ds/symlink/max232.pdf): 5 V supply, charge-pump capacitors and TTL input thresholds.
- [TI SN74LVC245A](https://www.ti.com/lit/ds/symlink/sn74lvc245a.pdf): 3.3 V logic, input tolerance and disabled/power-down behavior.
- [TI SN74AHCT125](https://www.ti.com/lit/ds/symlink/sn74ahct125.pdf): LED data level translation.
- [Commander X16 hardware reference](https://github.com/X16Community/x16-docs/blob/master/X16%20Reference%20-%2014%20-%20Hardware.md): IEC platform target.
- [Spectrum Next serial hardware context](https://www.specnext.com/the-next-on-the-network/): the ESP connection is logic-level serial, not an RS-232 electrical interface. A storage expansion adapter still needs its own active electronics and software.

The core bezel sits at the external front plane (Y0); the existing eject cap remains 8 mm proud at rest and 2 mm proud at full travel. The shell does not bury the button.
