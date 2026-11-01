package com.dearhand.service;

import com.dearhand.dto.auth.AuthResponse;
import com.dearhand.dto.auth.LoginRequest;
import com.dearhand.dto.auth.RegisterRequest;
import com.dearhand.dto.auth.UserDto;
import com.dearhand.entity.HelperProfile;
import com.dearhand.entity.User;
import com.dearhand.enums.HelperStatus;
import com.dearhand.enums.Role;
import com.dearhand.enums.UserStatus;
import com.dearhand.repository.HelperProfileRepository;
import com.dearhand.repository.UserRepository;
import com.dearhand.security.JwtTokenProvider;
import com.dearhand.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final HelperProfileRepository helperProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (request.getRole() == Role.ADMIN) {
            throw new IllegalArgumentException("Admin registration is not allowed through the public portal");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("An account with this email address already exists");
        }

        if (userRepository.existsByPhone(request.getPhone())) {
            throw new IllegalArgumentException("An account with this phone number already exists");
        }

        User user = User.builder()
                .name(request.getName().trim())
                .phone(request.getPhone().trim())
                .email(request.getEmail().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .status(UserStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(user);

        String helperStatusStr = null;
        if (savedUser.getRole() == Role.HELPER) {
            HelperProfile profile = HelperProfile.builder()
                    .user(savedUser)
                    .languages("Kannada")
                    .status(HelperStatus.APPLIED)
                    .build();
            helperProfileRepository.save(profile);
            helperStatusStr = HelperStatus.APPLIED.name();
        }

        String token = tokenProvider.generateToken(savedUser.getId(), savedUser.getEmail(), savedUser.getRole());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .id(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .phone(savedUser.getPhone())
                .role(savedUser.getRole())
                .helperStatus(helperStatusStr)
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String identifier = request.getUsernameOrEmail().trim();

        User user = userRepository.findByEmail(identifier.toLowerCase())
                .or(() -> userRepository.findByPhone(identifier))
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new DisabledException("Account has been suspended. Please contact support.");
        }

        String helperStatusStr = null;
        if (user.getRole() == Role.HELPER) {
            helperStatusStr = helperProfileRepository.findByUserId(user.getId())
                    .map(hp -> hp.getStatus().name())
                    .orElse(HelperStatus.APPLIED.name());
        }

        String token = tokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .helperStatus(helperStatusStr)
                .build();
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser(UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String helperStatusStr = null;
        if (user.getRole() == Role.HELPER) {
            helperStatusStr = helperProfileRepository.findByUserId(user.getId())
                    .map(hp -> hp.getStatus().name())
                    .orElse(null);
        }

        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .status(user.getStatus())
                .helperStatus(helperStatusStr)
                .createdAt(user.getCreatedAt())
                .build();
    }
}
