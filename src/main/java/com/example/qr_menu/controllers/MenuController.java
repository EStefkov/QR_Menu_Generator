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
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

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
        try {
            System.out.println("Received request to create menu: " + menuDTO);
            
            // Validate required fields
            if (menuDTO.getCategory() == null || menuDTO.getCategory().isBlank()) {
                return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Menu category is required"));
            }
            
            if (menuDTO.getRestaurantId() == null) {
                return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Restaurant ID is required"));
            }
            
            menuService.createMenu(menuDTO);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Menu created successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to create menu: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Test endpoint for debugging
    @PostMapping("/test")
    public ResponseEntity<Map<String, String>> testCreateMenu(@RequestBody MenuDTO menuDTO) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Test endpoint reached successfully");
        response.put("receivedData", menuDTO.toString());
        return ResponseEntity.ok(response);
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
        System.out.println("Updating menu with standard endpoint: " + menuDTO);
        menuService.updateMenu(id, menuDTO);
        return new ResponseEntity<>("Menu updated successfully", HttpStatus.OK);
    }

    @PutMapping(value = "/{id}/with-images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> updateMenuWithImages(
            @PathVariable Long id,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "restaurantId", required = false) Long restaurantId,
            @RequestParam(value = "bannerImage", required = false) MultipartFile bannerImage,
            @RequestParam(value = "defaultProductImage", required = false) MultipartFile defaultProductImage) {
        
        try {
            MenuDTO menuDTO = new MenuDTO();
            if (category != null) menuDTO.setCategory(category);
            if (name != null) menuDTO.setCategory(name);
            if (restaurantId != null) menuDTO.setRestaurantId(restaurantId);
            
            // Handle image uploads
            if (bannerImage != null && !bannerImage.isEmpty()) {
                String bannerImagePath = menuService.uploadMenuImage(id, bannerImage);
                menuDTO.setMenuImage(bannerImagePath);
            }
            
            if (defaultProductImage != null && !defaultProductImage.isEmpty()) {
                MenuDTO updatedMenu = menuService.uploadDefaultProductImage(id, defaultProductImage);
                menuDTO.setDefaultProductImage(updatedMenu.getDefaultProductImage());
            }
            
            // Update the menu with all data
            menuService.updateMenu(id, menuDTO);
            
            return new ResponseEntity<>("Menu updated successfully with images", HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update menu with images: " + e.getMessage());
        }
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

    @PutMapping("/{id}/text-color")
    public ResponseEntity<MenuDTO> updateTextColor(
            @PathVariable Long id,
            @RequestBody String textColor) {
        MenuDTO updatedMenu = menuService.updateTextColor(id, textColor);
        return ResponseEntity.ok(updatedMenu);
    }

    @PutMapping("/{id}/name")
    public ResponseEntity<MenuDTO> updateMenuName(
            @PathVariable Long id,
            @RequestBody String newName) {
        MenuDTO updatedMenu = menuService.updateMenuName(id, newName);
        return ResponseEntity.ok(updatedMenu);
    }

    @PostMapping("/{id}/default-product-image")
    public ResponseEntity<MenuDTO> uploadDefaultProductImage(@PathVariable("id") Long menuId,
                                                          @RequestParam("file") MultipartFile file) {
        try {
            MenuDTO updatedMenu = menuService.uploadDefaultProductImage(menuId, file);
            return ResponseEntity.ok(updatedMenu);
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload default product image: " + e.getMessage(), e);
        }
    }
}
