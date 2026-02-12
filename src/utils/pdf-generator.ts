/**
 * PDF Generator - Export document preview as PDF file
 * Uses dom-to-image to render the element, then wraps it in a PDF using jsPDF
 * Optimized to capture the entire document with proper multi-page handling
 */

/**
 * Generate and download element as PDF file
 */
export async function generatePDFFromElement(
  elementId: string,
  filename: string
): Promise<void> {
  const originalCursor = document.body.style.cursor;
  const originalOverflow = document.body.style.overflow;
  
  try {
    // Get the element
    const element = document.getElementById(elementId) as HTMLElement;
    if (!element) {
      throw new Error('Document preview element not found');
    }
    
    console.log('Starting PDF generation...');
    console.log('Element dimensions:', {
      offsetWidth: element.offsetWidth,
      offsetHeight: element.offsetHeight,
      scrollWidth: element.scrollWidth,
      scrollHeight: element.scrollHeight
    });
    
    document.body.style.cursor = 'wait';
    document.body.style.overflow = 'hidden';
    
    // Store original element styles
    const originalElementStyle = {
      maxHeight: element.style.maxHeight,
      overflow: element.style.overflow,
      height: element.style.height
    };
    
    // Temporarily ensure element is fully expanded and visible
    element.style.maxHeight = 'none';
    element.style.overflow = 'visible';
    element.style.height = 'auto';
    
    // Force a reflow to ensure all content is rendered
    element.offsetHeight;
    
    // Wait a moment for any dynamic content to settle and fonts to load
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Import required libraries
    const domtoimage = await import('dom-to-image');
    const { jsPDF } = await import('jspdf');
    
    console.log('Converting element to high-resolution image...');
    
    // Use scrollHeight to get the full height of the content
    const elementWidth = element.scrollWidth;
    const elementHeight = element.scrollHeight;
    
    console.log('Capturing full content:', {
      width: elementWidth,
      height: elementHeight
    });
    
    // Convert element to PNG data URL with 3x scaling for high resolution
    const scale = 3; // 3x resolution for crisp output
    const dataUrl = await domtoimage.toPng(element, {
      quality: 1,
      bgcolor: '#ffffff',
      width: elementWidth * scale,
      height: elementHeight * scale,
      style: {
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        maxHeight: 'none',
        overflow: 'visible'
      }
    });
    
    // Restore original element styles
    element.style.maxHeight = originalElementStyle.maxHeight;
    element.style.overflow = originalElementStyle.overflow;
    element.style.height = originalElementStyle.height;
    
    console.log('Creating PDF document...');
    
    // A4 size in mm: 210 x 297
    const a4Width = 210;
    const a4Height = 297;
    
    // Calculate image dimensions to fit A4 width
    const imgWidth = a4Width;
    const imgHeight = (elementHeight * imgWidth) / elementWidth;
    
    console.log('PDF dimensions:', {
      imgWidth,
      imgHeight,
      pages: Math.ceil(imgHeight / a4Height)
    });
    
    // Create a new jsPDF instance
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    
    // Check if content fits on one page
    if (imgHeight <= a4Height) {
      // Single page - add image directly
      pdf.addImage(dataUrl, 'PNG', 0, 0, imgWidth, imgHeight);
    } else {
      // Multi-page - split image across pages
      let remainingHeight = imgHeight;
      let position = 0;
      let pageNumber = 0;
      
      while (remainingHeight > 0) {
        if (pageNumber > 0) {
          pdf.addPage();
        }
        
        // Calculate how much of the image to show on this page
        const pageHeight = Math.min(a4Height, remainingHeight);
        
        // Add the image portion for this page
        // We use negative Y position to shift the image up for subsequent pages
        pdf.addImage(
          dataUrl, 
          'PNG', 
          0, 
          -position, 
          imgWidth, 
          imgHeight
        );
        
        remainingHeight -= a4Height;
        position += a4Height;
        pageNumber++;
      }
      
      console.log(`Document split across ${pageNumber} pages`);
    }
    
    console.log('Saving PDF...');
    
    // Download the PDF
    pdf.save(filename.replace('.png', '.pdf'));
    
    console.log('✓ PDF downloaded successfully!');
    document.body.style.cursor = originalCursor;
    document.body.style.overflow = originalOverflow;
    
  } catch (error) {
    console.error('PDF generation error:', error);
    document.body.style.cursor = originalCursor;
    document.body.style.overflow = originalOverflow;
    throw error;
  }
}

/**
 * Alternative function name for backward compatibility
 */
export async function downloadElementAsPDF(
  elementId: string,
  filename: string
): Promise<void> {
  return generatePDFFromElement(elementId, filename);
}
