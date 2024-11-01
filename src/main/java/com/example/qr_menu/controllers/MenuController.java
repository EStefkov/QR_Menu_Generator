package com.example.qr_menu.controllers;

import com.example.qr_menu.dto.MenuDTO;
import com.example.qr_menu.services.MenuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menus")
public class MenuController {

    private final MenuService menuService;

    @Autowired
    public MenuController(MenuService menuService) {
        this.menuService = menuService;
    }

    @PostMapping
    public ResponseEntity<String> createMenu(@RequestBody MenuDTO menuDTO) {
        menuService.createMenu(menuDTO);
        return new ResponseEntity<>("Menu created successfully", HttpStatus.CREATED);
    }

    @GetMapping("/restaurant/{restorantId}")
    public ResponseEntity<List<MenuDTO>> getMenusByRestaurantId(@PathVariable Long restorantId) {
        List<MenuDTO> menus = menuService.getMenusByRestaurantId(restorantId);
        return new ResponseEntity<>(menus, HttpStatus.OK);
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
}