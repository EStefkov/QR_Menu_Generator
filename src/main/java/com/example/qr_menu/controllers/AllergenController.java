package com.example.qr_menu.controllers;

import com.example.qr_menu.dto.AllergenDTO;
import com.example.qr_menu.entities.Allergen;
import com.example.qr_menu.exceptions.ResourceNotFoundException;
import com.example.qr_menu.repositories.AllergenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/allergens")
public class AllergenController {

    @Autowired
    private AllergenRepository allergenRepository;

    /**
     * GET /api/allergens
     * Връща списък с всички алергени.
     */
    @GetMapping
    public ResponseEntity<List<AllergenDTO>> getAllAllergens() {
        List<Allergen> allergenList = allergenRepository.findAll();
        List<AllergenDTO> dtos = allergenList.stream()
                .map(a -> new AllergenDTO(a.getId(), a.getAllergenName()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    /**
     * GET /api/allergens/{id}
     * Връща конкретен алерген по ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<AllergenDTO> getAllergenById(@PathVariable Long id) {
        Allergen allergen = allergenRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Allergen not found, ID = " + id));

        AllergenDTO dto = new AllergenDTO(allergen.getId(), allergen.getAllergenName());
        return ResponseEntity.ok(dto);
    }

    /**
     * POST /api/allergens
     * Създава нов алерген (примерно очаква { "allergenName": "..." }).
     */
    @PostMapping
    public ResponseEntity<AllergenDTO> createAllergen(@RequestBody AllergenDTO allergenDTO) {
        // Създаваме ентити
        Allergen entity = new Allergen();
        entity.setAllergenName(allergenDTO.getAllergenName());

        Allergen saved = allergenRepository.save(entity);

        AllergenDTO result = new AllergenDTO(saved.getId(), saved.getAllergenName());
        return ResponseEntity.ok(result);
    }

    /**
     * PUT /api/allergens/{id}
     * Редактира алерген (примерно очаква { "allergenName": "..." }).
     */
    @PutMapping("/{id}")
    public ResponseEntity<AllergenDTO> updateAllergen(
            @PathVariable Long id,
            @RequestBody AllergenDTO allergenDTO
    ) {
        Allergen allergen = allergenRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Allergen not found, ID = " + id));

        // Обновяваме полетата (засега имаме само allergenName)
        allergen.setAllergenName(allergenDTO.getAllergenName());

        Allergen updated = allergenRepository.save(allergen);

        AllergenDTO result = new AllergenDTO(updated.getId(), updated.getAllergenName());
        return ResponseEntity.ok(result);
    }

    /**
     * DELETE /api/allergens/{id}
     * Изтрива алерген по ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAllergen(@PathVariable Long id) {
        Allergen allergen = allergenRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Allergen not found, ID = " + id));

        allergenRepository.delete(allergen);
        return ResponseEntity.noContent().build();
    }
}
