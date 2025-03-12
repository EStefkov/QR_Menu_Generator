package com.example.qr_menu.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProductDTO {
    private Long id;
    private String productName;
    private Double productPrice;
    private String productInfo;
    private Long categoryId; // To associate the product with a menu by ID
    private String productImage;
    // Това го ползваш, за да подаваш ID-тата при създаване/редакция.
    private List<Long> allergenIds;

    // А това ще съдържа списъка с "истинските" алергени,
    // за да може фронтендът да покаже {id, allergenName}.
    private List<AllergenDTO> allergens;

}
