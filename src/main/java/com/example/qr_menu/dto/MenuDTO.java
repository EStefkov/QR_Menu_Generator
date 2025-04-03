package com.example.qr_menu.dto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;
import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MenuDTO {
    private Long id;
    private String category;
    private Date createdAt;
    private Date updatedAt;
    private Long restaurantId;
    private String menuUrl;
    private String menuImage;
    private byte[] qrCodeImage;
    private String defaultProductImage;
    private String textColor;
}