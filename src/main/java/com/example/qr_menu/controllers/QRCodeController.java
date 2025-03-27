package com.example.qr_menu.controllers;

import com.example.qr_menu.utils.QRCodeGenerator;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.Map;

@RestController
@RequestMapping("/api/qrcode")
public class QRCodeController {

    @PostMapping(value = "/generate", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> generateQRCode(@RequestBody Map<String, Object> data) {
        try {
            // Convert the data to a JSON string or any format you prefer
            String text = data.toString();
            
            // Generate QR code
            byte[] qrCodeBytes = QRCodeGenerator.generateQRCodeImage(text, 250, 250);
            
            // Convert to Base64 for easy transport to frontend
            String base64QRCode = Base64.getEncoder().encodeToString(qrCodeBytes);
            
            return ResponseEntity.ok(Map.of(
                "success", true, 
                "qrCode", "data:image/png;base64," + base64QRCode
            ));
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "success", false,
                    "error", e.getMessage()
                ));
        }
    }
} 