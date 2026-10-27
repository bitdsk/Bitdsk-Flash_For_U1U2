# Bitdsk browser flash tool

Re-flash a Bitdsk miner over USB, straight from the browser. No installer, no driver bundle, no
command line — the page talks to the ESP32 through the Web Serial API and writes the image from the
files in this repository. Everything happens locally; nothing is uploaded.

Live at **<https://bitdsk.github.io/bitdsk-flash/>**

---

## Supported boards

Three boards, three different devices. Pick the card that matches the label on your unit — the images
are **not interchangeable**.

| | **S1** | **U1 Touch** | **U2 Touch** |
|---|---|---|---|
| Hardware | off-the-shelf CYD board (ESP32-2432S028) | custom | custom |
| ASIC | none — the ESP32 hashes on its own | 1 | 1 |
| Hashrate | 600k–800k H/s | 200 G | 1100–1500 G |
| Power draw | USB powered | ≈10 W | ≈22–27 W |
| Supply | USB 5 V | DC / USB-C, 5 V ≈3 A | DC, 5 V ≈5 A |
| Display | 2.8″ touch | 2.8″ touch | 2.8″ touch |
| Temperature sensor | – | yes | yes |
| Firmware | free · **open source** | free download | free download |

- **S1** is not custom hardware. It runs on a generic ESP32 display board with no ASIC, so it hashes
  at a few hundred thousand H/s — it is a desk display and a learning platform, not a miner that pays
  for itself. Firmware is MIT licensed:
  [bitdsk/Bitdsk-s1-Miner](https://github.com/bitdsk/Bitdsk-s1-Miner).
- **U1 Touch** is the entry ASIC model: 200 G at ≈10 W, quiet and cheap to run continuously.
- **U2 Touch** is the same platform scaled up — 5 to 7 times the hashrate for roughly twice the power,
  with more heat and fan noise but noticeably better hashes per watt.

Flashing the wrong image is the usual cause of a board that boots to a blank screen. If in doubt,
check the model on the device before you start.

---

## Requirements

- **Desktop Chrome or Edge.** Web Serial is not available in Safari or Firefox, and not on mobile.
- **HTTPS or localhost.** On a plain `http://` origin `navigator.serial` is blocked and the page will
  tell you so. The hosted site is HTTPS, so this only matters if you serve it yourself.
- **A data-capable USB cable.** Charge-only cables are the most common reason nothing shows up.
- **Drivers on Windows.** You may need the CP210x or CH34x driver before a COM port appears.

---

## How to flash

**Before you connect**

1. Back up the **CD KEY** — web UI → Settings → System. A full erase wipes it, and it cannot be
   recovered afterwards.
2. Hold **BOOT** while plugging in if the board is unresponsive; that forces download mode.

**Flashing**

1. Click the button for your board.
2. Pick the serial port that appears (usually CP210x or CH34x).
3. Leave **Erase device** checked for a clean install.
4. Wait for *Installation complete* — do not unplug during the write.
5. After reboot, join the device's AP, open the web UI and re-enter your CD KEY.

**If something goes wrong**

| Symptom | Fix |
|---|---|
| No port listed | Install the CP210x / CH34x driver, try another cable and another USB port |
| Fails at "Connecting" | Hold BOOT while reconnecting |
| Boots but the screen stays blank | Wrong image was written — S1, U1 and U2 images are not interchangeable |

---

## Where the images come from

Each board has a `firmware/<board>/manifest.json` describing the partition map and pointing at the
five binaries in `firmware/<board>/v_*/`. The page loads the manifest and hands it to
[esp-web-tools](https://github.com/esphome/esp-web-tools), which is bundled locally under
`js/vendor/` (Apache-2.0) so the flasher works without a CDN.

Ordinary **OTA updates** do not need this page — download the `.zip` from the
[firmware archive](https://bitdsk.org/firmware.html) and upload it in the miner's web UI. Use this
tool when the board will not boot or the CD KEY has been wiped.

---

## Related repositories

| Repository | Contents |
|---|---|
| [bitdsk.github.io](https://github.com/bitdsk/bitdsk.github.io) | Main site: firmware index, docs, guides, manuals |
| **bitdsk-flash** (this repo) | This flash tool and the S1 / U1 / U2 images |
| [Bitdsk_Miner_Archive](https://github.com/bitdsk/Bitdsk_Miner_Archive) | All other firmware binaries (OTA zips, legacy, PC tools) |
| [Bitdsk-s1-Miner](https://github.com/bitdsk/Bitdsk-s1-Miner) | S1 firmware source (MIT) |

---

## Licence

Site and tooling © Bitdsk Lab. Bundled [esp-web-tools](https://github.com/esphome/esp-web-tools) is
Apache-2.0. The S1 firmware is MIT licensed — see
[Bitdsk-s1-Miner](https://github.com/bitdsk/Bitdsk-s1-Miner).
