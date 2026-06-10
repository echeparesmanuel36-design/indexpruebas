use wasm_bindgen::prelude::*;
use qrcode::QrCode;
use image::{Luma, ImageBuffer};
use base64::{engine::general_purpose, Engine as _};

#[wasm_bindgen]
pub fn generate_qr(text: &str, dark_color: &str, light_color: &str, size: u32) -> String {
    // Generar QR code
    let code = match QrCode::new(text.as_bytes()) {
        Ok(c) => c,
        Err(_) => return String::new(),
    };
    
    // Crear imagen
    let qr_image = code.render::<Luma<u8>>()
        .min_dimensions(size, size)
        .build();
    
    // Convertir a RGBA con colores personalizados
    let dark_rgb = hex_to_rgb(dark_color);
    let light_rgb = hex_to_rgb(light_color);
    
    let width = qr_image.width();
    let height = qr_image.height();
    let mut rgba_image = ImageBuffer::new(width, height);
    
    for (x, y, pixel) in qr_image.enumerate_pixels() {
        let is_dark = pixel.0[0] < 128;
        let (r, g, b) = if is_dark { dark_rgb } else { light_rgb };
        rgba_image.put_pixel(x, y, image::Rgba([r, g, b, 255]));
    }
    
    // Codificar a PNG y luego a base64
    let mut buffer = Vec::new();
    match image::codecs::png::PngEncoder::new(&mut buffer).encode(
        &rgba_image,
        width,
        height,
        image::ColorType::Rgba8
    ) {
        Ok(_) => format!("data:image/png;base64,{}", general_purpose::STANDARD.encode(&buffer)),
        Err(_) => String::new(),
    }
}

fn hex_to_rgb(hex: &str) -> (u8, u8, u8) {
    let hex = hex.trim_start_matches('#');
    let r = u8::from_str_radix(&hex[0..2], 16).unwrap_or(0);
    let g = u8::from_str_radix(&hex[2..4], 16).unwrap_or(0);
    let b = u8::from_str_radix(&hex[4..6], 16).unwrap_or(0);
    (r, g, b)
}
