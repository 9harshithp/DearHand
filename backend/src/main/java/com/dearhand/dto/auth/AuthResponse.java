package com.dearhand.dto.auth;

import com.dearhand.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String tokenType;
    private Long id;
    private String name;
    private String email;
    private String phone;
    private Role role;
    private String helperStatus; // If role is HELPER
}
