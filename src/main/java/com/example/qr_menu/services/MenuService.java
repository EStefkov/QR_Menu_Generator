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
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
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

    public String uploadMenuImage(Long menuId, MultipartFile menuImage) throws IOException {
        if (menuImage == null || menuImage.isEmpty()) {
            throw new IllegalArgumentException("Please select a file to upload");
        }

        // Validate file type
        String contentType = menuImage.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }

        // 1. Find the menu
        Menu menu = menuRepository.findById(menuId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu not found with id: " + menuId));

        // 2. Create base upload directory with absolute path
        Path baseUploadPath = Paths.get("").toAbsolutePath().resolve("uploads").resolve("menuImages");
        Files.createDirectories(baseUploadPath);

        // 3. Create menu-specific directory
        Path menuUploadPath = baseUploadPath.resolve(menuId.toString());
        Files.createDirectories(menuUploadPath);

        // 4. Generate unique filename with timestamp and original extension
        String originalFilename = StringUtils.cleanPath(menuImage.getOriginalFilename());
        String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String newFilename = System.currentTimeMillis() + fileExtension;

        // 5. Save the file
        Path filePath = menuUploadPath.resolve(newFilename);
        try {
            Files.copy(menuImage.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new IOException("Failed to save image file: " + e.getMessage());
        }

        // 6. Delete old menu image if it exists and is not the default
        String oldMenuImage = menu.getMenuImage();
        if (oldMenuImage != null && !oldMenuImage.equals("default_menu.png")) {
            try {
                Path oldFilePath = Paths.get("").toAbsolutePath().resolve(oldMenuImage.substring(1)); // Remove leading slash
                Files.deleteIfExists(oldFilePath);
            } catch (IOException e) {
                System.err.println("Failed to delete old menu image: " + e.getMessage());
            }
        }

        // 7. Update menu image path in database
        String menuImagePath = "/uploads/menuImages/" + menuId + "/" + newFilename;
        menu.setMenuImage(menuImagePath);
        menu.setUpdatedAt(new Date());

        // 8. Save to database
        try {
            menuRepository.save(menu);
            return menuImagePath; // Return the path
        } catch (Exception e) {
            // If database save fails, try to delete the uploaded file
            try {
                Files.deleteIfExists(filePath);
            } catch (IOException deleteError) {
                System.err.println("Failed to delete uploaded file after database error: " + deleteError.getMessage());
            }
            throw new RuntimeException("Failed to update menu with new image: " + e.getMessage());
        }
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
        menu.setMenuImage(menuDTO.getMenuImage() != null ? menuDTO.getMenuImage() : "default_menu.png");

        // Първо запази менюто, за да получиш ID
        menu = menuRepository.save(menu);

        // Създай URL с валидно ID
        String menuUrl = viteHost + "/menu/"+ menu.getId();
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
                        .menuImage(menu.getMenuImage())
                        .textColor(menu.getTextColor())
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

        String menuUrl = viteHost + "/menu/"+ menu.getId();
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
        return menuMapper.toDto(menu);
    }

    public MenuDTO updateTextColor(Long id, String textColor) {
        Menu menu = menuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu not found"));
        
        menu.setTextColor(textColor);
        menu.setUpdatedAt(new Date());
        Menu updatedMenu = menuRepository.save(menu);
        
        return menuMapper.toDto(updatedMenu);
    }

    public MenuDTO updateMenuName(Long id, String newName) {
        Menu menu = menuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu not found"));
        
        menu.setCategory(newName);
        menu.setUpdatedAt(new Date());
        Menu updatedMenu = menuRepository.save(menu);
        
        return menuMapper.toDto(updatedMenu);
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
