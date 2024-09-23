package com.example.qr_menu.repositories;

import com.example.qr_menu.entities.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    // Custom query methods can be added here if needed
}
