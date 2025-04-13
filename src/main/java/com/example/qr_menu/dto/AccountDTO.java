package com.example.qr_menu.dto;

import com.example.qr_menu.entities.Account;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AccountDTO {


    private Long id; // Add this field
    private String accountName;
    private String mailAddress;
    private String firstName;
    private String lastName;
    private String profilePicture; // Optional, can be null if default is used
    private String number;
    private String password;
    private Account.AccountType accountType;
    private List<RestaurantDTO> restaurants;
    private Long updatedBy; // Who performed the update
}

