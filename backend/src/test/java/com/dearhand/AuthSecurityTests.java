package com.dearhand;

import com.dearhand.dto.auth.LoginRequest;
import com.dearhand.dto.auth.RegisterRequest;
import com.dearhand.entity.User;
import com.dearhand.enums.Role;
import com.dearhand.enums.UserStatus;
import com.dearhand.repository.UserRepository;
import com.dearhand.security.JwtTokenProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthSecurityTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private User savedFamily;
    private User savedAdmin;
    private String familyJwt;
    private String adminJwt;

    @BeforeEach
    void setUp() {
        savedFamily = userRepository.save(User.builder()
                .name("Arun Kumar")
                .email("arun@example.com")
                .phone("+919876500001")
                .passwordHash(passwordEncoder.encode("Password123!"))
                .role(Role.FAMILY)
                .status(UserStatus.ACTIVE)
                .build());

        savedAdmin = userRepository.save(User.builder()
                .name("Admin User")
                .email("admin.test@dearhand.in")
                .phone("+919876500002")
                .passwordHash(passwordEncoder.encode("AdminPass123!"))
                .role(Role.ADMIN)
                .status(UserStatus.ACTIVE)
                .build());

        familyJwt = jwtTokenProvider.generateToken(savedFamily.getId(), savedFamily.getEmail(), savedFamily.getRole());
        adminJwt = jwtTokenProvider.generateToken(savedAdmin.getId(), savedAdmin.getEmail(), savedAdmin.getRole());
    }

    @Test
    @DisplayName("POST /api/v1/auth/register - Should register a new family account and return JWT")
    void shouldRegisterFamilyUserSuccessfully() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .name("Priya Sharma")
                .email("priya.sharma@example.com")
                .phone("+919888877777")
                .password("SecurePass123!")
                .role(Role.FAMILY)
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.role").value("FAMILY"))
                .andExpect(jsonPath("$.name").value("Priya Sharma"))
                .andExpect(jsonPath("$.email").value("priya.sharma@example.com"));

        assertThat(userRepository.existsByEmail("priya.sharma@example.com")).isTrue();
    }

    @Test
    @DisplayName("POST /api/v1/auth/register - Should reject duplicate email with 400")
    void shouldRejectDuplicateEmail() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .name("Duplicate User")
                .email("arun@example.com") // Already exists in setUp
                .phone("+919999911111")
                .password("Password123!")
                .role(Role.FAMILY)
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("An account with this email address already exists"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/register - Should reject self-registration as ADMIN")
    void shouldRejectAdminSelfRegistration() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .name("Fake Admin")
                .email("fakeadmin@example.com")
                .phone("+919999922222")
                .password("Password123!")
                .role(Role.ADMIN)
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Admin registration is not allowed through the public portal"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login - Should login with valid email and password")
    void shouldLoginSuccessfullyWithEmail() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .usernameOrEmail("arun@example.com")
                .password("Password123!")
                .build();

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.role").value("FAMILY"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login - Should reject wrong password with 401 Unauthorized")
    void shouldRejectWrongPassword() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .usernameOrEmail("arun@example.com")
                .password("WrongPassword123!")
                .build();

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid credentials"));
    }

    @Test
    @DisplayName("GET /api/v1/test/admin - Wrong-role access: Family accessing Admin endpoint must be refused with 403 Forbidden")
    void shouldRefuseWrongRoleAccessWithForbidden() throws Exception {
        // Family accessing Family endpoint -> 200 OK
        mockMvc.perform(get("/api/v1/test/family")
                .header("Authorization", "Bearer " + familyJwt))
                .andExpect(status().isOk());

        // Family attempting to access Admin endpoint -> 403 Forbidden
        mockMvc.perform(get("/api/v1/test/admin")
                .header("Authorization", "Bearer " + familyJwt))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/v1/test/admin - Correct-role access: Admin accessing Admin endpoint must succeed with 200 OK")
    void shouldAllowAdminAccessToAdminEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/test/admin")
                .header("Authorization", "Bearer " + adminJwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Access granted to Admin"));
    }

    @Test
    @DisplayName("GET /api/v1/auth/me - Should return current user profile using JWT")
    void shouldReturnCurrentUserProfile() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me")
                .header("Authorization", "Bearer " + familyJwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Arun Kumar"))
                .andExpect(jsonPath("$.email").value("arun@example.com"))
                .andExpect(jsonPath("$.role").value("FAMILY"));
    }
}
