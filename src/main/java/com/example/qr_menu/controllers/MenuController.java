package com.example.qr_menu.controllers;

import com.example.qr_menu.dto.CategoryDTO;
import com.example.qr_menu.dto.MenuDTO;
import com.example.qr_menu.services.MenuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/menus")
public class MenuController {

    private final MenuService menuService;

    @Autowired
    public MenuController(MenuService menuService) {
        this.menuService = menuService;
    }

    @PostMapping("/{id}/image")
    public ResponseEntity<Map<String, String>> uploadMenuImage(
            @PathVariable Long id,
            @RequestParam("image") MultipartFile image) {
        try {
            String menuImagePath = menuService.uploadMenuImage(id, image);
            return ResponseEntity.ok(Map.of(
                "menuImage", menuImagePath,
                "message", "Menu image uploaded successfully"
            ));
        } catch (IOException e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to upload menu image: " + e.getMessage()));
        }
    }


    @PostMapping
    public ResponseEntity<Map<String, String>> createMenu(@RequestBody MenuDTO menuDTO) {
        menuService.createMenu(menuDTO);

        // ✅ Връщаме JSON вместо plain текст
        Map<String, String> response = Map.of("message", "Menu created successfully");
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }


    @GetMapping("/restaurant/{restorantId}")
    public ResponseEntity<List<MenuDTO>> getMenusByRestaurantId(@PathVariable Long restorantId) {
        List<MenuDTO> menus = menuService.getMenusByRestaurantId(restorantId);
        return new ResponseEntity<>(menus, HttpStatus.OK);
    }
    @GetMapping("/{id}")
    public ResponseEntity<MenuDTO> getMenuById(@PathVariable Long id) {
        MenuDTO menu = menuService.getMenuById(id);
        return ResponseEntity.ok(menu);
    }


    @PutMapping("/{id}")
    public ResponseEntity<String> updateMenu(@PathVariable Long id, @RequestBody MenuDTO menuDTO) {
        menuService.updateMenu(id, menuDTO);
        return new ResponseEntity<>("Menu updated successfully", HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteMenu(@PathVariable Long id) {
        menuService.deleteMenu(id);
        return new ResponseEntity<>("Menu deleted successfully", HttpStatus.OK);
    }

    @GetMapping("/{id}/qrcode")
    public ResponseEntity<byte[]> getQRCode(@PathVariable Long id) {
        System.out.println("Fetching QR code for menu ID: " + id);
        byte[] qrCode = menuService.generateQRCodeForMenu(id);

        if (qrCode == null) {
            System.out.println("QR code not found for menu ID: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .body(qrCode);
    }

    @GetMapping("/{menuId}/categories")
    public List<CategoryDTO> getCategoriesByMenu(@PathVariable Long menuId) {
        return menuService.getCategoriesByMenu(menuId);
    }


}
