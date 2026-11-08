# RODDY Cyber Disk inspector

Website: http://disk.roddy.world/

GitHub Pages: https://lionsarmor.github.io/cyber-disk-site/ (redirects to the custom domain).

Hardware R3 publication: five routed PCBs with actual RODDY silkscreen, separate KiCad/schematic/Gerber downloads, supplier-grouped BOM, Drive R5 mechanism and External Case R4 with Daughterboard R3. The development repository remains private.

Saved-file ERC, DRC and independent pin-map checks pass with zero unrouted connections. These are prototype files: printed/powered sample qualification and real-host emulation testing remain required. Firmware is unchanged in this hardware publication.

GitHub Actions deploys `site/` to GitHub Pages on each push to main. DNS: CNAME `disk` points to `lionsarmor.github.io`. All asset URLs are relative. Obsolete generated geometry has been removed from the current deployment; historical revisions remain in Git.

Start with `?model=pcb%2Fdock&view=b&v=hardware-r3` for the branded PCB underside, `?model=drive%2Fmotion&v=hardware-r3` for the mechanism, or `?model=external%2Fservice&v=hardware-r3` for internal wiring. Board files are at `boards.html`; verification details are at `electrical.html`.
