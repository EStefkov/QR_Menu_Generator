package com.example.qr_menu.security;

import com.example.qr_menu.dto.MenuDTO;
import com.example.qr_menu.entities.Menu;
import org.springframework.stereotype.Component;

@Component
public class MenuMapper {
    public MenuDTO toDto(Menu menu) {
        return MenuDTO.builder()
                .id(menu.getId())
                .category(menu.getCategory())
                .restorantId(menu.getRestorant() != null ? menu.getRestorant().getId() : null)
                .createdAt(menu.getCreatedAt())
                .updatedAt(menu.getUpdatedAt())
                .menuUrl(menu.getMenuUrl())
                .qrCodeImage(menu.getQrCodeImage())
                .menuImage(menu.getMenuImage())
                .build();
    }
}
