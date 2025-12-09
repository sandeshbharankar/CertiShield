const pdfModule = require('pdf-parse');
const parsePdf =
  (typeof pdfModule === 'function' && pdfModule) ||
  (pdfModule && typeof pdfModule.default === 'function' && pdfModule.default) ||
  null;
const sharp = require("sharp");
const jsQR = require("jsqr");
const fs = require("fs");
const { 
  QRCodeReader, 
  BinaryBitmap, 
  HybridBinarizer, 
  RGBLuminanceSource, 
  DecodeHintType, 
  BarcodeFormat 
} = require('@zxing/library');

// Heuristic QR extractor: looks for JSON-like payload in text (for PDFs)
async function extractQrJson(buffer) {
  if (!parsePdf) {
    console.log('[PDF] pdf-parse not available in this environment');
    return null;
  }
  
  let data = { text: '' };
  try {
    data = await parsePdf(buffer);
  } catch (error) {
    console.log('[PDF] Error parsing PDF:', error.message);
    data = { text: '' };
  }
  
  const text = data && data.text ? data.text : '';
  if (!text.trim()) {
    console.log('[PDF] No text content found in PDF');
    return null;
  }

  console.log('[PDF] Extracted text length:', text.length);

  // Try to find the longest JSON-looking block and parse it
  const matches = text.match(/\{[\s\S]*?\}/g) || [];
  console.log('[PDF] Found', matches.length, 'JSON-like blocks');
  
  for (let i = matches.length - 1; i >= 0; i--) {
    const candidate = matches[i];
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === 'object') {
        console.log('[PDF] Successfully parsed JSON from text');
        return parsed;
      }
    } catch (_) {}
  }

  // Try to find a line like QR:(json)
  const qrLine = (text.split('\n').find(l => l.toLowerCase().includes('qr'))) || '';
  const brace = qrLine.indexOf('{');
  if (brace !== -1) {
    try {
      const parsed = JSON.parse(qrLine.slice(brace));
      console.log('[PDF] Found JSON in QR line');
      return parsed;
    } catch (_) {}
  }

  // Try to find base64-encoded JSON after markers like QR: or DATA:
  const b64Match = text.match(/(?:QR|DATA)[:=]\s*([A-Za-z0-9+/=]{20,})/i);
  if (b64Match) {
    try {
      const decoded = Buffer.from(b64Match[1], 'base64').toString('utf8');
      const parsed = JSON.parse(decoded);
      console.log('[PDF] Found and decoded base64 JSON');
      return parsed;
    } catch (_) {}
  }

  console.log('[PDF] No valid JSON/QR found in PDF text');
  return null;
}

module.exports = { extractQrJson };

// Main QR extraction function for images
async function extractQrFromImage(filePath) {
  try {
    console.log('[QR] Starting QR extraction from:', filePath);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log('[QR] ERROR: File does not exist:', filePath);
      return null;
    }
    
    // Read image metadata
    console.log('[QR] Reading image metadata...');
    const image = sharp(filePath);
    const metadata = await image.metadata();
    
    const width = metadata.width;
    const height = metadata.height;
    
    console.log('[QR] Image dimensions:', { width, height, format: metadata.format });
    
    // Strategy 1: Try bottom-left quadrant first (most common location)
    console.log('[QR] Strategy 1: Scanning bottom-left quadrant...');
    
    // Define bottom-left quadrant - adjust these values as needed
    const left = 0;
    const top = Math.floor(height * 0.65); // Start from 65% down (bottom 35%)
    const cropWidth = Math.floor(width * 0.35); // Take 35% of width from left
    const cropHeight = Math.floor(height * 0.35); // Take 35% of height
    
    // Ensure we're not cropping outside image bounds
    const safeLeft = Math.max(0, left);
    const safeTop = Math.max(0, top);
    const safeWidth = Math.min(cropWidth, width - safeLeft);
    const safeHeight = Math.min(cropHeight, height - safeTop);
    
    console.log('[QR] Cropping bottom-left:', { 
      left: safeLeft, top: safeTop, width: safeWidth, height: safeHeight 
    });
    
    try {
      // Extract and process the cropped region
      const { data, info } = await image
        .extract({ left: safeLeft, top: safeTop, width: safeWidth, height: safeHeight })
        .ensureAlpha() // Ensures 4 channels (RGBA)
        .raw()         // Get raw pixel data
        .toBuffer({ resolveWithObject: true });
      
      console.log('[QR] Cropped region size:', { 
        width: info.width, 
        height: info.height 
      });
      
      // Try to decode QR with jsQR
      const code = jsQR(new Uint8ClampedArray(data), info.width, info.height, {
        inversionAttempts: 'dontInvert',
      });
      
      if (code && code.data) {
        console.log('[QR] ✅ QR code found in bottom-left quadrant!');
        console.log('[QR] Data length:', code.data.length);
        
        return processQrData(code.data);
      }
    } catch (cropError) {
      console.log('[QR] Bottom-left crop failed:', cropError.message);
    }
    
    // Strategy 2: Try ZXing library on full image
    console.log('[QR] Strategy 2: Trying ZXing on full image...');
    try {
      const zxingResult = await tryZxingDecode(filePath);
      if (zxingResult) {
        console.log('[QR] ✅ ZXing decoded successfully');
        return zxingResult;
      }
    } catch (zxingError) {
      console.log('[QR] ZXing failed:', zxingError.message);
    }
    
    // Strategy 3: Try full image with jsQR
    console.log('[QR] Strategy 3: Scanning full image...');
    try {
      const fullImage = sharp(filePath);
      const { data: fullData, info: fullInfo } = await fullImage
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      
      const fullCode = jsQR(new Uint8ClampedArray(fullData), fullInfo.width, fullInfo.height, {
        inversionAttempts: 'dontInvert',
      });
      
      if (fullCode && fullCode.data) {
        console.log('[QR] ✅ QR code found in full image scan!');
        return processQrData(fullCode.data);
      }
    } catch (fullError) {
      console.log('[QR] Full image scan failed:', fullError.message);
    }
    
    // Strategy 4: Try multiple quadrants
    console.log('[QR] Strategy 4: Scanning all quadrants...');
    const quadrants = [
      { name: 'top-left', left: 0, top: 0, width: width * 0.5, height: height * 0.5 },
      { name: 'top-right', left: width * 0.5, top: 0, width: width * 0.5, height: height * 0.5 },
      { name: 'bottom-left', left: 0, top: height * 0.5, width: width * 0.5, height: height * 0.5 },
      { name: 'bottom-right', left: width * 0.5, top: height * 0.5, width: width * 0.5, height: height * 0.5 },
    ];
    
    for (const quadrant of quadrants) {
      console.log(`[QR] Scanning ${quadrant.name} quadrant...`);
      try {
        const quadrantImage = sharp(filePath);
        const { data: qData, info: qInfo } = await quadrantImage
          .extract({
            left: Math.floor(quadrant.left),
            top: Math.floor(quadrant.top),
            width: Math.floor(quadrant.width),
            height: Math.floor(quadrant.height)
          })
          .ensureAlpha()
          .raw()
          .toBuffer({ resolveWithObject: true });
        
        const qCode = jsQR(new Uint8ClampedArray(qData), qInfo.width, qInfo.height, {
          inversionAttempts: 'dontInvert',
        });
        
        if (qCode && qCode.data) {
          console.log(`[QR] ✅ QR found in ${quadrant.name} quadrant!`);
          return processQrData(qCode.data);
        }
      } catch (qError) {
        // Continue to next quadrant
      }
    }
    
    console.log('[QR] ❌ No QR code found in any scan strategy');
    return null;
    
  } catch (error) {
    console.error('[QR] ERROR in extractQrFromImage:', error.message);
    console.error('[QR] Stack trace:', error.stack);
    return null;
  }
}

