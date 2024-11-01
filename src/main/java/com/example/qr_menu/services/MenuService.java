package com.example.qr_menu.services;

import com.example.qr_menu.dto.MenuDTO;
import com.example.qr_menu.entities.Menu;
import com.example.qr_menu.entities.Restorant;
import com.example.qr_menu.exceptions.ResourceNotFoundException;
import com.example.qr_menu.repositories.MenuRepository;
import com.example.qr_menu.repositories.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MenuService {

    private final MenuRepository menuRepository;
    private final RestaurantRepository restaurantRepository;

    @Autowired
    public MenuService(MenuRepository menuRepository, RestaurantRepository restaurantRepository) {
        this.menuRepository = menuRepository;
        this.restaurantRepository = restaurantRepository;
    }

    // Create a new menu
    public void createMenu(MenuDTO menuDTO) {
        Restorant restorant = restaurantRepository.findById(menuDTO.getRestorantId())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));

        Menu menu = new Menu();
        menu.setCategory(menuDTO.getCategory());
        menu.setRestorant(restorant);
        menu.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        menu.setUpdatedAt(new Timestamp(System.currentTimeMillis()));

        menuRepository.save(menu);
    }

    // Get menus by restaurant ID
    public List<MenuDTO> getMenusByRestaurantId(Long restorantId) {
        return menuRepository.findByRestorantId(restorantId)
                .stream()
                .map(menu -> new MenuDTO(menu.getId(), menu.getCategory(), menu.getRestorant().getId(), menu.getCreatedAt(), menu.getUpdatedAt()))
                .collect(Collectors.toList());
    }

    // Update a menu
    public void updateMenu(Long id, MenuDTO menuDTO) {
        Menu menu = menuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu not found"));
        menu.setCategory(menuDTO.getCategory());
        menu.setUpdatedAt(new Timestamp(System.currentTimeMillis()));

        menuRepository.save(menu);
    }

    // Delete a menu
    public void deleteMenu(Long id) {
        Menu menu = menuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu not found"));

        menuRepository.delete(menu);
    }
}
