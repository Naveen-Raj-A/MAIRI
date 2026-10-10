// Generate MAIRI PWA icons as simple PNG files
const zlib = require('zlib')
const fs = require('fs')

function createPNG(width, height, r, g, b) {
  const crcTable = []
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    crcTable[n] = c
  }

  const crc = (buf) => {
    let c = 0xffffffff
    for (let i = 0; i < buf.length; i++) {
      c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
    }
    return (c ^ 0xffffffff) >>> 0
  }

  const chunk = (type, data) => {
    const len = Buffer.alloc(4)
    len.writeUInt32BE(data.length, 0)
    const typeBuf = Buffer.from(type, 'ascii')
    const crcBuf = Buffer.alloc(4)
    const crcVal = crc(Buffer.concat([typeBuf, data]))
    crcBuf.writeUInt32BE(crcVal, 0)
    return Buffer.concat([len, typeBuf, data, crcBuf])
  }

  // IHDR
  const ihdrData = Buffer.alloc(13)
  ihdrData.writeUInt32BE(width, 0)
  ihdrData.writeUInt32BE(height, 4)
  ihdrData[8] = 8 // bit depth
  ihdrData[9] = 2 // color type (RGB)
  ihdrData[10] = 0 // compression
  ihdrData[11] = 0 // filter
  ihdrData[12] = 0 // interlace

  // IDAT: raw pixel data with filter byte per row
  const rawRows = []
  for (let y = 0; y < height; y++) {
    rawRows.push(0) // filter byte (none)
    for (let x = 0; x < width; x++) {
      rawRows.push(r, g, b)
    }
  }
  const idatData = zlib.deflateSync(Buffer.from(rawRows))

  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdrData),
    chunk('IDAT', idatData),
    chunk('IEND', Buffer.alloc(0))
  ])

  return png
}

const sizes = [192, 512]
for (const size of sizes) {
  const png = createPNG(size, size, 9, 9, 11)
  fs.writeFileSync(`public/pwa-${size}x${size}.png`, png)
  console.log(`Created pwa-${size}x${size}.png`)
}

// Maskable icon (same color, padded)
for (const size of [192, 512]) {
  const png = createPNG(size, size, 9, 9, 11)
  fs.writeFileSync(`public/maskable-icon.png`, png)
  break
}

// Apple touch icon
const apple = createPNG(180, 180, 9, 9, 11)
fs.writeFileSync('public/apple-touch-icon.png', apple)
console.log('Created apple-touch-icon.png')

console.log('All icons generated.')