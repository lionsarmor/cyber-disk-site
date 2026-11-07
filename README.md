# RODDY Cyber Disk inspector

Website: https://disk.roddy.world/

GitHub Pages address (redirects to the custom domain): https://lionsarmor.github.io/cyber-disk-site/

Static 3D inspection website and downloadable prototype CAD. The development repository remains private.

GitHub Actions deploys `site/` to GitHub Pages on each push to main.

DNS: Namecheap CNAME `disk` -> `lionsarmor.github.io`, Automatic TTL. GitHub Pages custom domain is `disk.roddy.world`. All asset URLs are relative so the inspector works at the domain root.

Contact PCB R1: `?model=pcb%2Fcontact&v=contact-pcb-r1` adds the routed passive leaf-spring board, with seven free-height contact envelopes, copper, silkscreen and STEP. Drive R4 previews include the matching board outline, adjusted cassette height, relocated M2 mounts and seven cable tails. Main-board isolation and sliding durability remain unfinished.

External dock R3 / daughterboard R2: board-mounted through-hole USB-B, serial, IEC, accessory and 5V ports, with a purchased internal USB jumper. PCB remains unrouted; current drawings and reference downloads are under boards/external-r2. Superseded external model buffers were removed from the deployed site; historical revisions remain in Git.