// Helper function to process QR data
function processQrData(qrData) {
  if (!qrData || typeof qrData !== 'string') {
    return null;
  }
  
  const trimmedData = qrData.trim();
  
  // Try to parse as JSON
  try {
    const jsonData = JSON.parse(trimmedData);
    console.log('[QR] Successfully parsed as JSON');
    
    // Extract issuedTo from various possible JSON structures
    let issuedTo = null;
    
    if (jsonData.credentialSubject && jsonData.credentialSubject.issuedTo) {
      issuedTo = jsonData.credentialSubject.issuedTo;
    } else if (jsonData.issuedTo) {
      issuedTo = jsonData.issuedTo;
    } else if (jsonData.credentialSubject && jsonData.credentialSubject.name) {
      issuedTo = jsonData.credentialSubject.name;
    } else if (jsonData.name) {
      issuedTo = jsonData.name;
    }
    
    // Add issuedTo to the result if found
    if (issuedTo) {
      jsonData.issuedTo = issuedTo;
    }
    
    return jsonData;
  } catch (jsonError) {
    console.log('[QR] Not valid JSON, analyzing raw text...');
    
    // Check if it's a URL
    if (trimmedData.startsWith('http://') || trimmedData.startsWith('https://')) {
      console.log('[QR] Found URL:', trimmedData);
      return { raw: trimmedData, isUrl: true };
    }
    
    // Try to extract name from raw text
    const nameMatch = trimmedData.match(/issuedTo[:\s]+([^\n\r]+)/i) || 
                     trimmedData.match(/name[:\s]+([^\n\r]+)/i) ||
                     trimmedData.match(/student[:\s]+([^\n\r]+)/i);
    
    if (nameMatch && nameMatch[1]) {
      console.log('[QR] Extracted name from raw text:', nameMatch[1]);
      return { raw: trimmedData, issuedTo: nameMatch[1].trim() };
    }
    
    // Return raw data
    console.log('[QR] Returning raw text, length:', trimmedData.length);
    return { raw: trimmedData };
  }
}

// Helper function for ZXing decoding
async function tryZxingDecode(filePath) {
  try {
    // Read image with sharp
    const imageBuffer = await sharp(filePath)
      .ensureAlpha()
      .raw()
      .toBuffer();
    
    const metadata = await sharp(filePath).metadata();
    
    // Convert to Uint8ClampedArray
    const rgba = new Uint8ClampedArray(imageBuffer);
    
    // Use ZXing
    const luminance = new RGBLuminanceSource(rgba, metadata.width, metadata.height);
    const reader = new QRCodeReader();
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
    hints.set(DecodeHintType.TRY_HARDER, true);
    
    // Try HybridBinarizer
    try {
      const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminance));
      const result = reader.decode(binaryBitmap, hints);
      if (result && result.getText) {
        const raw = result.getText().trim();
        console.log('[ZXING] Decoded QR:', raw.substring(0, 100));
        return processQrData(raw);
      }
    } catch (e) {
      // Try alternative binarizer if first fails
      try {
        const binaryBitmap2 = new BinaryBitmap(new GlobalHistogramBinarizer(luminance));
        const result2 = reader.decode(binaryBitmap2, hints);
        if (result2 && result2.getText) {
          const raw = result2.getText().trim();
          console.log('[ZXING] Decoded QR with histogram:', raw.substring(0, 100));
          return processQrData(raw);
        }
      } catch (e2) {
        console.log('[ZXING] Both binarizers failed');
      }
    }
    
    return null;
  } catch (error) {
    console.log('[ZXING] Error:', error.message);
    return null;
  }
}

module.exports.extractQrFromImage = extractQrFromImage;