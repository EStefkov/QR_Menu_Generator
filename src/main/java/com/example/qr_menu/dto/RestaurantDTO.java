package com.example.qr_menu.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RestaurantDTO {
    private Long id;
    private String restorantName;
    private String phoneNumber;
    private Long accountId;
    private String address;
    private String email;
    
    // Add serialization fields for contactInfo if present in JSON
    private Object contactInfo;
    
    @Override
    public String toString() {
        return "RestaurantDTO{" +
                "id=" + id +
                ", restorantName='" + restorantName + '\'' +
                ", phoneNumber='" + phoneNumber + '\'' +
                ", accountId=" + accountId +
                ", address='" + address + '\'' +
                ", email='" + email + '\'' +
                ", contactInfo=" + contactInfo +
                '}';
    }
}