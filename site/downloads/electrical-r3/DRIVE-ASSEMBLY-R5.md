# Drive mechanism R5 — assembly specification

The core retains the 146.05 × 180 × 41.2 mm body and 148 × 42.3 mm bezel for the desktop optical-drive bay. Outer bezel rounding is only 0.5 mm; the disk entrance and button are rounded. Screws are accessible inside or underneath, not exposed on the face.

Use the R5 STEP/STL set and current core R1/contact R1 boards together. Original disk-shell geometry is unchanged. The contact bank remains below the disk, on a replaceable soldered-leaf PCB/cassette.

## Assembly order

1. Print the base, lid, bezel, bearing caps, guides, two eject sleds, latch bracket, latch, short button/cam, contact cassette and strain clamp. Start with PETG or another tough, dimensionally stable material; print fit/insert coupons before full parts. Orient guide sliding faces and cam working edges for clean surfaces. Remove burrs; do not force a rough sliding fit.
2. Install the specified M3 IUB-M3-1 and M2 IUTB-M2 heat-set inserts with a controlled-depth tool. The CAD uses their actual lengths and recommended pilot-hole geometry. A generic insert of the same thread is not automatically interchangeable.
3. Mount the guides and contact cassette. Fit the solderable leaf contacts, fit Phoenix 1725708 screw terminals to contact J1 (underside) and controller J3 (top). Wire the seven positions 1:1 and strain-clamp insulation with the silicone pad. Test continuity before power. Trim contact-terminal solder tails to at most 0.5 mm above the contact PCB.
4. Slide the two eject springs/sleds onto deburred 3 mm rods. Their shoulders, not the disk shell's snap tabs, carry eject load. The right sled contains the keeper that holds the latch withdrawn until the next insertion.
5. Install the latch and its short compression spring. Its follower is a standard M2 ×20 screw with two smooth brass bushes and a captive nylon-lock nut. Install the short right-side button/cam and its return spring; confirm free movement through the full 6 mm stroke.
6. Assemble the flap with a plain left pivot and the threaded metal right bearing spacer. The M3 screw/nut clamps the flap and rocker to the spacer; the spacer rotates inside the split bearing. Fit the torsion spring and screw down the removable bearing caps. Do not clamp the rotating spacer to the fixed bearing.
7. Install both D2F-01-D switches and the three-wire interlock harness. Seat switch SW1 is above the eject-carriage path. Adjust SW2 to open NC by 1.25 mm of button travel, before latch withdrawal. Verify using a meter; the visual animation is not a switch adjustment gauge.
8. Mount the socketed core board. Route the J3 service harness and J5 switch wiring as shown in the Wiring view. Fit the lid only after the dry mechanism moves freely and the interlock states are correct.

## Purchased motion hardware

| Function | Part | Installed condition |
|---|---|---|
| Eject springs, two | Lee LC022D14M | 27.6–55.6 mm long; free63.5, solid9.93, OD7.62 mm |
| Button spring | Lee LC018C09M | 8.3–14.3 mm; free19.05, solid3.35, OD6.096 mm |
| Latch spring | Lee CI008BC03M | 2.7–5.5 mm; free6.35, solid1.53, OD2.3876 mm |
| Flap spring | Lee LTR014A04M | 65° closed preload;155° at90° opening; straight legs trimmed to6 mm |
| Eject rods | 3 mm smooth steel | Two71 mm pieces, deburred |
| Left flap pivot | 3 mm smooth steel | One11.9 mm piece, captured by blind barrel and bearing cap |
| Right flap pivot | Harwin R30-5001002 | Ø4.76 ×10 mm through-threaded M3 spacer; M3×25 countersunk screw + M3 nyloc |
| Latch follower | M2×20 DIN912 + M2 nyloc | 3 mm OD/2.1 ID brass sleeves, lengths3.3 and4.4 mm |
| Flap follower | M2×10 DIN912 + M2 nyloc | Same brass stock, length5.0 mm |

Cut sleeves from K&S9821 or equivalent dimensioned stock. Sleeves are the replaceable wearing surfaces; screws carry load. No tiny custom grooves or retaining clips are required. See the master BOM for all fastener quantities and supplier links.

## Switch wiring

