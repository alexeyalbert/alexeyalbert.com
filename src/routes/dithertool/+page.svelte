<script lang="ts">
  import { onMount } from 'svelte';
  
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let originalImage: HTMLImageElement;
  let imageData: ImageData;
  
  let fileInput: HTMLInputElement;
  let isDraggingOverUpload = false;
  let uploadedFileName = '';
  let resizeObserver: ResizeObserver | null = null;

  // Control parameters
  let exposure = 0;
  let brightness = 0;
  let contrast = 0;
  let primaryColor = '#000000';
  let secondaryColor = '#ffffff';
  let scale = 1;
  let ditherMethod = 'bayer';
  let bayerSize = 8; // 2, 4, 8, 16, 32, 64
  let bayerAmount = 1; // 0-2, controls dithering intensity
  let ditheringEnabled = true; // allow turning dithering off
  
  // Overlay controls
  let overlayImage: HTMLImageElement | null = null;
  let overlayEnabled = false;
  let overlayOpacity = 0.4; // 0-1
  let overlayBlendMode: GlobalCompositeOperation = 'overlay';
  let overlayTintColor = '#71ff00';
  let overlayTintOpacity = 0.8; // 0-1, stronger default tint
  let tintBlendMode: GlobalCompositeOperation = 'color';
  let baseDesaturate = 0.5; // 0-1, reduce original color before tint
  type OverlaySource = 'upload' | 'generated';
  let overlaySource: OverlaySource = 'generated';
  // Generated grain controls
  let grainScale = 1; // pattern scale (0.5 - 4)
  let grainIntensity = 0.6; // how strong the grain contrast is (0-2)
  let grainMonochrome = true;
  let grainTileSize = 256; // px for generated tile
  let grainCacheKey = '';
  let grainTileCanvas: HTMLCanvasElement | null = null;
  // Track CSS display size of the canvas to normalize grain size visually
  let canvasDisplayWidth = 0;
  let canvasDisplayHeight = 0;

  function toggleDithering() {
    ditheringEnabled = !ditheringEnabled;
    if (originalImage) processImage();
  }

  function toggleOverlay() {
    overlayEnabled = !overlayEnabled;
    if (overlayEnabled && !overlaySource) {
      overlaySource = 'generated';
    }
    if (originalImage) processImage();
  }
  const overlayBlendModes: GlobalCompositeOperation[] = [
    'overlay',
    'soft-light',
    'multiply',
    'screen',
    'hard-light',
    'color-burn',
    'color-dodge',
    'lighten',
    'darken',
    'difference',
    'exclusion',
    'hue',
    'saturation',
    'color',
    'luminosity'
  ];
  const tintBlendModes: GlobalCompositeOperation[] = [
    'color',
    'overlay',
    'soft-light',
    'multiply',
    'screen',
    'hue',
    'saturation',
    'luminosity'
  ];
  
  // Dithering method options
  const ditherMethods = [
    { value: 'threshold', label: 'Threshold (Simple)' },
    { value: 'bayer', label: 'Bayer Matrix' },
    { value: 'blue-noise', label: 'Blue Noise' },
    { value: 'simple-error', label: 'Simple Error Diffusion' },
    { value: 'floyd-steinberg', label: 'Floyd-Steinberg' },
    { value: 'jarvis-judice-ninke', label: 'Jarvis-Judice-Ninke' },
    { value: 'atkinson', label: 'Atkinson' },
    { value: 'riemersma', label: 'Riemersma' }
  ];
  
  // Generate Bayer matrix of any power-of-2 size
  function generateBayerMatrix(size: number): number[][] {
    if (size === 1) {
      return [[0]];
    }
    
    if (size === 2) {
      return [
        [0, 2],
        [3, 1]
      ];
    }
    
    const half = size / 2;
    const smaller = generateBayerMatrix(half);
    const matrix = Array(size).fill(0).map(() => Array(size).fill(0));
    
    // Fill quadrants using recursive pattern
    for (let i = 0; i < half; i++) {
      for (let j = 0; j < half; j++) {
        const baseValue = smaller[i][j];
        matrix[i][j] = baseValue * 4;                           // Top-left
        matrix[i][j + half] = baseValue * 4 + 2;                // Top-right
        matrix[i + half][j] = baseValue * 4 + 3;                // Bottom-left
        matrix[i + half][j + half] = baseValue * 4 + 1;         // Bottom-right
      }
    }
    
    return matrix;
  }
  
  // Cache for generated matrices
  const bayerMatrixCache = new Map<number, number[][]>();
  
  function getBayerMatrix(size: number): number[][] {
    if (!bayerMatrixCache.has(size)) {
      bayerMatrixCache.set(size, generateBayerMatrix(size));
    }
    return bayerMatrixCache.get(size)!;
  }
  
  // Blue noise texture (simplified blue noise generation)
  let blueNoiseTexture: number[][] = [];
  
  function generateBlueNoise(size: number = 64): number[][] {
    const texture = Array(size).fill(0).map(() => Array(size).fill(0));
    
    // Simplified blue noise generation using Mitchell's best-candidate algorithm
    const points: Array<{x: number, y: number}> = [];
    const numPoints = Math.floor(size * size * 0.5);
    
    for (let i = 0; i < numPoints; i++) {
      let bestCandidate = null;
      let bestDistance = -1;
      
      // Try multiple candidates
      for (let j = 0; j < 30; j++) {
        const candidate = {
          x: Math.floor(Math.random() * size),
          y: Math.floor(Math.random() * size)
        };
        
        let minDistance = Infinity;
        for (const point of points) {
          const dx = candidate.x - point.x;
          const dy = candidate.y - point.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          minDistance = Math.min(minDistance, distance);
        }
        
        if (minDistance > bestDistance) {
          bestDistance = minDistance;
          bestCandidate = candidate;
        }
      }
      
      if (bestCandidate) {
        points.push(bestCandidate);
        texture[bestCandidate.y][bestCandidate.x] = 1;
      }
    }
    
    return texture;
  }
  
  // Hilbert curve for Riemersma dithering
  function* hilbertCurve(order: number, width: number, height: number) {
    function* hilbert(x: number, y: number, xi: number, xj: number, yi: number, yj: number, n: number): Generator<{x: number, y: number}, void, unknown> {
      if (n <= 0) {
        const X = x + (xi + yi) / 2;
        const Y = y + (xj + yj) / 2;
        if (X >= 0 && X < width && Y >= 0 && Y < height) {
          yield {x: Math.floor(X), y: Math.floor(Y)};
        }
      } else {
        yield* hilbert(x, y, yi/2, yj/2, xi/2, xj/2, n - 1);
        yield* hilbert(x + xi/2, y + xj/2, xi/2, xj/2, yi/2, yj/2, n - 1);
        yield* hilbert(x + xi/2 + yi/2, y + xj/2 + yj/2, xi/2, xj/2, yi/2, yj/2, n - 1);
        yield* hilbert(x + xi/2 + yi, y + xj/2 + yj, -yi/2, -yj/2, -xi/2, -xj/2, n - 1);
      }
    }
    
    yield* hilbert(0, 0, width, 0, 0, height, order);
  }
  
  onMount(() => {
    ctx = canvas.getContext('2d')!;
    blueNoiseTexture = generateBlueNoise(64);
    // Track canvas display size for proper grain normalization
    if (canvas) {
      resizeObserver = new ResizeObserver(() => {
        const rect = canvas.getBoundingClientRect();
        canvasDisplayWidth = rect.width;
        canvasDisplayHeight = rect.height;
      });
      resizeObserver.observe(canvas);
    }
    return () => {
      if (resizeObserver && canvas) resizeObserver.disconnect();
    };
  });
  
  function processSelectedFile(file: File) {
    uploadedFileName = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        originalImage = img;
        processImage();
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  function handleImageUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    processSelectedFile(file);
  }

  function handleDragEnter(event: DragEvent) {
    event.preventDefault();
    isDraggingOverUpload = true;
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    isDraggingOverUpload = true;
  }

  function handleDragLeave(event: DragEvent) {
    event.preventDefault();
    isDraggingOverUpload = false;
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    isDraggingOverUpload = false;
    const file = event.dataTransfer?.files?.[0];
    if (!file) return;
    processSelectedFile(file);
  }
  
  function handleOverlayUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        overlayImage = img;
        if (overlayEnabled && originalImage) processImage();
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  function ensureGrainTile(): HTMLCanvasElement {
    const key = JSON.stringify({ grainScale, grainIntensity, grainMonochrome, grainTileSize });
    if (grainTileCanvas && grainCacheKey === key) return grainTileCanvas;
    const tile = document.createElement('canvas');
    tile.width = grainTileSize;
    tile.height = grainTileSize;
    const tctx = tile.getContext('2d')!;
    const id = tctx.createImageData(grainTileSize, grainTileSize);
    const d = id.data;
    for (let y = 0; y < grainTileSize; y++) {
      for (let x = 0; x < grainTileSize; x++) {
        const i = (y * grainTileSize + x) * 4;
        // Base noise 0..1
        const n = Math.random();
        // Apply intensity as contrast around 0.5
        const contrasted = 0.5 + (n - 0.5) * (1 + grainIntensity);
        const v = Math.max(0, Math.min(255, Math.round(contrasted * 255)));
        if (grainMonochrome) {
          d[i] = v; d[i + 1] = v; d[i + 2] = v; d[i + 3] = 255;
        } else {
          // Slight channel variations for colored grain
          d[i] = Math.max(0, Math.min(255, v + Math.round((Math.random() - 0.5) * 20)));
          d[i + 1] = Math.max(0, Math.min(255, v + Math.round((Math.random() - 0.5) * 20)));
          d[i + 2] = Math.max(0, Math.min(255, v + Math.round((Math.random() - 0.5) * 20)));
          d[i + 3] = 255;
        }
      }
    }
    tctx.putImageData(id, 0, 0);
    grainTileCanvas = tile;
    grainCacheKey = key;
    return tile;
  }
  
  function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }
  
  function rgbToGrayscale(r: number, g: number, b: number): number {
    return 0.299 * r + 0.587 * g + 0.114 * b;
  }
  
  function adjustPixel(value: number, exposure: number, brightness: number, contrast: number): number {
    value *= Math.pow(2, exposure);
    value += brightness * 255;
    value = ((value - 128) * (contrast + 1)) + 128;
    return Math.max(0, Math.min(255, value));
  }
  
  function srgbToLinear(value: number): number {
    value /= 255;
    if (value <= 0.04045) {
      return value / 12.92;
    } else {
      return Math.pow((value + 0.055) / 1.055, 2.4);
    }
  }
  
  function linearToSrgb(value: number): number {
    if (value <= 0.0031308) {
      return 12.92 * value * 255;
    } else {
      return (1.055 * Math.pow(value, 1.0 / 2.4) - 0.055) * 255;
    }
  }
  
  function bayerDither(grayscale: number, x: number, y: number, matrixSize: number, amount: number): boolean {
    const matrix = getBayerMatrix(matrixSize);
    const threshold = matrix[y % matrixSize][x % matrixSize];
    const maxValue = matrixSize * matrixSize;
    const normalizedThreshold = (threshold / maxValue) * amount;
    const normalizedGrayscale = grayscale / 255;
    
    return normalizedGrayscale > normalizedThreshold;
  }
  
  function blueNoiseDither(grayscale: number, x: number, y: number): boolean {
    const textureSize = blueNoiseTexture.length;
    const noiseValue = blueNoiseTexture[y % textureSize][x % textureSize];
    const normalizedGrayscale = grayscale / 255;
    
    return normalizedGrayscale > noiseValue;
  }
  
  function thresholdDither(grayscale: number): boolean {
    return grayscale > 127.5;
  }
  
  function errorDiffusion(
    data: Uint8ClampedArray, 
    width: number, 
    height: number, 
    diffusionMatrix: Array<Array<{x: number, y: number, weight: number}>>
  ) {
    const grayscaleData = new Float32Array(width * height);
    
    // Convert to grayscale and apply adjustments
    for (let i = 0; i < data.length; i += 4) {
      const pixelIndex = i / 4;
      let grayscale = rgbToGrayscale(data[i], data[i + 1], data[i + 2]);
      grayscale = adjustPixel(grayscale, exposure, brightness, contrast);
      grayscaleData[pixelIndex] = grayscale;
    }
    
    const primary = hexToRgb(primaryColor);
    const secondary = hexToRgb(secondaryColor);
    
    // Apply error diffusion
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        const oldPixel = grayscaleData[index];
        const newPixel = oldPixel > 127.5 ? 255 : 0;
        const error = oldPixel - newPixel;
        
        grayscaleData[index] = newPixel;
        
        // Distribute error
        for (const diffusion of diffusionMatrix) {
          for (const offset of diffusion) {
            const newX = x + offset.x;
            const newY = y + offset.y;
            if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
              const newIndex = newY * width + newX;
              grayscaleData[newIndex] += error * offset.weight;
            }
          }
        }
        
        // Set pixel color
        const pixelIndex = index * 4;
        if (newPixel > 127.5) {
          data[pixelIndex] = secondary.r;
          data[pixelIndex + 1] = secondary.g;
          data[pixelIndex + 2] = secondary.b;
        } else {
          data[pixelIndex] = primary.r;
          data[pixelIndex + 1] = primary.g;
          data[pixelIndex + 2] = primary.b;
        }
      }
    }
  }
  
  function riemersaDither(data: Uint8ClampedArray, width: number, height: number) {
    const grayscaleData = new Float32Array(width * height);
    const processedData = new Uint8ClampedArray(data.length);
    processedData.set(data);
    
    // Convert to grayscale and apply adjustments
    for (let i = 0; i < data.length; i += 4) {
      const pixelIndex = i / 4;
      let grayscale = rgbToGrayscale(data[i], data[i + 1], data[i + 2]);
      grayscale = adjustPixel(grayscale, exposure, brightness, contrast);
      grayscaleData[pixelIndex] = grayscale;
    }
    
    const primary = hexToRgb(primaryColor);
    const secondary = hexToRgb(secondaryColor);
    
    // Riemersma parameters
    const historySize = 32;
    const falloff = 1/8;
    const errorHistory: number[] = [];
    
    // Calculate appropriate order for Hilbert curve
    const order = Math.ceil(Math.log2(Math.max(width, height)));
    
    // Process pixels in Hilbert curve order
    for (const point of hilbertCurve(order, width, height)) {
      const index = point.y * width + point.x;
      let pixelValue = grayscaleData[index];
      
      // Add weighted error from history
      for (let i = 0; i < errorHistory.length; i++) {
        const weight = Math.pow(falloff, i / (historySize - 1));
        pixelValue += errorHistory[i] * weight;
      }
      
      // Quantize
      const newPixel = pixelValue > 127.5 ? 255 : 0;
      const error = pixelValue - newPixel;
      
      // Update error history
      errorHistory.unshift(error);
      if (errorHistory.length > historySize) {
        errorHistory.pop();
      }
      
      // Set pixel color
      const pixelIndex = index * 4;
      if (newPixel > 127.5) {
        processedData[pixelIndex] = secondary.r;
        processedData[pixelIndex + 1] = secondary.g;
        processedData[pixelIndex + 2] = secondary.b;
      } else {
        processedData[pixelIndex] = primary.r;
        processedData[pixelIndex + 1] = primary.g;
        processedData[pixelIndex + 2] = primary.b;
      }
    }
    
    data.set(processedData);
  }
  
  function renderInto(targetCtx: CanvasRenderingContext2D, targetWidth: number, targetHeight: number, cssCompScale: number) {
    targetCtx.imageSmoothingEnabled = false;
    targetCtx.clearRect(0, 0, targetWidth, targetHeight);
    targetCtx.drawImage(originalImage, 0, 0, targetWidth, targetHeight);
    const id = targetCtx.getImageData(0, 0, targetWidth, targetHeight);
    imageData = id;
    const data = id.data;
    const primary = hexToRgb(primaryColor);
    const secondary = hexToRgb(secondaryColor);
    const width = targetWidth;
    const height = targetHeight;

    switch (ditheringEnabled ? ditherMethod : 'none') {
      case 'none':
        // Apply exposure/brightness/contrast to the original RGB image
        for (let i = 0; i < data.length; i += 4) {
          data[i] = adjustPixel(data[i], exposure, brightness, contrast);
          data[i + 1] = adjustPixel(data[i + 1], exposure, brightness, contrast);
          data[i + 2] = adjustPixel(data[i + 2], exposure, brightness, contrast);
        }
        break;
      case 'threshold':
        for (let i = 0; i < data.length; i += 4) {
          let grayscale = rgbToGrayscale(data[i], data[i + 1], data[i + 2]);
          grayscale = adjustPixel(grayscale, exposure, brightness, contrast);
          const useSecondary = thresholdDither(grayscale);
          if (useSecondary) { data[i] = secondary.r; data[i + 1] = secondary.g; data[i + 2] = secondary.b; }
          else { data[i] = primary.r; data[i + 1] = primary.g; data[i + 2] = primary.b; }
        }
        break;
      case 'bayer':
        for (let i = 0; i < data.length; i += 4) {
          const x = Math.floor((i / 4) % width);
          const y = Math.floor((i / 4) / width);
          let grayscale = rgbToGrayscale(data[i], data[i + 1], data[i + 2]);
          grayscale = adjustPixel(grayscale, exposure, brightness, contrast);
          const useSecondary = bayerDither(grayscale, x, y, bayerSize, bayerAmount);
          if (useSecondary) { data[i] = secondary.r; data[i + 1] = secondary.g; data[i + 2] = secondary.b; }
          else { data[i] = primary.r; data[i + 1] = primary.g; data[i + 2] = primary.b; }
        }
        break;
      case 'blue-noise':
        for (let i = 0; i < data.length; i += 4) {
          const x = Math.floor((i / 4) % width);
          const y = Math.floor((i / 4) / width);
          let grayscale = rgbToGrayscale(data[i], data[i + 1], data[i + 2]);
          grayscale = adjustPixel(grayscale, exposure, brightness, contrast);
          const useSecondary = blueNoiseDither(grayscale, x, y);
          if (useSecondary) { data[i] = secondary.r; data[i + 1] = secondary.g; data[i + 2] = secondary.b; }
          else { data[i] = primary.r; data[i + 1] = primary.g; data[i + 2] = primary.b; }
        }
        break;
      case 'simple-error':
        errorDiffusion(data, width, height, [[{x: 1, y: 0, weight: 0.5}, {x: 0, y: 1, weight: 0.5}]]);
        break;
      case 'floyd-steinberg':
        errorDiffusion(data, width, height, [[
          {x: 1, y: 0, weight: 7/16},
          {x: -1, y: 1, weight: 3/16},
          {x: 0, y: 1, weight: 5/16},
          {x: 1, y: 1, weight: 1/16}
        ]]);
        break;
      case 'jarvis-judice-ninke':
        errorDiffusion(data, width, height, [[
          {x: 1, y: 0, weight: 7/48},
          {x: 2, y: 0, weight: 5/48},
          {x: -2, y: 1, weight: 3/48},
          {x: -1, y: 1, weight: 5/48},
          {x: 0, y: 1, weight: 7/48},
          {x: 1, y: 1, weight: 5/48},
          {x: 2, y: 1, weight: 3/48},
          {x: -2, y: 2, weight: 1/48},
          {x: -1, y: 2, weight: 3/48},
          {x: 0, y: 2, weight: 5/48},
          {x: 1, y: 2, weight: 3/48},
          {x: 2, y: 2, weight: 1/48}
        ]]);
        break;
      case 'atkinson':
        errorDiffusion(data, width, height, [[
          {x: 1, y: 0, weight: 1/8},
          {x: 2, y: 0, weight: 1/8},
          {x: -1, y: 1, weight: 1/8},
          {x: 0, y: 1, weight: 1/8},
          {x: 1, y: 1, weight: 1/8},
          {x: 0, y: 2, weight: 1/8}
        ]]);
        break;
      case 'riemersma':
        riemersaDither(data, width, height);
        break;
    }

    targetCtx.putImageData(id, 0, 0);
    if (overlayEnabled) {
      applyOverlayToContext(targetCtx, targetWidth, targetHeight, cssCompScale);
    }
  }

  function processImage() {
    if (!originalImage || !ctx || !canvas) return;
    // Fill width of container via CSS and render at device-pixel-accurate backing size
    updateCanvasDisplaySize(originalImage.width, originalImage.height);
    const dpr = window.devicePixelRatio || 1;
    const cssWidth = canvas.getBoundingClientRect().width || 1;
    const aspectRatio = originalImage.width / originalImage.height;
    const cssHeight = cssWidth / aspectRatio;
    canvas.width = Math.max(1, Math.round(cssWidth * dpr));
    canvas.height = Math.max(1, Math.round(cssHeight * dpr));
    renderInto(ctx, canvas.width, canvas.height, dpr);
  }
  
  function applyOverlayToContext(context: CanvasRenderingContext2D, targetWidth: number, targetHeight: number, cssCompScale: number) {
    if (!context) return;
    context.save();
    
    // Optionally desaturate the base to reduce original colors bleeding through
    if (baseDesaturate > 0) {
      const id = context.getImageData(0, 0, targetWidth, targetHeight);
      const d = id.data;
      const a = Math.max(0, Math.min(1, baseDesaturate));
      for (let i = 0; i < d.length; i += 4) {
        const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        d[i] = d[i] * (1 - a) + gray * a;
        d[i + 1] = d[i + 1] * (1 - a) + gray * a;
        d[i + 2] = d[i + 2] * (1 - a) + gray * a;
      }
      context.putImageData(id, 0, 0);
    }
    
    if (overlaySource === 'upload' && overlayImage) {
      context.globalAlpha = overlayOpacity;
      context.globalCompositeOperation = overlayBlendMode;
      // cover-fit the overlay image to the canvas
      const ow = overlayImage.width;
      const oh = overlayImage.height;
      const scaleCover = Math.max(targetWidth / ow, targetHeight / oh);
      const dw = ow * scaleCover;
      const dh = oh * scaleCover;
      const dx = (targetWidth - dw) / 2;
      const dy = (targetHeight - dh) / 2;
      context.drawImage(overlayImage, dx, dy, dw, dh);
    } else if (overlaySource === 'generated') {
      const tile = ensureGrainTile();
      const pattern = context.createPattern(tile, 'repeat');
      if (pattern) {
        context.globalAlpha = overlayOpacity;
        context.globalCompositeOperation = overlayBlendMode;
        context.fillStyle = pattern as unknown as string;
        // scale pattern for grain size
        context.save();
        const s = Math.max(0.25, Math.min(4, grainScale));
        // Compensate for CSS downscaling so grain appears consistent across image sizes
        const scaleFactor = s * cssCompScale;
        context.scale(scaleFactor, scaleFactor);
        context.fillRect(0, 0, targetWidth / scaleFactor, targetHeight / scaleFactor);
        context.restore();
      }
    }
    
    if (overlayTintOpacity > 0) {
      context.globalAlpha = overlayTintOpacity;
      context.globalCompositeOperation = tintBlendMode;
      context.fillStyle = overlayTintColor;
      context.fillRect(0, 0, targetWidth, targetHeight);
    }
    context.restore();
  }
  
  function applyGrainOverlay() {
    overlayEnabled = true;
    overlaySource = 'generated';
    if (originalImage) processImage();
  }
  
  function clearGrainOverlay() {
    overlayEnabled = false;
    if (originalImage) processImage();
  }
  
  function updateCanvasDisplaySize(width: number, height: number) {
    if (!canvas) return;
    // Fill container width while preserving aspect ratio
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    const rect = canvas.getBoundingClientRect();
    canvasDisplayWidth = rect.width;
    canvasDisplayHeight = rect.height;
  }
  
  function downloadImage() {
    if (!canvas || !originalImage) return;
    const link = document.createElement('a');
    link.download = buildDownloadFilename();
    const exportWidth = Math.floor(originalImage.width * scale);
    const exportHeight = Math.floor(originalImage.height * scale);
    const off = document.createElement('canvas');
    off.width = exportWidth;
    off.height = exportHeight;
    const octx = off.getContext('2d')!;
    renderInto(octx, exportWidth, exportHeight, 1);
    link.href = off.toDataURL();
    link.click();
  }

  function buildDownloadFilename(): string {
    const safe = (s: string) => s.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$|\.$/g, '');
    const stripExt = (name: string) => name.replace(/\.[^.]+$/, '');
    const fmt = (n: number, digits = 2) => {
      const s = n.toFixed(digits);
      return s.replace(/\.?(0+)$/, '');
    };
    const hex = (h: string) => h.replace('#', '').toLowerCase();

    const methodPart = (() => {
      if (!ditheringEnabled) return 'none';
      if (ditherMethod === 'bayer') return `bayer-${bayerSize}x${bayerSize}-amt${fmt(bayerAmount)}`;
      return ditherMethod;
    })();

    const colorPart = `colors-${hex(primaryColor)}-${hex(secondaryColor)}`;
    const adjPart = `exp${fmt(exposure)}_bri${fmt(brightness)}_con${fmt(contrast)}`;
    const scalePart = `scale-${fmt(scale)}`;

    let overlayPart = '';
    if (overlayEnabled) {
      if (overlaySource === 'generated') {
        overlayPart = `_overlay-grain_op${fmt(overlayOpacity)}_${safe(overlayBlendMode)}_gs${fmt(grainScale)}_gi${fmt(grainIntensity)}_${grainMonochrome ? 'mono' : 'color'}_tint-${hex(overlayTintColor)}-op${fmt(overlayTintOpacity)}_desat${fmt(baseDesaturate)}`;
      } else {
        overlayPart = `_overlay-upload_op${fmt(overlayOpacity)}_${safe(overlayBlendMode)}_tint-${hex(overlayTintColor)}-op${fmt(overlayTintOpacity)}_desat${fmt(baseDesaturate)}`;
      }
    }

    const baseName = uploadedFileName ? safe(stripExt(uploadedFileName)) + '_' : '';
    const finalName = `${baseName}dither_${methodPart}_${colorPart}_${adjPart}_${scalePart}${overlayPart}.png`;
    return finalName;
  }
  
  // React to parameter changes
  $: if (originalImage) {
    exposure, brightness, contrast, primaryColor, secondaryColor, scale, ditherMethod, bayerSize, bayerAmount, ditheringEnabled,
    overlayEnabled, overlayOpacity, overlayBlendMode, overlayTintColor, overlayTintOpacity, tintBlendMode, baseDesaturate, overlayImage, overlaySource,
    grainScale, grainIntensity, grainMonochrome;
    processImage();
  }
