package com.example.qr_menu.repositories;

import com.example.qr_menu.entities.Account;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    Optional<Account> findByAccountNameOrMailAddress(String accountName, String mailAddress);

    boolean existsByAccountNameOrMailAddress(String accountName, String mailAddress);

    // Default pagination support
    Page<Account> findAll(Pageable pageable);

    // If needed, fetch accounts with restaurants for non-paginated cases
    @Query("SELECT a FROM Account a JOIN FETCH a.restorants")
    List<Account> findAllWithRestaurants();

    Optional<Account> findByMailAddress(String mailAddress);

    boolean existsByMailAddress(String mailAddress);
}
