# External enclosure R4

168 ×280 ×57 mm including feet. The bay-standard core remains unchanged; its carrier raises it to clear the retained through-hole lighting assembly. The case has rounded edges, a recessed top label, rounded shallow top pattern, and a continuous opal front/side diffuser. The long case is split into bed-sized pieces joined with a screwed underfloor bridge.

All five rear ports are soldered directly to the daughterboard: USB-B, DB9 RS-232, six-pin Commodore IEC, keyed accessory header and 5 V barrel power. The removable rear panel travels with the board carrier. Two rear-facing M3 screws secure it against plug insertion loads. Six PCB supports distribute connector loads.

The core slides in on a separate screwed carrier. Disconnect its J4 signal ribbon and J2 power plug before removing it. The original34-pin floppy ribbon connector is unused inside the external case; it remains available when the core is installed directly in a computer tower.

## Internal connections

| Cable | Specification |
|---|---|
| Core J4 ↔ dock J4 |10-way straight1:1 ribbon, TE1658621-1 sockets and3M3365/10 cable;220 mm cut length plus termination allowance. Dock pins2/7 intentionally NC. No floppy-cable twist.|
| Dock J6 → core J2 |5V/GND only,22AWG stranded wire. Harwin M20-1060200 socket atJ6; TE171822-4 with170204-2 terminals atJ2. The12V cavity is empty.|
| Internal USB |Adafruit898 A-to-micro-B,6.5in/165mm. J10 faces inward/right; other plug connects to the Pico. This is not an external USB-A device port.|
| Lighting J7 |Harwin3-way socket. Three Adafruit1938 through-hole pixels, data chained,5V/GND parallel;100nF at each pixel. Fit/insulate the hand-wired loom in the removable lightwell.|
| Sound J8 |Harwin2-way socket to TDKPS1240P02CT3 passive piezo. PCB R11 limits GPIO current. Piezo rests on2mm foam and is held by a removable screwed cap.|

The assembly render shows wire routes and plug envelopes. It does not model individual crimp strands, insulation stripping or every LED solder joint. Verify pin numbers against the schematic/silkscreen and continuity-test all looms. Ensure connector strain goes to the housing, not the solder joint.

## Mechanical assembly

1. Install the specified M2/M3 inserts. Join front/rear chassis with the underside bridge and four M3×8 screws/nuts. Add2mm feet so the bridge clears the table.
2. Place the opal diffuser in its captive stepped channel. Fit the three LEDs and local capacitors in the lightwell. Its removable upper strip captures the LED flanges; twoM2×10 screws/nuts retain the lightwell.
3. Assemble the core mechanism outside the case. Attach it to its carrier with fourM3×6 screws into its standard bay mounting positions. Slide the carrier in from the rear; secure with two undersideM3×8 screws into captive nuts.
4. Fit the piezo/foam ring and screw down its cap. Keep its leads inside the wire exit.
5. Install the dock PCB on the rear carrier using sixM3×6 screws/nuts. Trim tails to≤1.5mm below the board. Fit the USB jumper and other looms; slide in the rear carrier and secure its twoM3×10 rear screws.
6. Verify the core's eject motion, wiring clearance and all supply polarities. Fit the two lid sections with sixM2×8 screws intoIUTB-M2 inserts.

No internal mains supply is present. Use the specified regulated5V,≥2A centre-positive external adapter. Lighting is limited to200mA total; the chosen three pixels fit within that allocation. Optical uniformity around the side returns requires a real diffuser sample.

`checks.json` records core/enclosure fit; `wiring-checks.json` records selected nominal interference checks. Printed fit, cable molded dimensions, switch adjustment, connector loads and optical performance still require sample validation. These files describe the digital prototype, not a production-qualified product.
