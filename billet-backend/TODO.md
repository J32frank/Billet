# TODO: Fix Long Download Hang and Font Missing Messages

## Completed Tasks
- [x] Add TTF font files to backend repo (Roboto-Regular.ttf and Roboto-Bold.ttf in billet-backend/assets/fonts)
- [x] Register and load fonts before drawing (FontService.init() at module startup)
- [x] Use pureimage-friendly font names and syntax (changed from "bold 24px Arial" to "24px Roboto-Bold")
- [x] Attach stream listeners before encoding (moved listeners before encodePNGToStream call)
- [x] Don't end output stream too early (removed premature outStream.end(), await encoding completion first)
- [x] Add defensive logging (qrBuffer length, encodeResult type, chunk sizes, final buffer size)

## Next Steps
- [ ] Test locally with a direct request (curl/Postman to image download endpoint)
- [ ] Verify response headers (Content-Type: image/png, Content-Length, sends Buffer not stream)
- [ ] If still hangs, share startup logs, PNG generation logs, and backend route code

## Files Modified
- `billet-backend/src/services/fontService.js` (new)
- `billet-backend/src/services/pdfService.js` (font registration, syntax changes, stream fixes, logging)
- `billet-backend/assets/fonts/` (new directory with Roboto TTF files)

## Testing Command
```bash
curl -X GET "http://localhost:3000/api/public/download/{ticketId}/{token}" \
  -H "Accept: image/png" \
  -o test-ticket.png
