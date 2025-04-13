package com.example.qr_menu.repositories;

import com.example.qr_menu.entities.Account;
import com.example.qr_menu.entities.ManagerAssignment;
import com.example.qr_menu.entities.Restorant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ManagerAssignmentRepository extends JpaRepository<ManagerAssignment, Long> {
    
    List<ManagerAssignment> findByManager(Account manager);
    
    List<ManagerAssignment> findByRestorant(Restorant restorant);
    
    List<ManagerAssignment> findByManagerId(Long managerId);
    
    List<ManagerAssignment> findByRestorantId(Long restaurantId);
    
    Optional<ManagerAssignment> findByManagerIdAndRestorantId(Long managerId, Long restaurantId);
    
    boolean existsByManagerIdAndRestorantId(Long managerId, Long restaurantId);
    
    @Query("SELECT ma FROM ManagerAssignment ma JOIN FETCH ma.restorant WHERE ma.manager.id = :managerId")
    List<ManagerAssignment> findByManagerIdWithRestorant(@Param("managerId") Long managerId);
} 