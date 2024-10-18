package com.example.qr_menu.dto;

import com.example.qr_menu.entities.Account;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AccountDTO {

    private String accountName;
    private String mailAddress;
    private String number;
    private String password;
    private Account.AccountType accountType;
}

