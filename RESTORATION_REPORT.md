# main-page.swf → HTML5 restoration report

- Stage: 900 × 600
- FPS: 12.0
- Main frames: 342
- Main-page DoAction blocks: 29
- PlaceObject tags: 901
- RemoveObject2 tags: 546
- Bitmap definitions: 171 type-21 + 37 type-6 = 208 total
- Sprite definitions: 5
- Shape definitions: 239
- Button definitions: 53

## ActionScript frame anchors

1, 2, 7, 14, 26, 46, 66, 81, 96, 111, 126, 141, 156, 166, 176, 186, 196, 206, 216, 231, 246, 261, 276, 291, 301, 316, 326, 336, 342

## Explicit button navigation

- Button 52 → movie.html (_self)
- Button 53 → game.html (_self)
- Button 54 → choice.html (_self)

## Recovered bitmap data

- Browser-readable copies of all 208 bitmap definitions are in `assets/decoded/`.
- The main SWF's 179 editable text fields and linked SWFs' editable text fields were extracted to `assets/decoded/*-text.json` and per-page `text.json` files.
- The main SWF's 122 `DefineText` objects were extracted to `assets/decoded/main-page-static-text.json`; the homepage canvas now renders the first frame's text and display-list placements from the SWF data.
- ActionScript data from 278 frame, Sprite, and button action blocks across the supplied SWFs were recovered to `assets/decoded/swf-actions.json` (84 are button actions); numeric pushes and opcode sequences are retained. The guess game exposes its 25 bird names and five board sizes (4, 6, 8, 10, 12).
- 171 type-21 images were decoded from the SWF image stream and mapped back by definition order.
- 37 type-6 images were repaired with the SWF's shared JPEG tables; `bitmap_1.jpg` is the original 900 × 600 home background, and IDs 5, 7, and 9 are the three home thumbnails.
- The HTML timeline viewer now loads the repaired bitmap copies.
- Linked SWFs' JPEGs and indexed-alpha `DefineBitsLossless2` assets are extracted by `tools/extract-swfs.mjs`; the hit game uses the original egret, food, and litter sprites.
- `guide.html` displays original main-SWF frames 2–6 in the shared 900 × 600 HTML renderer; its controls step through the source frames, including the beach-loss and closing reflection frames.
- `region.html` starts at original main-SWF frame 342 and now provides selectable profiles for the three Keelung birds. Their original photo/dialogue frames are navigable: white-bellied booby 14–19, black kite 96–104, and crested tern 316–321. The timeline renderer now draws both static DefineText and extracted editable text fields, so the black kite and crested tern captions appear.
- The bird-family page now follows the eight names and the four-column, two-row grouping in main-SWF frame 7. Family species lists use the corresponding original names, including the six-item sandpiper list and three gulls.
- Opened the original SWF in the bundled Flash Player Standalone using its absolute path without quotes. Visually checked the home screen, frame 7's eight-family menu, and the first heron detail screen. The bird detail layout places the species list at left, the large photograph at right, and the description below it. All 22 menu species now use the source timeline to provide 160 photo-and-dialogue slides; next and autoplay advance within the selected species and stop at its final slide. Once the user's Go Live origin was allowed in the built-in browser, visually compared the home and heron pages at `http://127.0.0.1:5500/`; main-menu button artwork and exact frame transitions remain less faithful than the SWF.

## Remaining 1:1 work

- The source `choice.swf` has 37 question frames. `assets/decoded/choice/quiz.json` now contains each prompt, its three original options, and the exact answer index from Sprite 160; `choice.html` draws 10 randomly selected questions and scores each correct answer with the recovered 10-point value. The remaining linked HTML sections are still partial visual recreations.
- The bird guide uses the original dialogue and photographs, but flattens SWF frame transitions into per-photo pages; button animations and the original frame-by-frame timing are not reproduced.
- The supplied `source/movie.flv` was converted to browser-compatible H.264/AAC at `movie.mp4`, and `movie.html` now uses the HTML5 video player.
- Exact ShapeRecord rasterization instead of bitmap-filled bounding-box approximation.
- Exact embedded glyph/font rendering for DefineText/DefineEditText; current text uses browser fonts and recovered advances.
- Full AS1/2 VM semantics for all opcodes, rather than metadata/opcode reconstruction.
- Exact button hit areas and Button2 state rendering.
- Exact color transforms, filters, morphs and sound synchronization.
