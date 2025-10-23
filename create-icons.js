import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

const sizes = [
  { size: 32, name: 'favicon-32.png' },
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
  { size: 180, name: 'apple-touch-icon.png' }
];

function drawIcon(ctx, size) {
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#1DB954');
  gradient.addColorStop(1, '#1aa34a');
  
  // Rounded rectangle background
  const radius = size * 0.15;
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fill();
  
  // Book icon (simplified for small sizes)
  const scale = size / 512;
  const bookX = size * 0.27;
  const bookY = size * 0.23;
  const bookWidth = size * 0.45;
  const bookHeight = size * 0.55;
  
  // Book base
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(bookX, bookY, bookWidth, bookHeight);
  
  // Book spine
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(bookX, bookY, bookWidth * 0.14, bookHeight);
  
  // Center decoration (simplified)
  const centerX = size / 2;
  const centerY = size * 0.39;
  const circleRadius = size * 0.12;
  
  ctx.strokeStyle = '#1DB954';
  ctx.lineWidth = size * 0.006;
  ctx.beginPath();
  ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
  ctx.stroke();
  
  ctx.fillStyle = '#1DB954';
  ctx.beginPath();
  ctx.arc(centerX, centerY, size * 0.016, 0, Math.PI * 2);
  ctx.fill();
  
  // Text "القرآن" (only for larger sizes)
  if (size >= 192) {
    ctx.fillStyle = '#1DB954';
    ctx.font = `bold ${size * 0.063}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('القرآن', centerX, size * 0.68);
  }
}

async function generateIcons() {
  const publicDir = path.join(process.cwd(), 'public');
  
  for (const { size, name } of sizes) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    drawIcon(ctx, size);
    
    const buffer = canvas.toBuffer('image/png');
    const filePath = path.join(publicDir, name);
    
    fs.writeFileSync(filePath, buffer);
    console.log(`✅ Created: ${name}`);
  }
  
  console.log('\n🎉 All icons generated successfully!');
}

generateIcons().catch(console.error);
