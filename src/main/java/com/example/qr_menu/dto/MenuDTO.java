package com.example.qr_menu.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Date;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class MenuDTO {
    private Long id;
    private String category;
    private Long restorantId; // Foreign key reference
    private Date createdAt;
    private Date updatedAt;
}