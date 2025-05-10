package com.example.qr_menu.repositories;

import com.example.qr_menu.entities.Account;
import com.example.qr_menu.entities.Restorant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RestaurantRepository extends JpaRepository<Restorant, Long> {
    // Custom query methods can be added here if needed

    Page<Restorant> findAll(Pageable pageable);
    
    /**
     * Find all restaurants created by a specific account
     *
     * @param account The account that created the restaurants
     * @return List of restaurants created by the account
     */
    List<Restorant> findByAccount(Account account);
}