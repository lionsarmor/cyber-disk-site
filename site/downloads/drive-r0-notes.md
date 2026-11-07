# Cyber Drive assembly R0 — first packaging/mechanism study

This is editable CAD, not a production or proven eject mechanism. The preview uses the exported solids, not generated concept art. The guide/disk fit is sampled in CAD; cam geometry, lost motion, spring force, release timing, clearances under print tolerances and all electrical isolation remain unqualified.

## Layout

- CD-ROM bay body 146.05 W x 180 D x 41.2 H mm; bezel 148 W x 6.5 D x 42.3 H mm. Chassis uses SFF-8551 side-hole datums 47.4/126.65 mm longitudinal, 10/21.84 mm height. The current body models SIDE mounts only; bottom bay mounts are not modeled yet.
- Screw-together tray, separate lid and separate front bezel. No front-face screw holes. Bezel screws are accessible from inside. Small countersunk M2 lid screws, M3 mechanism/bay mounting, candidate brass heat-set insert bores in printed housing. Screw/insert lengths, seating faces and production tolerance details remain to be selected.
- Thirteen printed part designs, two PCB reference envelopes, steel rod/fastener and spring envelopes. STL coordinates are ASSEMBLED, not release-ready slicer orientations. Base fits a nominal 256mm FDM bed. Print orientation/support for undercuts and insert installation still need review; do not print the whole assembly as one object.
- Actual unchanged 92 x 96 x 8.5mm Basic A/B disk shell from unified-r12, with matching current R6 broad-face guide tracks. The A/B reference is the default; other styles share the guide interface but have not all been swept through this housing.
- The rounded controller PCB fits behind the disk; board and Pico/DIP envelopes are simplified packaging references, not exact vendor component CAD. Rear cutouts reserve the ordinary 34-pin floppy header and 4-pin floppy power opening. Cables and exact connector shells/plug swept volumes are not modeled; the rear connector blocks shown are clearance envelopes only. The PCB remains unrouted and electrically unqualified.

## Door

Separate hinged flap on short side pivot screws/shafts. Closed and 90-degree-open poses included. The hinge is above the disk/guide path. Gravity return is plausible in normal horizontal-drive orientation; a selected torsion spring is needed for reliable closure in other orientations. Hinge spring, pivot retention, over-travel stops and dust sealing still need detail. A dust flap is not a watertight seal.

## Retention and eject

Two orange pushers travel 24 mm on side rods and bear on the outer solid nose regions, never the copper lane. They move independently; there is no crossbar sweeping across the contact head or fixed disk stops. The left pusher carries the latch keeper. Two compression-spring envelopes run on removable 3mm steel rods. Springs are shown compressed in the seated pose and extended in the ejected pose. The rear 24mm of each guide has a side window for the pusher arm; its broad-face guide runners remain continuous. Their rate, free length, solid height, preload and force budget have NOT been selected or simulated. The disk protrudes approximately 11.5mm past the bezel front after the illustrated eject travel.

The left cross-slide pawl enters the existing 4mm-long keyed notch, not a shell snap. The intended keeper on the eject sled holds the pawl OUT throughout insertion/ejection, letting it engage only after the disk reaches its hard stop. Nominal seated tongue/slot interference and retracted clearance are checked independently. However, the spring that biases the pawl, the keeper's complete cam/follower engagement, the return of the eject button, and the button-to-latch lost-motion linkage are NOT finished. The CAD poses do not prove the mechanism will operate without sticking.

Intended release order: interrupt power and isolate all moving-pad signals; lift contact head; retract latch; let compression springs extend the eject sled. Reverse during insertion: guides and mechanical stop establish position, latch captures key, contact head lowers, hardware seat/interlock permits power. The current cam/button solids establish SPACE and intended layout; no continuous linkage or timing simulation has been performed. Do not connect live sliding pads on this basis.

## Serviceable leaf contacts

Candidate: **Harwin S7131-45R**, Mouser **855-S7131-45R**. Gold-plated extended-beam spring contact, 4.6mm long, suitable for a 6mm-pitch single-file row. Manufacturer describes 2mm free height; the preliminary assembly uses a 1.55mm working envelope, pending exact drawing/force qualification. Seven are oriented along insertion travel, one isolated contact per pad. The rendered leaf shapes are simplified bent-beam ENVELOPES, not supplier CAD or spring FEA.

The tiny contacts are SMT, unlike the through-hole core carrier. They live on an inexpensive removable contact PCB, not the main controller. The four bridge screws and one unplugged harness allow the service bridge/head to come out as a unit; two M2 PCB screws allow cartridge replacement on the bench. No change to the disk or controller is needed to iterate this carrier. Guide-pin retainers, harness strain relief, connector and independent end-stop/detection switches remain to be added.

The illustrated head retracts 4.8mm to clear the disk's full face during movement. It must not drag across the seven pads while powered: the broad longitudinal lane will bridge positions during travel. Working force, pad wear, contact plating pairing, solder attachment, bounce, ESD and lifetime need real tests. The supplier's generic contact/cycle ratings are not a drive-life guarantee.

Sourcing checked 2026-11-07:
- Mouser lists S7131-45R with cut-tape/single-piece ordering (roughly $0.35 each in the observed listing; stock and price can change): https://www.mouser.com/en/ProductDetail/Harwin/S7131-45R
- Manufacturer spring-contact description/drawing: https://www.harwin.com/products/S7131-45R
- Mouser spring-contact family: https://www.mouser.com/en/new/harwin/harwin-spring-contacts/
- Small alternative with integral over-compression stop: S7221-45R, Mouser 855-S7221-45R. Shorter/smaller than the chosen first envelope; would need a different carrier height/land pattern, not a drop-in substitute: https://www.mouser.com/en/ProductDetail/Harwin/S7221-45R
- Earlier Keystone 5231 is a battery leaf, not a qualified gold signal contact and not selected for this carrier.

## Files and inspection

`closed-assembly.step`, `service-assembly.step`, `ejected-assembly.step`, `exploded-assembly.step` are static poses of the same design. Exploded positions are visual disassembly aids, not a validated assembly/removal path. Lid fasteners are retained in the cover-off visualization as locator references; remove them physically before opening. `parts/` contains each part as STEP and STL. `parts.json` identifies printed parts versus purchased-component envelopes/reference geometry. `checks.json` records the limited checks and unresolved issues.

Next iteration should focus on a small bench test fixture for the pawl/keeper, contact lifting sequence and springs, before printing the entire housing or claiming operable storage hardware.
