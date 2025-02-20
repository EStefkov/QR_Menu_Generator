package com.example.qr_menu.services;

import com.example.qr_menu.dto.CategoryDTO;
import com.example.qr_menu.entities.Category;
import com.example.qr_menu.entities.Menu;
import com.example.qr_menu.exceptions.ResourceNotFoundException;
import com.example.qr_menu.repositories.CategoryRepository;
import com.example.qr_menu.repositories.MenuRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
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
