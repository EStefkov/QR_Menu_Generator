package com.example.qr_menu.services;

import com.example.qr_menu.dto.CategoryDTO;
import com.example.qr_menu.dto.MenuDTO;
import com.example.qr_menu.entities.Category;
import com.example.qr_menu.entities.Menu;
import com.example.qr_menu.entities.Restorant;
import com.example.qr_menu.exceptions.ResourceNotFoundException;
import com.example.qr_menu.repositories.CategoryRepository;
import com.example.qr_menu.repositories.MenuRepository;
import com.example.qr_menu.repositories.RestaurantRepository;
import com.example.qr_menu.security.MenuMapper;
import com.example.qr_menu.utils.QRCodeGenerator;
import lombok.Builder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MenuService {

    private final MenuRepository menuRepository;
    private final RestaurantRepository restaurantRepository;
    private final CategoryRepository categoryRepository;

    @Value("${server.host}")
    private String serverHost;
    @Value("${server.hostTwo}")
    private String viteHost;
    @Autowired
    private MenuMapper menuMapper;


    @Autowired
    public MenuService(MenuRepository menuRepository,
                       RestaurantRepository restaurantRepository,
                       CategoryRepository categoryRepository) {
        this.menuRepository = menuRepository;
        this.restaurantRepository = restaurantRepository;
        this.categoryRepository = categoryRepository;
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
        String menuUrl = viteHost + "/menus/"+ menu.getId();
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

        String menuUrl = viteHost + "/menus/"+ menu.getId();
        try {
            return QRCodeGenerator.generateQRCodeImage(menuUrl, 200, 200);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    public MenuDTO getMenuById(Long id) {
        Menu menu = menuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu not found"));
        return menuMapper.toDto(menu); // Преобразуване на entity към DTO
    }

    public List<CategoryDTO> getCategoriesByMenu(Long menuId) {
        Menu menu = menuRepository.findById(menuId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu not found"));

        List<Category> categories = categoryRepository.findByMenu(menu);
        return categories.stream()
                .map(category -> new CategoryDTO(category.getId(), category.getName(),category.getId(), category.getCategoryImage()))
                .collect(Collectors.toList());
    }
}
