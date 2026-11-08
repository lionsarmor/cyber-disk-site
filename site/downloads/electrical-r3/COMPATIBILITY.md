# Compatibility matrix

Every host combination remains untested on hardware. R2 firmware implements PC 720 KiB/1.44 MiB read-only MFM output and USB MSC/SCSI read/write; PC write/format, USB UFI and IEC are unfinished. **Floppy-device emulation is a product requirement.** Connection, file access, drive commands, formatting, booting and unusual loader compatibility are separate milestones. See [hardware review R3](ELECTRICAL-REVIEW-R3.md) for the hardware and firmware blockers.

| Platform | Route | Intended behavior / validation |
|---|---|---|
| Windows | USB-B device connection | Implement and qualify a USB floppy profile (UFI candidate); geometry, media change, read/write/format/errors. Ordinary removable storage is a separate mode; A: and BIOS boot are not guaranteed |
| Linux | USB-B device connection | Qualify the selected USB floppy protocol/transport on named kernels; geometry, format, media change, errors and integrity. Image management may use a separate USB storage mode |
| ESP32 | Accessory adapter, provisional SPI | Select chip/dev board; library block/file access; no universal USB-host assumption |
| Commander X16 | 6-pin IEC | Selected Commodore drive profile and disk images; device addressing alongside SD, directory, LOAD/SAVE, DOS/block commands and disk changes |
| C64 | 6-pin IEC | Selected drive model, DOS commands and image/block behavior; full CPU/VIA timing, fast loaders and protected software are additional acceptance targets |
| Commodore Ultimate | IEC, model dependent | Identify full computer versus cartridge product; test device numbers and internal virtual-drive conflicts |
| ZX Spectrum Next | Expansion-edge adapter | Choose hardware issue/core/NextZXOS and storage interface; verify bus configuration, read/write, launching native Next programs |
| Legacy IBM-compatible PC | 34-pin floppy + power | Select controller/BIOS/geometry; test disk-change, write protection, boot, format, read/write on DOS/Windows 98 hardware |

Launch scope: Windows/Linux, selected ESP32 board, X16, C64/selected Ultimate, Spectrum Next. Legacy PC mode is a parallel internal-drive milestone and must be claimed separately.

USB floppy emulation must be demonstrated, not replaced by a generic USB thumb-drive demo. UFI provides a standard floppy command specification, but OS driver binding/transport must be tested; modern USB cannot reproduce direct legacy FDC register access by itself. IEC fast modes require separate implementation/testing. Next needs an active storage adapter, not a serial cable. ESP32 needs a selected board and library. RS-232 is an explicit software protocol, not an automatic floppy interface.

The same physical disk targets shared read/write data through a common container, translation and custom tools. Legacy images retain host-specific geometry; a larger flash chip does not enlarge what the original DOS/FDC can address. Define the image format, shared-data API and single-writer ownership before claiming support. Shared files do not imply shared executables or automatic content conversion.

Protocol references: [USB-IF UFI](https://www.usb.org/sites/default/files/usbmass-ufi10.pdf), [X16 hardware](https://github.com/X16Community/x16-docs/blob/master/X16%20Reference%20-%2014%20-%20Hardware.md). These describe interfaces, not tested compatibility of our device.

Outside first release: classic Macintosh, Apple II, Amiga, Atari ST/8-bit, original Spectrum variants, BBC Micro, MSX, Amstrad, other CP/M machines, consoles, and musical instruments.

Cross-host acceptance test: write files on PC, read and modify supported files on each selected retro/ESP32 host, then reconnect to PC and verify contents and filesystem integrity. Specify naming, directory and size limits per host.
