package com.example.qr_menu.services;

import com.example.qr_menu.dto.MenuDTO;
import com.example.qr_menu.entities.Menu;
import com.example.qr_menu.entities.Restorant;
import com.example.qr_menu.exceptions.ResourceNotFoundException;
import com.example.qr_menu.repositories.MenuRepository;
import com.example.qr_menu.repositories.RestaurantRepository;
import com.example.qr_menu.utils.QRCodeGenerator;
import lombok.Builder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.Date;
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

    public void createMenu(MenuDTO menuDTO) {
        // Намери ресторанта по ID
        Restorant restorant = restaurantRepository.findById(menuDTO.getRestorantId())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));

        // Създай обект Menu
        Menu menu = new Menu();
        menu.setCategory(menuDTO.getCategory());
        menu.setRestorant(restorant);
        menu.setCreatedAt(new Date());
        menu.setUpdatedAt(new Date());

        // Първо запази менюто, за да получиш ID
        menu = menuRepository.save(menu);

        // Създай URL с валидно ID
        String menuUrl = "http://192.168.240.140:5173/menus/" + menu.getId();
        menu.setMenuUrl(menuUrl);

        // Генерирай QR код
        try {
            byte[] qrCodeImage = QRCodeGenerator.generateQRCodeImage(menuUrl, 200, 200);
            menu.setQrCodeImage(qrCodeImage);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR Code", e);
        }

        // Обнови записа с URL и QR кода
        menuRepository.save(menu);
    }



    public List<MenuDTO> getMenusByRestaurantId(Long restorantId) {
        return menuRepository.findByRestorantId(restorantId)
                .stream()
                .map(menu -> MenuDTO.builder()
                        .id(menu.getId())
                        .category(menu.getCategory())
                        .restorantId(menu.getRestorant().getId())
                        .createdAt(menu.getCreatedAt())
                        .updatedAt(menu.getUpdatedAt())
                        .menuUrl(menu.getMenuUrl())
                        .qrCodeImage(menu.getQrCodeImage())
                        .build()
                )
                .collect(Collectors.toList());
    }


    public void updateMenu(Long id, MenuDTO menuDTO) {
        Menu menu = menuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu not found"));
        menu.setCategory(menuDTO.getCategory());
        menu.setUpdatedAt(new Date());

        menuRepository.save(menu);
    }

    public void deleteMenu(Long id) {
        Menu menu = menuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu not found"));

        menuRepository.delete(menu);
    }

    public byte[] generateQRCodeForMenu(Long id) {
        Menu menu = menuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu not found"));

        String menuUrl = "https://myapp.com/menu/" + menu.getId();

        try {
            return QRCodeGenerator.generateQRCodeImage(menuUrl, 200, 200);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
