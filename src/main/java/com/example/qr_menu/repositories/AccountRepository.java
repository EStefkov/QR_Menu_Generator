package com.example.qr_menu.repositories;

import com.example.qr_menu.entities.Account;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

    @Query("SELECT a FROM Account a WHERE a.accountName = ?1 OR a.mailAddress = ?1")
    Optional<Account> findByAccountNameOrMailAddress(String accountName, String mailAddress);

    // Method to check if an accountName or mailAddress already exists
    boolean existsByAccountNameOrMailAddress(String accountName, String mailAddress);

    @Query("SELECT a FROM Account a JOIN FETCH a.restorants")
    List<Account> findAllWithRestaurants();

    // Custom query methods can be added here if needed
}
