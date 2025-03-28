package com.example.qr_menu.services;

import com.example.qr_menu.dto.CategoryDTO;
import com.example.qr_menu.entities.Category;
import com.example.qr_menu.entities.Menu;
import com.example.qr_menu.entities.Restorant;
import com.example.qr_menu.exceptions.ResourceNotFoundException;
import com.example.qr_menu.repositories.CategoryRepository;
import com.example.qr_menu.repositories.MenuRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private MenuRepository menuRepository;

    public CategoryDTO createCategory(CategoryDTO categoryDTO) {
        Menu menu = menuRepository.findById(categoryDTO.getMenuId())
                .orElseThrow(() -> new ResourceNotFoundException("Menu not found"));

        Category category = Category.builder()
                .name(categoryDTO.getName())
                .menu(menu)
                .build();

        Category savedCategory = categoryRepository.save(category);
        return convertToDTO(savedCategory);
    }

    public List<CategoryDTO> getCategoriesByMenuId(Long menuId) {
        return categoryRepository.findByMenuId(menuId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getCategoryWithDetails(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));
        
        Map<String, Object> result = new HashMap<>();
        result.put("id", category.getId());
        result.put("name", category.getName());
        result.put("categoryImage", category.getCategoryImage());
        
        Menu menu = category.getMenu();
        if (menu != null) {
            Map<String, Object> menuData = new HashMap<>();
            menuData.put("id", menu.getId());
            menuData.put("category", menu.getCategory());
            menuData.put("menuImage", menu.getMenuImage());
            
            Restorant restaurant = menu.getRestorant();
            if (restaurant != null) {
                Map<String, Object> restaurantData = new HashMap<>();
                restaurantData.put("id", restaurant.getId());
                restaurantData.put("name", restaurant.getRestorantName());
                menuData.put("restorant", restaurantData);
            }
            
            result.put("menu", menuData);
            result.put("menuId", menu.getId());
        }
        
        return result;
    }

    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }

    private CategoryDTO convertToDTO(Category category) {
        return CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .menuId(category.getMenu().getId())
                .build();
    }
}
