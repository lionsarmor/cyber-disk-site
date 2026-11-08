# Drive-local audio R1

The core controller now includes a through-hole LM386 amplifier and J6 speaker output. Sound therefore does not require the external daughterboard. The 20 mm PUI AS 02008MR-R dynamic speaker is mounted above the rear-left electronics in a supported cradle; a screw ring and a removable two-wire plug make it replaceable. It is not soldered directly to the carrier PCB. The external dock's old piezo remains an optional tone-only part.

## Circuit and assembly

- Pico GP27, physical pin 32, supplies AUDIO_PWM. Core J4 pin 6 is now unconnected. The dock's existing CORE_LED_RAW input remains pulled down; dock GPIO22 still drives its lights. Future activity/lighting messages use the existing UART. No new firmware protocol is implemented in this revision.
- R14=47k and R15=2.2k attenuate the PWM; C10=22 nF, R16=2.2k and C11=22 nF form a passive two-stage low-pass filter. C12=100 nF blocks DC into LM386 pin 3. Pin 2 and pin 4 are grounded; pins 1/8 remain unconnected for gain 20.
- U7 LM386N-1/NOPB is powered by the fused V5 rail, not the Pico's 3.3 V regulator or switched disk-contact supply. C14=47 uF and C15=100 nF decouple it; C17=22 uF bypasses pin 7. R17=10 ohm and C16=100 nF provide the output stability network. Verify stability under real speaker/wiring load.
- C13=100 uF/16 V blocks amplifier output DC. Its positive lead faces AMP_OUT; negative lead faces J6 pin 1/SPK_PLUS. This gives approximately 199 Hz nominal electrical high-pass corner into 8 ohm; the tiny speaker is intended for effects, not bass reproduction.
- J6 pin 1 is speaker positive; pin 2 is ground. Use an 8 ohm speaker rated at least 0.5 W. The selected speaker is 20 mm diameter, 3 mm high. The carrier remains entirely through-hole; the speaker itself has hand-solder pads. PUI limits hand-solder dwell to 3 seconds.
- Same Harwin two-way removable housing/contact family as the interlock. Use two 100 mm 26 AWG leads, red-mark positive, and keep them away from contacts, springs and latch. This plug is unkeyed: identify J6 and pin 1 before fitting; it is not interchangeable with J5's interlock function.
- Two M2 × 8 countersunk screws and two M2 nuts retain the printed ring. A thin foam ring touches only the metal rim. The cradle is supported from the rear wall and removes with two rear-accessible M2 × 10 countersunk screws and captive nuts, leaving the controller free for servicing. There is no load on the cone. CAD speaker is a manufacturer-dimension envelope, not a detailed supplier model. Check the actual rim, solder pads, foam compression and sound outlet on a printed sample.

## Firmware contract — not yet implemented

Use GP27 PWM with carrier at least 500 kHz and streamed mono samples (e.g. 16 kHz). Use hardware pacing/DMA; do not delay floppy servicing or interlock handling to play sound. Existing floppy code owns DMA_IRQ_0 exclusively, so audio must not replace that handler. Claim channels and use a separate interrupt or safe polling strategy. Budget RAM and flash for short sound packs; the Pico has finite onboard flash.

Provide classic disk effects, fantasy effects, volume and mute. Keep an idle 50% PWM duty and ramp to/from that midpoint to reduce clicks. Fixed attenuation limits full-scale low-frequency output to approximately 0.14 W into 8 ohm under an ideal linear gain 20 model; that is an estimate, not a measured power rating. Start at 70% digital amplitude to allow headroom at the lowest 5 V rail. Start/stop pops, PWM residue, clipping and EMI need powered tests. No sound playback capability is claimed by the current firmware.

## Power and checks

Allocate an additional 150 mA on 5 V for audio including signal peaks and margin; the existing 2A supply/fuse rating is unchanged. LM386N-1 operates from 4 V; the existing 4.55 V minimum core V5 budget leaves 0.55 V nominal margin before audio transients. Validate that margin at both amplifier and media regulator under simultaneous lighting, flash writes and loud effects. Do not infer power integrity or audio stability from a zero-DRC result.

Saved-file ERC/DRC and independent LM386/Pico/speaker pin assertions are included in the normal five-board audit. Physical sound, EMC, mechanical rattle and endurance are untested. Current Gerbers remain prototype files.

## Source references, checked 2026-11-07

- [TI LM386 datasheet](https://www.ti.com/lit/ds/symlink/lm386.pdf): pinout, gain, operating voltage, bypass and application circuits.
- [Mouser LM386N-1/NOPB](https://www.mouser.com/en/ProductDetail/Texas-Instruments/LM386N-1-NOPB?qs=QbsRYf82W3GLguMHc1jDPg%3D%3D), SKU926-LM386N-1/NOPB: PDIP8, listed in stock at review; inventory not reserved.
- [PUI AS02008MR-R](https://puiaudio.com/product/speakers-and-receivers/AS02008MR-R):8ohm,0.5W,20×3mm.
- [Mouser speaker listing](https://www.mouser.com/en/ProductDetail/PUI-Audio/AS02008MR-R?qs=e16JbV5WBEsk5k09rzRy6w%3D%3D), SKU665-AS02008MRR: listed in stock at review.
- [PUI speaker drawing and solder limit](https://www.mouser.com/datasheet/2/334/AS02008MR-R-25434.pdf).
- [KEMET22nF Mouser listing](https://www.mouser.co.uk/ProductDetail/KEMET/C315C223K5R5TA?qs=ssTRkLwZd3iQhhqUNJSk1g%3D%3D), SKU80-C315C223K5R:2.54mm lead pitch.
- [Panasonic100uF Mouser listing](https://au.mouser.com/en/ProductDetail/Panasonic-Industry/EEU-FC1C101?qs=GthJePliqcHI6kDPx1urtQ%3D%3D), SKU667-EEU-FC1C101:6.3mm diameter,11mm body,2.5mm pitch.

All other added resistors, capacitors and headers use existing project Mouser families. Recheck stock at purchase; no substitute package or polarity is implicit.
