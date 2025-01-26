package com.example.qr_menu.security;

import com.example.qr_menu.dto.MenuDTO;
import com.example.qr_menu.entities.Menu;
import org.springframework.stereotype.Component;

@Component
public class MenuMapper {
    public MenuDTO toDto(Menu menu){
        MenuDTO dto = new MenuDTO();
        dto.setId(menu.getId());
        dto.setCategory(menu.getCategory());
        dto.setCreatedAt(menu.getCreatedAt());
        dto.setUpdatedAt(menu.getUpdatedAt());
        return dto;
    }
}
