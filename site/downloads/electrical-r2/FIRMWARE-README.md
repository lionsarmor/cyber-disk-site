# Cyber Disk firmware R1 — bench prototype

This is executable Pico 2 firmware, not a compatibility certification. It targets **controller PCB R1 and dock PCB R3**. Do not load the core image on controller R0: GPIO22/26 and the media connector have changed.

## Implemented

- Core: hardware permission input, 25 ms insertion debounce, switched media power, 10 ms startup wait, power-error/eject interrupt, exact Macronix C2 20 16 identification, bounded SPI operations and watchdog.
- A sector journal on a 4 MiB MX25L3233F: data first, metadata and CRC next, commit marker last, readback before success. Garbage collection copies and verifies live records before erasing their old block.
- PC 34-pin **read-only** 720 KiB and 1.44 MiB profiles: 80 cylinders, two heads, CRC-bearing MFM tracks, PIO/DMA flux output, 300 RPM index, step/direction/head/select/motor, disk-change and write-protect. Default select is ribbon pin12, motor pin16, for a standard twisted PC cable.
- Dock: USB full-speed **MSC/SCSI removable block storage**, sector read/write, flush, logical eject, and a CDC maintenance console. It is **not yet a USB UFI floppy device**, and no Windows/Linux hardware enumeration or boot test has been run.
- CRC-framed, bounded 1 Mbaud UART requests between the two Picos. One owner at a time; floppy selection blocks dock requests. USB ownership prevents a stale floppy track being served while USB writes. A three-second communications lease releases ownership after a silent dock disappears.
- A boot-randomised 32-bit media-generation token rejects requests against a previous insertion. Dock reports UNIT ATTENTION after generation changes. This is accidental-stale-request protection, not authentication.

## Explicitly unfinished

**34-pin WRITE DATA capture/format is not implemented.** The firmware asserts write protection rather than pretending to accept writes. Commodore IEC/DOS, fast loaders, RS-232 host protocol, ESP32 client, Spectrum Next adapter, USB UFI mode and the lighting/sound UI are also unfinished. The dock leaves its IEC sinks off and accessory outputs disabled.

A physical eject has no solenoid or firmware-controlled lock. Completed sector commits are the durability boundary. A write interrupted before acknowledgement may recover as either the old or new sector; unrelated committed sectors must survive. This does not make an entire file or FAT update atomic, and cannot save data that the computer has not sent. Eject in the OS before pressing the mechanical button.

## Build

Use Raspberry Pi Pico SDK **2.2.0** (commit `a1438dff1d38bd9c65dbd693f0e5db4b9ae91779`), its pinned TinyUSB submodule, and Arm GNU Toolchain **14.3.Rel1**. Do not vendor those dependencies into this repository.

```sh
cmake -S firmware -B /tmp/cyber-tests -DCMAKE_BUILD_TYPE=Debug
cmake --build /tmp/cyber-tests
ctest --test-dir /tmp/cyber-tests --output-on-failure

export PICO_SDK_PATH=/path/to/pico-sdk
export PICO_TOOLCHAIN_PATH=/path/to/arm-gnu-toolchain
cmake -S firmware/pico -B /tmp/cyber-pico -DPICO_BOARD=pico2 -DCMAKE_BUILD_TYPE=Release
cmake --build /tmp/cyber-pico
```

`cyber_core.uf2` goes on the drive Pico; `cyber_dock.uf2` goes on the external daughterboard Pico. Both are experimental. The USB descriptors use TinyUSB's development VID/PID; production needs an allocated identifier. BOOTSEL flashing and first powered testing have not been performed on the boards.

## Initial media preparation

Blank flash is deliberately not formatted automatically. With the drive electrically qualified, the disk fully latched, and no PC floppy cable selecting it, connect the dock's USB and open its **Maintenance** CDC port. The exact command `FORMAT 1440` followed by newline destructively creates a 2,880-sector journal. `FORMAT 720` creates 1,440 sectors. It may take several minutes. Require `FORMAT OK`; reconnect USB, then create the filesystem using the host. `RELEASE` releases the dock's media ownership.

The journal format is not a raw FAT disk image on the chip. Each side of an A/B disk has an independent chip/journal. Swapping to the other side is removal and reinsertion.

## On-flash layout

Two 4 KiB superblocks identify format/version/capacity. Every remaining 4 KiB block reserves 256 bytes, followed by five 768-byte records. Each record contains two 256-byte data pages and a metadata page. Metadata carries LBA, 64-bit sequence, data CRC32, metadata CRC32 and a four-byte commit marker at byte252; that marker is programmed in a separate operation. Torn or CRC-invalid records are ignored on mount. There are 5,110 record slots on the 4 MiB part, with a maximum of 2,880 logical sectors and space for copying during collection.

All program and erase failures invalidate the in-RAM mount. No write is reported successful until its full record has been read back. Reinsert to rescan after a fault. CRC detects accidental corruption probabilistically; it is not an ECC or a guarantee against arbitrary silicon failure. NOR wear levelling and retention/endurance qualification remain future work; the present allocator is intended for bench prototypes, not a rated media lifetime.

## Verification boundary

Host tests exercise byte-interrupted program/commit/GC erase operations, repeated overwrites and reboot scans; they are a software flash model. MFM tests independently decode complete tracks and check sector IDs, data and CRC. Wire tests reject corrupted frames. Pico SDK compilation checks the hardware API calls and generated PIO program. None replaces scope traces, real abrupt-power tests, USB interoperability or tests on an actual floppy controller.