Core J5 pin1 (3.3V) → SW2 COM; SW2 NC → SW1 COM; SW1 NO → J5 pin2 (INTERLOCK_OK). The other switch terminals are unused and insulated. Test pin2 LOW when empty, eject pressed, either wire disconnected, or firmware unarmed. Mechanical closure alone does not arm media power.

The D2F drawing identifies the terminals; do not infer NO/NC from an arbitrary viewing direction. Label all wires at both ends. The plug housing has no polarization key, so mark pin1 and verify orientation before power.

## Motion and validation

The disk slides on smooth guides and the sprung latch drops into the keyed slot. The button opens the flap first, then withdraws the latch; the carriage springs eject the disk28 mm. The keeper permits the button to return while the disk remains ejected. Button travel stops at6 mm, leaving2 mm exposed beyond the bezel.

The generated `hardware-clearances.json` checks selected static and coupled swept pairs. This does not establish friction, printed shrinkage, spring handedness, shock strength or cycle life. Confirm the right-hand torsion spring winds tighter during opening, correct any print burrs, and cycle a dry sample before powering contacts. Do not order a batch based solely on the rendered animation.

## Replaceable contact harness — terminal revision

The standard TE 171826-4 floppy power receptacle J2 remains beside the 34-pin J1 ribbon connector at the rear of the controller. J2 uses +5V and ground; its legacy +12V position is deliberately unused. Neither connector is replaced by a screw terminal.

The contact harness uses two identical Phoenix Contact MPT 0,5/7-2,54 (1725708, Mouser 651-1725708) seven-way terminals. Contact-board J1 is underneath; controller J3 is on top. Screwdriver access through the cassette underside and a side wire exit are modeled. Remove the screw-mounted cassette for service. Disconnect all power, including USB, before loosening terminals.

| Position on BOTH blocks | Signal | Viewer color |
|---|---|---|
| 1 | GND | Black |
| 2 | Switched media supply (nominal 3.1V) | Red |
| 3 | CS_N | Orange |
| 4 | SCK | Yellow |
| 5 | MOSI | Green |
| 6 | MISO | Blue |
| 7 | Reserved; controller not connected | Purple |

Use 26 AWG stranded Alpha 6821 wire (0.89 mm nominal / 0.94 mm maximum insulation diameter). Number each end; the BOM buys one black spool, not seven colors. Leave approximately 150 mm per conductor and trim to fit the shown service loop. Strip 4.5 mm, tighten to 0.12–0.15 Nm while supporting the terminal housing, and do not tin stranded ends under screw clamps. The connector accepts 26–20 AWG; earlier 28 AWG wire is not suitable for these blocks. Check continuity by terminal number, not apparent left-to-right orientation, because J1 is mounted underneath.

The terminals are soldered to their boards; the seven wires release by loosening the screws. The leaf contacts stay soldered to the replaceable contact board. No desoldering is needed to remove the complete contact PCB/cassette from the drive.

Terminal dimensions and wire preparation: [Phoenix Contact 1725708](https://www.phoenixcontact.com/en-de/products/pcb-terminal-block-mpt-05-7-254-1725708). Footprint and component geometry derive from KiCad's TerminalBlock_Phoenix library; the contact-board STEP has its solder tails trimmed to the specified installed length. Wire curves show routing envelopes, not preformed cable specifications. Printed fit, screw access and actual insertion wear still require sample testing.

J2 now includes a simplified TE 171826-4 inspection model based on [TE drawing 171826](https://www.te.com/en/product-171826-4.html). Four pins at 2.5 mm pitch, 10 mm width and 6.7 mm installed height are represented; molding and locking details are simplified. The rear window has 0.35 mm top clearance to this body. Confirm the chosen plug and supplier drawing on a physical sample.

The controller’s custom through-hole power and capacitor pads now explicitly open both solder-mask layers, exposing their annular rings for hand soldering. No power or signal nets changed.


## Drive-local speaker update

The core now has GP27 PWM → LM386 → J6 → replaceable20mm8ohm speaker. J4 pin6 is reserved; lighting remains on the dock. See [Drive audio R1](../docs/DRIVE-AUDIO-R1.md) for circuit, wiring, mounting and firmware requirements. Playback is not yet implemented or bench-tested.