</script>

<main>
  <h1>DitherTool</h1>
  <p>Upload an image and apply various dithering algorithms or a tinted grain overlay</p>
  
  <div class="container">
    <div class="controls">
      <div class="control-group">
        <label for="image-upload">Upload Image:</label>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          bind:this={fileInput}
          on:change={handleImageUpload}
          style="display:none"
        />
        <div
          class="dropzone"
          class:is-dragover={isDraggingOverUpload}
          role="button"
          tabindex="0"
          aria-controls="image-upload"
          on:click={() => fileInput && fileInput.click()}
          on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput && fileInput.click(); } }}
          on:dragenter={handleDragEnter}
          on:dragover={handleDragOver}
          on:dragleave={handleDragLeave}
          on:drop={handleDrop}
        >
          <div class="dropzone-text">{uploadedFileName || 'Choose image or drop file here'}</div>
        </div>
      </div>

      <div class="control-group">
        <button class="primary-toggle" class:is-on={ditheringEnabled} on:click={toggleDithering}>
          {ditheringEnabled ? 'Dithering: ON' : 'Use Dithering'}
        </button>
      </div>

      {#if ditheringEnabled}
        <div class="warning">
          <span class="warn-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
              <path d="M12 3 1 21h22L12 3Z" fill="#ffe69c" stroke="#d7a20a"/>
              <path d="M12 8v6" stroke="#7a5a00" stroke-width="2" stroke-linecap="round"/>
              <circle cx="12" cy="17.5" r="1" fill="#7a5a00"/>
            </svg>
          </span>
          <span>
            Dithered previews may not render exactly in the browser. Use the downloaded image for the most accurate result.
          </span>
        </div>
      {/if}

      <div class="control-group">
        <button class="primary-toggle" class:is-on={overlayEnabled} on:click={toggleOverlay}>
          {overlayEnabled ? 'Grain Overlay: ON' : 'Use Grain Overlay'}
        </button>
      </div>

      {#if ditheringEnabled}
        <div class="control-group">
          <label for="dither-method">Dithering Method:</label>
          <select id="dither-method" bind:value={ditherMethod}>
            {#each ditherMethods as method}
              <option value={method.value}>{method.label}</option>
            {/each}
          </select>
        </div>

        {#if ditherMethod === 'bayer'}
          <div class="control-group">
            <label for="bayer-size">Bayer Matrix Size: {bayerSize}×{bayerSize}</label>
            <input 
              id="bayer-size"
              type="range" 
              min="1" 
              max="6" 
              step="1" 
              value={Math.log2(bayerSize)}
              on:input={(e) => { 
                const target = e.target as HTMLInputElement;
                bayerSize = Math.pow(2, parseInt(target.value)); 
              }}
            />
            <div class="range-labels">
              <span>2×2</span>
              <span>4×4</span>
              <span>8×8</span>
              <span>16×16</span>
              <span>32×32</span>
              <span>64×64</span>
            </div>
          </div>
          
          <div class="control-group">
            <label for="bayer-amount">Bayer Amount: {bayerAmount.toFixed(2)}</label>
            <input 
              id="bayer-amount"
              type="range" 
              min="0.1" 
              max="2" 
              step="0.1" 
              bind:value={bayerAmount}
            />
          </div>
        {/if}
      {/if}
      
      <div class="control-group">
        <label for="exposure">Exposure: {exposure.toFixed(2)}</label>
        <input 
          id="exposure"
          type="range" 
          min="-2" 
          max="2" 
          step="0.1" 
          bind:value={exposure}
        />
      </div>
      
      <div class="control-group">
        <label for="brightness">Brightness: {brightness.toFixed(2)}</label>
        <input 
          id="brightness"
          type="range" 
          min="-1" 
          max="1" 
          step="0.05" 
          bind:value={brightness}
        />
      </div>
      
      <div class="control-group">
        <label for="contrast">Contrast: {contrast.toFixed(2)}</label>
        <input 
          id="contrast"
          type="range" 
          min="-1" 
          max="1" 
          step="0.05" 
          bind:value={contrast}
        />
      </div>
      
      {#if ditheringEnabled}
        <div class="control-group">
          <label for="primary-color">Primary Color:</label>
          <input 
            id="primary-color"
            type="color" 
            bind:value={primaryColor}
          />
        </div>
        
        <div class="control-group">
          <label for="secondary-color">Secondary Color:</label>
          <input 
            id="secondary-color"
            type="color" 
            bind:value={secondaryColor}
          />
        </div>
      {/if}

      {#if overlayEnabled}
        <div class="control-group">
          <label for="overlay-upload">Grain/Overlay Image:</label>
          <input
            id="overlay-upload"
            type="file"
            accept="image/*"
            on:change={handleOverlayUpload}
          />
        </div>

        <div class="control-group">
          <label for="overlay-source">Overlay Source:</label>
          <select id="overlay-source" bind:value={overlaySource}>
            <option value="generated">Built‑in Grain (generated)</option>
            <option value="upload">Uploaded Image</option>
          </select>
        </div>

        <div class="control-group">
          <label for="overlay-opacity">Overlay Opacity: {overlayOpacity.toFixed(2)}</label>
          <input
            id="overlay-opacity"
            type="range"
            min="0"
            max="1"
            step="0.05"
            bind:value={overlayOpacity}
          />
        </div>

        {#if overlaySource === 'generated'}
          <div class="control-group">
            <label for="grain-scale">Grain Scale: {grainScale.toFixed(2)}×</label>
            <input id="grain-scale" type="range" min="0.25" max="4" step="0.05" bind:value={grainScale} />
          </div>
          <div class="control-group">
            <label for="grain-intensity">Grain Intensity: {grainIntensity.toFixed(2)}</label>
            <input id="grain-intensity" type="range" min="0" max="2" step="0.05" bind:value={grainIntensity} />
          </div>
          <div class="control-group">
            <label>
              <input type="checkbox" bind:checked={grainMonochrome} /> Monochrome Grain
            </label>
          </div>
        {/if}

        <div class="control-group">
          <label for="overlay-blend">Overlay Blend Mode:</label>
          <select id="overlay-blend" bind:value={overlayBlendMode}>
            {#each overlayBlendModes as mode}
              <option value={mode}>{mode}</option>
            {/each}
          </select>
        </div>

        <div class="control-group">
          <label for="base-desaturate">Base Desaturate: {baseDesaturate.toFixed(2)}</label>
          <input id="base-desaturate" type="range" min="0" max="1" step="0.05" bind:value={baseDesaturate} />
        </div>

        <div class="control-group">
          <label for="overlay-tint">Tint Color:</label>
          <input id="overlay-tint" type="color" bind:value={overlayTintColor} />
        </div>

        <div class="control-group">
          <label for="overlay-tint-opacity">Tint Opacity: {overlayTintOpacity.toFixed(2)}</label>
          <input
            id="overlay-tint-opacity"
            type="range"
            min="0"
            max="1"
            step="0.05"
            bind:value={overlayTintOpacity}
          />
        </div>

        <div class="control-group">
          <label for="tint-blend">Tint Blend Mode:</label>
          <select id="tint-blend" bind:value={tintBlendMode}>
            {#each tintBlendModes as mode}
              <option value={mode}>{mode}</option>
            {/each}
          </select>
        </div>
      {/if}
      
      <div class="control-group">
        <label for="scale">Scale: {scale.toFixed(2)}x ({Math.round(originalImage?.width * scale || 0)}×{Math.round(originalImage?.height * scale || 0)})</label>
        <input 
          id="scale"
          type="range" 
          min="0.1" 
          max="5" 
          step="0.1" 
          bind:value={scale}
        />
        <div class="range-labels">
          <span>0.1x</span>
          <span>1x</span>
          <span>2x</span>
          <span>3x</span>
          <span>4x</span>
          <span>5x</span>
        </div>
      </div>
      
      <button on:click={downloadImage} disabled={!originalImage}>
        Download Image
      </button>

      
    </div>
    
    <div class="canvas-container">
      <div class="canvas-wrapper">
        <canvas 
          bind:this={canvas}
          style="image-rendering: pixelated; image-rendering: -moz-crisp-edges; image-rendering: crisp-edges;"
        ></canvas>
        {#if originalImage}
          <div class="resolution-display">
            Resolution: {Math.round(originalImage.width * scale)}×{Math.round(originalImage.height * scale)}px
          </div>
        {/if}
      </div>
    </div>
  </div>
</main>

<style>
  :global(html) {
    background-color: #ffffff !important;
    color-scheme: light;
  }

  :global(body) {
    font-family: "Inter Tight", system-ui, -apple-system, sans-serif;
    margin: 0;
    padding: 0;
    background-color: #ffffff !important;
    color: #000000 !important;
  }
  
  main {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  h1 {
    font-size: 40px;
    letter-spacing: -1.6px;
    color: #333;
    margin-bottom: 0.5rem;
    font-weight: 700;
  }
  
  p {
    color: #666;
    margin-bottom: 2rem;
    font-weight: 400;
  }
  
  .container {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 2rem;
    align-items: start;
  }
  
  .controls {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    padding: 1.5rem;
    background: #f8f9fa;
    border-radius: 12px;
    border: 1px solid #e9ecef;
  }

  .dropzone {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.9rem 1rem;
    border: 2px dashed #0d6efd;
    border-radius: 10px;
    background: #eef6ff;
    color: #0d6efd;
    cursor: pointer;
    user-select: none;
  }

  .dropzone:is(:hover, :focus-visible) {
    background: #e2f0ff;
  }

  .dropzone.is-dragover {
    background: #d6e9ff;
    border-color: #0b5ed7;
  }

  .dropzone .dropzone-text {
    display: flex;
    gap: 0.25rem;
    align-items: center;
    font-size: 0.9rem;
  }
  
  .control-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  label {
    font-weight: 600;
    color: #333;
    font-size: 0.9rem;
  }
  
  input[type="range"] {
    width: 100%;
    height: 6px;
    background: #ddd;
    border-radius: 3px;
    outline: none;
    -webkit-appearance: none;
    appearance: none;
  }
  
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    background: #007acc;
    border-radius: 50%;
    cursor: pointer;
  }
  
  input[type="range"]::-moz-range-thumb {
    width: 18px;
    height: 18px;
    background: #007acc;
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }
  
  input[type="color"] {
    width: 100%;
    height: 44px;
    border: 1px solid #ddd;
    border-radius: 8px;
    cursor: pointer;
    padding: 4px;
  }
  
  input[type="file"] {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: white;
    font-family: inherit;
    font-size: 0.9rem;
  }
  
  select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: white;
    font-family: inherit;
    font-size: 0.9rem;
    cursor: pointer;
  }
  
  button {
    background: #007acc;
    color: white;
    border: none;
    padding: 0.875rem 1.25rem;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
    font-family: inherit;
    transition: background 0.2s ease;
  }
  
  button:hover:not(:disabled) {
    background: #005a9e;
  }
  
  button:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  .warning {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.75rem 0.875rem;
    border-radius: 8px;
    background: #fff7e6;
    color: #7a5a00;
    border: 1px solid #ffe8b3;
    font-size: 0.85rem;
  }

  .warn-icon {
    line-height: 0;
    display: inline-flex;
    margin-top: 2px;
  }

  /* Prominent toggles */
  .primary-toggle {
    width: 100%;
    padding: 0.9rem 1rem;
    font-size: 1rem;
    background: #0d6efd;
    border: 1px solid #0b5ed7;
    box-shadow: 0 2px 6px rgba(13, 110, 253, 0.2);
  }

  .primary-toggle:hover:not(:disabled) {
    background: #0b5ed7;
  }

  .primary-toggle.is-on {
    background: #198754; /* success */
    border-color: #157347;
    box-shadow: 0 2px 6px rgba(25, 135, 84, 0.25);
  }

  .primary-toggle.is-on:hover:not(:disabled) {
    background: #157347;
  }
  
  .canvas-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 12px;
    padding: 1.5rem;
    position: sticky;
    top: 16px;
    align-self: start;
  }
  
  .canvas-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  
  .resolution-display {
    font-size: 0.85rem;
    color: #666;
    font-weight: 500;
  }
  
  canvas {
    width: 100%;
    height: auto;
    object-fit: contain;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  }
  
  .range-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    color: #666;
    margin-top: 0.25rem;
    padding: 0 0.25rem;
  }
  
  .range-labels span {
    font-weight: 500;
  }
  
  @media (max-width: 768px) {
    .container {
      grid-template-columns: 1fr;
    }
    
    .controls {
      order: 2;
    }
    
    .canvas-container {
      order: 1;
      position: static;
      top: auto;
    }
  }
</style>

