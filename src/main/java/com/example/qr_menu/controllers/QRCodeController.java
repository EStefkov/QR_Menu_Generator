package com.example.qr_menu.controllers;

import com.example.qr_menu.services.QRCodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/qrcode")
public class QRCodeController {

    @Autowired
    private QRCodeService qrCodeService;

    @PostMapping("/generate")
    public ResponseEntity<?> generateQRCode(@RequestBody Map<String, Object> request) {
        try {
            String text = (String) request.get("text");
            String format = (String) request.get("format");
            Integer size = (Integer) request.getOrDefault("size", 300);
            Integer margin = (Integer) request.getOrDefault("margin", 1);
            String errorCorrectionLevel = (String) request.getOrDefault("errorCorrectionLevel", "H");
            String type = (String) request.getOrDefault("type", "text");

            // Generate QR code
            String qrCode = qrCodeService.generateQRCode(text, format, size, margin, errorCorrectionLevel, type);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "qrCode", qrCode
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }
} 