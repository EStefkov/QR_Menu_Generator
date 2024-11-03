package com.example.qr_menu.repositories;

import com.example.qr_menu.entities.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

    Optional<Account> findByAccountNameOrMailAddress(String accountName, String mailAddress);

    // Custom query methods can be added here if needed
}
