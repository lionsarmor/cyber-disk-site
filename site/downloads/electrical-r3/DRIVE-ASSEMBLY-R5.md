# Drive mechanism R5 — assembly specification

The core retains the 146.05 × 180 × 41.2 mm body and 148 × 42.3 mm bezel for the desktop optical-drive bay. Outer bezel rounding is only 0.5 mm; the disk entrance and button are rounded. Screws are accessible inside or underneath, not exposed on the face.

Use the R5 STEP/STL set and current core R1/contact R1 boards together. Original disk-shell geometry is unchanged. The contact bank remains below the disk, on a replaceable soldered-leaf PCB/cassette.

## Assembly order

1. Print the base, lid, bezel, bearing caps, guides, two eject sleds, latch bracket, latch, short button/cam, contact cassette and strain clamp. Start with PETG or another tough, dimensionally stable material; print fit/insert coupons before full parts. Orient guide sliding faces and cam working edges for clean surfaces. Remove burrs; do not force a rough sliding fit.
2. Install the specified M3 IUB-M3-1 and M2 IUTB-M2 heat-set inserts with a controlled-depth tool. The CAD uses their actual lengths and recommended pilot-hole geometry. A generic insert of the same thread is not automatically interchangeable.
3. Mount the guides and contact cassette. Fit the solderable leaf contacts, wire the seven pads 1:1, strain-clamp insulation with the silicone pad, and plug the seven-cavity M20-1060700 housing into J3. Test continuity before power. Trim board solder tails to the documented clearance.
4. Slide the two eject springs/sleds onto deburred 3 mm rods. Their shoulders, not the disk shell's snap tabs, carry eject load. The right sled contains the keeper that holds the latch withdrawn until the next insertion.
5. Install the latch and its short compression spring. Its follower is a standard M2 ×20 screw with two smooth brass bushes and a captive nylon-lock nut. Install the short right-side button/cam and its return spring; confirm free movement through the full 6 mm stroke.
6. Assemble the flap with a plain left pivot and the threaded metal right bearing spacer. The M3 screw/nut clamps the flap and rocker to the spacer; the spacer rotates inside the split bearing. Fit the torsion spring and screw down the removable bearing caps. Do not clamp the rotating spacer to the fixed bearing.
7. Install both D2F-01-D switches and the three-wire interlock harness. Seat switch SW1 is above the eject-carriage path. Adjust SW2 to open NC by 1.25 mm of button travel, before latch withdrawal. Verify using a meter; the visual animation is not a switch adjustment gauge.
8. Mount the socketed core board. Route the J3 pigtail and J5 switch wiring as shown in the Wiring view. Fit the lid only after the dry mechanism moves freely and the interlock states are correct.

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
